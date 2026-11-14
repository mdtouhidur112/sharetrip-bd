import React, { createContext, useContext, useState, useEffect } from 'react';

const LANGUAGE_STORAGE_KEY = 'aetheria_language';

const TRANSLATIONS = {
  bn: {
    brand_tagline: 'অভিজাত বিশ্বভ্রমণ',
    nav_home: 'হোম',
    nav_destinations: 'গন্তব্য',
    nav_packages: 'ট্যুর প্যাকেজ',
    nav_services: 'সেবাসমূহ',
    nav_reviews: 'রিভিউ',
    nav_contact: 'যোগাযোগ',
    book_a_call: 'কল বুক করুন',
    sign_in: 'সাইন ইন',
    sign_out: 'ভয়েজার আইডি সাইন আউট',
    my_bookings: 'আমার বুকিং ও অনুসন্ধান',
    wishlist: 'পছন্দের প্যাকেজসমূহ',
    account_settings: 'অ্যাকাউন্ট সেটিংস',
    admin_portal: 'অ্যাডমিন পোর্টাল',
    website_view: 'ওয়েবসাইট ভিউ',
    theme_light: 'লাইট মোড',
    theme_dark: 'ডার্ক মোড',
    theme_system: 'সিস্টেম থিম',
    lang_name: 'বাংলা',
    lang_short: 'বাং'
  },
  en: {
    brand_tagline: 'Curated Expeditions',
    nav_home: 'Home',
    nav_destinations: 'Destinations',
    nav_packages: 'Tour Packages',
    nav_services: 'Services',
    nav_reviews: 'Reviews',
    nav_contact: 'Contact',
    book_a_call: 'Book a Call',
    sign_in: 'Sign In',
    sign_out: 'Sign Out Voyager ID',
    my_bookings: 'My Bookings & Inquiries',
    wishlist: 'Wishlist Packages',
    account_settings: 'Account Settings',
    admin_portal: 'Admin Portal',
    website_view: 'Storefront View',
    theme_light: 'Light Mode',
    theme_dark: 'Dark Mode',
    theme_system: 'System Theme',
    lang_name: 'English',
    lang_short: 'EN'
  }
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, fallback) => fallback || key,
  isBengali: false
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'bn' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read language from localStorage', e);
    }
    return 'en';
  });

  const applyGoogleTranslate = (lang) => {
    try {
      const domain = window.location.hostname;
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
      const isLocal = domain === 'localhost' || isIp;

      if (lang === 'bn') {
        const epoch = 'expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        document.cookie = `googtrans=; ${epoch} path=/;`;
        if (domain && !isLocal) {
          document.cookie = `googtrans=; ${epoch} path=/; domain=${domain};`;
          document.cookie = `googtrans=; ${epoch} path=/; domain=.${domain};`;
        }
      } else {
        document.cookie = 'googtrans=/bn/en; path=/;';
        if (domain && !isLocal) {
          document.cookie = `googtrans=/bn/en; path=/; domain=${domain};`;
          document.cookie = `googtrans=/bn/en; path=/; domain=.${domain};`;
        }
      }

      const triggerCombo = () => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          if (lang === 'en') {
            select.value = 'en';
          } else {
            const hasBnOption = Array.from(select.options).some((o) => o.value === 'bn');
            if (hasBnOption) {
              select.value = 'bn';
            } else {
              select.selectedIndex = 0;
              select.value = '';
            }
          }
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        return false;
      };

      if (!triggerCombo()) {
        const timer = setInterval(() => {
          if (triggerCombo()) {
            clearInterval(timer);
          }
        }, 100);
        setTimeout(() => clearInterval(timer), 3500);
      }
    } catch (err) {
      console.warn('Google Translate sync issue:', err);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
    applyGoogleTranslate(language);
  }, [language]);

  const setLanguage = (lang) => {
    if (lang === 'bn' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const t = (key, fallback = '') => {
    if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
      return TRANSLATIONS[language][key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isBengali: language === 'bn'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
