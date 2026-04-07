import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'farmer' | 'trader';

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  mobile: string;
  village?: string;
  business_name?: string;
  location?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isReady, setIsReady] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  };

  const syncAuthState = async (session: Session | null) => {
    setIsReady(false);
    setUser(session?.user ?? null);

    if (session?.user) {
      await fetchProfile(session.user.id);
    } else {
      setProfile(null);
    }

    setIsReady(true);
  };

  useEffect(() => {
    let isMounted = true;

    const runSync = async (session: Session | null) => {
      if (!isMounted) return;
      await syncAuthState(session);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void runSync(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      void runSync(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return { user, profile, isReady, signOut };
}
