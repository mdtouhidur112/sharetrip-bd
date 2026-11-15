import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AmbientBackground } from './components/AmbientBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { DestinationBentoGrid } from './components/DestinationBentoGrid';
import { HowItWorksSection } from './components/HowItWorksSection';
import { CoreServicesSection } from './components/CoreServicesSection';
import { ClientReviewsSection } from './components/ClientReviewsSection';
import { ContactBentoSection } from './components/ContactBentoSection';
import { SingleHotelsGrid } from './components/SingleHotelsGrid';
import { TransportShowcaseSection } from './components/TransportShowcaseSection';
import { FloatingContactDock } from './components/FloatingContactDock';
import { BrandSection } from './components/BrandSection';
import { Footer } from './components/Footer';
import { AdminAuthService } from './services/adminAuthService';
import { StorageService } from './services/storageService';
import { useAuth } from './context/AuthContext';
import { Helmet } from './context/HelmetContext';
import { Sparkles, CheckCircle2, AlertTriangle, X } from 'lucide-react';

// Lazy-loaded pages & modals for optimal initial bundle size & fast first paint
const HeroFilteredResults = lazy(() => import('./components/HeroFilteredResults').then(m => ({ default: m.HeroFilteredResults })));
const AllDestinationsPage = lazy(() => import('./components/AllDestinationsPage').then(m => ({ default: m.AllDestinationsPage })));
const ServicesPage = lazy(() => import('./components/ServicesPage').then(m => ({ default: m.ServicesPage })));
const SingleHotelDetailPage = lazy(() => import('./components/SingleHotelDetailPage').then(m => ({ default: m.SingleHotelDetailPage })));
const TransportCategoryPage = lazy(() => import('./components/TransportCategoryPage').then(m => ({ default: m.TransportCategoryPage })));
const BookingInquiryWidget = lazy(() => import('./components/BookingInquiryWidget').then(m => ({ default: m.BookingInquiryWidget })));
const BookCallModal = lazy(() => import('./components/BookCallModal').then(m => ({ default: m.BookCallModal })));
const AboutPage = lazy(() => import('./components/AboutPage').then(m => ({ default: m.AboutPage })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLoginModal = lazy(() => import('./components/admin/AdminLoginModal').then(m => ({ default: m.AdminLoginModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const WishlistModal = lazy(() => import('./components/UserModals').then(m => ({ default: m.WishlistModal })));
const UserProfileModal = lazy(() => import('./components/UserModals').then(m => ({ default: m.UserProfileModal })));
const MyBookingsPage = lazy(() => import('./components/MyBookingsPage').then(m => ({ default: m.MyBookingsPage })));

const LazyFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center p-8">
    <div className="w-8 h-8 rounded-full border-2 border-[#69EBDA] border-t-transparent animate-spin" />
  </div>
);

const NAV_STATE_STORAGE_KEY = 'aetheria_nav_state_v1';
const SCROLL_POS_STORAGE_KEY = 'aetheria_scroll_pos_v1';

const readSavedNavState = () => {
  try {
    const raw = sessionStorage.getItem(NAV_STATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    // ignore storage errors
  }
  return {};
};

export default function App() {
  const { user, activeUserModal, closeUserModal } = useAuth();
  const [savedNav] = useState(() => readSavedNavState());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => AdminAuthService.isAuthenticated());
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(() => savedNav.selectedCategory ?? 'all');
  const [searchQuery, setSearchQuery] = useState(() => savedNav.searchQuery ?? '');
  const [activeHeroFilter, setActiveHeroFilter] = useState(() => savedNav.activeHeroFilter ?? null);
  const [selectedHotel, setSelectedHotel] = useState(() => savedNav.selectedHotel ?? null); // When set, renders the dedicated SingleHotelDetailPage
  const [selectedTransportCategory, setSelectedTransportCategory] = useState(() => savedNav.selectedTransportCategory ?? null); // When set, renders the dedicated TransportCategoryPage
  const [isServicesPageOpen, setIsServicesPageOpen] = useState(() => Boolean(savedNav.isServicesPageOpen));
  const [isAllDestinationsPageOpen, setIsAllDestinationsPageOpen] = useState(() => Boolean(savedNav.isAllDestinationsPageOpen));
  const [isAboutPageOpen, setIsAboutPageOpen] = useState(() => Boolean(savedNav.isAboutPageOpen));
  const [isMyBookingsPageOpen, setIsMyBookingsPageOpen] = useState(() => Boolean(savedNav.isMyBookingsPageOpen));
  const [activeServiceTab, setActiveServiceTab] = useState(() => savedNav.activeServiceTab || 'hotels');
  const [returnToServices, setReturnToServices] = useState(() => Boolean(savedNav.returnToServices));
  const [isBookCallOpen, setIsBookCallOpen] = useState(false);
  const [isGlobalBookingModalOpen, setIsGlobalBookingModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [seoSettings, setSeoSettings] = useState(() => StorageService.getSeoSettings());
  const [servicesControl, setServicesControl] = useState(() => StorageService.getServicesControl());
  const [disabledServiceModal, setDisabledServiceModal] = useState(null);
  const hasRestoredScrollRef = useRef(false);

  // Persist current page / view state across browser reloads
  useEffect(() => {
    try {
      sessionStorage.setItem(
        NAV_STATE_STORAGE_KEY,
        JSON.stringify({
          selectedCategory,
          searchQuery,
          activeHeroFilter,
          selectedHotel,
          selectedTransportCategory,
          isServicesPageOpen,
          isAllDestinationsPageOpen,
          isAboutPageOpen,
          isMyBookingsPageOpen,
          activeServiceTab,
          returnToServices
        })
      );
    } catch (e) {
      // ignore storage quota errors
    }
  }, [
    selectedCategory,
    searchQuery,
    activeHeroFilter,
    selectedHotel,
    selectedTransportCategory,
    isServicesPageOpen,
    isAllDestinationsPageOpen,
    isAboutPageOpen,
    isMyBookingsPageOpen,
    activeServiceTab,
    returnToServices
  ]);

  // Save & restore exact scroll position across browser reloads (including lazy-loaded pages)
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (!hasRestoredScrollRef.current) {
      hasRestoredScrollRef.current = true;
      try {
        const savedY = Number(sessionStorage.getItem(SCROLL_POS_STORAGE_KEY) || 0);
        if (savedY > 0) {
          let attempts = 0;
          const tryRestoreScroll = () => {
            attempts += 1;
            window.scrollTo({ top: savedY, behavior: 'auto' });
            const currentY = window.scrollY || window.pageYOffset || 0;
            if (Math.abs(currentY - savedY) > 16 && attempts < 25) {
              setTimeout(() => requestAnimationFrame(tryRestoreScroll), 80);
            }
          };
          requestAnimationFrame(() => setTimeout(tryRestoreScroll, 60));
        }
      } catch (e) {
        // ignore
      }
    }

    let scrollTimer = null;
    const persistScroll = () => {
      try {
        sessionStorage.setItem(SCROLL_POS_STORAGE_KEY, String(Math.round(window.scrollY || 0)));
      } catch (e) {
        // ignore
      }
    };
    const handleScroll = () => {
      if (scrollTimer) return;
      scrollTimer = setTimeout(() => {
        scrollTimer = null;
        persistScroll();
      }, 120);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', persistScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', persistScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);

  useEffect(() => {
    const syncSeo = () => setSeoSettings(StorageService.getSeoSettings());
    const syncServicesControl = () => setServicesControl(StorageService.getServicesControl());
    const handleDisabledClick = (e) => {
      if (e?.detail) {
        setDisabledServiceModal(e.detail);
      }
    };
    window.addEventListener('app:seo-settings-updated', syncSeo);
    window.addEventListener('app:services-control-updated', syncServicesControl);
    window.addEventListener('app:service-disabled-clicked', handleDisabledClick);
    return () => {
      window.removeEventListener('app:seo-settings-updated', syncSeo);
      window.removeEventListener('app:services-control-updated', syncServicesControl);
      window.removeEventListener('app:service-disabled-clicked', handleDisabledClick);
    };
  }, []);

  // Auto-close any open service view if admin disables that service in real time
  useEffect(() => {
    if (isAdminMode) return;
    if (selectedHotel) {
      const svcKey =
        selectedHotel.serviceType === 'transport'
          ? (selectedHotel.category || 'transport')
          : selectedHotel.serviceType === 'restaurant'
          ? 'restaurant'
          : 'hotels';
      if (!StorageService.isServiceEnabled(svcKey)) {
        setSelectedHotel(null);
        StorageService.notifyDisabledService(svcKey);
      }
    }
    if (selectedTransportCategory) {
      const catCheckKey = selectedTransportCategory === 'all' ? 'transport' : selectedTransportCategory;
      if (!StorageService.isServiceEnabled(catCheckKey)) {
        setSelectedTransportCategory(null);
        StorageService.notifyDisabledService(catCheckKey);
      }
    }
    if (isServicesPageOpen && !StorageService.isServiceEnabled(activeServiceTab)) {
      setIsServicesPageOpen(false);
      StorageService.notifyDisabledService(activeServiceTab);
    }
    if (activeHeroFilter) {
      const tabKey = activeHeroFilter.activeTab || 'hotels';
      const subMap = { 'Road Services': 'road', 'River Services': 'waterway', 'Air Services': 'air' };
      const checkKey = tabKey === 'transport' && activeHeroFilter.subOption ? (subMap[activeHeroFilter.subOption] || 'transport') : tabKey;
      if (!StorageService.isServiceEnabled(checkKey)) {
        setActiveHeroFilter(null);
        StorageService.notifyDisabledService(checkKey);
      }
    }
  }, [servicesControl, isAdminMode, selectedHotel, selectedTransportCategory, isServicesPageOpen, activeServiceTab, activeHeroFilter]);

  // Core Routing Logic: Detect /admin route (pathname) and #admin (hash)
  const checkRoute = () => {
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const isTargetingAdmin = pathname === '/admin' || pathname === '/admin/' || hash === '#admin';

    if (isTargetingAdmin) {
      if (AdminAuthService.isAuthenticated()) {
        setIsAdminAuthenticated(true);
        setIsAdminMode(true);
        setIsAdminLoginModalOpen(false);
      } else if (user && StorageService.isNormalAdmin(user.email)) {
        // If current logged-in website user has Normal Admin rights, log them in directly
        AdminAuthService.loginAsNormalAdmin(user);
        setIsAdminAuthenticated(true);
        setIsAdminMode(true);
        setIsAdminLoginModalOpen(false);
      } else {
        setIsAdminMode(false);
        setIsAdminLoginModalOpen(true);
      }
    } else {
      // If user navigates away to / or any non-admin route
      if (pathname === '/' || pathname === '') {
        setIsAdminMode(false);
        setIsAdminLoginModalOpen(false);
      }
    }
  };

  useEffect(() => {
    // Initial route check on mount
    checkRoute();

    // Listen to browser popstate (back/forward navigation or manual URL changes)
    const handlePopState = () => {
      checkRoute();
    };

    const handleHashChange = () => {
      checkRoute();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [user]);

  useEffect(() => {
    if (activeUserModal === 'bookings') {
      closeUserModal();
      setIsAdminMode(false);
      setIsServicesPageOpen(false);
      setIsAllDestinationsPageOpen(false);
      setIsAboutPageOpen(false);
      setSelectedHotel(null);
      setSelectedTransportCategory(null);
      setIsMyBookingsPageOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeUserModal, closeUserModal]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const getItemServiceKey = (item) =>
    item?.serviceType === 'transport'
      ? (item?.category || 'transport')
      : item?.serviceType === 'restaurant'
      ? 'restaurant'
      : 'hotels';

  const handleOpenServiceItem = (item, { fromServices = false, clearTransport = false } = {}) => {
    const svcKey = getItemServiceKey(item);
    if (!StorageService.isServiceEnabled(svcKey)) {
      StorageService.notifyDisabledService(svcKey);
      return;
    }
    if (fromServices) setReturnToServices(true);
    setSelectedHotel(item);
    if (clearTransport) setSelectedTransportCategory(null);
    if (fromServices) setIsServicesPageOpen(false);
    setIsAdminMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`${item.name}-এর বিস্তারিত বিবরণ দেখা হচ্ছে`);
  };

  const handleSearch = (filterPayload) => {
    const { activeTab, subOption, destination, query, pickup, dropoff, guests, mealPlan } = filterPayload;
    const targetTab = activeTab || 'hotels';
    const subMap = { 'Road Services': 'road', 'River Services': 'waterway', 'Air Services': 'air' };
    const checkKey = targetTab === 'transport' && subOption ? (subMap[subOption] || 'transport') : targetTab;
    if (!StorageService.isServiceEnabled(checkKey)) {
      StorageService.notifyDisabledService(checkKey);
      return;
    }
    const effectiveQuery = (query || destination || '').trim();
    setSearchQuery(effectiveQuery);
    setSelectedHotel(null);
    setSelectedTransportCategory(null);
    setIsServicesPageOpen(false);
    setIsAllDestinationsPageOpen(false);
    setIsAboutPageOpen(false);
    setIsMyBookingsPageOpen(false);
    setActiveHeroFilter(filterPayload);

    setTimeout(() => {
      const el = document.getElementById('hero-filtered-results');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    if (activeTab === 'transport') {
      const routeText = [pickup, dropoff].filter(Boolean).join(' → ');
      showToast(`ট্রান্সপোর্ট ফিল্টার: ${subOption || 'Road Services'}${routeText ? ` • ${routeText}` : ''}`);
    } else if (activeTab === 'restaurant') {
      showToast(`রেস্টুরেন্ট ফিল্টার: ${effectiveQuery || mealPlan || 'সকল ডাইনিং'} • ${guests || 2} জন`);
    } else {
      showToast(`হোটেল ফিল্টার: ${effectiveQuery || 'সব হোটেল'} • ${guests || 2} জন অতিথি`);
    }
  };

  const handleOpenServicesPage = (tab = 'hotels') => {
    if (!StorageService.isServiceEnabled(tab)) {
      StorageService.notifyDisabledService(tab);
      return;
    }
    setActiveServiceTab(tab);
    setIsServicesPageOpen(true);
    setIsAboutPageOpen(false);
    setIsMyBookingsPageOpen(false);
    setSelectedHotel(null);
    setSelectedTransportCategory(null);
    setIsAdminMode(false);
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsServicesPageOpen(false);
    setIsAboutPageOpen(false);
    setIsMyBookingsPageOpen(false);
    setSelectedHotel(null);
    setSelectedTransportCategory(null);
    setIsAdminMode(false);
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      window.history.pushState({}, '', '/');
    }
    setTimeout(() => {
      const element = document.getElementById('single-hotels');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    const destinations = StorageService.getDestinations();
    const matchedDest = destinations.find(
      (d) => (d.id || '').toLowerCase() === String(categoryId).toLowerCase()
    );
    const catNames = {
      beach: 'সমুদ্র সৈকত',
      adventure: 'রোমাঞ্চকর অভিযান',
      nature: 'প্রকৃতি ও অরণ্য',
      all: 'সব'
    };
    const displayName = matchedDest?.destinationName || matchedDest?.title || catNames[categoryId] || categoryId;
    showToast(`${displayName} এর হোটেল ও রিসোর্টসমূহ দেখা হচ্ছে`);
  };

  const scrollToSection = (targetId) => {
    const attemptScroll = (tries = 0) => {
      const element = document.getElementById(targetId);
      if (element) {
        const yOffset = -84; // Offset for fixed floating Navbar
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      } else if (tries < 6) {
        requestAnimationFrame(() => setTimeout(() => attemptScroll(tries + 1), 60));
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    requestAnimationFrame(() => setTimeout(() => attemptScroll(0), 50));
  };

  const handleNavigateHome = (href) => {
    if (isAdminMode) {
      setIsAdminMode(false);
    }
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      window.history.pushState({}, '', '/');
    }
    setIsServicesPageOpen(false);
    setIsAllDestinationsPageOpen(false);
    setIsMyBookingsPageOpen(false);
    setSelectedHotel(null);
    setSelectedTransportCategory(null);
    setReturnToServices(false);
    const targetId = href ? href.replace('#', '') : 'home';
    if (targetId === 'about') {
      setIsAboutPageOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsAboutPageOpen(false);
    scrollToSection(targetId);
  };

  // Open Admin: triggered from navbar, footer, or buttons
  const handleOpenAdmin = () => {
    // 1. If already authenticated:
    if (AdminAuthService.isAuthenticated()) {
      setIsAdminAuthenticated(true);
      setIsAdminMode(true);
      setIsAdminLoginModalOpen(false);
      window.history.pushState({}, '', '/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('অ্যাডমিন অপারেশনস প্যানেলে প্রবেশ করেছেন');
      return;
    }

    // 2. If logged-in user has Normal Admin access granted by Root Admin:
    if (user && StorageService.isNormalAdmin(user.email)) {
      const res = AdminAuthService.loginAsNormalAdmin(user);
      if (res.success) {
        setIsAdminAuthenticated(true);
        setIsAdminMode(true);
        setIsAdminLoginModalOpen(false);
        window.history.pushState({}, '', '/admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast(`স্বাগতম, ${user.name}! আপনি নরমাল অ্যাডমিন হিসেবে প্রবেশ করেছেন।`);
        return;
      }
    }

    // 3. Otherwise: Opens Root Admin Login Modal (.env credentials required)
    window.history.pushState({}, '', '/admin');
    setIsAdminMode(false);
    setIsAdminLoginModalOpen(true);
  };

  // Admin Login Successful
  const handleAdminLoginSuccess = (adminData) => {
    setIsAdminAuthenticated(true);
    setIsAdminLoginModalOpen(false);
    setIsAdminMode(true);
    window.history.pushState({}, '', '/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`স্বাগতম, ${adminData.name || 'অ্যাডমিন'}! অ্যাডমিন ড্যাশবোর্ড সফলভাবে সক্রিয় হয়েছে।`);
  };

  // Close Admin Login Modal (Cancel)
  const handleCloseAdminLoginModal = () => {
    setIsAdminLoginModalOpen(false);
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      window.history.pushState({}, '', '/');
    }
  };

  // Exit Admin: Log out admin session and return to main website
  const handleExitAdmin = () => {
    AdminAuthService.logout();
    setIsAdminAuthenticated(false);
    setIsAdminMode(false);
    setIsAdminLoginModalOpen(false);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('অ্যাডমিন সেশন সমাপ্ত হয়েছে এবং মূল ওয়েবসাইটে ফিরে এসেছেন');
  };

  const pageTitle = isAdminMode
    ? `Admin Panel | ${seoSettings?.siteTitle || 'ShareTrip BD'}`
    : selectedHotel?.name
      ? `${selectedHotel.name} | ${seoSettings?.siteTitle || 'ShareTrip BD'}`
      : isServicesPageOpen
        ? `Services | ${seoSettings?.siteTitle || 'ShareTrip BD'}`
        : isMyBookingsPageOpen
          ? `My Bookings | ${seoSettings?.siteTitle || 'ShareTrip BD'}`
          : isAboutPageOpen
            ? `About Us | ${seoSettings?.siteTitle || 'ShareTrip BD'}`
            : isAllDestinationsPageOpen
              ? `Destinations | ${seoSettings?.siteTitle || 'ShareTrip BD'}`
              : seoSettings?.siteTitle || 'ShareTrip BD';

  const schemaJsonLd = seoSettings?.schemaOrgName
    ? {
        '@context': 'https://schema.org',
        '@type': 'TravelAgency',
        name: seoSettings.schemaOrgName,
        url: seoSettings.canonicalUrl || (typeof window !== 'undefined' ? window.location.origin : ''),
        telephone: seoSettings.schemaPhone || undefined,
        address: seoSettings.schemaAddress || undefined,
        image: seoSettings.ogImage || undefined
      }
    : null;

  return (
    <div className="relative min-h-screen w-full overflow-x-clip text-black/70 dark:text-slate-100 selection:bg-[#69EBDA]/30 selection:text-slate-900 transition-colors duration-300">
      <Helmet
        title={pageTitle}
        description={seoSettings?.metaDescription}
        keywords={seoSettings?.metaKeywords}
        canonical={seoSettings?.canonicalUrl}
        robots={seoSettings?.robots}
        ogTitle={seoSettings?.ogTitle || pageTitle}
        ogDescription={seoSettings?.ogDescription || seoSettings?.metaDescription}
        ogImage={seoSettings?.ogImage}
        twitterCard={seoSettings?.twitterCard}
        twitterSite={seoSettings?.twitterSite}
        googleVerification={seoSettings?.googleVerification}
        jsonLd={schemaJsonLd}
      />
      {/* 1. Ambient Dynamic Glass Background with Blobs */}
      <AmbientBackground />

      {/* 2. Floating Liquid Glass Navbar (Hidden in Admin Panel) */}
      {!isAdminMode && (
        <Navbar 
          onOpenBookCall={() => setIsBookCallOpen(true)}
          onNavigateHome={handleNavigateHome}
          onOpenAdmin={handleOpenAdmin}
          isAdminMode={false}
        />
      )}

      {/* Main Content Area */}
      <main className="relative z-10">
        <Suspense fallback={<LazyFallback />}>
        {isAdminMode ? (
          /* Step 5: Liquid Glass Admin Operations Dashboard */
          <AdminDashboard
            onExitAdmin={handleExitAdmin}
            currentAdmin={AdminAuthService.getCurrentAdmin()}
          />
        ) : selectedHotel ? (
          /* Dedicated Single Hotel & Resort Details Page with Calendar & Responsive Checkout */
          <SingleHotelDetailPage
            hotel={selectedHotel}
            onBack={() => {
              setSelectedHotel(null);
              if (returnToServices) {
                setIsServicesPageOpen(true);
                setReturnToServices(false);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBookingSuccess={(booking) => {
              showToast(`বুকিং সফলভাবে সম্পন্ন হয়েছে! আপনার আইডি: ${booking.itemId || 'AETH-BK'}`);
            }}
          />
        ) : selectedTransportCategory ? (
          /* Step 2: Dedicated Transport Category Page */
          <TransportCategoryPage
            categoryId={selectedTransportCategory}
            initialSearchQuery={searchQuery}
            onBack={() => {
              setSelectedTransportCategory(null);
              if (returnToServices) {
                setActiveServiceTab('transport');
                setIsServicesPageOpen(true);
                setReturnToServices(false);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectHotel={(hotel) => handleOpenServiceItem(hotel, { fromServices: true, clearTransport: true })}
            onOpenBookCall={() => setIsBookCallOpen(true)}
          />
        ) : isServicesPageOpen ? (
          /* Dedicated Interactive Services Page (Hotels, Transport, Restaurant) */
          <ServicesPage
            initialTab={activeServiceTab}
            initialSearchQuery={searchQuery}
            onBack={() => {
              setIsServicesPageOpen(false);
              setReturnToServices(false);
              setTimeout(() => {
                const el = document.getElementById('services');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }, 80);
            }}
            onSelectHotel={(hotel) => handleOpenServiceItem(hotel, { fromServices: true })}
            onSelectTransportCategory={(catId) => {
              const checkKey = catId === 'all' ? 'transport' : catId;
              if (!StorageService.isServiceEnabled(checkKey)) {
                StorageService.notifyDisabledService(checkKey);
                return;
              }
              setReturnToServices(true);
              setActiveServiceTab('transport');
              setSelectedTransportCategory(catId);
              setIsServicesPageOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : isMyBookingsPageOpen ? (
          <MyBookingsPage
            user={user}
            onBack={() => {
              setIsMyBookingsPageOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onShowToast={showToast}
          />
        ) : isAboutPageOpen ? (
          <AboutPage
            onBack={() => {
              setIsAboutPageOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenContact={() => {
              setIsAboutPageOpen(false);
              scrollToSection('contact-info');
            }}
          />
        ) : isAllDestinationsPageOpen ? (
          <AllDestinationsPage
            selectedCategory={selectedCategory}
            onBack={() => {
              setIsAllDestinationsPageOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectDestination={(catId) => {
              setIsAllDestinationsPageOpen(false);
              handleSelectCategory(catId);
            }}
          />
        ) : (
          /* Step 1 & 4: Full High-Converting Homepage Journey */
          <>
            {/* Hero Section with Scenic Backdrop, Headline & Liquid Glass Search Bar */}
            <HeroSection onSearch={handleSearch} onSelectCategory={handleSelectCategory} />

            {activeHeroFilter ? (
              /* When Hero Filter is active, hide all other sections and show ONLY filtered service cards */
              <HeroFilteredResults
                filter={activeHeroFilter}
                onResetFilter={() => {
                  setActiveHeroFilter(null);
                  setSearchQuery('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectItem={(item) => handleOpenServiceItem(item)}
              />
            ) : (
              <div className="space-y-5 sm:space-y-0">
                {/* Destination Categories Bento Grid (Adventure, Beach, Nature) */}
                <DestinationBentoGrid 
                  onSelectCategory={handleSelectCategory}
                  selectedCategory={selectedCategory}
                  onOpenAllDestinations={() => {
                    setIsAllDestinationsPageOpen(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />

                {/* Single Hotels & Resorts Grid (Most Popular Bookings) */}
                <SingleHotelsGrid
                  onSelectHotel={(hotel) => handleOpenServiceItem(hotel)}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                />

                {/* Step 2: Vehicle & Transport Showcase Section (Road, Waterway, Air, Hotel & Restaurant) */}
                <TransportShowcaseSection
                  onSelectCategory={(catId) => {
                    const checkKey = catId === 'all' ? 'transport' : catId;
                    if (!StorageService.isServiceEnabled(checkKey)) {
                      StorageService.notifyDisabledService(checkKey);
                      return;
                    }
                    setSelectedTransportCategory(catId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onSelectService={handleOpenServicesPage}
                />

                {/* Step 4: "How It Works" 3-Step Glass Cards */}
                <HowItWorksSection 
                  onExploreTours={() => {
                    const el = document.getElementById('single-hotels');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* New Core Services 3-Card Section (Hotels, Transport, Restaurant) */}
                <CoreServicesSection onSelectService={handleOpenServicesPage} />

                {/* Step 4: Client Testimonials & Reviews Grid/Carousel */}
                <ClientReviewsSection />

                {/* Step 4: Contact & Office Info Bento Section (Dhaka & NY Offices, Hours, WhatsApp, Gmail, Phone) */}
                <ContactBentoSection 
                  onOpenBookCall={() => setIsBookCallOpen(true)}
                />
              </div>
            )}
          </>
        )}
        </Suspense>
      </main>

      {/* Partner Brand Section (Directly above Footer) */}
      {!isAdminMode && !activeHeroFilter && <BrandSection />}

      {/* Footer */}
      {!isAdminMode && (
        <Footer 
          onOpenBookCall={() => setIsBookCallOpen(true)} 
          onOpenAdmin={handleOpenAdmin}
        />
      )}

      {/* Step 3: Global Persistent Floating Contact Dock (WhatsApp, Book Call, Inquiry) */}
      {!isAdminMode && (
        <FloatingContactDock
          pkg={null}
          onOpenBookCall={() => setIsBookCallOpen(true)}
          onOpenBookingModal={() => setIsGlobalBookingModalOpen(true)}
        />
      )}

      {/* Global Booking / Inquiry Modal (Triggered from Floating Dock or Nav) */}
      <Suspense fallback={null}>
        {isGlobalBookingModalOpen && (
          <BookingInquiryWidget
            pkg={null}
            isOpenAsModal={true}
            onClose={() => setIsGlobalBookingModalOpen(false)}
            onSuccess={(data) => {
              StorageService.saveBooking(data);
              showToast(`অনুরোধ #${data.id} সফলভাবে সংরক্ষিত হয়েছে!`);
            }}
          />
        )}

        {/* Interactive Book a Call Modal */}
        <BookCallModal
          isOpen={isBookCallOpen}
          onClose={() => setIsBookCallOpen(false)}
        />

        {/* Complete Interactive Liquid Glass Auth Modal */}
        <AuthModal />

        {/* User Profile Modals (Wishlist, Settings) */}
        <WishlistModal
          isOpen={activeUserModal === 'wishlist'}
          onClose={closeUserModal}
          onSelectHotel={(hotel) => handleOpenServiceItem(hotel)}
        />

        <UserProfileModal
          isOpen={activeUserModal === 'settings'}
          onClose={closeUserModal}
        />

        {/* Admin Login Modal (Triggered on /admin route or admin portal click) */}
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={handleCloseAdminLoginModal}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      </Suspense>

      {/* Global Disabled Service Notice Modal (English) */}
      {disabledServiceModal && (
        <div
          onClick={() => setDisabledServiceModal(null)}
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-6 sm:p-7 text-center animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setDisabledServiceModal(null)}
              aria-label="Close modal"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Service Currently Off
            </h3>
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Sorry, <span className="font-bold text-slate-900 dark:text-white">{disabledServiceModal.title}</span> is currently turned off. Please check back later or explore our other available services.
            </p>

            <button
              type="button"
              onClick={() => setDisabledServiceModal(null)}
              className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-[#69EBDA] to-teal-500 text-slate-950 font-black text-sm hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-teal-500/20"
            >
              Okay, Got It
            </button>
          </div>
        </div>
      )}

      {/* Global Liquid Glass Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-teal-400/40 text-white shadow-[0_12px_40px_rgba(20,184,166,0.35)]">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 animate-pulse" />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
