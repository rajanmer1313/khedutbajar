import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Simple mock auth state from localStorage
  const user = localStorage.getItem('kisanUser');
  const parsed = user ? JSON.parse(user) : null;

  const handleLogout = () => {
    localStorage.removeItem('kisanUser');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <span className="text-lg font-bold text-primary">{t('appName')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {parsed ? (
            <div className="flex items-center gap-2 ml-2">
              {parsed.role === 'trader' && (
                <Link
                  to="/dashboard"
                  className="touch-target flex items-center justify-center px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                >
                  {t('dashboard')}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="touch-target flex items-center justify-center p-2 rounded-lg bg-destructive/10 text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="touch-target flex items-center justify-center ml-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium gap-1"
            >
              <User className="w-4 h-4" />
              {t('login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
