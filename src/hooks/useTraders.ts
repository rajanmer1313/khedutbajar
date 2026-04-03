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
      const { data: traders, error: tErr } = await supabase
        .from('traders')
        .select('*')
        .order('rating', { ascending: false });
      if (tErr) throw tErr;

      const { data: crops, error: cErr } = await supabase.from('crops').select('*');
      if (cErr) throw cErr;

      const { data: reviews, error: rErr } = await supabase.from('reviews').select('*');
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
