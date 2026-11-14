// src/utils/packageComboHelper.js
// Utility to extract or construct normalized Combo Items for Tour Packages

export const getPackageComboItems = (pkg) => {
  if (!pkg) return [];
  if (Array.isArray(pkg.comboItems) && pkg.comboItems.length > 0) {
    return pkg.comboItems
      .filter((i) => i && (i.name || i.title))
      .map((i, idx) => ({
        ...i,
        id: i.id || `combo-item-${idx + 1}`,
        name: i.name || i.title || `সার্ভিস ${idx + 1}`,
        photo: i.photo || i.defaultPhoto || i.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        defaultPhoto: i.defaultPhoto || i.photo,
        details: i.details || i.description || i.shortDescription || '',
        shortDescription: i.shortDescription || '',
        shortInfoItems: Array.isArray(i.shortInfoItems) ? i.shortInfoItems : [],
        galleryPhotos: Array.isArray(i.galleryPhotos) ? i.galleryPhotos : [],
        tag: i.tag || i.serviceName || i.name || 'কম্বো সার্ভিস',
        badge: i.badge || (
          (i.name || '').includes('হোটেল') ? '🏨 হোটেল' :
          (i.name || '').includes('কার') ? '🚗 কার' :
          (i.name || '').includes('রেস্টুরেন্ট') ? '🍽️ রেস্টুরেন্ট' :
          (i.name || '').includes('গাইড') ? '🧭 গাইড' : '✨ সার্ভিস'
        )
      }));
  }

  const items = [];

  // 1. Hotel / Accommodation Service
  const hotelPhoto =
    pkg.hotelService?.image ||
    (Array.isArray(pkg.featuredHotels) && pkg.featuredHotels[0]?.image) ||
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

  items.push({
    id: 'combo-hotel',
    name: pkg.hotelService?.name || 'লাক্সারি হোটেল ও রিসোর্ট সার্ভিস',
    details:
      pkg.hotelService?.description ||
      'মনোরম পরিবেশে ৫-তারকা মানের রিসোর্টে আরামদায়ক আবাসন, ওয়েলকাম ড্রিংকস ও কমপ্লিমেন্টারি বুফে নাস্তা।',
    price: pkg.hotelService?.perDayRate ? String(pkg.hotelService.perDayRate) : '12000',
    photo: hotelPhoto,
    tag: 'হোটেল সার্ভিস',
    badge: '🏨 হোটেল'
  });

  // 2. Transport / Car Service
  const transportPhoto =
    pkg.transportService?.image ||
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

  items.push({
    id: 'combo-transport',
    name: pkg.transportService?.vehicleType || 'প্রাইভেট কার ও ট্রান্সপোর্ট সার্ভিস',
    details:
      pkg.transportService?.routeSummary ||
      'সার্বক্ষণিক রিজার্ভ প্রাইভেট এসি গাড়ি, অভিজ্ঞ লাইসেন্সধারী চালক, ফুয়েল ও সকল দর্শনীয় স্থান পরিদর্শন।',
    price: pkg.transportService?.perDayPerPersonRate ? String(pkg.transportService.perDayPerPersonRate) : '8500',
    photo: transportPhoto,
    tag: 'কার সার্ভিস',
    badge: '🚗 কার'
  });

  // 3. Restaurant / Dining Service
  const diningPhoto =
    pkg.diningService?.image ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

  items.push({
    id: 'combo-dining',
    name: pkg.diningService?.restaurantName || 'রেস্টুরেন্ট ও স্পেশাল ডাইনিং সার্ভিস',
    details: Array.isArray(pkg.diningService?.breakfastMenu) && pkg.diningService.breakfastMenu.length > 0
      ? `প্রতিদিনের ৩ বেলা স্বাস্থ্যকর ও সুস্বাদু খাবার মেনু: ${pkg.diningService.breakfastMenu.slice(0, 2).join(', ')}`
      : 'প্রতিদিনের স্পেশাল ৩ বেলা বুফে, লোকাল তাজা সীফুড ডিনার ও ঐতিহ্যবাহী হালাল খাবার।',
    price: pkg.diningService?.perDayPerPersonRate ? String(pkg.diningService.perDayPerPersonRate) : '4500',
    photo: diningPhoto,
    tag: 'রেস্টুরেন্ট সার্ভিস',
    badge: '🍽️ রেস্টুরেন্ট'
  });

  // 4. Guided Sightseeing & Tickets (Optional 4th item if package gallery or inclusions exist)
  if (Array.isArray(pkg.gallery) && pkg.gallery.length > 2) {
    const fourthPhoto = pkg.gallery[1]?.url || pkg.gallery[2]?.url;
    if (fourthPhoto) {
      items.push({
        id: 'combo-guide',
        name: 'দর্শনীয় স্থান এন্ট্রি পাস ও গাইড সার্ভিস',
        details: 'সকল দর্শনীয় স্থান ও জাতীয় উদ্যানের ভিআইপি এন্ট্রি টিকেট এবং অভিজ্ঞ স্থানীয় ট্যুর গাইড।',
        price: '2500',
        photo: fourthPhoto,
        tag: 'গাইড ও পাস',
        badge: '🎫 টিকেট ও গাইড'
      });
    }
  }

  return items;
};

// Check if a package is a Combo Package (Multi-service combo package)
export const isComboPackage = (pkg) => {
  if (!pkg) return false;
  if (pkg.packageType === 'single') return false;
  if (pkg.packageType === 'combo') return true;
  if (pkg.category === 'Single Package' || pkg.category === 'সিঙ্গেল প্যাকেজ') return false;
  if (pkg.category === 'Combo Package' || pkg.category === 'কম্বো প্যাকেজ') return true;
  if (Array.isArray(pkg.comboItems) && pkg.comboItems.length > 1) return true;
  if (pkg.hotelService && pkg.transportService && pkg.diningService) return true;
  return false;
};

// Check if a package is a Single Package (Dedicated standalone tour package)
export const isSinglePackage = (pkg) => !isComboPackage(pkg);

