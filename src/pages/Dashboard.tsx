import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cropOptions } from '@/data/mockData';
import Header from '@/components/Header';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';

interface MyCrop {
  id: string;
  cropId: string;
  price: number;
  isEditing: boolean;
}

const Dashboard = () => {
  const { language, t } = useLanguage();
  const [myCrops, setMyCrops] = useState<MyCrop[]>([
    { id: '1', cropId: 'groundnut', price: 62, isEditing: false },
    { id: '2', cropId: 'wheat', price: 28, isEditing: false },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCropId, setNewCropId] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const getCropInfo = (cropId: string) => cropOptions.find((c) => c.id === cropId);

  const addCrop = () => {
    if (newCropId && newPrice) {
      setMyCrops([
        ...myCrops,
        { id: Date.now().toString(), cropId: newCropId, price: Number(newPrice), isEditing: false },
      ]);
      setNewCropId('');
      setNewPrice('');
      setShowAddForm(false);
    }
  };

  const deleteCrop = (id: string) => {
    setMyCrops(myCrops.filter((c) => c.id !== id));
  };

  const toggleEdit = (id: string) => {
    setMyCrops(myCrops.map((c) => (c.id === id ? { ...c, isEditing: !c.isEditing } : c)));
  };

  const updatePrice = (id: string, price: number) => {
    setMyCrops(myCrops.map((c) => (c.id === id ? { ...c, price, isEditing: false } : c)));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 max-w-lg mx-auto space-y-4">
        {/* Dashboard Header */}
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏪</span>
            <div>
              <h1 className="text-xl font-bold">{t('dashboard')}</h1>
              <p className="text-sm opacity-90">{t('myCrops')}</p>
            </div>
          </div>
        </div>

        {/* My Crops List */}
        <div className="space-y-3">
          {myCrops.map((crop) => {
            const info = getCropInfo(crop.cropId);
            if (!info) return null;

            return (
              <div key={crop.id} className="rounded-2xl bg-card card-shadow p-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{info.emoji}</span>
                    <div>
                      <h3 className="font-bold text-foreground">{info.name[language]}</h3>
                      {crop.isEditing ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            defaultValue={crop.price}
                            className="w-20 px-2 py-1 rounded-lg bg-muted border border-input text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updatePrice(crop.id, Number((e.target as HTMLInputElement).value));
                              }
                            }}
                            id={`price-${crop.id}`}
                          />
                          <span className="text-sm text-muted-foreground">{t('perKg')}</span>
                          <button
                            onClick={() => {
                              const input = document.getElementById(`price-${crop.id}`) as HTMLInputElement;
                              updatePrice(crop.id, Number(input.value));
                            }}
                            className="p-1.5 rounded-lg bg-primary text-primary-foreground"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-primary">₹{crop.price} {t('perKg')}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleEdit(crop.id)}
                      className="p-2.5 rounded-xl bg-secondary text-secondary-foreground touch-target flex items-center justify-center"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteCrop(crop.id)}
                      className="p-2.5 rounded-xl bg-destructive/10 text-destructive touch-target flex items-center justify-center"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Crop */}
        {showAddForm ? (
          <div className="rounded-2xl bg-card card-shadow p-4 space-y-3 animate-fade-in">
            <h3 className="font-bold text-foreground">{t('addCrop')}</h3>
            <div className="flex flex-wrap gap-2">
              {cropOptions
                .filter((c) => !myCrops.some((mc) => mc.cropId === c.id))
                .map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => setNewCropId(crop.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all touch-target flex items-center gap-1 ${
                      newCropId === crop.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <span>{crop.emoji}</span>
                    <span>{crop.name[language]}</span>
                  </button>
                ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('price')}</label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-input text-base touch-target"
                placeholder="₹"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addCrop}
                disabled={!newCropId || !newPrice}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 touch-target"
              >
                {t('save')}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm touch-target"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-semibold flex items-center justify-center gap-2 touch-target hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('addCrop')}
          </button>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
