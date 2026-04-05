import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { toast } from 'sonner';

const Login = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Fetch profile to determine role-based redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    setLoading(false);

    if (profile?.role === 'trader') {
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
          <span className="text-5xl block mb-2">🌾</span>
          <h1 className="text-2xl font-bold text-foreground">{t('login')}</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target disabled:opacity-50"
          >
            {loading ? '...' : t('login')}
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
