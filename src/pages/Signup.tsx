import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cropOptions } from '@/data/mockData';
import Header from '@/components/Header';
import { toast } from 'sonner';

type Role = 'farmer' | 'trader';

const Signup = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [village, setVillage] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleCrop = (cropId: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((c) => c !== cropId) : [...prev, cropId]
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, name, mobile },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      toast.error('Signup failed');
      setLoading(false);
      return;
    }

    // Update profile with extra fields
    const profileUpdate: Record<string, string | undefined> = {};
    if (role === 'farmer') {
      profileUpdate.village = village;
    } else {
      profileUpdate.business_name = businessName;
      profileUpdate.location = location;
    }

    await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', data.user.id);

    // If trader, create trader record
    if (role === 'trader') {
      await supabase.from('traders').insert({
        user_id: data.user.id,
        name,
        business_name: businessName,
        mobile,
        location_en: location,
        location_hi: location,
        location_gu: location,
      });
    }

    setLoading(false);
    toast.success(t('welcome') + '!');

    if (role === 'trader') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-2">🌱</span>
          <h1 className="text-2xl font-bold text-foreground">{t('signup')}</h1>
        </div>

        {/* Role Toggle */}
        <div className="flex rounded-2xl bg-secondary p-1 mb-6">
          <button
            onClick={() => setRole('farmer')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all touch-target flex items-center justify-center gap-2 ${
              role === 'farmer' ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground'
            }`}
          >
            👨‍🌾 {t('farmer')}
          </button>
          <button
            onClick={() => setRole('trader')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all touch-target flex items-center justify-center gap-2 ${
              role === 'trader' ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground'
            }`}
          >
            🏪 {t('trader')}
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">👤 {t('name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-input text-base touch-target"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">📧 {t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-input text-base touch-target"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">📱 {t('mobile')}</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-input text-base touch-target"
              placeholder="9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">🔒 {t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-input text-base touch-target"
              required
              minLength={6}
            />
          </div>

          {role === 'farmer' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">🏘️ {t('village')}</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-input text-base touch-target"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">🌾 {t('selectCrops')}</label>
                <div className="flex flex-wrap gap-2">
                  {cropOptions.map((crop) => (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => toggleCrop(crop.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all touch-target flex items-center gap-1 ${
                        selectedCrops.includes(crop.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <span>{crop.emoji}</span>
                      <span>{crop.name[language]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">🏢 {t('businessName')}</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-input text-base touch-target"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">📍 {t('location')}</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-input text-base touch-target"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target disabled:opacity-50"
          >
            {loading ? '...' : language === 'en' ? `${t('signupAs')} ${role === 'farmer' ? t('farmer') : t('trader')}` : `${role === 'farmer' ? t('farmer') : t('trader')} ${t('signupAs')}`}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-muted-foreground">
          {t('hasAccount')}{' '}
          <Link to="/login" className="text-primary font-semibold">
            {t('login')}
          </Link>
        </p>
      </main>
    </div>
  );
};

export default Signup;
