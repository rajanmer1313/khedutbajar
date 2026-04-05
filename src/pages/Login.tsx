import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error(t('enterValidMobile'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t('otpSent'));
    setStep('otp');
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error(t('enterValidOtp'));
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: 'sms',
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Check if profile exists and get role
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.role === 'trader') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 max-w-md mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-4 touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('home')}
        </button>

        <div className="text-center mb-6">
          <span className="text-5xl block mb-2">🌾</span>
          <h1 className="text-2xl font-bold text-foreground">{t('login')}</h1>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">📱 {t('mobile')}</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 py-3 rounded-xl bg-muted border border-input text-sm font-medium">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 px-4 py-3 rounded-xl bg-card border border-input text-base touch-target"
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <button
              onClick={sendOtp}
              disabled={loading || phone.length < 10}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target disabled:opacity-50"
            >
              {loading ? '⏳...' : `📩 ${t('sendOtp')}`}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              {t('otpSentTo')} +91{phone}
            </p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">🔐 {t('enterOtp')}</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 rounded-xl bg-card border border-input text-center text-2xl tracking-[0.5em] font-mono touch-target"
                placeholder="• • • • • •"
                maxLength={6}
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target disabled:opacity-50"
            >
              {loading ? '⏳...' : `✅ ${t('verifyOtp')}`}
            </button>
            <button
              onClick={() => { setStep('phone'); setOtp(''); }}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm touch-target"
            >
              {t('changeNumber')}
            </button>
          </div>
        )}

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
