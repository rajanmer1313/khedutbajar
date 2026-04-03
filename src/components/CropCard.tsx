import { useLanguage } from '@/contexts/LanguageContext';
import type { Tables } from '@/integrations/supabase/types';

interface CropCardProps {
  crop: Tables<'crops'>;
}

const CropCard = ({ crop }: CropCardProps) => {
  const { language, t } = useLanguage();

  const name = language === 'hi' ? crop.name_hi : language === 'gu' ? crop.name_gu : crop.name_en;

  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-secondary/50 min-w-[90px]">
      <span className="text-3xl mb-1">{crop.emoji}</span>
      <span className="text-xs font-medium text-foreground text-center leading-tight">
        {name}
      </span>
      <span className="text-sm font-bold text-primary mt-1">
        ₹{crop.price_per_20kg}/20{language === 'hi' ? 'किलो' : language === 'gu' ? 'કિલો' : 'kg'}
      </span>
    </div>
  );
};

export default CropCard;
