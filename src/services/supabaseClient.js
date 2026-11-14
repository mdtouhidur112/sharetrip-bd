import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Backend Client & CMS Media Manager for Travel Agency
 * Storage Bucket: agency-media
 * Credentials loaded strictly from environment variables (.env)
 */

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '').trim();
let rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '').trim();
if (rawKey.startsWith('sb_secret_') && import.meta.env.SUPABASE_ANON_KEY?.startsWith('ey')) {
  rawKey = import.meta.env.SUPABASE_ANON_KEY.trim();
}
const supabaseUrl = rawUrl;
const supabaseAnonKey = rawKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export const getDatabaseBackendStatus = () => {
  if (isSupabaseConfigured && supabase) {
    return {
      type: 'supabase',
      label: 'Supabase PostgreSQL & Media Bucket লাইভ কানেক্টেড (share-trip-BD)',
      color: 'emerald',
      cloud: true
    };
  }
  return {
    type: 'local',
    label: 'হাই-পারফরম্যান্স লোকাল মোড (Supabase প্রস্তুত)',
    color: 'teal',
    cloud: false
  };
};

// =========================================================================
// SUPABASE STORAGE MEDIA MANAGER (agency-media)
// =========================================================================

export const STORAGE_BUCKET = 'agency-media';

/**
 * Extracts Supabase Storage relative path from a full URL
 * e.g. https://xyz.supabase.co/storage/v1/object/public/agency-media/packages/photo.webp -> packages/photo.webp
 */
