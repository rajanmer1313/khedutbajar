import { useLanguage } from '@/contexts/LanguageContext';
import { Trader } from '@/data/mockData';
import StarRating from './StarRating';
import CropCard from './CropCard';
import { Phone, MessageCircle, Shield, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import ReviewSection from './ReviewSection';

interface TraderCardProps {
  trader: Trader;
}

const TraderCard = ({ trader }: TraderCardProps) => {
  const { language, t } = useLanguage();
  const [showReviews, setShowReviews] = useState(false);

  const handleCall = () => {
    window.open(`tel:${trader.mobile}`);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/91${trader.mobile}`, '_blank');
  };

  return (
    <div className={`rounded-2xl bg-card card-shadow overflow-hidden animate-fade-in ${trader.isTrusted ? 'trust-glow' : ''}`}>
      {/* Trader Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{trader.name}</h3>
              {trader.isTrusted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-trust/10 text-trust text-xs font-semibold">
                  <Shield className="w-3 h-3" />
                  {t('trustedTrader')}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{trader.businessName}</p>
            <p className="text-sm text-muted-foreground">📍 {trader.location[language]}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <StarRating rating={trader.rating} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            {trader.totalDeals} {t('deals')}
          </span>
        </div>
      </div>

      {/* Crops */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {trader.crops.map((crop) => (
            <CropCard key={crop.id} crop={crop} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
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

      {showReviews && <ReviewSection trader={trader} />}
    </div>
  );
};

export default TraderCard;
