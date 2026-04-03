import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'hi' | 'gu' | 'en';

const translations = {
  hi: {
    appName: 'किसान बाज़ार',
    home: 'होम',
    login: 'लॉगिन',
    signup: 'साइन अप',
    farmer: 'किसान',
    trader: 'व्यापारी',
    name: 'नाम',
    village: 'गाँव',
    mobile: 'मोबाइल नंबर',
    crops: 'फसलें',
    businessName: 'व्यापार का नाम',
    location: 'स्थान',
    password: 'पासवर्ड',
    call: 'कॉल करें',
    whatsapp: 'व्हाट्सएप',
    search: 'खोजें...',
    filterByCrop: 'फसल से खोजें',
    filterByLocation: 'स्थान से खोजें',
    bestPrice: 'सबसे अच्छी कीमत',
    rating: 'रेटिंग',
    trustedTrader: 'विश्वसनीय व्यापारी',
    deals: 'सफल सौदे',
    perKg: '₹/20किलो',
    addCrop: 'फसल जोड़ें',
    setPrice: 'कीमत सेट करें',
    dashboard: 'डैशबोर्ड',
    myCrops: 'मेरी फसलें',
    editPrice: 'कीमत बदलें',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    giveFeedback: 'प्रतिक्रिया दें',
    writeReview: 'समीक्षा लिखें...',
    submit: 'जमा करें',
    reviews: 'समीक्षाएं',
    allCrops: 'सभी फसलें',
    loginAs: 'के रूप में लॉगिन करें',
    signupAs: 'के रूप में साइन अप',
    noAccount: 'खाता नहीं है?',
    hasAccount: 'पहले से खाता है?',
    topTraders: 'शीर्ष व्यापारी',
    nearYou: 'आपके पास',
    welcome: 'स्वागत है',
    logout: 'लॉगआउट',
    cropName: 'फसल का नाम',
    price: 'कीमत (₹/किलो)',
    delete: 'हटाएं',
    edit: 'बदलें',
    subscription: 'सदस्यता',
    free: 'मुफ्त',
    selectCrops: 'फसलें चुनें',
  },
  gu: {
    appName: 'ખેડૂત બજાર',
    home: 'હોમ',
    login: 'લૉગિન',
    signup: 'સાઇન અપ',
    farmer: 'ખેડૂત',
    trader: 'વેપારી',
    name: 'નામ',
    village: 'ગામ',
    mobile: 'મોબાઈલ નંબર',
    crops: 'પાક',
    businessName: 'વેપારનું નામ',
    location: 'સ્થાન',
    password: 'પાસવર્ડ',
    call: 'કૉલ કરો',
    whatsapp: 'વૉટ્સએપ',
    search: 'શોધો...',
    filterByCrop: 'પાક દ્વારા શોધો',
    filterByLocation: 'સ્થાન દ્વારા શોધો',
    bestPrice: 'શ્રેષ્ઠ કિંમત',
    rating: 'રેટિંગ',
    trustedTrader: 'વિશ્વાસુ વેપારી',
    deals: 'સફળ સોદા',
    perKg: '₹/કિલો',
    addCrop: 'પાક ઉમેરો',
    setPrice: 'કિંમત સેટ કરો',
    dashboard: 'ડેશબોર્ડ',
    myCrops: 'મારા પાક',
    editPrice: 'કિંમત બદલો',
    save: 'સેવ કરો',
    cancel: 'રદ કરો',
    giveFeedback: 'પ્રતિક્રિયા આપો',
    writeReview: 'સમીક્ષા લખો...',
    submit: 'સબમિટ કરો',
    reviews: 'સમીક્ષાઓ',
    allCrops: 'બધા પાક',
    loginAs: 'તરીકે લૉગિન કરો',
    signupAs: 'તરીકે સાઇન અપ',
    noAccount: 'ખાતું નથી?',
    hasAccount: 'પહેલેથી ખાતું છે?',
    topTraders: 'ટોચના વેપારીઓ',
    nearYou: 'તમારી નજીક',
    welcome: 'સ્વાગત છે',
    logout: 'લૉગઆઉટ',
    cropName: 'પાકનું નામ',
    price: 'કિંમત (₹/કિલો)',
    delete: 'કાઢી નાખો',
    edit: 'બદલો',
    subscription: 'સબ્સ્ક્રિપ્શન',
    free: 'મફત',
    selectCrops: 'પાક પસંદ કરો',
  },
  en: {
    appName: 'Kisan Bazaar',
    home: 'Home',
    login: 'Login',
    signup: 'Sign Up',
    farmer: 'Farmer',
    trader: 'Trader',
    name: 'Name',
    village: 'Village',
    mobile: 'Mobile Number',
    crops: 'Crops',
    businessName: 'Business Name',
    location: 'Location',
    password: 'Password',
    call: 'Call',
    whatsapp: 'WhatsApp',
    search: 'Search...',
    filterByCrop: 'Filter by Crop',
    filterByLocation: 'Filter by Location',
    bestPrice: 'Best Price',
    rating: 'Rating',
    trustedTrader: 'Trusted Trader',
    deals: 'Successful Deals',
    perKg: '₹/kg',
    addCrop: 'Add Crop',
    setPrice: 'Set Price',
    dashboard: 'Dashboard',
    myCrops: 'My Crops',
    editPrice: 'Edit Price',
    save: 'Save',
    cancel: 'Cancel',
    giveFeedback: 'Give Feedback',
    writeReview: 'Write review...',
    submit: 'Submit',
    reviews: 'Reviews',
    allCrops: 'All Crops',
    loginAs: 'Login as',
    signupAs: 'Sign up as',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    topTraders: 'Top Traders',
    nearYou: 'Near You',
    welcome: 'Welcome',
    logout: 'Logout',
    cropName: 'Crop Name',
    price: 'Price (₹/kg)',
    delete: 'Delete',
    edit: 'Edit',
    subscription: 'Subscription',
    free: 'Free',
    selectCrops: 'Select Crops',
  },
};

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('hi');

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
