import React, { useState, useEffect } from 'react';
import { AmbientBackground } from './components/AmbientBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HeroFilteredResults } from './components/HeroFilteredResults';
import { DestinationBentoGrid } from './components/DestinationBentoGrid';
import { AllDestinationsPage } from './components/AllDestinationsPage';
import { HowItWorksSection } from './components/HowItWorksSection';
import { CoreServicesSection } from './components/CoreServicesSection';
import { ServicesPage } from './components/ServicesPage';
import { ClientReviewsSection } from './components/ClientReviewsSection';
import { ContactBentoSection } from './components/ContactBentoSection';
import { SingleHotelDetailPage } from './components/SingleHotelDetailPage';
import { SingleHotelsGrid } from './components/SingleHotelsGrid';
import { TransportShowcaseSection } from './components/TransportShowcaseSection';
import { TransportCategoryPage } from './components/TransportCategoryPage';
import { BookingInquiryWidget } from './components/BookingInquiryWidget';
import { FloatingContactDock } from './components/FloatingContactDock';
import { BookCallModal } from './components/BookCallModal';
import { BrandSection } from './components/BrandSection';
import { AboutPage } from './components/AboutPage';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminAuthService } from './services/adminAuthService';
import { StorageService } from './services/storageService';
import { AuthModal } from './components/AuthModal';
import { WishlistModal, UserProfileModal } from './components/UserModals';
import { MyBookingsPage } from './components/MyBookingsPage';
import { useAuth } from './context/AuthContext';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const { user, activeUserModal, closeUserModal } = useAuth();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => AdminAuthService.isAuthenticated());
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHeroFilter, setActiveHeroFilter] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null); // When set, renders the dedicated SingleHotelDetailPage
  const [selectedTransportCategory, setSelectedTransportCategory] = useState(null); // When set, renders the dedicated TransportCategoryPage
  const [isServicesPageOpen, setIsServicesPageOpen] = useState(false);
  const [isAllDestinationsPageOpen, setIsAllDestinationsPageOpen] = useState(false);
  const [isAboutPageOpen, setIsAboutPageOpen] = useState(false);
  const [isMyBookingsPageOpen, setIsMyBookingsPageOpen] = useState(false);
  const [activeServiceTab, setActiveServiceTab] = useState('hotels');
  const [returnToServices, setReturnToServices] = useState(false);
  const [isBookCallOpen, setIsBookCallOpen] = useState(false);
  const [isGlobalBookingModalOpen, setIsGlobalBookingModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

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

  const handleSearch = (filterPayload) => {
    const { activeTab, subOption, destination, query, pickup, dropoff, guests, mealPlan } = filterPayload;
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

  return (
    <div className="relative min-h-screen w-full overflow-x-clip text-black/70 dark:text-slate-100 selection:bg-[#69EBDA]/30 selection:text-slate-900 transition-colors duration-300">
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
            onSelectHotel={(hotel) => {
              setReturnToServices(true);
              setSelectedHotel(hotel);
              setSelectedTransportCategory(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              showToast(`${hotel.name}-এর বিস্তারিত বিবরণ দেখা হচ্ছে`);
            }}
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
            onSelectHotel={(hotel) => {
              setReturnToServices(true);
              setSelectedHotel(hotel);
              setIsServicesPageOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              showToast(`${hotel.name}-এর বিস্তারিত বিবরণ দেখা হচ্ছে`);
            }}
            onSelectTransportCategory={(catId) => {
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
                onSelectItem={(item) => {
                  setSelectedHotel(item);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  showToast(`${item.name}-এর বিস্তারিত বিবরণ দেখা হচ্ছে`);
                }}
              />
            ) : (
              <>
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
                  onSelectHotel={(hotel) => {
                    setSelectedHotel(hotel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    showToast(`${hotel.name}-এর বিস্তারিত বিবরণ দেখা হচ্ছে`);
                  }}
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                />

                {/* Step 2: Vehicle & Transport Showcase Section (Road, Waterway, Air, Hotel & Restaurant) */}
                <TransportShowcaseSection
                  onSelectCategory={(catId) => {
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
              </>
            )}
          </>
        )}
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
        onSelectHotel={(hotel) => {
          setSelectedHotel(hotel);
          setIsAdminMode(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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
