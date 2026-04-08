import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEV_OTP_CODE = '123456';

function isPreviewOrigin(origin: string | null) {
  if (!origin) return false;

  try {
    const hostname = new URL(origin).hostname;
    return hostname === 'localhost'
      || hostname.endsWith('.lovable.app')
      || hostname.endsWith('.lovableproject.com');
  } catch {
    return false;
  }
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return `+91${digits}`;
}

async function derivePassword(phone: string, secret: string) {
  const payload = new TextEncoder().encode(`${secret}:${phone}:dev-phone-auth`);
  const digest = await crypto.subtle.digest('SHA-256', payload);
  const hash = Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');

  return `${hash.slice(0, 24)}Aa!9`;
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const origin = request.headers.get('origin') ?? request.headers.get('referer');

  if (!isPreviewOrigin(origin)) {
    return new Response(JSON.stringify({ error: 'Development OTP is only available in preview mode.' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey || !publishableKey) {
      throw new Error('Missing backend configuration');
    }

    const { otp, phone, purpose, metadata } = await request.json() as {
      otp?: string;
      phone?: string;
      purpose?: 'login' | 'signup';
      metadata?: Record<string, string>;
    };

    if (!otp || !phone || !purpose) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (otp !== DEV_OTP_CODE) {
      return new Response(JSON.stringify({ error: 'Invalid OTP code.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Use a more reliable lookup: iterate pages to find user by phone
    let user = null;
    let page = 1;
    while (!user) {
      const { data: listedUsers, error: listError } = await adminClient.auth.admin.listUsers({
        page,
        perPage: 1000,
      });
      if (listError) throw listError;
      user = listedUsers.users.find((entry) => entry.phone === normalizedPhone) ?? null;
      if (user || listedUsers.users.length < 1000) break;
      page++;
    }

    if (!user && purpose === 'login') {
      return new Response(JSON.stringify({ error: 'No account found for this mobile number.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!user && purpose === 'signup') {
      const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
        phone: normalizedPhone,
        phone_confirm: true,
        user_metadata: metadata,
      });

      if (createError) {
        // If phone already exists (race condition), try to find the user again
        if (createError.message?.includes('already') || createError.message?.includes('duplicate')) {
          const { data: retryList } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
          user = retryList?.users.find((entry) => entry.phone === normalizedPhone) ?? null;
        }
        if (!user) throw createError;
      } else {
        user = createdUser.user;
      }
    }

    if (!user) {
      throw new Error('Unable to complete authentication');
    }

    const password = await derivePassword(normalizedPhone, serviceRoleKey);
    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password,
      phone_confirm: true,
      user_metadata: {
        ...(user.user_metadata ?? {}),
        ...(metadata ?? {}),
      },
    });

    if (updateError) {
      throw updateError;
    }

    const tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        password,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return new Response(JSON.stringify({ error: tokenData.error_description ?? tokenData.msg ?? 'Failed to sign in.' }), {
        status: tokenResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      session: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
      },
      user: tokenData.user,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected authentication error';

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});