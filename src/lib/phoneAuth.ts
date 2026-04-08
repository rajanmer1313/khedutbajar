import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type OtpMode = 'sms' | 'dev';
export type AuthPurpose = 'login' | 'signup';

interface PhoneOtpRequestParams {
  phone: string;
  shouldCreateUser: boolean;
  metadata?: Record<string, string>;
}

interface DevPhoneAuthResponse {
  session: {
    access_token: string;
    refresh_token: string;
  };
  user: User;
}

export const DEV_OTP_CODE = '123456';

const SMS_PROVIDER_ERROR_REGEX = /unable to get sms provider/i;

/** Returns true when the app is running in a dev/preview context */
function isDevOrPreview(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    const hostname = window.location.hostname;
    return (
      hostname === 'localhost' ||
      hostname.endsWith('.lovable.app') ||
      hostname.endsWith('.lovableproject.com')
    );
  } catch {
    return false;
  }
}

export function toAuthPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const localNumber = digits.slice(-10);
  return `+91${localNumber}`;
}

export function toStoredPhone(phone: string) {
  return phone.replace(/\D/g, '').slice(-10);
}

export async function requestPhoneOtp({ phone, shouldCreateUser, metadata }: PhoneOtpRequestParams) {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser,
      data: metadata,
    },
  });

  if (!error) {
    return { mode: 'sms' as const };
  }

  // Fall back to dev OTP if SMS provider isn't configured and we're in preview
  if (isDevOrPreview() && SMS_PROVIDER_ERROR_REGEX.test(error.message)) {
    return { mode: 'dev' as const };
  }

  return { mode: 'sms' as const, error };
}

export async function verifyDevPhoneOtp(params: {
  otp: string;
  phone: string;
  purpose: AuthPurpose;
  metadata?: Record<string, string>;
}) {
  const { data, error } = await supabase.functions.invoke<DevPhoneAuthResponse>('dev-phone-auth', {
    body: params,
  });

  if (error) {
    throw error;
  }

  if (!data?.session) {
    throw new Error('Missing session from development fallback');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  if (sessionError) {
    throw sessionError;
  }

  return data.user;
}
