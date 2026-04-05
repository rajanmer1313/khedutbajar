import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
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
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
                {profile?.name || user.email?.split('@')[0]}
              </span>
              {profile?.role === 'trader' && (
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
