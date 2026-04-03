import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';

type Role = 'farmer' | 'trader';

const Login = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('farmer');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    localStorage.setItem('kisanUser', JSON.stringify({ role, mobile, name: role === 'farmer' ? 'किसान' : 'व्यापारी' }));
    navigate(role === 'trader' ? '/dashboard' : '/');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-2">🌾</span>
          <h1 className="text-2xl font-bold text-foreground">{t('login')}</h1>
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

        <form onSubmit={handleLogin} className="space-y-4">
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
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target"
          >
            {t('loginAs')} {role === 'farmer' ? t('farmer') : t('trader')}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link to="/signup" className="text-primary font-semibold">
            {t('signup')}
          </Link>
        </p>
      </main>
    </div>
  );
};

export default Login;
