import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { cropOptions } from '@/data/mockData';
import Header from '@/components/Header';

type Role = 'farmer' | 'trader';

const Signup = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('farmer');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [village, setVillage] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);

  const toggleCrop = (cropId: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((c) => c !== cropId) : [...prev, cropId]
    );
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(
      'kisanUser',
      JSON.stringify({ role, name, mobile, village, businessName, location, selectedCrops })
    );
    navigate(role === 'trader' ? '/dashboard' : '/');
    window.location.reload();
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
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target"
          >
            {t('signupAs')} {role === 'farmer' ? t('farmer') : t('trader')}
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
