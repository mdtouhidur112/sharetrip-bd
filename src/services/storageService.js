import { 
  CATEGORIES,
  POPULAR_PACKAGES, 
  DEFAULT_PACKAGE_CATEGORIES,
  AGENCY_SERVICES, 
  CLIENT_REVIEWS, 
  OFFICE_CONTACT_INFO,
  DEFAULT_HERO_BANNER,
  DEFAULT_BRANDING,
  DEFAULT_TRANSPORT_CATEGORIES,
  DEFAULT_TRANSPORTS
} from '../data/travelData';
import { DEFAULT_ABOUT_PAGE_DATA } from '../data/aboutDefaultData';

import { 
  supabase, 
  packageToRow, 
  rowToPackage, 
  packageCategoryToRow,
  rowToPackageCategory,
  destinationToRow,
  rowToDestination,
  bookingToRow, 
  rowToBooking, 
  userToRow, 
  rowToUser,
  hotelToRow,
  rowToHotel,
  reviewToRow,
  rowToReview,
  serviceToRow,
  rowToService,
  contactInfoToRow,
  rowToContactInfo,
  rowToHeroBanner,
  heroBannerToRow,
  rowToBranding,
  brandingToRow,
  rowToTransport,
  transportToRow,
  rowToRestaurant,
  restaurantToRow,
  rowToBrandLogo,
  brandLogoToRow,
  rowToExpense,
  expenseToRow,
  rowToAboutPage,
  aboutPageToRow,
  rowToFooterSettings,
  footerSettingsToRow,
  rowToSeoSettings,
  seoSettingsToRow,
  rowToServicesControl,
  servicesControlToRow,
  removeStorageFiles,
  handlePermanentDelete
} from './supabaseClient';

const PACKAGES_STORAGE_KEY = 'aetheria_packages_db';
const CATEGORIES_STORAGE_KEY = 'aetheria_pkg_categories_db';
const DESTINATIONS_STORAGE_KEY = 'aetheria_destinations_db';
const BOOKINGS_STORAGE_KEY = 'aetheria_bookings_db';
const USERS_STORAGE_KEY = 'aetheria_registered_users_db';
const HOTELS_STORAGE_KEY = 'aetheria_hotels_db';
const REVIEWS_STORAGE_KEY = 'aetheria_reviews_db';
const SERVICES_STORAGE_KEY = 'aetheria_services_db';
const CONTACT_INFO_STORAGE_KEY = 'aetheria_contact_info_db';
const HERO_BANNER_STORAGE_KEY = 'aetheria_hero_banner_db';
const BRANDING_STORAGE_KEY = 'aetheria_branding_db';
const TRANSPORTS_STORAGE_KEY = 'aetheria_transports_db';
const TRANSPORT_CATEGORIES_STORAGE_KEY = 'aetheria_transport_categories_db';
const RESTAURANTS_STORAGE_KEY = 'aetheria_restaurants_db';
const BRAND_LOGOS_STORAGE_KEY = 'aetheria_brand_logos_db';
const EXPENSES_STORAGE_KEY = 'aetheria_expenses_db';
const ABOUT_PAGE_STORAGE_KEY = 'aetheria_about_page_db';
const SOCIAL_LINKS_STORAGE_KEY = 'aetheria_social_links_db';
const FOOTER_SETTINGS_STORAGE_KEY = 'aetheria_footer_settings_db';
const SEO_SETTINGS_STORAGE_KEY = 'aetheria_seo_settings_db';
const SERVICES_CONTROL_STORAGE_KEY = 'aetheria_services_control_db';

export const DEFAULT_SERVICES_CONTROL = {
  id: 'primary',
  hotels: true,
  transport: true,
  restaurant: true,
  road: true,
  waterway: true,
  air: true,
};

export const DEFAULT_SEO_SETTINGS = {
  id: 'primary',
  siteTitle: 'ShareTrip BD — Curated Travel, Hotels & Tour Packages',
  metaDescription: 'Book curated tour packages, luxury hotels, transport & dining experiences across Bangladesh and worldwide.',
  metaKeywords: 'travel agency bangladesh, tour packages, hotel booking, transport, sharetrip bd',
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterCard: 'summary_large_image',
  twitterSite: '',
  robots: 'index, follow',
  googleVerification: '',
  schemaOrgName: '',
  schemaPhone: '',
  schemaAddress: ''
};

