import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cropOptions } from '@/data/cropCatalog';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { OtpMode, requestPhoneOtp, toAuthPhone, toStoredPhone, verifyDevPhoneOtp } from '@/lib/phoneAuth';

type Role = 'farmer' | 'trader';

const Signup = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [role, setRole] = useState<Role>('farmer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpMode, setOtpMode] = useState<OtpMode>('sms');

  const fullPhone = toAuthPhone(phone);
  const storedPhone = toStoredPhone(phone);

  const toggleCrop = (cropId: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((c) => c !== cropId) : [...prev, cropId]
    );
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || phone.length < 10) {
      toast.error(t('fillAllFields'));
      return;
    }

    setLoading(true);
    const result = await requestPhoneOtp({
      phone: fullPhone,
      shouldCreateUser: true,
      metadata: {
        role,
        name,
        mobile: storedPhone,
      },
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    setOtpMode(result.mode);
    toast.success(result.mode === 'dev' ? t('devOtpMode') : t('otpSent'));
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error(t('enterValidOtp'));
      return;
    }

    setLoading(true);

    try {
      const user = otpMode === 'dev'
        ? await verifyDevPhoneOtp({
            phone: fullPhone,
            otp,
            purpose: 'signup',
            metadata: {
              role,
              name,
              mobile: storedPhone,
            },
          })
        : (await supabase.auth.verifyOtp({
            phone: fullPhone,
            token: otp,
            type: 'sms',
          })).data.user;

      if (!user) {
        toast.error(t('signupFailed'));
        setLoading(false);
        return;
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({
            role,
            name,
            mobile: storedPhone,
            village: role === 'farmer' ? village : null,
            business_name: role === 'trader' ? businessName : null,
            location: role === 'trader' ? location : null,
          })
          .eq('id', user.id);

        if (profileUpdateError) throw profileUpdateError;
      } else {
        const { error: profileInsertError } = await supabase.from('profiles').insert({
          id: user.id,
          role,
          name,
          mobile: storedPhone,
          village: role === 'farmer' ? village : null,
          business_name: role === 'trader' ? businessName : null,
          location: role === 'trader' ? location : null,
        });

        if (profileInsertError) throw profileInsertError;
      }

      if (role === 'trader') {
        const { data: existingTrader } = await supabase
          .from('traders')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingTrader) {
          const { error: traderUpdateError } = await supabase
            .from('traders')
            .update({
              name,
              business_name: businessName,
              mobile: storedPhone,
              location_en: location,
              location_hi: location,
              location_gu: location,
            })
            .eq('id', existingTrader.id);

          if (traderUpdateError) throw traderUpdateError;
        } else {
          const { error: traderInsertError } = await supabase.from('traders').insert({
            user_id: user.id,
            name,
            business_name: businessName,
            mobile: storedPhone,
            location_en: location,
            location_hi: location,
            location_gu: location,
          });

          if (traderInsertError) throw traderInsertError;
        }
      }

      toast.success(`${t('welcome')}!`);
      navigate(role === 'trader' ? '/dashboard' : '/');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : t('signupFailed'));
      setLoading(false);
      return;
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
          <span className="text-5xl block mb-2">🌱</span>
          <h1 className="text-2xl font-bold text-foreground">{t('signup')}</h1>
        </div>

        {step === 'details' ? (
          <>
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

            <form onSubmit={handleSendOtp} className="space-y-4">
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
                disabled={loading || phone.length < 10}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target disabled:opacity-50"
              >
                {loading ? '⏳...' : `📩 ${t('sendOtp')}`}
              </button>
            </form>
          </>
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
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base touch-target disabled:opacity-50"
            >
              {loading ? '⏳...' : `✅ ${t('verifyOtp')}`}
            </button>
            <button
              onClick={() => { setStep('details'); setOtp(''); }}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm touch-target"
            >
              {t('changeNumber')}
            </button>
            {otpMode === 'dev' && (
              <p className="text-center text-sm text-muted-foreground">{t('devOtpHint')}</p>
            )}
          </div>
        )}

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
