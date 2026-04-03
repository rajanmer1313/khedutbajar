import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockTraders } from '@/data/mockData';
import Header from '@/components/Header';
import TraderCard from '@/components/TraderCard';
import SearchFilter from '@/components/SearchFilter';

const Index = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const filteredTraders = useMemo(() => {
    let traders = [...mockTraders];

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      traders = traders.filter(
        (tr) =>
          tr.name.toLowerCase().includes(term) ||
          tr.businessName.toLowerCase().includes(term) ||
          tr.location.en.toLowerCase().includes(term) ||
          tr.location.hi.includes(term) ||
          tr.location.gu.includes(term)
      );
    }

    // Filter by crop
    if (selectedCrop) {
      traders = traders.filter((tr) =>
        tr.crops.some((c) => c.name.en.toLowerCase() === selectedCrop.toLowerCase() ||
          c.name.en.toLowerCase().includes(selectedCrop))
      );
    }

    // Sort
    if (sortBy === 'rating') {
      traders.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      traders.sort((a, b) => {
        const avgA = a.crops.reduce((sum, c) => sum + c.price, 0) / (a.crops.length || 1);
        const avgB = b.crops.reduce((sum, c) => sum + c.price, 0) / (b.crops.length || 1);
        return avgB - avgA;
      });
    }

    return traders;
  }, [searchTerm, selectedCrop, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 space-y-4 max-w-lg mx-auto">
        {/* Welcome Banner */}
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

        {/* Trader List */}
        <div className="space-y-4">
          {filteredTraders.map((trader) => (
            <TraderCard key={trader.id} trader={trader} />
          ))}
          {filteredTraders.length === 0 && (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3">🔍</span>
              <p className="text-muted-foreground">{t('search')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
