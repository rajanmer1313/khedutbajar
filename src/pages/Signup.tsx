import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cropOptions } from '@/data/mockData';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

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

  const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;

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
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t('otpSent'));
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
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

    if (!data.user) {
      toast.error('Signup failed');
      setLoading(false);
      return;
    }

    // Check if profile already exists (trigger may have created it)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (existingProfile) {
      // Update existing profile
      await supabase
        .from('profiles')
        .update({
          role,
          name,
          mobile: phone,
          ...(role === 'farmer' ? { village } : { business_name: businessName, location }),
        })
        .eq('id', data.user.id);
    } else {
      // Insert profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        role,
        name,
        mobile: phone,
        ...(role === 'farmer' ? { village } : { business_name: businessName, location }),
      });
    }

    // If trader, create trader record
    if (role === 'trader') {
      const { data: existingTrader } = await supabase
        .from('traders')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!existingTrader) {
        await supabase.from('traders').insert({
          user_id: data.user.id,
          name,
          business_name: businessName,
          mobile: phone,
          location_en: location,
          location_hi: location,
          location_gu: location,
        });
      }
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
