import { useLanguage } from '@/contexts/LanguageContext';
import { Crop } from '@/data/mockData';

interface CropCardProps {
  crop: Crop;
}

const CropCard = ({ crop }: CropCardProps) => {
  const { language, t } = useLanguage();

  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-secondary/50 min-w-[90px]">
      <span className="text-3xl mb-1">{crop.emoji}</span>
      <span className="text-xs font-medium text-foreground text-center leading-tight">
        {crop.name[language]}
      </span>
      <span className="text-sm font-bold text-primary mt-1">
        ₹{crop.price}/{t('perKg').replace('₹/', '')}
      </span>
    </div>
  );
};

export default CropCard;
