import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trader } from '@/data/mockData';
import StarRating from './StarRating';

interface ReviewSectionProps {
  trader: Trader;
}

const ReviewSection = ({ trader }: ReviewSectionProps) => {
  const { t } = useLanguage();
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const user = localStorage.getItem('kisanUser');
  const parsed = user ? JSON.parse(user) : null;

  const handleSubmit = () => {
    if (newRating > 0) {
      // In a real app, this would save to DB
      setNewRating(0);
      setNewReview('');
    }
  };

  return (
    <div className="border-t border-border p-4 bg-muted/30">
      {/* Existing Reviews */}
      {trader.reviews.length > 0 ? (
        <div className="space-y-3 mb-4">
          {trader.reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{review.farmerName}</span>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <StarRating rating={review.rating} size={14} />
              <p className="text-sm text-muted-foreground mt-1">{review.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4 text-center">No reviews yet</p>
      )}

      {/* Add Review (for farmers) */}
      {parsed?.role === 'farmer' && (
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
            disabled={newRating === 0}
            className="mt-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 touch-target"
          >
            {t('submit')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
