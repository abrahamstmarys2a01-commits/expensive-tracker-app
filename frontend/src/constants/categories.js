export const CATEGORIES = [
  { id: '1', name: 'Rent & Housing', icon: '🏠', color: '#4ade80', image: require('../../assets/categories/rent.png') },
  { id: '2', name: 'Utilities - EB, Water', icon: '💡', color: '#facc15', image: require('../../assets/categories/utilities.png') },
  { id: '3', name: 'Groceries Food & Dining', icon: '🛒', color: '#f59e0b', image: require('../../assets/categories/groceries.png') },
  { id: '4', name: 'Transportation - Petrol, Bus, Auto, Cab', icon: '🚕', color: '#3b82f6', image: require('../../assets/categories/transportation.png') },
  { id: '5', name: 'Health & Medical', icon: '❤️', color: '#ef4444', image: require('../../assets/categories/health.png') },
  { id: '6', name: 'Medicine & Pharmacy', icon: '💊', color: '#10b981', image: require('../../assets/categories/pharmacy.png') },
  { id: '7', name: 'Clothing & Fashion', icon: '👗', color: '#d946ef', image: require('../../assets/categories/clothing.png') },
  { id: '8', name: 'Personal Care - Salon, Grooming', icon: '✂️', color: '#f472b6', image: require('../../assets/categories/personal_care.png') },
  { id: '9', name: 'Mobile & Internet', icon: '📱', color: '#0ea5e9', image: require('../../assets/categories/mobile.png') },
  { id: '10', name: 'Subscriptions - Netflix, Spotify, OTT, Apps', icon: '📺', color: '#8b5cf6', image: require('../../assets/categories/entertainment.png') },
  { id: '11', name: 'Shopping', icon: '🛍️', color: '#ec4899', image: require('../../assets/categories/shopping.png') },
  { id: '12', name: 'Insurance', icon: '🛡️', color: '#6366f1', image: require('../../assets/categories/insurance.png') },
  { id: '13', name: 'Travel & Vacation', icon: '✈️', color: '#14b8a6', image: require('../../assets/categories/travel.png') },
  { id: '14', name: 'Gifts & Donations', icon: '🎁', color: '#f43f5e', image: require('../../assets/categories/gifts.png') },
  { id: '15', name: 'Savings & Investments - SIP, FD, Savings', icon: '💰', color: '#eab308', image: require('../../assets/categories/savings.png') },
  { id: '16', name: 'Other / Miscellaneous', icon: '📦', color: '#6b7280', image: require('../../assets/categories/other.png') },
];

export const getCategoryByName = (name) => {
  return CATEGORIES.find(cat => cat.name === name) || CATEGORIES[CATEGORIES.length - 1];
};
