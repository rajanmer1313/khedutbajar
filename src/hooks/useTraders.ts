import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type TraderWithCropsAndReviews = Tables<'traders'> & {
  crops: Tables<'crops'>[];
  reviews: Tables<'reviews'>[];
};

export function useTraders() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['traders'],
    queryFn: async () => {
      const [
        { data: traders, error: tErr },
        { data: crops, error: cErr },
        { data: reviews, error: rErr },
      ] = await Promise.all([
        supabase
          .from('traders')
          .select('*')
          .order('rating', { ascending: false }),
        supabase.from('crops').select('*'),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      ]);

      if (tErr) throw tErr;
      if (cErr) throw cErr;
      if (rErr) throw rErr;

      return (traders || []).map((trader) => ({
        ...trader,
        crops: (crops || []).filter((c) => c.trader_id === trader.id),
        reviews: (reviews || []).filter((r) => r.trader_id === trader.id),
      })) as TraderWithCropsAndReviews[];
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'traders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['traders'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crops' }, () => {
        queryClient.invalidateQueries({ queryKey: ['traders'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        queryClient.invalidateQueries({ queryKey: ['traders'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
