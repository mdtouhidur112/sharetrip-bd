const bnToEnDigits = (str = '') =>
  String(str).replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d));

export const parseNumericFare = (fareStr) => {
  if (typeof fareStr === 'number') return fareStr;
  const en = bnToEnDigits(fareStr || '');
  const cleaned = en.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export const normalizeTransportToCardShape = (item) => {
  const price = parseNumericFare(item.fare);
  const isTrip = String(item.fare || '').includes('ট্রিপ') || String(item.fare || '').includes('ফ্লাইট');
  const isAir = item.category === 'air';

  const fallbackShortInfo = isAir
    ? [
        item.route ? `রুট: ${item.route}` : '',
        item.flightTime ? `ফ্লাইট সময়: ${item.flightTime}` : '',
        item.airports ? `এয়ারপোর্ট: ${item.airports}` : '',
        item.capacity,
        ...(Array.isArray(item.features) ? item.features : [])
      ]
        .filter(Boolean)
        .map((text) => ({ icon: '', text }))
    : [
        item.capacity,
        item.model,
        ...(Array.isArray(item.features) ? item.features : [])
      ]
        .filter(Boolean)
        .map((text) => ({ icon: '', text }));

  const shortInfoItems =
    Array.isArray(item.shortInfoItems) && item.shortInfoItems.length > 0
      ? item.shortInfoItems
      : fallbackShortInfo;

  return {
    ...item,
    serviceType: 'transport',
    defaultPhoto:
      item.photo ||
      item.defaultPhoto ||
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    galleryPhotos:
      Array.isArray(item.galleryPhotos) && item.galleryPhotos.length > 0
        ? item.galleryPhotos
        : [
            item.photo ||
              'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
          ],
    shortDescription: isAir && item.route
      ? `${item.route}${item.flightTime ? ` • ${item.flightTime}` : ''}`
      : item.description || item.model || '',
    shortInfoItems,
    bookingPrice: price,
    bookingDays: isTrip ? '১ ট্রিপ' : '১ দিন',
    location: item.airports || item.categoryName || item.category || 'ট্রান্সপোর্ট সার্ভিস',
    details: [
      item.description,
      item.route ? `ফ্লাইট রুট: ${item.route}` : '',
      item.airports ? `এয়ারপোর্ট তথ্য: ${item.airports}` : '',
      item.flightTime ? `ফ্লাইট সময়সূচী: ${item.flightTime}` : '',
      item.model ? `মডেল / এয়ারক্রাফট: ${item.model}` : '',
      item.capacity ? `যাত্রী ধারণক্ষমতা: ${item.capacity}` : '',
      Array.isArray(item.features) && item.features.length > 0
        ? `সুবিধাসমূহ: ${item.features.join(', ')}`
        : ''
    ]
      .filter(Boolean)
      .join('\n\n'),
    checkInTime: '08:00',
    checkOutTime: '22:00',
    rating: item.rating || 4.8,
    reviewsCount: item.reviewsCount || 0
  };
};

export const normalizeRestaurantToCardShape = (rest) => {
  const price = Number(rest.ratePerPerson || 0);
  const shortInfoItems = [
    rest.mealPlanType,
    ...(Array.isArray(rest.tags) ? rest.tags : []),
    Array.isArray(rest.breakfastMenu) && rest.breakfastMenu.length > 0
      ? `ব্রেকফাস্ট: ${rest.breakfastMenu[0]}`
      : '',
    Array.isArray(rest.dinnerMenu) && rest.dinnerMenu.length > 0
      ? `ডিনার: ${rest.dinnerMenu[0]}`
      : ''
  ]
    .filter(Boolean)
    .map((text) => ({ icon: '', text }));

  return {
    ...rest,
    serviceType: 'restaurant',
    defaultPhoto:
      rest.photo ||
      rest.defaultPhoto ||
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    galleryPhotos:
      Array.isArray(rest.galleryPhotos) && rest.galleryPhotos.length > 0
        ? rest.galleryPhotos
        : [
            rest.photo ||
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
          ],
    shortDescription: `${rest.mealPlanType || ''}${rest.badge ? ` • ${rest.badge}` : ''}`.trim(),
    shortInfoItems,
    bookingPrice: price,
    bookingDays: '১ দিন (জনপ্রতি)',
    location: rest.badge || 'রেস্টুরেন্ট ও ডাইনিং',
    details: [
      rest.mealPlanType ? `মিল প্ল্যান: ${rest.mealPlanType}` : '',
      Array.isArray(rest.tags) && rest.tags.length > 0
        ? `বৈশিষ্ট্য: ${rest.tags.join(', ')}`
        : '',
      Array.isArray(rest.breakfastMenu) && rest.breakfastMenu.length > 0
        ? `ব্রেকফাস্ট মেনু: ${rest.breakfastMenu.join(', ')}`
        : '',
      Array.isArray(rest.lunchMenu) && rest.lunchMenu.length > 0
        ? `লাঞ্চ মেনু: ${rest.lunchMenu.join(', ')}`
        : '',
      Array.isArray(rest.dinnerMenu) && rest.dinnerMenu.length > 0
        ? `ডিনার মেনু: ${rest.dinnerMenu.join(', ')}`
        : ''
    ]
      .filter(Boolean)
      .join('\n\n'),
    checkInTime: '07:30',
    checkOutTime: '22:30',
    rating: rest.rating || 4.8,
    reviewsCount: rest.reviewsCount || 0
  };
};
