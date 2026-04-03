import { useLanguage } from '@/contexts/LanguageContext';
import { TraderWithCropsAndReviews } from '@/hooks/useTraders';
import StarRating from './StarRating';
import CropCard from './CropCard';
import { Phone, MessageCircle, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import ReviewSection from './ReviewSection';

interface TraderCardProps {
  trader: TraderWithCropsAndReviews;
}

const TraderCard = ({ trader }: TraderCardProps) => {
  const { language, t } = useLanguage();
  const [showReviews, setShowReviews] = useState(false);

  const location = language === 'hi' ? trader.location_hi : language === 'gu' ? trader.location_gu : trader.location_en;

  const handleCall = () => {
    window.open(`tel:${trader.mobile}`);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/91${trader.mobile}`, '_blank');
  };

  return (
    <div className={`rounded-2xl bg-card card-shadow overflow-hidden animate-fade-in ${trader.is_trusted ? 'trust-glow' : ''}`}>
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{trader.name}</h3>
              {trader.is_trusted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-trust/10 text-trust text-xs font-semibold">
                  <Shield className="w-3 h-3" />
                  {t('trustedTrader')}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{trader.business_name}</p>
            <p className="text-sm text-muted-foreground">📍 {location}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <StarRating rating={Number(trader.rating)} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            {trader.total_deals} {t('deals')}
          </span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {trader.crops.map((crop) => (
            <CropCard key={crop.id} crop={crop} />
          ))}
        </div>
      </div>

      <div className="flex border-t border-border">
        <button
          onClick={handleCall}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors touch-target"
        >
          <Phone className="w-5 h-5" />
          {t('call')}
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={handleWhatsApp}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-success hover:bg-success/5 transition-colors touch-target"
        >
          <MessageCircle className="w-5 h-5" />
          {t('whatsapp')}
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={() => setShowReviews(!showReviews)}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-muted/50 transition-colors touch-target"
        >
          ⭐ {t('reviews')} ({trader.reviews.length})
        </button>
      </div>

      {showReviews && <ReviewSection traderId={trader.id} reviews={trader.reviews} />}
    </div>
  );
};

export default TraderCard;
