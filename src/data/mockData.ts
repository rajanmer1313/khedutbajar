export interface Crop {
  id: string;
  name: { hi: string; gu: string; en: string };
  emoji: string;
  price: number;
  unit: string;
}

export interface Review {
  id: string;
  farmerName: string;
  rating: number;
  text: string;
  date: string;
}

export interface Trader {
  id: string;
  name: string;
  businessName: string;
  location: { hi: string; gu: string; en: string };
  mobile: string;
  rating: number;
  totalDeals: number;
  isTrusted: boolean;
  crops: Crop[];
  reviews: Review[];
}

export const cropOptions = [
  { id: 'groundnut', name: { hi: 'मूंगफली', gu: 'મગફળી', en: 'Groundnut' }, emoji: '🥜' },
  { id: 'wheat', name: { hi: 'गेहूं', gu: 'ઘઉં', en: 'Wheat' }, emoji: '🌾' },
  { id: 'chana', name: { hi: 'चना', gu: 'ચણા', en: 'Chana' }, emoji: '🫘' },
  { id: 'rice', name: { hi: 'चावल', gu: 'ચોખા', en: 'Rice' }, emoji: '🍚' },
  { id: 'cotton', name: { hi: 'कपास', gu: 'કપાસ', en: 'Cotton' }, emoji: '☁️' },
  { id: 'soybean', name: { hi: 'सोयाबीन', gu: 'સોયાબીન', en: 'Soybean' }, emoji: '🫛' },
  { id: 'sugarcane', name: { hi: 'गन्ना', gu: 'શેરડી', en: 'Sugarcane' }, emoji: '🎋' },
  { id: 'onion', name: { hi: 'प्याज', gu: 'ડુંગળી', en: 'Onion' }, emoji: '🧅' },
  { id: 'potato', name: { hi: 'आलू', gu: 'બટાકા', en: 'Potato' }, emoji: '🥔' },
  { id: 'tomato', name: { hi: 'टमाटर', gu: 'ટામેટા', en: 'Tomato' }, emoji: '🍅' },
];

export const mockTraders: Trader[] = [
  {
    id: '1',
    name: 'राजेश पटेल',
    businessName: 'पटेल ट्रेडिंग कंपनी',
    location: { hi: 'अहमदाबाद', gu: 'અમદાવાદ', en: 'Ahmedabad' },
    mobile: '9876543210',
    rating: 4.5,
    totalDeals: 234,
    isTrusted: true,
    crops: [
      { id: '1', name: { hi: 'मूंगफली', gu: 'મગફળી', en: 'Groundnut' }, emoji: '🥜', price: 62, unit: 'kg' },
      { id: '2', name: { hi: 'गेहूं', gu: 'ઘઉં', en: 'Wheat' }, emoji: '🌾', price: 28, unit: 'kg' },
      { id: '3', name: { hi: 'चना', gu: 'ચણા', en: 'Chana' }, emoji: '🫘', price: 55, unit: 'kg' },
    ],
    reviews: [
      { id: '1', farmerName: 'सुरेश भाई', rating: 5, text: 'बहुत अच्छा व्यापारी, सही कीमत देता है', date: '2024-03-15' },
      { id: '2', farmerName: 'महेश भाई', rating: 4, text: 'समय पर भुगतान करता है', date: '2024-03-10' },
    ],
  },
  {
    id: '2',
    name: 'अमित शर्मा',
    businessName: 'शर्मा एग्रो ट्रेडर्स',
    location: { hi: 'राजकोट', gu: 'રાજકોટ', en: 'Rajkot' },
    mobile: '9876543211',
    rating: 4.2,
    totalDeals: 189,
    isTrusted: true,
    crops: [
      { id: '4', name: { hi: 'कपास', gu: 'કપાસ', en: 'Cotton' }, emoji: '☁️', price: 72, unit: 'kg' },
      { id: '5', name: { hi: 'मूंगफली', gu: 'મગફળી', en: 'Groundnut' }, emoji: '🥜', price: 60, unit: 'kg' },
      { id: '6', name: { hi: 'सोयाबीन', gu: 'સોયાબીન', en: 'Soybean' }, emoji: '🫛', price: 45, unit: 'kg' },
    ],
    reviews: [
      { id: '3', farmerName: 'रमेश भाई', rating: 4, text: 'अच्छा अनुभव, फिर से बेचूंगा', date: '2024-03-12' },
    ],
  },
  {
    id: '3',
    name: 'विजय सिंह',
    businessName: 'सिंह ग्रेन मार्ट',
    location: { hi: 'सूरत', gu: 'સુરત', en: 'Surat' },
    mobile: '9876543212',
    rating: 3.8,
    totalDeals: 98,
    isTrusted: false,
    crops: [
      { id: '7', name: { hi: 'चावल', gu: 'ચોખા', en: 'Rice' }, emoji: '🍚', price: 35, unit: 'kg' },
      { id: '8', name: { hi: 'गेहूं', gu: 'ઘઉં', en: 'Wheat' }, emoji: '🌾', price: 26, unit: 'kg' },
    ],
    reviews: [],
  },
  {
    id: '4',
    name: 'प्रकाश जोशी',
    businessName: 'जोशी एग्री बिजनेस',
    location: { hi: 'वडोदरा', gu: 'વડોદરા', en: 'Vadodara' },
    mobile: '9876543213',
    rating: 4.7,
    totalDeals: 312,
    isTrusted: true,
    crops: [
      { id: '9', name: { hi: 'प्याज', gu: 'ડુંગળી', en: 'Onion' }, emoji: '🧅', price: 18, unit: 'kg' },
      { id: '10', name: { hi: 'आलू', gu: 'બટાકા', en: 'Potato' }, emoji: '🥔', price: 22, unit: 'kg' },
      { id: '11', name: { hi: 'टमाटर', gu: 'ટામેટા', en: 'Tomato' }, emoji: '🍅', price: 30, unit: 'kg' },
      { id: '12', name: { hi: 'गन्ना', gu: 'શેરડી', en: 'Sugarcane' }, emoji: '🎋', price: 4, unit: 'kg' },
    ],
    reviews: [
      { id: '4', farmerName: 'किशन भाई', rating: 5, text: 'सबसे अच्छा व्यापारी! हमेशा सही तौल', date: '2024-03-18' },
      { id: '5', farmerName: 'गोपाल भाई', rating: 5, text: 'भरोसेमंद, समय पर पैसा देता है', date: '2024-03-14' },
      { id: '6', farmerName: 'हरि भाई', rating: 4, text: 'अच्छी कीमत मिलती है', date: '2024-03-08' },
    ],
  },
];
