import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cropOptions } from '@/data/cropCatalog';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [traderId, setTraderId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCropId, setNewCropId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Get current user's trader profile
  useEffect(() => {
    const loadTrader = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('traders')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (data) setTraderId(data.id);
      }
    };
    loadTrader();
  }, []);

  // Fetch crops for this trader
  const { data: myCrops = [], isLoading } = useQuery({
    queryKey: ['my-crops', traderId],
    queryFn: async () => {
      if (!traderId) return [];
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .eq('trader_id', traderId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!traderId,
  });

  // Real-time subscription for crops
  useEffect(() => {
    if (!traderId) return;
    const channel = supabase
      .channel('my-crops-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crops', filter: `trader_id=eq.${traderId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['my-crops', traderId] });
        queryClient.invalidateQueries({ queryKey: ['traders'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [traderId, queryClient]);

  const addCrop = async () => {
    if (!newCropId || !newPrice || !traderId) return;
    const cropInfo = cropOptions.find((c) => c.id === newCropId);
    if (!cropInfo) return;

    const { error } = await supabase.from('crops').insert({
      trader_id: traderId,
      name_hi: cropInfo.name.hi,
      name_gu: cropInfo.name.gu,
      name_en: cropInfo.name.en,
      emoji: cropInfo.emoji,
      price_per_20kg: Number(newPrice),
    });

    if (error) {
      toast.error(error.message);
      return;
    }
    setNewCropId('');
    setNewPrice('');
    setShowAddForm(false);
    toast.success(t('cropAdded'));
  };

  const deleteCrop = async (id: string) => {
    const { error } = await supabase.from('crops').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t('cropDeleted'));
  };

  const updatePrice = async (id: string, price: number) => {
    const { error } = await supabase.from('crops').update({ price_per_20kg: price }).eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setEditingId(null);
    toast.success(t('priceUpdated'));
  };

  if (!traderId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-4 max-w-lg mx-auto text-center py-12">
          <span className="text-5xl block mb-3">🏪</span>
          <p className="text-muted-foreground">{t('login')} as {t('trader')}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-4 max-w-lg mx-auto space-y-4">
        <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏪</span>
            <div>
              <h1 className="text-xl font-bold">{t('dashboard')}</h1>
              <p className="text-sm opacity-90">{t('myCrops')}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <span className="text-4xl animate-spin inline-block">⏳</span>
          </div>
        ) : (
          <div className="space-y-3">
            {myCrops.map((crop) => {
              const name = language === 'hi' ? crop.name_hi : language === 'gu' ? crop.name_gu : crop.name_en;

              return (
                <div key={crop.id} className="rounded-2xl bg-card card-shadow p-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{crop.emoji}</span>
                      <div>
                        <h3 className="font-bold text-foreground">{name}</h3>
                        {editingId === crop.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="number"
                              defaultValue={crop.price_per_20kg}
                              className="w-20 px-2 py-1 rounded-lg bg-muted border border-input text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updatePrice(crop.id, Number((e.target as HTMLInputElement).value));
                                }
                              }}
                              id={`price-${crop.id}`}
                            />
                            <span className="text-sm text-muted-foreground">₹/20{language === 'hi' ? 'किलो' : language === 'gu' ? 'કિલો' : 'kg'}</span>
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
                          <p className="text-lg font-bold text-primary">₹{crop.price_per_20kg}/20{language === 'hi' ? 'किलो' : language === 'gu' ? 'કિલો' : 'kg'}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(editingId === crop.id ? null : crop.id)}
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
        )}

        {showAddForm ? (
          <div className="rounded-2xl bg-card card-shadow p-4 space-y-3 animate-fade-in">
            <h3 className="font-bold text-foreground">{t('addCrop')}</h3>
            <div className="flex flex-wrap gap-2">
              {cropOptions
                .filter((c) => !myCrops.some((mc) => mc.name_en.toLowerCase() === c.name.en.toLowerCase()))
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
              <label className="block text-sm font-medium text-foreground mb-1">{t('price')} (₹/20kg)</label>
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
