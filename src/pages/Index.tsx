import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTraders } from '@/hooks/useTraders';
import Header from '@/components/Header';
import TraderCard from '@/components/TraderCard';
import SearchFilter from '@/components/SearchFilter';

const Index = () => {
  const { t, language } = useLanguage();
  const { data: traders = [], isLoading } = useTraders();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const filteredTraders = useMemo(() => {
    let list = [...traders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (tr) =>
          tr.name.toLowerCase().includes(term) ||
          tr.business_name.toLowerCase().includes(term) ||
          tr.location_en.toLowerCase().includes(term) ||
            tr.location_hi.includes(term) ||
            tr.location_gu.includes(term) ||
            tr.crops.some(
              (crop) =>
                crop.name_en.toLowerCase().includes(term)
                || crop.name_hi.includes(searchTerm)
                || crop.name_gu.includes(searchTerm)
            )
      );
    }

    if (selectedCrop) {
      const cropInfo = (await import('@/data/cropCatalog')).cropOptions.find((c) => c.id === selectedCrop);
      if (cropInfo) {
        const cropNameEn = cropInfo.name.en.toLowerCase();
        list = list.filter((tr) =>
          tr.crops.some((c) => c.name_en.toLowerCase() === cropNameEn)
        );
      }
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortBy === 'price') {
      list.sort((a, b) => {
        const avgA = a.crops.reduce((sum, c) => sum + Number(c.price_per_20kg), 0) / (a.crops.length || 1);
        const avgB = b.crops.reduce((sum, c) => sum + Number(c.price_per_20kg), 0) / (b.crops.length || 1);
        return avgB - avgA;
      });
    }

    return list;
  }, [traders, searchTerm, selectedCrop, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 space-y-4 max-w-lg mx-auto">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="text-4xl">👨‍🌾</span>
            <div>
              <h1 className="text-xl font-bold">{t('appName')}</h1>
              <p className="text-sm opacity-90">{t('topTraders')} • {t('nearYou')}</p>
            </div>
          </div>
        </div>

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCrop={selectedCrop}
          onCropChange={setSelectedCrop}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3 animate-spin">⏳</span>
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : filteredTraders.length > 0 ? (
            filteredTraders.map((trader) => (
              <TraderCard key={trader.id} trader={trader} />
            ))
          ) : (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3">🔍</span>
              <p className="text-muted-foreground">{t('noTradersFound')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
