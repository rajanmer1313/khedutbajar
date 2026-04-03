import { useLanguage } from '@/contexts/LanguageContext';
import { cropOptions } from '@/data/mockData';
import { Search } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCrop: string;
  onCropChange: (value: string) => void; 
  sortBy: string;
  onSortChange: (value: string) => void;
}

const SearchFilter = ({
  searchTerm,
  onSearchChange,
  selectedCrop,
  onCropChange,
  sortBy,
  onSortChange,
}: SearchFilterProps) => {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('search')}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-input text-sm touch-target"
        />
      </div>

      {/* Crop Filter - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onCropChange('')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all touch-target ${
            selectedCrop === ''
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {t('allCrops')}
        </button>
        {cropOptions.map((crop) => (
          <button
            key={crop.id}
            onClick={() => onCropChange(crop.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all touch-target flex items-center gap-1 ${
              selectedCrop === crop.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            <span>{crop.emoji}</span>
            <span>{crop.name[language]}</span>
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2">
        <button
          onClick={() => onSortChange('rating')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all touch-target ${
            sortBy === 'rating'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          ⭐ {t('rating')}
        </button>
        <button
          onClick={() => onSortChange('price')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all touch-target ${
            sortBy === 'price'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          💰 {t('bestPrice')}
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
