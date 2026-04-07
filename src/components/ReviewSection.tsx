import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import StarRating from './StarRating';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ReviewSectionProps {
  traderId: string;
  reviews: Tables<'reviews'>[];
}

const ReviewSection = ({ traderId, reviews }: ReviewSectionProps) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectToLogin = () => {
    toast.error(t('loginRequired'));
    navigate('/login', { state: { redirectTo: '/' } });
  };

  const handleSubmit = async () => {
    if (!user || profile?.role !== 'farmer') {
      redirectToLogin();
      return;
    }

    if (newRating === 0) return;
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        redirectToLogin();
        return;
      }

      const { error } = await supabase.from('reviews').insert({
        trader_id: traderId,
        user_id: session.user.id,
        farmer_name: profile.name || t('farmer'),
        rating: newRating,
        text: newReview,
      });

      if (error) throw error;
      setNewRating(0);
      setNewReview('');
      queryClient.invalidateQueries({ queryKey: ['traders'] });
      toast.success(t('reviewSubmitted'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('reviewSubmitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-border p-4 bg-muted/30">
      {reviews.length > 0 ? (
        <div className="space-y-3 mb-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{review.farmer_name}</span>
                <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <StarRating rating={review.rating} size={14} />
              <p className="text-sm text-muted-foreground mt-1">{review.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4 text-center">{t('noReviewsYet')}</p>
      )}

      {!user ? (
        <div className="border-t border-border pt-3">
          <button
            onClick={redirectToLogin}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm touch-target"
          >
            {t('loginToReview')}
          </button>
        </div>
      ) : profile?.role === 'farmer' ? (
        <div className="border-t border-border pt-3">
          <p className="text-sm font-semibold mb-2">{t('giveFeedback')}</p>
          <StarRating rating={newRating} interactive onChange={setNewRating} size={24} />
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder={t('writeReview')}
            className="w-full mt-2 p-3 rounded-xl bg-card border border-input text-sm resize-none h-20"
          />
          <button
            onClick={handleSubmit}
            disabled={newRating === 0 || submitting}
            className="mt-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 touch-target"
          >
            {submitting ? '⏳...' : t('submit')}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ReviewSection;