export const DEFAULT_FOOTER_SETTINGS = {
  id: 'primary',
  showNewsletter: true,
  newsletterBadge: 'বিশেষ নিউজলেটার',
  newsletterTitle: 'অপ্রকাশিত ভ্রমণ পরিকল্পনা ও গোপন রিসোর্ট অফার পান',
  newsletterSubtitle: '৪৫,০০০+ ভ্রমণপিপাসুদের সাথে যুক্ত হন এবং মৌসুমী চার্টার ও প্রাইভেট আইল্যান্ড ট্যুরে আগাম ছাড় উপভোগ করুন।',
  description: 'সাতটি মহাদেশ জুড়ে অবিস্মরণীয় ও পরিবেশবান্ধব বিলাসবহুল ভ্রমণ। সর্বোচ্চ বিশ্বমানের আতিথেয়তা ও নিখুঁত সেবা।',
  navTitle: 'ন্যাভিগেশন',
  navLinks: [
    { name: 'Home', href: '#home' },
    { name: 'Destination', href: '#destinations' },
    { name: 'Services', href: '#services' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact-info' },
    { name: 'About', href: '#about' }
  ],
  categoryTitle: 'ভ্রমণ বিভাগ',
  categoryLinks: [
    { name: 'পর্বত ও রোমাঞ্চ', href: '#destinations' },
    { name: 'নীল সাগর সৈকত', href: '#destinations' },
    { name: 'প্রকৃতি ও ট্রেইল', href: '#destinations' },
    { name: 'প্রাইভেট ইয়ট চার্টার', href: '#destinations' },
    { name: 'মেরু অঞ্চলের অভিযান', href: '#destinations' }
  ],
  commitmentTitle: 'আমাদের অঙ্গীকার',
  commitments: [
    '১০০% বিমাকৃত ও সুরক্ষিত',
    'কন্ডে নাস্ট সেরা আর্কিটেক্ট ২০২৬',
    'পরিবেশবান্ধব ও কার্বন মুক্ত'
  ],
  copyrightText: '© ২০২৬ এথেরিয়া ট্রাভেল গ্রুপ। সর্বস্বত্ব সংরক্ষিত।',
  privacyLabel: 'গোপনীয়তা নীতি',
  termsLabel: 'ভ্রমণের শর্তাবলী',
  shareUrl: '',
  shareTitle: '',
  developerPortfolioUrl: '',
  socialLinks: [],
  paymentLogos: []
};

export const DEFAULT_RESTAURANTS = [];

export const INITIAL_HOTELS = [];

// Initial registered users list (Zero mock users: Real registered travelers & admins only)
const INITIAL_USERS = [];

// Initial client bookings (Zero mock bookings: Real inquiries & bookings only)
const INITIAL_BOOKINGS = [];

export const StorageService = {
  // -------------------------------------------------------------
  // SUPABASE LIVE CLOUD SYNC ENGINE
  // -------------------------------------------------------------
  _syncPromise: null,
  initSupabaseSync: async () => {
    if (!supabase) return;
    if (StorageService._syncPromise) return StorageService._syncPromise;
    StorageService._syncPromise = (async () => {
    try {
      // 1. Packages (Sync directly from Supabase - Zero Demo Injection)
      const { data: dbPackages, error: pkgError } = await supabase.from('packages').select('*');
      if (!pkgError && Array.isArray(dbPackages)) {
        localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(dbPackages.map(rowToPackage)));
        window.dispatchEvent(new CustomEvent('app:packages-updated'));
      }

      // 2. Hotels (Sync directly from Supabase - Zero Demo Injection)
      const { data: dbHotels, error: hotelError } = await supabase.from('hotels').select('*');
      if (!hotelError && Array.isArray(dbHotels)) {
        localStorage.setItem(HOTELS_STORAGE_KEY, JSON.stringify(dbHotels.map(rowToHotel)));
        window.dispatchEvent(new CustomEvent('app:hotels-updated'));
      }

      // 3. Reviews (Sync directly from Supabase - Zero Demo Injection)
      const { data: dbReviews, error: revError } = await supabase.from('reviews').select('*');
      if (!revError && Array.isArray(dbReviews)) {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(dbReviews.map(rowToReview)));
        window.dispatchEvent(new CustomEvent('app:reviews-updated'));
      }

      // 4. Services (Sync directly from Supabase - Zero Demo Injection)
      const { data: dbServices, error: srvError } = await supabase.from('services').select('*');
      if (!srvError && Array.isArray(dbServices)) {
        localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(dbServices.map(rowToService)));
        window.dispatchEvent(new CustomEvent('app:services-updated'));
      }

      // 5. Contact Info (Sync directly from Supabase - Zero Demo Injection)
      const { data: dbContact, error: contactError } = await supabase.from('contact_info').select('*').eq('id', 'primary').maybeSingle();
      if (!contactError && dbContact) {
        localStorage.setItem(CONTACT_INFO_STORAGE_KEY, JSON.stringify(rowToContactInfo(dbContact)));
        window.dispatchEvent(new CustomEvent('app:contact-info-updated'));
      }

      // 6. Bookings (Real bookings only - filter out legacy mock entries)
      const { data: dbBookings, error: bkError } = await supabase.from('bookings').select('*').order('timestamp', { ascending: false });
      if (!bkError && Array.isArray(dbBookings)) {
        const cleanBookings = dbBookings
          .filter(b => !['AETH-7842-BK', 'AETH-9104-INQ', 'AETH-6218-BK', 'AETH-4521-BK', 'AETH-3392-INQ'].includes(b.id))
          .map(rowToBooking);
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(cleanBookings));
        window.dispatchEvent(new CustomEvent('app:bookings-updated'));
      }

      // 7. Users (Real registered users only - filter out legacy mock profiles)
      const { data: dbUsers, error: usrError } = await supabase.from('users').select('*');
      if (!usrError && Array.isArray(dbUsers)) {
        const cleanUsers = dbUsers
          .filter(u => 
            !['usr-arif-hasan', 'usr-sarah-ahmed', 'usr-tanvir-rahman', 'usr-elena-vance', 'usr-david-miller'].includes(u.id) &&
            !u.email?.includes('@dhakavoyages.com') &&
            !u.email?.includes('@londonlux.co.uk') &&
            !u.email?.includes('@ctgsteel.com') &&
            !u.email?.includes('@zurichprivate.ch') &&
            !u.email?.includes('@nycapitol.com')
          )
          .map(rowToUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(cleanUsers));
        window.dispatchEvent(new CustomEvent('app:users-updated'));
      }

      // 8. Hero Banner & Web Control (Sync directly from Supabase)
      const { data: dbBanner, error: bannerError } = await supabase.from('hero_banner').select('*').eq('id', 'primary').maybeSingle();
      if (!bannerError && dbBanner) {
        localStorage.setItem(HERO_BANNER_STORAGE_KEY, JSON.stringify(rowToHeroBanner(dbBanner)));
        window.dispatchEvent(new CustomEvent('app:hero-banner-updated'));
      }

      // 9. Branding & Logo Settings (Sync directly from Supabase)
      const { data: dbBranding, error: brandingError } = await supabase.from('branding_settings').select('*').eq('id', 'primary').maybeSingle();
      if (!brandingError && dbBranding) {
        localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(rowToBranding(dbBranding)));
        window.dispatchEvent(new CustomEvent('app:branding-updated'));
      }

      // 10. Package Categories (Sync from Supabase if table exists)
      const { data: dbCategories, error: catError } = await supabase.from('package_categories').select('*');
      if (!catError && Array.isArray(dbCategories) && dbCategories.length > 0) {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(dbCategories.map(rowToPackageCategory)));
        window.dispatchEvent(new CustomEvent('app:categories-updated'));
      }

      // 11. Destinations (Sync directly from Supabase - Zero Demo Injection)
      const { data: dbDestinations, error: destError } = await supabase.from('destinations').select('*');
      if (!destError && Array.isArray(dbDestinations)) {
        localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(dbDestinations.map(rowToDestination)));
        window.dispatchEvent(new CustomEvent('app:destinations-updated'));
      }

      // 11b. Transports (Sync directly from Supabase - Zero Demo Injection)
      const { data: dbTransports, error: transError } = await supabase.from('transports').select('*');
      if (!transError && Array.isArray(dbTransports)) {
        localStorage.setItem(TRANSPORTS_STORAGE_KEY, JSON.stringify(dbTransports.map(rowToTransport)));
        window.dispatchEvent(new CustomEvent('app:transports-updated'));
      }

      // 11c. Restaurants (Sync directly from Supabase - Zero Demo Injection)
      const { data: dbRestaurants, error: restError } = await supabase.from('restaurants').select('*');
      if (!restError && Array.isArray(dbRestaurants)) {
        localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(dbRestaurants.map(rowToRestaurant)));
        window.dispatchEvent(new CustomEvent('app:restaurants-updated'));
      }

      // 11d. Partner Brand Logos (Sync from Supabase)
      const { data: dbBrandLogos, error: brandLogoError } = await supabase
        .from('brand_logos')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (!brandLogoError && Array.isArray(dbBrandLogos)) {
        localStorage.setItem(BRAND_LOGOS_STORAGE_KEY, JSON.stringify(dbBrandLogos.map(rowToBrandLogo)));
        window.dispatchEvent(new CustomEvent('app:brand-logos-updated'));
      }

      // 11e. Operational Expenses (Sync from Supabase)
      const { data: dbExpenses, error: expError } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      if (!expError && Array.isArray(dbExpenses)) {
        localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(dbExpenses.map(rowToExpense)));
        window.dispatchEvent(new CustomEvent('app:expenses-updated'));
      }

      // 11f. About Page CMS (Sync from Supabase)
      const { data: dbAbout, error: aboutError } = await supabase
        .from('about_page')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();
      if (!aboutError && dbAbout) {
        const mergedAbout = { ...DEFAULT_ABOUT_PAGE_DATA, ...rowToAboutPage(dbAbout) };
        localStorage.setItem(ABOUT_PAGE_STORAGE_KEY, JSON.stringify(mergedAbout));
        window.dispatchEvent(new CustomEvent('app:about-page-updated'));
      }

      // 11g. Footer Settings CMS (Sync from Supabase)
      const { data: dbFooter, error: footerError } = await supabase
        .from('footer_settings')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();
      if (!footerError && dbFooter) {
        const mergedFooter = { ...DEFAULT_FOOTER_SETTINGS, ...rowToFooterSettings(dbFooter) };
        localStorage.setItem(FOOTER_SETTINGS_STORAGE_KEY, JSON.stringify(mergedFooter));
        window.dispatchEvent(new CustomEvent('app:footer-settings-updated'));
      }

      // 11h. SEO Settings CMS (Sync from Supabase)
      const { data: dbSeo, error: seoError } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();
      if (!seoError && dbSeo) {
        const mergedSeo = { ...DEFAULT_SEO_SETTINGS, ...rowToSeoSettings(dbSeo) };
        localStorage.setItem(SEO_SETTINGS_STORAGE_KEY, JSON.stringify(mergedSeo));
        window.dispatchEvent(new CustomEvent('app:seo-settings-updated'));
      }

      // 11i. Services Control CMS (Sync from Supabase)
      const { data: dbServicesControl, error: servicesControlError } = await supabase
        .from('services_control')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle();
      if (!servicesControlError && dbServicesControl) {
        const mergedServicesControl = { ...DEFAULT_SERVICES_CONTROL, ...rowToServicesControl(dbServicesControl) };
        localStorage.setItem(SERVICES_CONTROL_STORAGE_KEY, JSON.stringify(mergedServicesControl));
        window.dispatchEvent(new CustomEvent('app:services-control-updated'));
      }

      // 12. Start Persistent Real-Time WebSocket Listeners across all tables
      StorageService.startRealtimeListeners();
    } catch (e) {
      console.warn('Supabase sync notice: Operating in resilient cache mode', e);
    }
    })();
    return StorageService._syncPromise;
  },

  _realtimeChannel: null,
  startRealtimeListeners: () => {
    if (!supabase || StorageService._realtimeChannel) return;
    try {
      StorageService._realtimeChannel = supabase
        .channel('global-agency-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'destinations' }, async () => {
          const { data } = await supabase.from('destinations').select('*');
          if (Array.isArray(data)) {
            localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(data.map(rowToDestination)));
            window.dispatchEvent(new CustomEvent('app:destinations-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' }, async () => {
          const { data } = await supabase.from('packages').select('*');
          if (Array.isArray(data)) {
            localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(data.map(rowToPackage)));
            window.dispatchEvent(new CustomEvent('app:packages-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, async () => {
          const { data } = await supabase.from('hotels').select('*');
          if (Array.isArray(data)) {
            localStorage.setItem(HOTELS_STORAGE_KEY, JSON.stringify(data.map(rowToHotel)));
            window.dispatchEvent(new CustomEvent('app:hotels-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transports' }, async () => {
          const { data } = await supabase.from('transports').select('*');
          if (Array.isArray(data)) {
            localStorage.setItem(TRANSPORTS_STORAGE_KEY, JSON.stringify(data.map(rowToTransport)));
            window.dispatchEvent(new CustomEvent('app:transports-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, async () => {
          const { data } = await supabase.from('restaurants').select('*');
          if (Array.isArray(data)) {
            localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(data.map(rowToRestaurant)));
            window.dispatchEvent(new CustomEvent('app:restaurants-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, async () => {
          const { data } = await supabase.from('reviews').select('*');
          if (Array.isArray(data)) {
            localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(data.map(rowToReview)));
            window.dispatchEvent(new CustomEvent('app:reviews-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, async () => {
          const { data } = await supabase.from('services').select('*');
          if (Array.isArray(data)) {
            localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(data.map(rowToService)));
            window.dispatchEvent(new CustomEvent('app:services-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, async () => {
          const { data } = await supabase.from('bookings').select('*').order('timestamp', { ascending: false });
          if (Array.isArray(data)) {
            localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(data.map(rowToBooking)));
            window.dispatchEvent(new CustomEvent('app:bookings-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_info' }, async () => {
          const { data } = await supabase.from('contact_info').select('*').eq('id', 'primary').maybeSingle();
          if (data) {
            localStorage.setItem(CONTACT_INFO_STORAGE_KEY, JSON.stringify(rowToContactInfo(data)));
            window.dispatchEvent(new CustomEvent('app:contact-info-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_banner' }, async () => {
          const { data } = await supabase.from('hero_banner').select('*').eq('id', 'primary').maybeSingle();
          if (data) {
            localStorage.setItem(HERO_BANNER_STORAGE_KEY, JSON.stringify(rowToHeroBanner(data)));
            window.dispatchEvent(new CustomEvent('app:hero-banner-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'branding_settings' }, async () => {
          const { data } = await supabase.from('branding_settings').select('*').eq('id', 'primary').maybeSingle();
          if (data) {
            localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(rowToBranding(data)));
            window.dispatchEvent(new CustomEvent('app:branding-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'brand_logos' }, async () => {
          const { data, error } = await supabase
            .from('brand_logos')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });
          if (!error && Array.isArray(data)) {
            try {
              localStorage.setItem(BRAND_LOGOS_STORAGE_KEY, JSON.stringify(data.map(rowToBrandLogo)));
            } catch (e) {
              console.warn('Local cache notice (brand_logos):', e);
            }
            window.dispatchEvent(new CustomEvent('app:brand-logos-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'package_categories' }, async () => {
          const { data, error } = await supabase.from('package_categories').select('*');
          if (!error && Array.isArray(data)) {
            localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(data.map(rowToPackageCategory)));
            window.dispatchEvent(new CustomEvent('app:categories-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
          const { data, error } = await supabase.from('users').select('*');
          if (!error && Array.isArray(data)) {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data.map(rowToUser)));
            window.dispatchEvent(new CustomEvent('app:users-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, async () => {
          const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('expense_date', { ascending: false });
          if (!error && Array.isArray(data)) {
            localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(data.map(rowToExpense)));
            window.dispatchEvent(new CustomEvent('app:expenses-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'about_page' }, async () => {
          const { data, error } = await supabase
            .from('about_page')
            .select('*')
            .eq('id', 'primary')
            .maybeSingle();
          if (!error && data) {
            const mergedAbout = { ...DEFAULT_ABOUT_PAGE_DATA, ...rowToAboutPage(data) };
            localStorage.setItem(ABOUT_PAGE_STORAGE_KEY, JSON.stringify(mergedAbout));
            window.dispatchEvent(new CustomEvent('app:about-page-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'footer_settings' }, async () => {
          const { data, error } = await supabase
            .from('footer_settings')
            .select('*')
            .eq('id', 'primary')
            .maybeSingle();
          if (!error && data) {
            const mergedFooter = { ...DEFAULT_FOOTER_SETTINGS, ...rowToFooterSettings(data) };
            localStorage.setItem(FOOTER_SETTINGS_STORAGE_KEY, JSON.stringify(mergedFooter));
            window.dispatchEvent(new CustomEvent('app:footer-settings-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'seo_settings' }, async () => {
          const { data, error } = await supabase
            .from('seo_settings')
            .select('*')
            .eq('id', 'primary')
            .maybeSingle();
          if (!error && data) {
            const mergedSeo = { ...DEFAULT_SEO_SETTINGS, ...rowToSeoSettings(data) };
            localStorage.setItem(SEO_SETTINGS_STORAGE_KEY, JSON.stringify(mergedSeo));
            window.dispatchEvent(new CustomEvent('app:seo-settings-updated'));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services_control' }, async () => {
          const { data, error } = await supabase
            .from('services_control')
            .select('*')
            .eq('id', 'primary')
            .maybeSingle();
          if (!error && data) {
            const mergedServicesControl = { ...DEFAULT_SERVICES_CONTROL, ...rowToServicesControl(data) };
            localStorage.setItem(SERVICES_CONTROL_STORAGE_KEY, JSON.stringify(mergedServicesControl));
            window.dispatchEvent(new CustomEvent('app:services-control-updated'));
          }
        })
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription warning:', err);
    }
  },

  // -------------------------------------------------------------
  // PACKAGE CATEGORIES CRUD
  // -------------------------------------------------------------
  getPackageCategories: () => {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading stored package categories', err);
    }
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_PACKAGE_CATEGORIES));
    return DEFAULT_PACKAGE_CATEGORIES;
  },

  savePackageCategory: async (catData) => {
    const categories = StorageService.getPackageCategories();
    const existingIndex = categories.findIndex(c => c.id === catData.id || c.slug === catData.slug);

    let targetCat;
    let updatedCategories;
    if (existingIndex >= 0) {
      targetCat = { ...categories[existingIndex], ...catData };
      updatedCategories = [...categories];
      updatedCategories[existingIndex] = targetCat;
    } else {
      targetCat = {
        id: catData.id || `cat-${Date.now()}`,
        name: catData.name || 'Custom Category',
        labelBn: catData.labelBn || catData.name || 'কাস্টম ক্যাটাগরি',
        slug: catData.slug || catData.name || `cat-${Date.now()}`,
        icon: catData.icon || 'Compass',
        badgeColor: catData.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      };
      updatedCategories = [...categories, targetCat];
    }

    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
    window.dispatchEvent(new CustomEvent('app:categories-updated'));

    if (supabase) {
      try {
        await supabase.from('package_categories').upsert(packageCategoryToRow(targetCat));
      } catch (err) {
        console.warn('Supabase category upsert notice:', err);
      }
    }
    return updatedCategories;
  },

  deletePackageCategory: async (catId) => {
    const categories = StorageService.getPackageCategories();
    const updated = categories.filter(c => c.id !== catId);
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:categories-updated'));

    if (supabase) {
      try {
        await supabase.from('package_categories').delete().eq('id', catId);
      } catch (err) {
        console.warn('Supabase category delete notice:', err);
      }
    }
    return updated;
  },

  // -------------------------------------------------------------
  // REAL-TIME AVAILABILITY & DATE LOCKING ENGINE
  // -------------------------------------------------------------
  getBookedDateRanges: (packageId, packageTitle = '') => {
    const bookings = StorageService.getBookings();
    const ranges = [];

    bookings.forEach(bk => {
      if (bk.type === 'inquiry') return;
      if (bk.status === 'Cancelled' || bk.status === 'বাতিল') return;

      const matchesPkg =
        (packageId && bk.packageId === packageId) ||
        (packageTitle && bk.packageTitle && bk.packageTitle.toLowerCase() === packageTitle.toLowerCase());

      if (!matchesPkg) return;

      let startStr = bk.checkInDate || '';
      let endStr = bk.checkOutDate || '';

      if (!startStr && bk.travelDate) {
        if (bk.travelDate.includes(' to ')) {
          const [s, e] = bk.travelDate.split(' to ');
          startStr = s?.trim() || '';
          endStr = e?.trim() || startStr;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(bk.travelDate.trim())) {
          startStr = bk.travelDate.trim();
          endStr = startStr;
        }
      }

      if (startStr && /^\d{4}-\d{2}-\d{2}$/.test(startStr)) {
        ranges.push({
          bookingId: bk.id,
          start: startStr,
          end: (endStr && /^\d{4}-\d{2}-\d{2}$/.test(endStr)) ? endStr : startStr,
          status: bk.status || 'Confirmed'
        });
      }
    });

    return ranges;
  },

  isDateStrBooked: (dateStr, ranges = []) => {
    if (!dateStr) return false;
    return ranges.some(r => dateStr >= r.start && dateStr <= r.end);
  },

  getNextAvailableDate: (packageId, packageTitle = '') => {
    const ranges = StorageService.getBookedDateRanges(packageId, packageTitle);
    const candidate = new Date();
    candidate.setDate(candidate.getDate() + 1); // Start checking from tomorrow

    for (let i = 0; i < 180; i++) {
      const y = candidate.getFullYear();
      const m = String(candidate.getMonth() + 1).padStart(2, '0');
      const d = String(candidate.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${d}`;
      if (!StorageService.isDateStrBooked(iso, ranges)) {
        return {
          iso,
          formattedBn: candidate.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }),
          formattedEn: candidate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
        };
      }
      candidate.setDate(candidate.getDate() + 1);
    }

    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 1);
    const fy = fallback.getFullYear();
    const fm = String(fallback.getMonth() + 1).padStart(2, '0');
    const fd = String(fallback.getDate()).padStart(2, '0');
    return {
      iso: `${fy}-${fm}-${fd}`,
      formattedBn: fallback.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }),
      formattedEn: fallback.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  },

  // -------------------------------------------------------------
  // DESTINATIONS CRUD & PACKAGE MATCHING
  // -------------------------------------------------------------
  getDestinations: () => {
    try {
      const stored = localStorage.getItem(DESTINATIONS_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((d) => ({
            ...d,
            destinationName: d.destinationName || d.title || '',
            title: d.title || d.destinationName || '',
            subtitle: d.subtitle || d.tagline || '',
            tagline: d.tagline || d.subtitle || '',
            shortDescription: d.shortDescription || d.description || '',
            description: d.description || d.shortDescription || '',
            badge: d.badge || d.destinationName || d.title || 'গন্তব্য',
            image: d.image || '',
            accent: d.accent || 'from-teal-500/20 to-cyan-500/10',
            borderGlow: d.borderGlow || 'hover:border-teal-400/40'
          }));
        }
      }
    } catch (err) {
      console.warn('Error reading stored destinations', err);
    }
    return [];
  },

  saveDestination: async (destData) => {
    const destinations = StorageService.getDestinations();
    const rawName = (destData.destinationName || destData.title || '').trim();
    const generatedId =
      destData.id ||
      rawName
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      `dest-${Date.now()}`;

    const existingIndex = destinations.findIndex((d) => d.id === generatedId || (destData.id && d.id === destData.id));

    const targetDest = {
      ...(existingIndex >= 0 ? destinations[existingIndex] : {}),
      id: existingIndex >= 0 ? destinations[existingIndex].id : generatedId,
      destinationName: (destData.destinationName || destData.title || '').trim(),
      title: (destData.title || destData.destinationName || '').trim(),
      subtitle: (destData.subtitle || destData.tagline || '').trim(),
      tagline: (destData.subtitle || destData.tagline || '').trim(),
      shortDescription: (destData.shortDescription || destData.description || '').trim(),
      description: (destData.shortDescription || destData.description || '').trim(),
      badge: destData.badge || (destData.destinationName || destData.title || 'গন্তব্য').trim(),
      image:
        destData.image ||
        (existingIndex >= 0 ? destinations[existingIndex].image : '') ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      accent:
        destData.accent ||
        (existingIndex >= 0 ? destinations[existingIndex].accent : '') ||
        'from-teal-500/20 to-cyan-500/10',
      borderGlow:
        destData.borderGlow ||
        (existingIndex >= 0 ? destinations[existingIndex].borderGlow : '') ||
        'hover:border-teal-400/40',
      lastUpdated: new Date().toISOString()
    };

    let updatedDestinations;
    if (existingIndex >= 0) {
      updatedDestinations = [...destinations];
      updatedDestinations[existingIndex] = targetDest;
    } else {
      updatedDestinations = [...destinations, targetDest];
    }

    localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(updatedDestinations));
    window.dispatchEvent(new CustomEvent('app:destinations-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('destinations').upsert(destinationToRow(targetDest));
        if (error) console.error('Supabase destination upsert ERROR:', error);
      } catch (err) {
        console.error('Supabase destination save exception:', err);
      }
    }
    return updatedDestinations;
  },

  deleteDestination: async (destId) => {
    const destinations = StorageService.getDestinations();
    const updated = destinations.filter((d) => d.id !== destId);
    localStorage.setItem(DESTINATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:destinations-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('destinations').delete().eq('id', destId);
        if (error) console.error('Supabase destination delete ERROR:', error);
      } catch (err) {
        console.error('Supabase destination delete exception:', err);
      }
    }
    return updated;
  },

  getPackageDefaultPhoto: (pkg) => {
    if (!pkg) return '';
    if (pkg.image && typeof pkg.image === 'string') return pkg.image;
    if (Array.isArray(pkg.gallery) && pkg.gallery.length > 0) {
      const firstImg = pkg.gallery.find((g) => g.type !== 'video' && g.url) || pkg.gallery[0];
      return firstImg?.url || '';
    }
    return '';
  },

  getPackageResortName: (pkg) => {
    if (!pkg) return '';
    return (
      pkg.resortName ||
      pkg.hotelService?.name ||
      (Array.isArray(pkg.featuredHotels) && pkg.featuredHotels[0]?.name) ||
      ''
    );
  },

  getPackagesForDestination: (destOrId, allPackagesInput) => {
    const allPackages = Array.isArray(allPackagesInput) ? allPackagesInput : StorageService.getPackages();
    if (!destOrId) return allPackages;

    const allDestinations = StorageService.getDestinations();
    const destObj =
      typeof destOrId === 'object'
        ? destOrId
        : allDestinations.find(
            (d) =>
              (d.id || '').toLowerCase() === String(destOrId).toLowerCase() ||
              (d.destinationName || '').toLowerCase() === String(destOrId).toLowerCase() ||
              (d.title || '').toLowerCase() === String(destOrId).toLowerCase()
          ) || { id: String(destOrId), destinationName: String(destOrId), title: String(destOrId) };

    const destId = (destObj.id || '').toLowerCase().trim();
    const destName = (destObj.destinationName || '').toLowerCase().trim();
    const destTitle = (destObj.title || '').toLowerCase().trim();

    if (!destId || destId === 'all') return allPackages;

    return allPackages.filter((pkg) => {
      const pkgDestId = (pkg.destinationId || '').toLowerCase().trim();
      const pkgDestName = (pkg.destinationName || '').toLowerCase().trim();
      const pkgCat = (pkg.category || '').toLowerCase().trim();
      const pkgCatLabel = (pkg.categoryLabel || '').toLowerCase().trim();
      const pkgLoc = (pkg.location || '').toLowerCase().trim();
      const pkgTitle = (pkg.title || '').toLowerCase().trim();

      if (pkgDestId && pkgDestId === destId) return true;
      if (destName && pkgDestName && pkgDestName === destName) return true;
      if (pkgCat === destId) return true;
      if (destName && pkgCat === destName) return true;
      if (destTitle && pkgCatLabel === destTitle) return true;

      if (destId === 'beach' && (pkgCat.includes('beach') || pkgCat.includes('সমুদ্র'))) return true;
      if (destId === 'nature' && (pkgCat.includes('nature') || pkgCat.includes('hill') || pkgCat.includes('প্রকৃতি'))) return true;
      if (destId === 'adventure' && (pkgCat.includes('adventure') || pkgCat.includes('অভিযান'))) return true;

      if (destName && destName.length >= 2) {
        if (pkgLoc.includes(destName) || pkgTitle.includes(destName) || pkgCat.includes(destName)) return true;
      }
      if (destTitle && destTitle.length >= 2) {
        if (pkgLoc.includes(destTitle) || pkgTitle.includes(destTitle) || pkgCat.includes(destTitle)) return true;
      }

      return false;
    });
  },

  // -------------------------------------------------------------
  // PACKAGES CRUD
  // -------------------------------------------------------------
  getPackages: () => {
    try {
      const stored = localStorage.getItem(PACKAGES_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error reading stored packages', err);
    }
    return [];
  },

  resetPackagesToDefault: async () => {
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('app:packages-updated'));
    return [];
  },

  savePackage: async (pkgData) => {
    const packages = StorageService.getPackages();
    const existingIndex = packages.findIndex(p => p.id === pkgData.id);

    let targetPackage;
    let updatedPackages;
    if (existingIndex >= 0) {
      targetPackage = {
        ...packages[existingIndex],
        ...pkgData,
        lastUpdated: new Date().toISOString()
      };
      updatedPackages = [...packages];
      updatedPackages[existingIndex] = targetPackage;
    } else {
      targetPackage = {
        ...pkgData,
        id: pkgData.id || `custom-pkg-${Date.now()}`,
        lastUpdated: new Date().toISOString()
      };
      updatedPackages = [targetPackage, ...packages];
    }

    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(updatedPackages));
    window.dispatchEvent(new CustomEvent('app:packages-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('packages').upsert(packageToRow(targetPackage));
        if (error) console.error('Supabase package upsert ERROR:', error);
        else console.log('Supabase package saved successfully:', targetPackage.id);
      } catch (err) {
        console.error('Supabase package save exception:', err);
      }
    }
    return updatedPackages;
  },

  deletePackage: async (packageItemOrId) => {
    const pkgId = typeof packageItemOrId === 'string' ? packageItemOrId : packageItemOrId?.id;
    const packages = StorageService.getPackages();
    const itemToDelete = packages.find(p => p.id === pkgId) || packageItemOrId;

    if (itemToDelete && typeof itemToDelete === 'object') {
      await handlePermanentDelete('packages', itemToDelete).catch(e => console.warn(e));
    }

    const updated = packages.filter(p => p.id !== pkgId);
    localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:packages-updated'));
    return updated;
  },

  // -------------------------------------------------------------
  // HOTELS CRUD
  // -------------------------------------------------------------
  getHotels: () => {
    try {
      const stored = localStorage.getItem(HOTELS_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error reading stored hotels', err);
    }
    return [];
  },

  saveHotel: async (hotelData) => {
    const hotels = StorageService.getHotels();
    const existingIndex = hotels.findIndex(h => h.id === hotelData.id);

    let targetHotel;
    let updatedHotels;
    if (existingIndex >= 0) {
      targetHotel = { ...hotels[existingIndex], ...hotelData };
      updatedHotels = [...hotels];
      updatedHotels[existingIndex] = targetHotel;
    } else {
      targetHotel = {
        ...hotelData,
        id: hotelData.id || `hotel-${Date.now()}`
      };
      updatedHotels = [targetHotel, ...hotels];
    }

    localStorage.setItem(HOTELS_STORAGE_KEY, JSON.stringify(updatedHotels));
    window.dispatchEvent(new CustomEvent('app:hotels-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('hotels').upsert(hotelToRow(targetHotel));
        if (error) console.error('Supabase hotel upsert ERROR:', error);
        else console.log('Supabase hotel saved successfully:', targetHotel.id);
      } catch (err) {
        console.error('Supabase hotel save exception:', err);
      }
    }
    return updatedHotels;
  },

  deleteHotel: async (hotelItemOrId) => {
    const hotelId = typeof hotelItemOrId === 'string' ? hotelItemOrId : hotelItemOrId?.id;
    const hotels = StorageService.getHotels();
    const itemToDelete = hotels.find(h => h.id === hotelId) || hotelItemOrId;

    if (itemToDelete && typeof itemToDelete === 'object') {
      await handlePermanentDelete('hotels', itemToDelete).catch(e => console.warn(e));
    }

    const updated = hotels.filter(h => h.id !== hotelId);
    localStorage.setItem(HOTELS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:hotels-updated'));
    return updated;
  },

  // -------------------------------------------------------------
  // REVIEWS CRUD
  // -------------------------------------------------------------
  getReviews: () => {
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored !== null) return JSON.parse(stored);
    } catch (err) {
      console.warn('Error reading stored reviews', err);
    }
    return [];
  },

  saveReview: async (reviewData) => {
    const reviews = StorageService.getReviews();
    const existingIndex = reviews.findIndex(r => r.id === reviewData.id);

    let targetReview;
    let updatedReviews;
    if (existingIndex >= 0) {
      targetReview = { ...reviews[existingIndex], ...reviewData };
      updatedReviews = [...reviews];
      updatedReviews[existingIndex] = targetReview;
    } else {
      targetReview = {
        ...reviewData,
        id: reviewData.id || `rev-${Date.now()}`
      };
      updatedReviews = [targetReview, ...reviews];
    }

    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updatedReviews));
    window.dispatchEvent(new CustomEvent('app:reviews-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('reviews').upsert(reviewToRow(targetReview));
        if (error) console.error('Supabase review upsert ERROR:', error);
        else console.log('Supabase review saved successfully:', targetReview.id);
      } catch (err) {
        console.error('Supabase review save exception:', err);
      }
    }
    return updatedReviews;
  },

  deleteReview: async (reviewItemOrId) => {
    const revId = typeof reviewItemOrId === 'string' ? reviewItemOrId : reviewItemOrId?.id;
    const reviews = StorageService.getReviews();
    const itemToDelete = reviews.find(r => r.id === revId) || reviewItemOrId;

    if (itemToDelete && typeof itemToDelete === 'object') {
      await handlePermanentDelete('reviews', itemToDelete).catch(e => console.warn(e));
    }

    const updated = reviews.filter(r => r.id !== revId);
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:reviews-updated'));
    return updated;
  },

  // -------------------------------------------------------------
  // SERVICES CRUD
  // -------------------------------------------------------------
  getServices: () => {
    try {
      const stored = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error reading stored services', err);
    }
    return [];
  },

  saveService: async (serviceData) => {
    const services = StorageService.getServices();
    const existingIndex = services.findIndex(s => s.id === serviceData.id);

    let targetService;
    let updatedServices;
    if (existingIndex >= 0) {
      targetService = { ...services[existingIndex], ...serviceData };
      updatedServices = [...services];
      updatedServices[existingIndex] = targetService;
    } else {
      targetService = {
        ...serviceData,
        id: serviceData.id || `srv-${Date.now()}`
      };
      updatedServices = [targetService, ...services];
    }

    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices));
    window.dispatchEvent(new CustomEvent('app:services-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('services').upsert(serviceToRow(targetService));
        if (error) console.error('Supabase service upsert ERROR:', error);
        else console.log('Supabase service saved successfully:', targetService.id);
      } catch (err) {
        console.error('Supabase service save exception:', err);
      }
    }
    return updatedServices;
  },

  deleteService: async (serviceItemOrId) => {
    const srvId = typeof serviceItemOrId === 'string' ? serviceItemOrId : serviceItemOrId?.id;
    const services = StorageService.getServices();
    const itemToDelete = services.find(s => s.id === srvId) || serviceItemOrId;

    if (itemToDelete && typeof itemToDelete === 'object') {
      await handlePermanentDelete('services', itemToDelete).catch(e => console.warn(e));
    }

    const updated = services.filter(s => s.id !== srvId);
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:services-updated'));
    return updated;
  },

  // -------------------------------------------------------------
  // TRANSPORTS & VEHICLE SERVICES CRUD
  // -------------------------------------------------------------
  getTransportCategories: () => {
    try {
      const stored = localStorage.getItem(TRANSPORT_CATEGORIES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('Error reading stored transport categories', err);
    }
    localStorage.setItem(TRANSPORT_CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_TRANSPORT_CATEGORIES));
    return DEFAULT_TRANSPORT_CATEGORIES;
  },

  saveTransportCategory: (catData) => {
    const categories = StorageService.getTransportCategories();
    const existingIdx = categories.findIndex(c => c.id === catData.id || c.name.toLowerCase() === (catData.name || '').toLowerCase());
    let updated;
    if (existingIdx >= 0) {
      updated = [...categories];
      updated[existingIdx] = { ...updated[existingIdx], ...catData };
    } else {
      const newCat = {
        ...catData,
        id: catData.id || `cat-${Date.now()}`
      };
      updated = [...categories, newCat];
    }
    localStorage.setItem(TRANSPORT_CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:transport-categories-updated'));
    return updated;
  },

  getTransports: () => {
    try {
      const stored = localStorage.getItem(TRANSPORTS_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error reading stored transports', err);
    }
    return [];
  },

  saveTransport: async (transportData) => {
    const transports = StorageService.getTransports();
    const existingIndex = transports.findIndex(t => t.id === transportData.id);

    let targetTransport;
    let updatedTransports;
    if (existingIndex >= 0) {
      targetTransport = { ...transports[existingIndex], ...transportData };
      updatedTransports = [...transports];
      updatedTransports[existingIndex] = targetTransport;
    } else {
      targetTransport = {
        ...transportData,
        id: transportData.id || `trans-${Date.now()}`
      };
      updatedTransports = [targetTransport, ...transports];
    }

    localStorage.setItem(TRANSPORTS_STORAGE_KEY, JSON.stringify(updatedTransports));
    window.dispatchEvent(new CustomEvent('app:transports-updated'));

    if (supabase) {
      try {
        await supabase.from('transports').upsert(transportToRow(targetTransport));
      } catch (err) {
        console.warn('Supabase transport upsert notice:', err);
      }
    }

    return updatedTransports;
  },

  deleteTransport: async (transportItemOrId) => {
    const transId = typeof transportItemOrId === 'string' ? transportItemOrId : transportItemOrId?.id;
    const transports = StorageService.getTransports();
    const itemToDelete = transports.find(t => t.id === transId) || transportItemOrId;

    if (itemToDelete && typeof itemToDelete === 'object') {
      await handlePermanentDelete('transports', itemToDelete).catch(e => console.warn(e));
    }

    const updated = transports.filter(t => t.id !== transId);
    localStorage.setItem(TRANSPORTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:transports-updated'));
    return updated;
  },

  // -------------------------------------------------------------
  // RESTAURANTS & DINING PLANS CRUD
  // -------------------------------------------------------------
  getRestaurants: () => {
    try {
      const stored = localStorage.getItem(RESTAURANTS_STORAGE_KEY);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error reading stored restaurants', err);
    }
    return [];
  },

  saveRestaurant: async (restaurantData) => {
    const restaurants = StorageService.getRestaurants();
    const existingIndex = restaurants.findIndex(r => r.id === restaurantData.id);
    let targetRestaurant;
    let updatedRestaurants;

    if (existingIndex >= 0) {
      targetRestaurant = { ...restaurants[existingIndex], ...restaurantData };
      updatedRestaurants = [...restaurants];
      updatedRestaurants[existingIndex] = targetRestaurant;
    } else {
      targetRestaurant = {
        ...restaurantData,
        id: restaurantData.id || `rest-${Date.now()}`
      };
      updatedRestaurants = [targetRestaurant, ...restaurants];
    }

    localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(updatedRestaurants));
    window.dispatchEvent(new CustomEvent('app:restaurants-updated'));

    if (supabase) {
      try {
        await supabase.from('restaurants').upsert({
          id: targetRestaurant.id,
          name: targetRestaurant.name,
          meal_plan_type: targetRestaurant.mealPlanType || '',
          badge: targetRestaurant.badge || '',
          rate_per_person: Number(targetRestaurant.ratePerPerson || 0),
          rate_label: targetRestaurant.rateLabel || '',
          tags: Array.isArray(targetRestaurant.tags) ? targetRestaurant.tags : [],
          breakfast_menu: Array.isArray(targetRestaurant.breakfastMenu) ? targetRestaurant.breakfastMenu : [],
          lunch_menu: Array.isArray(targetRestaurant.lunchMenu) ? targetRestaurant.lunchMenu : [],
          dinner_menu: Array.isArray(targetRestaurant.dinnerMenu) ? targetRestaurant.dinnerMenu : [],
          photo: targetRestaurant.photo || ''
        });
      } catch (err) {
        console.warn('Supabase restaurant upsert notice:', err);
      }
    }

    return updatedRestaurants;
  },

  deleteRestaurant: async (restItemOrId) => {
    const restId = typeof restItemOrId === 'string' ? restItemOrId : restItemOrId?.id;
    const restaurants = StorageService.getRestaurants();
    const itemToDelete = restaurants.find(r => r.id === restId) || restItemOrId;

    if (itemToDelete && typeof itemToDelete === 'object') {
      await handlePermanentDelete('restaurants', itemToDelete).catch(e => console.warn(e));
    }

    const updated = restaurants.filter(r => r.id !== restId);
    localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:restaurants-updated'));
    return updated;
  },

  // -------------------------------------------------------------
  // PARTNER BRAND LOGOS CRUD
  // -------------------------------------------------------------
  getBrandLogos: () => {
    try {
      const stored = localStorage.getItem(BRAND_LOGOS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error reading stored brand logos', err);
    }
    return [];
  },

  saveBrandLogo: async (brandData) => {
    const logos = StorageService.getBrandLogos();
    const existingIndex = logos.findIndex((b) => b.id === brandData.id);
    let targetBrand;
    let updatedLogos;

    if (existingIndex >= 0) {
      targetBrand = { ...logos[existingIndex], ...brandData };
      updatedLogos = [...logos];
      updatedLogos[existingIndex] = targetBrand;
    } else {
      targetBrand = {
        ...brandData,
        id: brandData.id || `brand-${Date.now()}`,
        sortOrder: brandData.sortOrder ?? logos.length
      };
      updatedLogos = [...logos, targetBrand];
    }

    try {
      localStorage.setItem(BRAND_LOGOS_STORAGE_KEY, JSON.stringify(updatedLogos));
    } catch (e) {
      console.warn('Local cache notice (brand_logos):', e);
    }
    window.dispatchEvent(new CustomEvent('app:brand-logos-updated'));

    if (supabase) {
      try {
        await supabase.from('brand_logos').upsert(brandLogoToRow(targetBrand));
      } catch (err) {
        console.warn('Supabase brand logo upsert notice:', err);
      }
    }

    return updatedLogos;
  },

  deleteBrandLogo: async (brandItemOrId) => {
    const brandId = typeof brandItemOrId === 'string' ? brandItemOrId : brandItemOrId?.id;
    const logos = StorageService.getBrandLogos();
    const itemToDelete = logos.find((b) => b.id === brandId) || brandItemOrId;

    if (itemToDelete && typeof itemToDelete === 'object' && itemToDelete.logoUrl) {
      await removeStorageFiles([itemToDelete.logoUrl]).catch((e) => console.warn(e));
    }

    if (supabase && brandId) {
      try {
        await supabase.from('brand_logos').delete().eq('id', brandId);
      } catch (err) {
        console.warn('Supabase brand logo delete notice:', err);
      }
    }

    const updated = logos.filter((b) => b.id !== brandId);
    try {
      localStorage.setItem(BRAND_LOGOS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Local cache notice (brand_logos delete):', e);
    }
    window.dispatchEvent(new CustomEvent('app:brand-logos-updated'));
    return updated;
  },

  // -------------------------------------------------------------
  // SITE & CONTACT INFO CRUD
  // -------------------------------------------------------------
  getContactInfo: () => {
    try {
      const stored = localStorage.getItem(CONTACT_INFO_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (err) {
      console.warn('Error reading stored contact info', err);
    }
    localStorage.setItem(CONTACT_INFO_STORAGE_KEY, JSON.stringify(OFFICE_CONTACT_INFO));
    return OFFICE_CONTACT_INFO;
  },

  saveContactInfo: async (contactData) => {
    localStorage.setItem(CONTACT_INFO_STORAGE_KEY, JSON.stringify(contactData));
    if (contactData?.social) {
      localStorage.setItem(SOCIAL_LINKS_STORAGE_KEY, JSON.stringify(contactData.social));
    }
    window.dispatchEvent(new CustomEvent('app:contact-info-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('contact_info').upsert(contactInfoToRow(contactData));
        if (error) console.error('Supabase contact upsert ERROR:', error);
        else console.log('Supabase contact info saved successfully');
      } catch (err) {
        console.error('Supabase contact save exception:', err);
      }
    }
    return contactData;
  },

  getSocialLinks: () => {
    try {
      const stored = localStorage.getItem(SOCIAL_LINKS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      const about = StorageService.getAboutPage();
      if (about?.social) return about.social;
    } catch (err) {
      console.warn('Error reading social links', err);
    }
    return { facebook: '', youtube: '', instagram: '', website: '' };
  },

  saveSocialLinks: async (socialData) => {
    const clean = {
      facebook: socialData?.facebook || '',
      youtube: socialData?.youtube || '',
      instagram: socialData?.instagram || '',
      website: socialData?.website || ''
    };
    localStorage.setItem(SOCIAL_LINKS_STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent('app:contact-info-updated'));
    const about = StorageService.getAboutPage();
    await StorageService.saveAboutPage({ ...about, social: clean });
    return clean;
  },

  // -------------------------------------------------------------
  // ABOUT PAGE CMS CRUD
  // -------------------------------------------------------------
  getAboutPage: () => {
    try {
      const stored = localStorage.getItem(ABOUT_PAGE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_ABOUT_PAGE_DATA, ...parsed };
        }
      }
    } catch (err) {
      console.warn('Error reading stored about page data', err);
    }
    return DEFAULT_ABOUT_PAGE_DATA;
  },

  saveAboutPage: async (aboutData) => {
    const nextData = { ...DEFAULT_ABOUT_PAGE_DATA, ...(aboutData || {}), id: 'primary' };
    localStorage.setItem(ABOUT_PAGE_STORAGE_KEY, JSON.stringify(nextData));
    window.dispatchEvent(new CustomEvent('app:about-page-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('about_page').upsert(aboutPageToRow(nextData));
        if (error) console.error('Supabase about_page upsert ERROR:', error);
      } catch (err) {
        console.error('Supabase about_page save exception:', err);
      }
    }
    return nextData;
  },

  // -------------------------------------------------------------
  // SERVICES CONTROL CMS
  // -------------------------------------------------------------
  getServicesControl: () => {
    try {
      const stored = localStorage.getItem(SERVICES_CONTROL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_SERVICES_CONTROL, ...parsed };
        }
      }
    } catch (err) {
      console.warn('Error reading stored services control', err);
    }
    return DEFAULT_SERVICES_CONTROL;
  },

  saveServicesControl: async (servicesData) => {
    const nextData = { ...DEFAULT_SERVICES_CONTROL, ...(servicesData || {}), id: 'primary' };
    localStorage.setItem(SERVICES_CONTROL_STORAGE_KEY, JSON.stringify(nextData));
    window.dispatchEvent(new CustomEvent('app:services-control-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('services_control').upsert(servicesControlToRow(nextData));
        if (error) console.error('Supabase services_control upsert ERROR:', error);
      } catch (err) {
        console.error('Supabase services_control save exception:', err);
      }
    }
    return nextData;
  },

  // -------------------------------------------------------------
  // FOOTER SETTINGS & UNLIMITED SOCIAL / PAYMENT LOGOS CRUD
  // -------------------------------------------------------------
  getFooterSettings: () => {
    try {
      const stored = localStorage.getItem(FOOTER_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_FOOTER_SETTINGS, ...parsed };
        }
      }
    } catch (err) {
      console.warn('Error reading stored footer settings', err);
    }
    return DEFAULT_FOOTER_SETTINGS;
  },

  saveFooterSettings: async (footerData) => {
    const nextData = { ...DEFAULT_FOOTER_SETTINGS, ...(footerData || {}), id: 'primary' };
    localStorage.setItem(FOOTER_SETTINGS_STORAGE_KEY, JSON.stringify(nextData));
    window.dispatchEvent(new CustomEvent('app:footer-settings-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('footer_settings').upsert(footerSettingsToRow(nextData));
        if (error) console.error('Supabase footer_settings upsert ERROR:', error);
      } catch (err) {
        console.error('Supabase footer_settings save exception:', err);
      }
    }
    return nextData;
  },

  // -------------------------------------------------------------
  // SERVICES CONTROL CMS
  // -------------------------------------------------------------
  getServicesControl: () => {
    try {
      const stored = localStorage.getItem(SERVICES_CONTROL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_SERVICES_CONTROL, ...parsed };
        }
      }
    } catch (err) {
      console.warn('Error reading stored services control', err);
    }
    return DEFAULT_SERVICES_CONTROL;
  },

  saveServicesControl: async (servicesData) => {
    const nextData = { ...DEFAULT_SERVICES_CONTROL, ...(servicesData || {}), id: 'primary' };
    localStorage.setItem(SERVICES_CONTROL_STORAGE_KEY, JSON.stringify(nextData));
    window.dispatchEvent(new CustomEvent('app:services-control-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('services_control').upsert(servicesControlToRow(nextData));
        if (error) console.error('Supabase services_control upsert ERROR:', error);
      } catch (err) {
        console.error('Supabase services_control save exception:', err);
      }
    }
    return nextData;
  },

  // -------------------------------------------------------------
  // SEO CONTROL SETTINGS CRUD
  // -------------------------------------------------------------
  getSeoSettings: () => {
    try {
      const stored = localStorage.getItem(SEO_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_SEO_SETTINGS, ...parsed };
        }
      }
    } catch (err) {
      console.warn('Error reading stored seo settings', err);
    }
    return DEFAULT_SEO_SETTINGS;
  },

  saveSeoSettings: async (seoData) => {
    const nextData = { ...DEFAULT_SEO_SETTINGS, ...(seoData || {}), id: 'primary' };
    localStorage.setItem(SEO_SETTINGS_STORAGE_KEY, JSON.stringify(nextData));
    window.dispatchEvent(new CustomEvent('app:seo-settings-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('seo_settings').upsert(seoSettingsToRow(nextData));
        if (error) console.error('Supabase seo_settings upsert ERROR:', error);
      } catch (err) {
        console.error('Supabase seo_settings save exception:', err);
      }
    }
    return nextData;
  },

  // -------------------------------------------------------------
  // SERVICES CONTROL CMS
  // -------------------------------------------------------------
  getServicesControl: () => {
    try {
      const stored = localStorage.getItem(SERVICES_CONTROL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_SERVICES_CONTROL, ...parsed };
        }
      }
    } catch (err) {
      console.warn('Error reading stored services control', err);
    }
    return DEFAULT_SERVICES_CONTROL;
  },

  saveServicesControl: async (servicesData) => {
    const nextData = { ...DEFAULT_SERVICES_CONTROL, ...(servicesData || {}), id: 'primary' };
    localStorage.setItem(SERVICES_CONTROL_STORAGE_KEY, JSON.stringify(nextData));
    window.dispatchEvent(new CustomEvent('app:services-control-updated'));

    if (supabase) {
      try {
        const { error } = await supabase.from('services_control').upsert(servicesControlToRow(nextData));
        if (error) console.error('Supabase services_control upsert ERROR:', error);
      } catch (err) {
        console.error('Supabase services_control save exception:', err);
      }
    }
    return nextData;
  },

  isServiceEnabled: (serviceKey) => {
    const validKeys = ['hotels', 'transport', 'restaurant', 'road', 'waterway', 'air'];
    const key = validKeys.includes(serviceKey) ? serviceKey : 'hotels';
    const control = StorageService.getServicesControl();
    if (key === 'road' || key === 'waterway' || key === 'air') {
      return control?.transport !== false && control?.[key] !== false;
    }
    return control?.[key] !== false;
  },

  notifyDisabledService: (serviceKey) => {
    const titles = {
      hotels: 'Hotels & Resorts',
      transport: 'Transport & Vehicles',
      restaurant: 'Restaurant & Dining',
      road: 'Road Services',
      waterway: 'River Services',
      air: 'Airline Services'
    };
    const key = titles[serviceKey] ? serviceKey : 'hotels';
    window.dispatchEvent(
      new CustomEvent('app:service-disabled-clicked', {
        detail: { serviceKey: key, title: titles[key] || 'This Service' }
      })
    );
  },

  // -------------------------------------------------------------
  // HERO BANNER & WEB CONTROL CRUD
  // -------------------------------------------------------------
  getHeroBanner: () => {
    try {
      const stored = localStorage.getItem(HERO_BANNER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_HERO_BANNER,
            ...parsed,
            slides: Array.isArray(parsed.slides) && parsed.slides.length > 0 
              ? parsed.slides 
              : DEFAULT_HERO_BANNER.slides
          };
        }
      }
    } catch (err) {
      console.warn('Error reading stored hero banner', err);
    }
    return DEFAULT_HERO_BANNER;
  },

  saveHeroBanner: async (bannerData) => {
    const dataToSave = {
      ...DEFAULT_HERO_BANNER,
      ...bannerData,
      id: 'primary',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(HERO_BANNER_STORAGE_KEY, JSON.stringify(dataToSave));
    window.dispatchEvent(new CustomEvent('app:hero-banner-updated'));

    if (supabase) {
      try {
        const { error } = await supabase
          .from('hero_banner')
          .upsert(heroBannerToRow(dataToSave), { onConflict: 'id' });
        if (error) {
          console.error('Supabase hero_banner upsert ERROR:', error);
          throw error;
        } else {
          console.log('Supabase hero_banner saved successfully');
        }
      } catch (err) {
        console.error('Supabase hero_banner save exception:', err);
        throw err;
      }
    }
    return dataToSave;
  },

  // -------------------------------------------------------------
  // BRANDING & LOGO SETTINGS CRUD
  // -------------------------------------------------------------
  getBranding: () => {
    try {
      const stored = localStorage.getItem(BRANDING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_BRANDING,
            ...parsed
          };
        }
      }
    } catch (err) {
      console.warn('Error reading stored branding', err);
    }
    return DEFAULT_BRANDING;
  },

  saveBranding: async (brandingData) => {
    const dataToSave = {
      ...DEFAULT_BRANDING,
      ...brandingData,
      id: 'primary',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(dataToSave));
    window.dispatchEvent(new CustomEvent('app:branding-updated'));

    if (supabase) {
      try {
        const { error } = await supabase
          .from('branding_settings')
          .upsert(brandingToRow(dataToSave), { onConflict: 'id' });
        if (error) {
          console.error('Supabase branding_settings upsert ERROR:', error);
          throw error;
        } else {
          console.log('Supabase branding_settings saved successfully');
        }
      } catch (err) {
        console.error('Supabase branding_settings save exception:', err);
        throw err;
      }
    }
    return dataToSave;
  },

  deleteBrandingLogo: async () => {
    const current = StorageService.getBranding();
    const oldLogo = current.logoUrl;

    // 1. Remove physical image file from Supabase Storage bucket 'agency-media'
    if (oldLogo && typeof oldLogo === 'string' && oldLogo.startsWith('http')) {
      await removeStorageFiles(oldLogo);
    }

    // 2. Clear logo_url in state & localStorage
    const updated = {
      ...current,
      logoUrl: '',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:branding-updated'));

    // 3. Update database record in Supabase
    if (supabase) {
      try {
        const { error } = await supabase
          .from('branding_settings')
          .upsert(brandingToRow(updated), { onConflict: 'id' });
        if (error) console.error('Supabase delete logo error:', error);
      } catch (err) {
        console.error('Supabase delete logo exception:', err);
      }
    }
    return updated;
  },

  // -------------------------------------------------------------
  // BOOKINGS & INQUIRIES CRUD
  // -------------------------------------------------------------
  getBookings: () => {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const clean = Array.isArray(parsed)
          ? parsed.filter(b => !['AETH-7842-BK', 'AETH-9104-INQ', 'AETH-6218-BK', 'AETH-4521-BK', 'AETH-3392-INQ'].includes(b.id))
          : [];
        return clean;
      }
    } catch (err) {
      console.warn('Error reading stored bookings', err);
    }
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([]));
    return [];
  },

  saveBooking: async (bookingPayload) => {
    const bookings = StorageService.getBookings();
    const newEntry = {
      ...bookingPayload,
      id: bookingPayload.id || `AETH-${Math.floor(1000 + Math.random() * 9000)}-${bookingPayload.type === 'inquiry' ? 'INQ' : 'BK'}`,
      status: bookingPayload.status || 'Pending',
      timestamp: bookingPayload.timestamp || new Date().toISOString()
    };
    const updated = [newEntry, ...bookings];
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:bookings-updated'));

    if (supabase) {
      try {
        const row = bookingToRow(newEntry);
        const { error } = await supabase.from('bookings').insert(row);
        if (error) console.error('Supabase booking insert ERROR:', error);
        else console.log('Supabase booking saved successfully:', newEntry.id);
      } catch (err) {
        console.error('Supabase booking save exception:', err);
      }
    }
    return updated;
  },

  updateBookingStatus: async (bookingId, newStatus, adminMeta = null) => {
    const bookings = StorageService.getBookings();
    let resolvedAdmin = adminMeta;
    if (!resolvedAdmin && ['Confirmed', 'Ongoing', 'Completed'].includes(newStatus)) {
      try {
        const sessionRaw = localStorage.getItem('aetheria_admin_session');
        const rootRaw = localStorage.getItem('aetheria_root_admin_profile');
        const session = sessionRaw ? JSON.parse(sessionRaw) : null;
        const rootProfile = rootRaw ? JSON.parse(rootRaw) : null;
        if (session) {
          resolvedAdmin = {
            name: session.name || rootProfile?.name || 'Admin',
            phone: session.phone || rootProfile?.phone || '',
            whatsapp: session.whatsapp || rootProfile?.whatsapp || session.phone || rootProfile?.phone || ''
          };
        } else if (rootProfile) {
          resolvedAdmin = {
            name: rootProfile.name || 'Admin',
            phone: rootProfile.phone || '',
            whatsapp: rootProfile.whatsapp || rootProfile.phone || ''
          };
        }
      } catch (_) {}
    }

    let updatedTarget = null;
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        const shouldAttachAdmin = ['Confirmed', 'Ongoing', 'Completed'].includes(newStatus) && resolvedAdmin;
        updatedTarget = {
          ...b,
          status: newStatus,
          confirmedByName: b.confirmedByName || (shouldAttachAdmin ? resolvedAdmin.name : ''),
          confirmedByPhone: b.confirmedByPhone || (shouldAttachAdmin ? resolvedAdmin.phone : ''),
          confirmedByWhatsapp: b.confirmedByWhatsapp || (shouldAttachAdmin ? resolvedAdmin.whatsapp : ''),
          confirmedAt: b.confirmedAt || (shouldAttachAdmin ? new Date().toISOString() : ''),
          lastModified: new Date().toISOString()
        };
        return updatedTarget;
      }
      return b;
    });
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:bookings-updated'));

    if (supabase && updatedTarget) {
      try {
        const row = bookingToRow(updatedTarget);
        const { error } = await supabase
          .from('bookings')
          .update({
            status: newStatus,
            special_notes: row.special_notes,
            last_modified: new Date().toISOString()
          })
          .eq('id', bookingId);
        if (error) console.error('Supabase booking status update ERROR:', error);
        else console.log('Supabase booking status updated:', bookingId, newStatus);
      } catch (err) {
        console.error('Supabase booking update exception:', err);
      }
    }
    return updated;
  },

  deleteBooking: async (bookingItemOrId) => {
    const bkId = typeof bookingItemOrId === 'string' ? bookingItemOrId : bookingItemOrId?.id;
    const bookings = StorageService.getBookings();
    const itemToDelete = bookings.find(b => b.id === bkId) || bookingItemOrId;

    if (itemToDelete && typeof itemToDelete === 'object') {
      await handlePermanentDelete('bookings', itemToDelete).catch(e => console.warn(e));
    }

    const updated = bookings.filter(b => b.id !== bkId);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:bookings-updated'));
    return updated;
  },

  updateBookingPayment: async (bookingId, { advancePaid, paymentMethod }) => {
    const bookings = StorageService.getBookings();
    let updatedTarget = null;
    const updated = bookings.map((b) => {
      if (b.id !== bookingId) return b;
      const numericTotal = Number(String(b.totalPrice || 0).replace(/[^0-9.-]/g, '')) || 0;
      const safeAdvance = Math.max(0, Number(advancePaid) || 0);
      const dueAmount = Math.max(0, numericTotal - safeAdvance);
      const paymentStatus =
        dueAmount === 0 && numericTotal > 0 ? 'Paid' : safeAdvance > 0 ? 'Partial' : 'Pending';
      updatedTarget = {
        ...b,
        advancePaid: safeAdvance,
        dueAmount,
        paymentMethod: paymentMethod || b.paymentMethod || 'Cash',
        paymentStatus,
        lastModified: new Date().toISOString()
      };
      return updatedTarget;
    });

    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:bookings-updated'));

    if (supabase && updatedTarget) {
      try {
        const row = bookingToRow(updatedTarget);
        await supabase.from('bookings').upsert({
          ...row,
          advance_paid: updatedTarget.advancePaid,
          due_amount: updatedTarget.dueAmount,
          payment_method: updatedTarget.paymentMethod,
          payment_status: updatedTarget.paymentStatus
        });
      } catch (err) {
        console.warn('Supabase booking payment update notice:', err);
      }
    }
    return updated;
  },

  convertInquiryToBooking: async (bookingId) => {
    const bookings = StorageService.getBookings();
    let updatedTarget = null;
    const updated = bookings.map((b) => {
      if (b.id !== bookingId) return b;
      updatedTarget = {
        ...b,
        type: 'booking',
        status: 'Confirmed',
        lastModified: new Date().toISOString()
      };
      return updatedTarget;
    });
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('app:bookings-updated'));
    if (supabase && updatedTarget) {
      try {
        await supabase.from('bookings').update({ type: 'booking', status: 'Confirmed' }).eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase inquiry convert notice:', err);
      }
    }
    return updated;
  },

  // -------------------------------------------------------------
  // OPERATIONAL EXPENSES LEDGER CRUD
  // -------------------------------------------------------------
  getExpenses: () => {
    try {
      const stored = localStorage.getItem(EXPENSES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error reading stored expenses', err);
    }
    return [];
  },

  saveExpense: async (expenseData) => {
    const expenses = StorageService.getExpenses();
    const existingIndex = expenses.findIndex((e) => e.id === expenseData.id);
    let target;
    let updated;
    if (existingIndex >= 0) {
      target = { ...expenses[existingIndex], ...expenseData };
      updated = [...expenses];
      updated[existingIndex] = target;
    } else {
      target = {
        ...expenseData,
        id: expenseData.id || `exp-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      updated = [target, ...expenses];
    }

    try {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Local cache notice (expenses):', err);
    }
    window.dispatchEvent(new CustomEvent('app:expenses-updated'));

    if (supabase) {
      try {
        await supabase.from('expenses').upsert(expenseToRow(target));
      } catch (err) {
        console.warn('Supabase expense upsert notice:', err);
      }
    }
    return updated;
  },

  deleteExpense: async (expenseId) => {
    const expenses = StorageService.getExpenses();
    const updated = expenses.filter((e) => e.id !== expenseId);
    try {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Local cache notice (expenses delete):', err);
    }
    window.dispatchEvent(new CustomEvent('app:expenses-updated'));
    if (supabase && expenseId) {
      try {
        await supabase.from('expenses').delete().eq('id', expenseId);
      } catch (err) {
        console.warn('Supabase expense delete notice:', err);
      }
    }
    return updated;
  },

  // -------------------------------------------------------------
  // ANALYTICS & STATS CALCULATOR
  // -------------------------------------------------------------
  getStats: () => {
    const packages = StorageService.getPackages();
    const bookings = StorageService.getBookings();

    const pendingCount = bookings.filter(b => b.status === 'Pending').length;
    const inquiryCount = bookings.filter(b => b.type === 'inquiry').length;
    const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;

    let totalRevenue = 0;
    bookings.forEach(b => {
      if (b.totalPrice && b.totalPrice !== 'N/A' && b.totalPrice !== 'প্রযোজ্য নয়') {
        const cleanVal = parseFloat(b.totalPrice.replace(/[^0-9.]/g, ''));
        if (!isNaN(cleanVal)) {
          totalRevenue += cleanVal;
        }
      }
    });

    return {
      totalPackages: packages.length,
      pendingCount,
      inquiryCount,
      confirmedCount,
      totalBookings: bookings.length,
      totalRevenue: totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };
  },

  // -------------------------------------------------------------
  // USER & ADMIN ROLE MANAGEMENT
  // -------------------------------------------------------------
  getUsers: () => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const clean = Array.isArray(parsed)
          ? parsed.filter(u => 
              !['usr-arif-hasan', 'usr-sarah-ahmed', 'usr-tanvir-rahman', 'usr-elena-vance', 'usr-david-miller'].includes(u.id) &&
              !u.email?.includes('@dhakavoyages.com') &&
              !u.email?.includes('@londonlux.co.uk') &&
              !u.email?.includes('@ctgsteel.com') &&
              !u.email?.includes('@zurichprivate.ch') &&
              !u.email?.includes('@nycapitol.com')
            )
          : [];
        return clean;
      }
    } catch (err) {
      console.warn('Error reading stored users', err);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
    return [];
  },

  syncUser: async (userPayload) => {
    if (!userPayload || !userPayload.email) return;
    const users = StorageService.getUsers();
    const cleanEmail = userPayload.email.trim().toLowerCase();
    const index = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    let targetUser;

    if (index >= 0) {
      targetUser = {
        ...users[index],
        ...userPayload,
        id: users[index].id || userPayload.id,
        role: users[index].role || userPayload.role || 'user'
      };
      users[index] = targetUser;
    } else {
      targetUser = {
        id: userPayload.id || `usr-${Date.now()}`,
        name: userPayload.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: userPayload.phone || '',
        avatar: userPayload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: userPayload.role || 'user',
        tier: userPayload.membership || 'Standard Voyager',
        country: userPayload.passportCountry || 'বাংলাদেশ 🇧🇩',
        status: 'Active',
        joinedDate: userPayload.joinedDate || 'আজ যুক্ত হয়েছেন'
      };
      users.unshift(targetUser);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('app:users-updated'));

    if (supabase) {
      try {
        const row = userToRow(targetUser);
        const { error } = await supabase.from('users').upsert(row, { onConflict: 'email' });
        if (error) {
          console.warn('Supabase user upsert notice, trying email update:', error.message);
          const { error: updErr } = await supabase
            .from('users')
            .update({
              name: row.name,
              phone: row.phone,
              avatar: row.avatar,
              role: row.role,
              tier: row.tier,
              country: row.country,
              status: row.status
            })
            .eq('email', row.email);
          if (updErr) console.error('Supabase user update ERROR:', updErr);
        }
      } catch (err) {
        console.error('Supabase user sync exception:', err);
      }
    }
    return users;
  },

  isNormalAdmin: (email) => {
    if (!email) return false;
    const users = StorageService.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    return found ? found.role === 'normal_admin' : false;
  },

  setUserRole: async (emailOrId, newRole) => {
    const users = StorageService.getUsers();
    const cleanQuery = String(emailOrId).trim().toLowerCase();
    let updated = false;

    const newUsers = users.map(u => {
      if (u.email.toLowerCase() === cleanQuery || u.id === emailOrId) {
        updated = true;
        return { ...u, role: newRole, roleUpdatedAt: new Date().toISOString() };
      }
      return u;
    });

    if (!updated && cleanQuery.includes('@')) {
      newUsers.unshift({
        id: `usr-${Date.now()}`,
        name: cleanQuery.split('@')[0],
        email: cleanQuery,
        phone: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: newRole,
        tier: newRole === 'normal_admin' ? 'Normal Admin' : 'Standard Voyager',
        country: 'বাংলাদেশ 🇧🇩',
        status: 'Active',
        joinedDate: 'আজ যুক্ত হয়েছেন'
      });
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
    window.dispatchEvent(new CustomEvent('app:users-updated'));

    if (supabase) {
      try {
        const query = cleanQuery.includes('@')
          ? supabase.from('users').update({ role: newRole, role_updated_at: new Date().toISOString() }).eq('email', cleanQuery)
          : supabase.from('users').update({ role: newRole, role_updated_at: new Date().toISOString() }).eq('id', emailOrId);
        const { error } = await query;
        if (error) console.error('Supabase role update ERROR:', error);
        else console.log('Supabase user role updated:', cleanQuery, newRole);
      } catch (err) {
        console.error('Supabase role update exception:', err);
      }
    }

    return newUsers;
  },

  toggleUserAdminRole: (emailOrId) => {
    const users = StorageService.getUsers();
    const cleanQuery = String(emailOrId).trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanQuery || u.id === emailOrId);
    const newRole = found?.role === 'normal_admin' ? 'user' : 'normal_admin';
    return StorageService.setUserRole(emailOrId, newRole);
  }
};

// Auto-trigger background sync with Supabase
if (typeof window !== 'undefined') {
  setTimeout(() => {
    StorageService.initSupabaseSync();
  }, 300);
}