export const extractStoragePath = (url) => {
  if (!url || typeof url !== 'string') return null;
  const marker = `/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    return decodeURIComponent(url.substring(idx + marker.length).split('?')[0]);
  }
  return null;
};

/**
 * Uploads a local photo or video file directly to Supabase Storage bucket 'agency-media'
 * @param {File} file - Photo (.jpg, .png, .webp) or Video (.mp4, .webm)
 * @param {string} folder - 'packages' | 'hotels' | 'reviews' | 'services' | 'admin' | 'general'
 * @returns {Promise<{ success: boolean, url: string, path: string }>}
 */
export const uploadMediaFile = async (file, folder = 'general') => {
  if (!file) throw new Error('কোনো ফাইল সিলেক্ট করা হয়নি।');
  if (!supabase) {
    // Offline / demo fallback using DataURL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ success: true, url: e.target.result, path: 'local-data-url' });
      reader.readAsDataURL(file);
    });
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const fileExt = cleanName.split('.').pop() || 'jpg';
  const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (uploadError) {
    console.error('Supabase Storage Upload Error:', uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return {
    success: true,
    url: publicUrlData.publicUrl,
    path: filePath
  };
};

/**
 * Deletes photos or videos permanently from Supabase Storage bucket 'agency-media'
 * @param {string | string[]} urlsOrPaths - Full URLs or relative storage paths
 */
export const removeStorageFiles = async (urlsOrPaths) => {
  if (!supabase || !urlsOrPaths) return;
  const list = Array.isArray(urlsOrPaths) ? urlsOrPaths : [urlsOrPaths];
  const pathsToDelete = list
    .map(item => (typeof item === 'string' && item.startsWith('http') ? extractStoragePath(item) : item))
    .filter(p => p && typeof p === 'string' && p !== 'local-data-url');

  if (pathsToDelete.length === 0) return;

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(pathsToDelete);
    if (error) {
      console.warn('Storage cleanup warning:', error);
    }
  } catch (err) {
    console.warn('Could not remove storage files:', err);
  }
};

/**
 * Recursively extracts all Supabase Storage URLs from an item and its child arrays
 */
export const extractAllMediaUrlsFromItem = (item) => {
  const urls = [];
  if (!item || typeof item !== 'object') return urls;

  if (item.image && typeof item.image === 'string') urls.push(item.image);
  if (item.avatar && typeof item.avatar === 'string') urls.push(item.avatar);
  if (item.videoUrl && typeof item.videoUrl === 'string') urls.push(item.videoUrl);

  if (Array.isArray(item.gallery)) {
    item.gallery.forEach(g => {
      if (g && typeof g === 'object' && g.url) urls.push(g.url);
      else if (typeof g === 'string') urls.push(g);
    });
  }

  if (Array.isArray(item.featuredHotels)) {
    item.featuredHotels.forEach(h => {
      if (h && typeof h === 'object' && h.image) urls.push(h.image);
    });
  }

  return urls;
};

/**
 * Universal Permanent Cascade Delete:
 * 1. Storage Cleanup: Deletes hosted photos & videos from 'agency-media'
 * 2. Database Cleanup: Deletes record from Supabase table
 * 3. Returns success flag for instant UI sync
 */
export const handlePermanentDelete = async (table, item) => {
  if (!item || !item.id) throw new Error('মুছে ফেলার জন্য সঠিক আইটেম আইডি প্রয়োজন।');

  // Step 1: Storage Cleanup (Photos & Videos)
  const mediaUrls = extractAllMediaUrlsFromItem(item);
  if (mediaUrls.length > 0) {
    await removeStorageFiles(mediaUrls);
  }

  // Step 2: Database Cleanup
  if (supabase) {
    const { error: dbError } = await supabase
      .from(table)
      .delete()
      .eq('id', item.id);
    if (dbError) {
      console.error(`Error deleting from table ${table}:`, dbError);
      throw dbError;
    }
  }

  return {
    success: true,
    deletedId: item.id,
    table
  };
};

// =========================================================================
// MAPPERS: JSON/Frontend CamelCase <-> PostgreSQL SnakeCase
// =========================================================================

// 1. Packages
export const rowToPackage = (r) => {
  const rawFeatures = Array.isArray(r.features) ? r.features : [];
  const metaObj = rawFeatures.find((f) => f && typeof f === 'object' && f._meta) || {};
  const cleanFeatures = rawFeatures.filter((f) => !(f && typeof f === 'object' && f._meta));

  const defaultHotelService = {
    name: r.featured_hotels?.[0]?.name || 'প্রিমিয়াম ৫-তারকা রিসোর্ট ও ভিলা',
    roomType: r.featured_hotels?.[0]?.roomType || 'ডিলাক্স কাপল / ফ্যামিলি স্যুট',
    location: r.featured_hotels?.[0]?.location || r.location || '',
    rating: Number(r.featured_hotels?.[0]?.rating || 4.8),
    perDayRate: Number(r.featured_hotels?.[0]?.pricePerNight || 120),
    image: r.featured_hotels?.[0]?.image || r.image || '',
    description: r.featured_hotels?.[0]?.description || 'মনোরম পরিবেশে আধুনিক সুযোগ-সুবিধাসম্পন্ন বিলাসবহুল আবাসন।',
    specs: [
      { label: 'ফ্লোর নম্বর (Floor)', value: '৩য় - ৫ম তলা (প্যানোরামিক ভিউ)' },
      { label: 'মোট রুম (Total Rooms)', value: '২ টি প্রশস্ত বেডরুম ও ব্যালকনি' },
      { label: 'বাথরুম (Bathrooms)', value: '২ টি অ্যাটাচড গিজার ও বাথটাব' },
      { label: 'বেড কনফিগারেশন (Bed)', value: '২ টি কিং সাইজ প্রিমিয়াম বেড' },
      { label: 'এসি ও ওয়াইফাই', value: 'সেন্ট্রাল এসি ও হাই-স্পিড ফাইবার ওয়াইফাই' }
    ]
  };

  const defaultTransportService = {
    vehicleType: 'প্রাইভেট এসি এসইউভি / ৪x৪ ল্যান্ড ক্রুজার ও স্পিডবোট',
    perDayPerPersonRate: 25,
    routeSummary: 'এয়ারপোর্ট/স্টেশন পিকআপ -> রিসোর্ট চেক-ইন -> সকল দর্শনীয় স্পট সাইটসিইং -> এয়ারপোর্ট ড্রপ-অফ',
    sightseeingLocations: Array.isArray(r.highlights) && r.highlights.length > 0
      ? r.highlights
      : ['প্রধান ভিউ পয়েন্ট ও সানরাইজ পয়েন্ট', 'হেরিটেজ সাইট ও ন্যাশনাল পার্ক', 'লোকাল বিচ ও ক্রুজ পয়েন্ট']
  };

  const defaultDiningService = {
    restaurantName: 'রিসোর্ট ইন-হাউস মাল্টি-কুইজিন ও হালাল রেস্তোরাঁ',
    perDayPerPersonRate: 20,
    breakfastMenu: ['ওয়েলকাম ফ্রেশ জুস ও ট্রপিক্যাল ফল', 'পরোটা / নান, ভাজি, ডিম অমলেট ও চিকেন সুপ', 'ব্রেড টোস্ট, বাটার, জ্যাম এবং চা / প্রিমিয়াম কফি'],
    lunchMenu: ['স্টিমড বাসমতি রাইস / পোলাও ও মিক্সড ভেজিটেবল', 'লোকাল ফিশ কারি / রোস্ট চিকেন / বিফ ভুনা', 'ফ্রেশ সালাদ, ডাল মাখানি ও স্পেশাল ডেজার্ট'],
    dinnerMenu: ['লাইভ বারবিকিউ চিকেন / গ্রিলড সি-ফুড প্ল্যাটার', 'গার্লিক নান / ফ্রাইড রাইস ও বাটার মাসালা', 'স্থানীয় ঐতিহ্যবাহী মিষ্টান্ন ও সফট ড্রিংকস']
  };

  const defaultEligibility = {
    childrenSuitability: 'শিশুদের জন্য সম্পূর্ণ নিরাপদ (৩+ বছর)',
    seniorsSuitability: 'প্রবীণদের জন্য উপযোগী (হুইলচেয়ার ও ইজি অ্যাক্সেস)',
    fitnessLevel: 'সাধারণ / মডারেট ফিটনেস (Easy to Moderate)',
    requiredDocuments: 'জাতীয় পরিচয়পত্র (NID) / জন্ম নিবন্ধন অথবা বৈধ পাসপোর্ট (আন্তর্জাতিক ভ্রমণে কমপক্ষে ৬ মাস মেয়াদ)'
  };

  const defaultPricingMeta = {
    defaultGuests: 2,
    couplePrice: Number(r.price || 0) * 1.9,
    groupDiscountPercent: 10,
    groupMinGuests: 4,
    vatTaxLabel: '১৫% সরকারি ভ্যাট ও সকল রিসোর্ট ট্যাক্স অন্তর্ভুক্ত'
  };

  const rawVideoUrls =
    (Array.isArray(r.video_urls) && r.video_urls.length > 0 && r.video_urls) ||
    (Array.isArray(metaObj.videoUrls) && metaObj.videoUrls.length > 0 && metaObj.videoUrls) ||
    (r.video_url ? [{ url: r.video_url, title: `${r.short_title || r.title} - ভিডিও ট্যুর` }] : []);

  return {
    id: r.id,
    slug: r.slug || metaObj.slug || r.id,
    title: r.title,
    shortTitle: r.short_title || r.title,
    location: r.location,
    mapLocation: r.map_location || metaObj.mapLocation || r.location || 'Bali, Indonesia',
    category: r.category || 'all',
    rating: Number(r.rating || 4.8),
    reviews: Number(r.reviews || 0),
    duration: r.duration,
    groupType: r.group_type || metaObj.groupType || 'প্রাইভেট ও ফ্যামিলি ট্যুর',
    bestSeason: r.best_season || metaObj.bestSeason || 'সারা বছর (অক্টোবর - মার্চ সেরা)',
    advancePaymentPercent: r.advance_payment_percent ?? metaObj.advancePaymentPercent ?? 50,
    cancellationPolicy:
      r.cancellation_policy ||
      metaObj.cancellationPolicy ||
      'ভ্রমণের ৭ দিন পূর্বে বাতিল করলে ৯০% রিফান্ড এবং ৭২ ঘণ্টা পূর্বে ৫০% রিফান্ড প্রযোজ্য।',
    price: Number(r.price || 0),
    originalPrice: r.original_price ? Number(r.original_price) : undefined,
    priceNote: r.price_note || '/ জন',
    tag: r.tag,
    tagColor: r.tag_color,
    image: r.image,
    videoUrl: r.video_url || rawVideoUrls[0]?.url || '',
    videoUrls: rawVideoUrls,
    hotelService: {
      ...defaultHotelService,
      ...(r.hotel_service && Object.keys(r.hotel_service).length > 0 ? r.hotel_service : {}),
      ...(metaObj.hotelService || {})
    },
    transportService: {
      ...defaultTransportService,
      ...(r.transport_service && Object.keys(r.transport_service).length > 0 ? r.transport_service : {}),
      ...(metaObj.transportService || {})
    },
    diningService: {
      ...defaultDiningService,
      ...(r.dining_service && Object.keys(r.dining_service).length > 0 ? r.dining_service : {}),
      ...(metaObj.diningService || {})
    },
    eligibility: {
      ...defaultEligibility,
      ...(r.eligibility && Object.keys(r.eligibility).length > 0 ? r.eligibility : {}),
      ...(metaObj.eligibility || {})
    },
    pricingMeta: {
      ...defaultPricingMeta,
      ...(r.pricing_meta && Object.keys(r.pricing_meta).length > 0 ? r.pricing_meta : {}),
      ...(metaObj.pricingMeta || {})
    },
    gallery: Array.isArray(r.gallery) ? r.gallery : [],
    features: cleanFeatures,
    highlights: Array.isArray(r.highlights) ? r.highlights : [],
    included: Array.isArray(r.included) ? r.included : [],
    excluded: Array.isArray(r.excluded) ? r.excluded : [],
    inclusions: Array.isArray(r.inclusions) ? r.inclusions : [],
    comboItems: Array.isArray(metaObj.comboItems) && metaObj.comboItems.length > 0 
      ? metaObj.comboItems 
      : (Array.isArray(r.inclusions) && r.inclusions.length > 0 && r.inclusions[0]?.price !== undefined)
        ? r.inclusions
        : [],
    featuredHotels: Array.isArray(r.featured_hotels) ? r.featured_hotels : [],
    description: r.description || '',
    overview: r.description || '',
    itinerary: Array.isArray(r.itinerary) ? r.itinerary : [],
    faq: Array.isArray(r.faq) ? r.faq : [],
    reviewsList: Array.isArray(r.reviews_list) ? r.reviews_list : [],
    lastUpdated: r.last_updated
  };
};

export const packageToRow = (p) => {
  const existingFeatures = Array.isArray(p.features)
    ? p.features.filter((f) => !(f && typeof f === 'object' && f._meta))
    : [];

  const metaFeature = {
    _meta: true,
    slug: p.slug || p.id,
    mapLocation: p.mapLocation || p.location || '',
    groupType: p.groupType || 'প্রাইভেট ও ফ্যামিলি ট্যুর',
    bestSeason: p.bestSeason || 'সারা বছর (অক্টোবর - মার্চ সেরা)',
    advancePaymentPercent: Number(p.advancePaymentPercent ?? 50),
    cancellationPolicy:
      p.cancellationPolicy ||
      'ভ্রমণের ৭ দিন পূর্বে বাতিল করলে ৯০% রিফান্ড এবং ৭২ ঘণ্টা পূর্বে ৫০% রিফান্ড প্রযোজ্য।',
    videoUrls: Array.isArray(p.videoUrls) ? p.videoUrls : [],
    comboItems: Array.isArray(p.comboItems) ? p.comboItems : [],
    hotelService: p.hotelService || {},
    transportService: p.transportService || {},
    diningService: p.diningService || {},
    eligibility: p.eligibility || {},
    pricingMeta: p.pricingMeta || {}
  };

  return {
    id: p.id || p.slug || `pkg-${Date.now()}`,
    title: p.title,
    short_title: p.shortTitle || p.title,
    location: p.location || '',
    category: p.category || 'all',
    rating: Number(p.rating || 4.8),
    reviews: Number(p.reviews || 0),
    duration: p.duration || '',
    price: Number(p.price || 0),
    original_price: p.originalPrice ? Number(p.originalPrice) : null,
    price_note: p.priceNote || '/ জন',
    tag: p.tag || null,
    tag_color: p.tagColor || null,
    image: p.image || '',
    video_url: p.videoUrl || p.videoUrls?.[0]?.url || null,
    gallery: p.gallery || [],
    features: [...existingFeatures, metaFeature],
    highlights: p.highlights || [],
    included: p.included || [],
    excluded: p.excluded || [],
    inclusions: p.inclusions || [],
    featured_hotels: p.featuredHotels || [],
    description: p.overview || p.description || '',
    itinerary: p.itinerary || [],
    faq: p.faq || [],
    reviews_list: p.reviewsList || [],
    last_updated: new Date().toISOString()
  };
};

// 2. Hotels
export const rowToHotel = (r) => ({
  id: r.id,
  name: r.name || '',
  shortDescription: r.short_description || '',
  checkInTime: r.check_in_time || '',
  checkOutTime: r.check_out_time || '',
  destinationId: r.destination_id || r.location || '',
  location: r.location || '',
  bookingPrice: Number(r.booking_price ?? r.price_per_night ?? 0),
  pricePerNight: Number(r.price_per_night ?? r.booking_price ?? 0),
  bookingDays: r.booking_days || '1',
  vatTaxPercentage: Number(r.vat_tax_percentage ?? 5),
  shortInfoItems: Array.isArray(r.short_info_items)
    ? r.short_info_items
    : Array.isArray(r.amenities)
      ? r.amenities
      : [],
  details: r.details || r.description || '',
  description: r.description || r.details || '',
  defaultPhoto: r.default_photo || r.image || '',
  image: r.image || r.default_photo || '',
  galleryPhotos: Array.isArray(r.gallery_photos) ? r.gallery_photos : [],
  youtubeLink: r.youtube_link || '',
  locationLink: r.location_link || '',
  rating: Number(r.rating || 4.8),
  reviewsCount: Number(r.reviews_count || 0),
  roomType: r.room_type || '',
  amenities: Array.isArray(r.amenities) ? r.amenities : [],
  packageId: r.package_id
});

export const hotelToRow = (h) => ({
  id: h.id || `hotel-${Date.now()}`,
  name: h.name || '',
  short_description: h.shortDescription || '',
  check_in_time: h.checkInTime || '',
  check_out_time: h.checkOutTime || '',
  destination_id: h.destinationId || '',
  location: h.destinationId || h.location || '',
  booking_price: Number(h.bookingPrice ?? h.pricePerNight ?? 0),
  price_per_night: Number(h.bookingPrice ?? h.pricePerNight ?? 0),
  booking_days: String(h.bookingDays || '1'),
  vat_tax_percentage: Number(h.vatTaxPercentage ?? 5),
  short_info_items: Array.isArray(h.shortInfoItems) ? h.shortInfoItems : [],
  details: h.details || h.description || '',
  description: h.details || h.description || '',
  default_photo: h.defaultPhoto || h.image || '',
  image: h.defaultPhoto || h.image || '',
  gallery_photos: Array.isArray(h.galleryPhotos) ? h.galleryPhotos : [],
  youtube_link: h.youtubeLink || '',
  location_link: h.locationLink || '',
  rating: Number(h.rating || 4.8),
  reviews_count: Number(h.reviewsCount || 0),
  room_type: h.roomType || '',
  amenities: Array.isArray(h.shortInfoItems) ? h.shortInfoItems : (h.amenities || []),
  package_id: h.packageId || null,
  updated_at: new Date().toISOString()
});

// 3. Reviews
export const rowToReview = (r) => ({
  id: r.id,
  name: r.name,
  location: r.location,
  trip: r.trip,
  rating: Number(r.rating || 5),
  avatar: r.avatar,
  quote: r.quote,
  verified: Boolean(r.verified),
  date: r.date
});

export const reviewToRow = (rv) => ({
  id: rv.id || `rev-${Date.now()}`,
  name: rv.name || '',
  location: rv.location || '',
  trip: rv.trip || '',
  rating: Number(rv.rating || 5),
  avatar: rv.avatar || '',
  quote: rv.quote || '',
  verified: rv.verified !== false,
  date: rv.date || 'আজ যুক্ত হয়েছেন',
  updated_at: new Date().toISOString()
});

// 4. Services
export const rowToService = (r) => ({
  id: r.id,
  title: r.title,
  subtitle: r.subtitle,
  description: r.description,
  icon: r.icon || 'Compass',
  color: r.color || 'from-teal-500/20 to-cyan-500/10',
  borderAccent: r.border_accent || 'hover:border-teal-400/50',
  perks: Array.isArray(r.perks) ? r.perks : []
});

export const serviceToRow = (s) => ({
  id: s.id || `srv-${Date.now()}`,
  title: s.title || '',
  subtitle: s.subtitle || '',
  description: s.description || '',
  icon: s.icon || 'Compass',
  color: s.color || 'from-teal-500/20 to-cyan-500/10',
  border_accent: s.borderAccent || 'hover:border-teal-400/50',
  perks: s.perks || [],
  updated_at: new Date().toISOString()
});

// 5. Contact Info
export const rowToContactInfo = (r) => ({
  hours: {
    weekdays: r.weekdays_hours,
    weekends: r.weekends_hours,
    emergency: r.emergency_hours
  },
  address: {
    primary: r.primary_address,
    satellite: r.satellite_address,
    mapLink: r.map_link
  },
  phone: {
    hotline: r.hotline_phone,
    tollFree: r.toll_free_phone
  },
  email: {
    concierge: r.concierge_email,
    bookings: r.bookings_email
  },
  whatsapp: r.whatsapp
});

export const contactInfoToRow = (c) => ({
  id: 'primary',
  weekdays_hours: c.hours?.weekdays || '',
  weekends_hours: c.hours?.weekends || '',
  emergency_hours: c.hours?.emergency || '',
  primary_address: c.address?.primary || '',
  satellite_address: c.address?.satellite || '',
  map_link: c.address?.mapLink || '',
  hotline_phone: c.phone?.hotline || '',
  toll_free_phone: c.phone?.tollFree || '',
  concierge_email: c.email?.concierge || '',
  bookings_email: c.email?.bookings || '',
  whatsapp: c.whatsapp || '',
  updated_at: new Date().toISOString()
});

// 6. Bookings
export const rowToBooking = (r) => {
  const rawDate = r.travel_date || '';
  let checkInDate = r.check_in_date || '';
  let checkOutDate = r.check_out_date || '';
  if (!checkInDate && rawDate.includes(' to ')) {
    const parts = rawDate.split(' to ');
    checkInDate = parts[0]?.trim() || '';
    checkOutDate = parts[1]?.trim() || '';
  } else if (!checkInDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
    checkInDate = rawDate.trim();
    checkOutDate = rawDate.trim();
  }

  let selectedServices = r.selected_services && typeof r.selected_services === 'object'
    ? r.selected_services
    : { hotel: true, transport: true, dining: true };
  let priceBreakdown = r.price_breakdown && typeof r.price_breakdown === 'object'
    ? r.price_breakdown
    : {};
  let selectedDays = Number(r.selected_days) || 1;
  let cleanNotes = r.special_notes || '';
  let extraMeta = {};

  // Also check if JSON metadata was embedded in special_notes for backward compatibility
  if (cleanNotes.includes('||META:')) {
    const [notePart, metaPart] = cleanNotes.split('||META:');
    cleanNotes = notePart.trim();
    try {
      const parsedMeta = JSON.parse(metaPart);
      extraMeta = parsedMeta || {};
      if (parsedMeta.selectedServices) selectedServices = parsedMeta.selectedServices;
      if (parsedMeta.priceBreakdown) priceBreakdown = parsedMeta.priceBreakdown;
      if (parsedMeta.selectedDays) selectedDays = Number(parsedMeta.selectedDays) || 1;
      if (parsedMeta.checkInDate && !checkInDate) checkInDate = parsedMeta.checkInDate;
      if (parsedMeta.checkOutDate && !checkOutDate) checkOutDate = parsedMeta.checkOutDate;
    } catch (_) {
      // ignore parse error
    }
  }

  const numericTotal = Number(String(r.total_price || 0).replace(/[^0-9.-]/g, '')) || 0;
  const advancePaid = Number(r.advance_paid ?? extraMeta.advancePaid ?? 0) || 0;
  const dueAmount = Math.max(0, Number(r.due_amount ?? extraMeta.dueAmount ?? (numericTotal - advancePaid)) || 0);
  const paymentMethod = r.payment_method || extraMeta.paymentMethod || 'Cash';
  const paymentStatus = r.payment_status || extraMeta.paymentStatus || (dueAmount === 0 && numericTotal > 0 ? 'Paid' : advancePaid > 0 ? 'Partial' : 'Pending');

  return {
    id: r.id,
    type: r.type || 'booking',
    packageId: r.package_id,
    packageTitle: r.package_title,
    itemTitle: extraMeta.itemTitle || r.package_title || '',
    hotelName: extraMeta.hotelName || r.package_title || '',
    fullName: r.full_name,
    customerName: extraMeta.customerName || r.full_name || '',
    phone: r.phone,
    customerPhone: extraMeta.customerPhone || r.phone || '',
    customerWhatsApp: extraMeta.customerWhatsApp || r.phone || '',
    email: r.email,
    customerEmail: r.email || '',
    travelDate: rawDate,
    checkInDate,
    checkOutDate,
    selectedDays,
    days: selectedDays,
    selectedServices,
    priceBreakdown,
    travelers: r.travelers || 1,
    guests: r.travelers || 1,
    adults: extraMeta.adults ?? null,
    children: extraMeta.children ?? null,
    taxAmount: Number(r.tax_amount ?? extraMeta.taxAmount ?? 0) || 0,
    vatTaxPercentage: Number(r.vat_tax_percentage ?? extraMeta.vatTaxPercentage ?? 0) || 0,
    serviceType: extraMeta.serviceType || '',
    bookingType: extraMeta.bookingType || '',
    pickup: extraMeta.pickup || '',
    dropoff: extraMeta.dropoff || '',
    destination: extraMeta.destination || '',
    mealPlan: extraMeta.mealPlan || '',
    roomType: extraMeta.roomType || '',
    vehicleType: extraMeta.vehicleType || '',
    rooms: extraMeta.rooms ?? null,
    seats: extraMeta.seats ?? null,
    arrivalTime: extraMeta.arrivalTime || '',
    confirmedByName: extraMeta.confirmedByName || '',
    confirmedByPhone: extraMeta.confirmedByPhone || '',
    confirmedByWhatsapp: extraMeta.confirmedByWhatsapp || '',
    confirmedAt: extraMeta.confirmedAt || '',
    totalPrice: r.total_price,
    advancePaid,
    dueAmount,
    paymentMethod,
    paymentStatus,
    specialNotes: cleanNotes,
    inquiryTopic: r.inquiry_topic,
    status: r.status,
    timestamp: r.timestamp
  };
};

export const bookingToRow = (b) => {
  const travelRange = (b.checkInDate && b.checkOutDate)
    ? `${b.checkInDate} to ${b.checkOutDate}`
    : (b.travelDate || b.checkInDate || '');

  const numericTotal = Number(String(b.totalPrice || 0).replace(/[^0-9.-]/g, '')) || 0;
  const advancePaid = Number(b.advancePaid ?? 0) || 0;
  const dueAmount = Math.max(0, Number(b.dueAmount ?? (numericTotal - advancePaid)) || 0);
  const paymentMethod = b.paymentMethod || 'Cash';
  const paymentStatus = b.paymentStatus || (dueAmount === 0 && numericTotal > 0 ? 'Paid' : advancePaid > 0 ? 'Partial' : 'Pending');

  const metaPayload = JSON.stringify({
    checkInDate: b.checkInDate || '',
    checkOutDate: b.checkOutDate || '',
    selectedDays: Number(b.selectedDays || b.days) || 1,
    selectedServices: b.selectedServices || { hotel: true, transport: true, dining: true },
    priceBreakdown: b.priceBreakdown || {},
    advancePaid,
    dueAmount,
    paymentMethod,
    paymentStatus,
    itemTitle: b.itemTitle || b.hotelName || b.packageTitle || '',
    hotelName: b.hotelName || b.itemTitle || b.packageTitle || '',
    customerName: b.customerName || b.fullName || '',
    customerPhone: b.customerPhone || b.phone || '',
    customerWhatsApp: b.customerWhatsApp || b.phone || '',
    adults: b.adults ?? null,
    children: b.children ?? null,
    taxAmount: Number(b.taxAmount ?? 0) || 0,
    vatTaxPercentage: Number(b.vatTaxPercentage ?? 0) || 0,
    serviceType: b.serviceType || '',
    bookingType: b.bookingType || '',
    pickup: b.pickup || '',
    dropoff: b.dropoff || '',
    destination: b.destination || '',
    mealPlan: b.mealPlan || '',
    roomType: b.roomType || '',
    vehicleType: b.vehicleType || '',
    rooms: b.rooms ?? null,
    seats: b.seats ?? null,
    arrivalTime: b.arrivalTime || '',
    confirmedByName: b.confirmedByName || '',
    confirmedByPhone: b.confirmedByPhone || '',
    confirmedByWhatsapp: b.confirmedByWhatsapp || '',
    confirmedAt: b.confirmedAt || ''
  });

  const baseNotes = (b.specialNotes || '').split('||META:')[0].trim();
  const combinedNotes = `${baseNotes} ||META:${metaPayload}`.trim();

  return {
    id: b.id,
    type: b.type || 'booking',
    package_id: b.packageId || b.itemId || null,
    package_title: b.packageTitle || b.itemTitle || b.hotelName || '',
    full_name: b.fullName || b.customerName || '',
    phone: b.phone || b.customerPhone || '',
    email: b.email || b.customerEmail || '',
    travel_date: travelRange,
    travelers: Number(b.travelers || b.guests || 1),
    total_price: b.totalPrice || '',
    special_notes: combinedNotes,
    inquiry_topic: b.inquiryTopic || null,
    status: b.status || 'Pending',
    timestamp: b.timestamp || new Date().toISOString()
  };
};

// 6b. Package Categories
export const rowToPackageCategory = (r) => ({
  id: r.id,
  name: r.name,
  labelBn: r.label_bn || r.name,
  slug: r.slug || r.id,
  icon: r.icon || 'Compass',
  badgeColor: r.badge_color || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
});

export const packageCategoryToRow = (c) => ({
  id: c.id || `cat-${Date.now()}`,
  name: c.name || '',
  label_bn: c.labelBn || c.name || '',
  slug: c.slug || (c.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  icon: c.icon || 'Compass',
  badge_color: c.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  updated_at: new Date().toISOString()
});

// 7. Users
export const rowToUser = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  avatar: r.avatar,
  role: r.role || 'user',
  tier: r.tier || 'Standard Voyager',
  country: r.country || 'বাংলাদেশ 🇧🇩',
  status: r.status || 'Active',
  joinedDate: r.joined_date
});

export const userToRow = (u) => ({
  id: u.id || `usr-${Date.now()}`,
  name: u.name || '',
  email: (u.email || '').trim().toLowerCase(),
  phone: u.phone || '',
  avatar: u.avatar || '',
  role: u.role || 'user',
  tier: u.tier || 'Standard Voyager',
  country: u.country || 'বাংলাদেশ 🇧🇩',
  status: u.status || 'Active',
  joined_date: u.joinedDate || 'আজ যুক্ত হয়েছেন',
  updated_at: new Date().toISOString()
});

// 8. Admin Profile
export const rowToAdminProfile = (r) => ({
  id: r.id || 'root',
  name: r.name,
  email: r.email,
  phone: r.phone,
  address: r.address,
  avatar: r.avatar
});

export const adminProfileToRow = (p) => ({
  id: 'root',
  name: p.name || '',
  email: p.email || '',
  phone: p.phone || '',
  address: p.address || '',
  avatar: p.avatar || '',
  updated_at: new Date().toISOString()
});

// 9. Hero Banner & Web Control
export const rowToHeroBanner = (r) => ({
  id: r?.id || 'primary',
  headline: r?.headline || 'সবার মুখে মুখে ফেরা',
  headlineHighlight: r?.headline_highlight || 'স্বপ্নের ভ্রমণ অভিজ্ঞতা',
  subtitle: r?.subtitle || 'শীর্ষস্থানীয় ট্রাভেল স্থপতিদের নিখুঁত পরিকল্পনায় অংশ নিন নান্দনিক অ্যাডভেঞ্চার, নিরিবিলি লাক্সারি রিসোর্ট ও খাঁটি সাংস্কৃতিক অভিজ্ঞতায়।',
  headlineSize: r?.headline_size || '4xl',
  headlineColor: r?.headline_color || '#FFFFFF',
  headlineBold: r?.headline_bold !== false,
  highlightColor: r?.highlight_color || '#69EBDA',
  subtitleSize: r?.subtitle_size || 'base',
  subtitleColor: r?.subtitle_color || '#F1F5F9',
  subtitleBold: r?.subtitle_bold === true,
  slides: Array.isArray(r?.slides) ? r.slides : [],
  updatedAt: r?.updated_at
});

export const heroBannerToRow = (b) => ({
  id: 'primary',
  headline: b.headline || '',
  headline_highlight: b.headlineHighlight || '',
  subtitle: b.subtitle || '',
  headline_size: b.headlineSize || '4xl',
  headline_color: b.headlineColor || '#FFFFFF',
  headline_bold: b.headlineBold !== false,
  highlight_color: b.highlightColor || '#69EBDA',
  subtitle_size: b.subtitleSize || 'base',
  subtitle_color: b.subtitleColor || '#F1F5F9',
  subtitle_bold: b.subtitleBold === true,
  slides: Array.isArray(b.slides) ? b.slides : [],
  updated_at: new Date().toISOString()
});

// 10. Branding & Logo Settings
export const rowToBranding = (r) => ({
  id: r?.id || 'primary',
  logoUrl: r?.logo_url || '',
  logoType: r?.logo_type || 'both',
  logoWidth: Number(r?.logo_width) || 40,
  logoHeight: Number(r?.logo_height) || 40,
  brandName: r?.brand_name || 'AETHERIA',
  tagline: r?.tagline || 'অভিজাত বিশ্বভ্রমণ',
  textColor: r?.text_color || '#FFFFFF',
  accentColor: r?.accent_color || '#69EBDA',
  updatedAt: r?.updated_at
});

export const brandingToRow = (b) => ({
  id: 'primary',
  logo_url: b.logoUrl || '',
  logo_type: b.logoType || 'both',
  logo_width: Number(b.logoWidth) || 40,
  logo_height: Number(b.logoHeight) || 40,
  brand_name: b.brandName || 'AETHERIA',
  tagline: b.tagline || '',
  text_color: b.textColor || '#FFFFFF',
  accent_color: b.accentColor || '#69EBDA',
  updated_at: new Date().toISOString()
});

// 11. Destinations
export const rowToDestination = (r) => ({
  id: r.id,
  destinationName: r.destination_name || r.title || '',
  title: r.title || r.destination_name || '',
  subtitle: r.subtitle || r.tagline || '',
  tagline: r.tagline || r.subtitle || '',
  shortDescription: r.short_description || r.description || '',
  description: r.description || r.short_description || '',
  badge: r.badge || r.destination_name || r.title || 'গন্তব্য',
  image: r.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  accent: r.accent || 'from-teal-500/20 to-cyan-500/10',
  borderGlow: r.border_glow || 'hover:border-teal-400/40',
  lastUpdated: r.updated_at
});

export const destinationToRow = (d) => ({
  id: d.id || `dest-${Date.now()}`,
  destination_name: d.destinationName || d.title || '',
  title: d.title || d.destinationName || '',
  subtitle: d.subtitle || d.tagline || '',
  tagline: d.tagline || d.subtitle || '',
  short_description: d.shortDescription || d.description || '',
  description: d.description || d.shortDescription || '',
  badge: d.badge || d.destinationName || d.title || 'গন্তব্য',
  image: d.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  accent: d.accent || 'from-teal-500/20 to-cyan-500/10',
  border_glow: d.borderGlow || 'hover:border-teal-400/40',
  updated_at: new Date().toISOString()
});

// 11. Transports
export const rowToTransport = (r) => ({
  id: r.id,
  category: r.category || 'road',
  categoryName: r.category_name || 'রোড সার্ভিস',
  name: r.name || '',
  description: r.description || '',
  details: r.details || '',
  fare: r.fare || '',
  bookingPrice: Number(r.booking_price || 0),
  bookingDays: r.booking_days || '১ দিন',
  destinationId: r.destination_id || '',
  routeFares: Array.isArray(r.route_fares) ? r.route_fares : [],
  features: Array.isArray(r.features) ? r.features : [],
  shortInfoItems: Array.isArray(r.short_info_items) ? r.short_info_items : [],
  photo: r.photo || r.default_photo || '',
  defaultPhoto: r.default_photo || r.photo || '',
  galleryPhotos: Array.isArray(r.gallery_photos) ? r.gallery_photos : [],
  youtubeLink: r.youtube_link || '',
  locationLink: r.location_link || '',
  checkInTime: r.check_in_time || '',
  checkOutTime: r.check_out_time || '',
  vatTaxPercentage: Number(r.vat_tax_percentage ?? 5),
  rating: Number(r.rating ?? 4.8),
  reviewsCount: Number(r.reviews_count ?? 0),
  route: r.route || '',
  airports: r.airports || '',
  flightTime: r.flight_time || '',
  model: r.model || '',
  capacity: r.capacity || ''
});

export const transportToRow = (t) => ({
  id: t.id || `trans-${Date.now()}`,
  category: t.category || 'road',
  category_name: t.categoryName || 'রোড সার্ভিস',
  name: t.name || '',
  description: t.description || '',
  details: t.details || '',
  fare: t.fare || '',
  booking_price: Number(t.bookingPrice || 0),
  booking_days: String(t.bookingDays || '১ দিন'),
  destination_id: t.destinationId || '',
  route_fares: Array.isArray(t.routeFares) ? t.routeFares : [],
  features: Array.isArray(t.features) ? t.features : [],
  short_info_items: Array.isArray(t.shortInfoItems) ? t.shortInfoItems : [],
  photo: t.photo || t.defaultPhoto || '',
  default_photo: t.defaultPhoto || t.photo || '',
  gallery_photos: Array.isArray(t.galleryPhotos) ? t.galleryPhotos : [],
  youtube_link: t.youtubeLink || '',
  location_link: t.locationLink || '',
  check_in_time: t.checkInTime || '',
  check_out_time: t.checkOutTime || '',
  vat_tax_percentage: Number(t.vatTaxPercentage ?? 5),
  rating: Number(t.rating ?? 4.8),
  reviews_count: Number(t.reviewsCount ?? 0),
  route: t.route || '',
  airports: t.airports || '',
  flight_time: t.flightTime || '',
  model: t.model || '',
  capacity: t.capacity || '',
  updated_at: new Date().toISOString()
});

// 12. Restaurants
export const rowToRestaurant = (r) => ({
  id: r.id,
  name: r.name || '',
  mealPlanType: r.meal_plan_type || '',
  badge: r.badge || '',
  ratePerPerson: Number(r.rate_per_person || 0),
  rateLabel: r.rate_label || '',
  tags: Array.isArray(r.tags) ? r.tags : [],
  shortInfoItems: Array.isArray(r.short_info_items) ? r.short_info_items : [],
  breakfastMenu: Array.isArray(r.breakfast_menu) ? r.breakfast_menu : [],
  lunchMenu: Array.isArray(r.lunch_menu) ? r.lunch_menu : [],
  dinnerMenu: Array.isArray(r.dinner_menu) ? r.dinner_menu : [],
  photo: r.photo || r.default_photo || '',
  defaultPhoto: r.default_photo || r.photo || '',
  galleryPhotos: Array.isArray(r.gallery_photos) ? r.gallery_photos : [],
  details: r.details || '',
  youtubeLink: r.youtube_link || '',
  locationLink: r.location_link || '',
  rating: Number(r.rating ?? 4.8),
  reviewsCount: Number(r.reviews_count ?? 0)
});

export const restaurantToRow = (r) => ({
  id: r.id || `rest-${Date.now()}`,
  name: r.name || '',
  meal_plan_type: r.mealPlanType || '',
  badge: r.badge || '',
  rate_per_person: Number(r.ratePerPerson || 0),
  rate_label: r.rateLabel || '',
  tags: Array.isArray(r.tags) ? r.tags : [],
  short_info_items: Array.isArray(r.shortInfoItems) ? r.shortInfoItems : [],
  breakfast_menu: Array.isArray(r.breakfastMenu) ? r.breakfastMenu : [],
  lunch_menu: Array.isArray(r.lunchMenu) ? r.lunchMenu : [],
  dinner_menu: Array.isArray(r.dinnerMenu) ? r.dinnerMenu : [],
  photo: r.photo || r.defaultPhoto || '',
  default_photo: r.defaultPhoto || r.photo || '',
  gallery_photos: Array.isArray(r.galleryPhotos) ? r.galleryPhotos : [],
  details: r.details || '',
  youtube_link: r.youtubeLink || '',
  location_link: r.locationLink || '',
  rating: Number(r.rating ?? 4.8),
  reviews_count: Number(r.reviewsCount ?? 0),
  updated_at: new Date().toISOString()
});

// 13. Partner Brand Logos
export const rowToBrandLogo = (b) => ({
  id: b.id,
  name: b.name || '',
  logoUrl: b.logo_url || '',
  sortOrder: Number(b.sort_order ?? 0),
  createdAt: b.created_at || new Date().toISOString()
});

export const brandLogoToRow = (b) => ({
  id: b.id || `brand-${Date.now()}`,
  name: b.name || '',
  logo_url: b.logoUrl || '',
  sort_order: Number(b.sortOrder ?? 0),
  updated_at: new Date().toISOString()
});

// 14. Operational Expenses
export const rowToExpense = (e) => ({
  id: e.id,
  category: e.category || 'Other',
  amount: Number(e.amount || 0),
  expenseDate: e.expense_date || '',
  note: e.note || '',
  createdAt: e.created_at || new Date().toISOString()
});

export const expenseToRow = (e) => ({
  id: e.id || `exp-${Date.now()}`,
  category: e.category || 'Other',
  amount: Number(e.amount || 0),
  expense_date: e.expenseDate || new Date().toISOString().split('T')[0],
  note: e.note || '',
  updated_at: new Date().toISOString()
});

// 15. About Page CMS
export const rowToAboutPage = (r) => ({
  ...(r?.data || {}),
  id: r?.id || 'primary',
  updatedAt: r?.updated_at || new Date().toISOString()
});

export const aboutPageToRow = (aboutData) => ({
  id: 'primary',
  data: aboutData || {},
  updated_at: new Date().toISOString()
});

// 16. Footer Control CMS
export const rowToFooterSettings = (r) => ({
  ...(r?.data || {}),
  id: r?.id || 'primary',
  updatedAt: r?.updated_at || new Date().toISOString()
});

export const footerSettingsToRow = (footerData) => ({
  id: 'primary',
  data: footerData || {},
  updated_at: new Date().toISOString()
});
