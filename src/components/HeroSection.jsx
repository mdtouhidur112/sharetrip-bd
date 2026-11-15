import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  Compass, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  X,
  Building2,
  Car,
  Plane,
  Utensils,
  ArrowLeftRight,
  Clock
} from 'lucide-react';
import { DEFAULT_HERO_BANNER } from '../data/travelData';
import { openPopup } from '../utils/popupManager';
import { StorageService } from '../services/storageService';
import { supabase, rowToHeroBanner } from '../services/supabaseClient';

export const HeroSection = ({ onSearch, onSelectCategory }) => {
  // Hero Banner Realtime Cloud & Local Storage State
  const [heroBanner, setHeroBanner] = useState(() => StorageService.getHeroBanner());
  const [destinations, setDestinations] = useState(() => StorageService.getDestinations());
  const [allPackages, setAllPackages] = useState(() => StorageService.getPackages());
  const [allHotels, setAllHotels] = useState(() => StorageService.getHotels());
  const [allTransports, setAllTransports] = useState(() => StorageService.getTransports());
  const [allRestaurants, setAllRestaurants] = useState(() => StorageService.getRestaurants());
  const [packageCategories, setPackageCategories] = useState(() => StorageService.getPackageCategories());
  const [allReviews, setAllReviews] = useState(() => StorageService.getReviews());
  const [allBookings, setAllBookings] = useState(() => StorageService.getBookings());
  const [cycleSeed, setCycleSeed] = useState(0);

  // Multi-tab Hero Search Widget State (3 Services: Hotels, Transport, Restaurant)
  const [activeSearchTab, setActiveSearchTab] = useState('hotels');
  const [subOptionByTab, setSubOptionByTab] = useState({
    hotels: 'Resort / Hotel',
    transport: 'Road Services',
    restaurant: 'Full Board (3 Meals)'
  });
  const [swapRotation, setSwapRotation] = useState(0);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [arrivalTime, setArrivalTime] = useState('10:00');
  const [hotelQuery, setHotelQuery] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('2026-12-17');
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [pkgCategory, setPkgCategory] = useState('');
  const [restQuery, setRestQuery] = useState('');
  const [mealPlan, setMealPlan] = useState('Breakfast, Lunch & Dinner');
  const [activePopover, setActivePopover] = useState(null); // 'pickup' | 'dropoff' | 'datetime' | 'hotel-dest' | 'hotel-dates' | 'hotel-guests' | 'pkg-dest' | 'pkg-cat' | 'pkg-date' | 'rest-loc' | 'rest-meal' | 'rest-date'
  const tabsScrollRef = useRef(null);

  // Top Quick Search state
  const [topSearchQuery, setTopSearchQuery] = useState('');
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [navBottom, setNavBottom] = useState(80);

  // Main Search Controls State
  const [destination, setDestination] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const [travelDate, setTravelDate] = useState('2026-12-15');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 11, 1)); // Dec 2026

  const [guests, setGuests] = useState(2);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  // Rotating Banner Animation State
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const destRef = useRef(null);
  const dateRef = useRef(null);
  const guestsRef = useRef(null);
  const searchBarRef = useRef(null);

  // Build Hero Banner slides dynamically: 1 random package's default first photo per destination
  const slides = React.useMemo(() => {
    void cycleSeed;
    if (Array.isArray(destinations) && destinations.length > 0) {
      const destSlides = destinations
        .map((dest) => {
          const matchedPkgs = StorageService.getPackagesForDestination(dest, allPackages).filter((p) =>
            Boolean(StorageService.getPackageDefaultPhoto(p))
          );
          if (matchedPkgs.length > 0) {
            const randomPkg = matchedPkgs[Math.floor(Math.random() * matchedPkgs.length)];
            return {
              id: `${dest.id}-${randomPkg.id}`,
              destinationId: dest.id,
              destinationName: dest.destinationName || dest.title || '',
              location: dest.destinationName || dest.title || randomPkg.location || '',
              title: randomPkg.shortTitle || randomPkg.title || dest.title || '',
              url: StorageService.getPackageDefaultPhoto(randomPkg)
            };
          }
          if (dest.image) {
            return {
              id: dest.id,
              destinationId: dest.id,
              destinationName: dest.destinationName || dest.title || '',
              location: dest.destinationName || dest.title || '',
              title: dest.title || dest.destinationName || '',
              url: dest.image
            };
          }
          return null;
        })
        .filter(Boolean);

      if (destSlides.length > 0) {
        return destSlides;
      }
    }
    return heroBanner?.slides && heroBanner.slides.length > 0 ? heroBanner.slides : DEFAULT_HERO_BANNER.slides;
  }, [destinations, allPackages, heroBanner, cycleSeed]);

  const currentSlide = slides[currentBannerIndex % slides.length] || slides[0] || {};

  // Listen to local and Supabase Realtime updates
  useEffect(() => {
    const handleUpdate = () => {
      setHeroBanner(StorageService.getHeroBanner());
    };
    const handleDestinationsUpdate = () => {
      setDestinations(StorageService.getDestinations());
    };
    const handlePackagesUpdate = () => {
      setAllPackages(StorageService.getPackages());
    };
    const handleHotelsUpdate = () => setAllHotels(StorageService.getHotels());
    const handleTransportsUpdate = () => setAllTransports(StorageService.getTransports());
    const handleRestaurantsUpdate = () => setAllRestaurants(StorageService.getRestaurants());
    const handleCategoriesUpdate = () => setPackageCategories(StorageService.getPackageCategories());
    const handleReviewsUpdate = () => setAllReviews(StorageService.getReviews());
    const handleBookingsUpdate = () => setAllBookings(StorageService.getBookings());

    window.addEventListener('app:hero-banner-updated', handleUpdate);
    window.addEventListener('app:destinations-updated', handleDestinationsUpdate);
    window.addEventListener('app:packages-updated', handlePackagesUpdate);
    window.addEventListener('app:hotels-updated', handleHotelsUpdate);
    window.addEventListener('app:transports-updated', handleTransportsUpdate);
    window.addEventListener('app:restaurants-updated', handleRestaurantsUpdate);
    window.addEventListener('app:categories-updated', handleCategoriesUpdate);
    window.addEventListener('app:reviews-updated', handleReviewsUpdate);
    window.addEventListener('app:bookings-updated', handleBookingsUpdate);

    let channel = null;
    if (supabase) {
      channel = supabase
        .channel('hero-banner-realtime-front')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'hero_banner' },
          (payload) => {
            if (payload.new) {
              const mapped = rowToHeroBanner(payload.new);
              setHeroBanner(mapped);
              localStorage.setItem('aetheria_hero_banner_db', JSON.stringify(mapped));
            }
          }
        )
        .subscribe();
    }

  return () => {
      window.removeEventListener('app:hero-banner-updated', handleUpdate);
      window.removeEventListener('app:destinations-updated', handleDestinationsUpdate);
      window.removeEventListener('app:packages-updated', handlePackagesUpdate);
      window.removeEventListener('app:hotels-updated', handleHotelsUpdate);
      window.removeEventListener('app:transports-updated', handleTransportsUpdate);
      window.removeEventListener('app:restaurants-updated', handleRestaurantsUpdate);
      window.removeEventListener('app:categories-updated', handleCategoriesUpdate);
      window.removeEventListener('app:reviews-updated', handleReviewsUpdate);
      window.removeEventListener('app:bookings-updated', handleBookingsUpdate);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Auto-rotate hero banners sequentially through each destination (and pick new random package on each full cycle)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const nextIdx = (prev + 1) % slides.length;
        if (nextIdx === 0) {
          setCycleSeed((s) => s + 1);
        }
        return nextIdx;
      });
    }, 5500);
  return () => clearInterval(timer);
  }, [slides.length]);

  // Track scroll position to fix search bar with an exact 2px gap below navbar
  useEffect(() => {
    const handleScroll = () => {
      // When scroll passes 120px, search bar sticks with 2px gap below navbar
      setIsSearchSticky(window.scrollY > 120);

      // Measure the exact bottom edge of the navbar
      const navEl = document.querySelector('header nav') || document.querySelector('header');
      if (navEl) {
        const rect = navEl.getBoundingClientRect();
        // Exact 2px gap along the Y-axis below navbar
        setNavBottom(Math.round(rect.bottom + 2));
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
  return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Click outside, touch outside, or scroll listener to safely close pop-up boxes
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setShowDateDropdown(false);
      }
      if (guestsRef.current && !guestsRef.current.contains(e.target)) {
        setShowGuestsDropdown(false);
      }
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setActivePopover(null);
      }
    };
    const handleScrollOutside = (e) => {
      const target = e.target;
      const insideSearchBar =
        searchBarRef.current &&
        target instanceof Node &&
        searchBarRef.current.contains(target);
      if (!insideSearchBar) {
        setActivePopover(null);
      }
      if (
        (destRef.current && destRef.current.contains(target)) ||
        (dateRef.current && dateRef.current.contains(target)) ||
        (guestsRef.current && guestsRef.current.contains(target))
      ) {
        return;
      }
      setShowDestDropdown(false);
      setShowDateDropdown(false);
      setShowGuestsDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    window.addEventListener('scroll', handleScrollOutside, { passive: true, capture: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOutside, { capture: true });
    };
  }, []);

  // Global popup listener: auto-close hero popups when another popup is triggered anywhere
  useEffect(() => {
    const handleOtherPopupOpened = (e) => {
      if (e.detail !== 'hero-destination') {
        setShowDestDropdown(false);
      }
      if (e.detail !== 'hero-date') {
        setShowDateDropdown(false);
      }
      if (e.detail !== 'hero-guests') {
        setShowGuestsDropdown(false);
      }
    };
    window.addEventListener('app:open-popup', handleOtherPopupOpened);
  return () => window.removeEventListener('app:open-popup', handleOtherPopupOpened);
  }, []);

  const toggleDestDropdown = (forcedState) => {
    const nextState = typeof forcedState === 'boolean' ? forcedState : !showDestDropdown;
    setShowDestDropdown(nextState);
    if (nextState) {
      setShowDateDropdown(false);
      setShowGuestsDropdown(false);
      openPopup('hero-destination');
    }
  };

  const toggleDateDropdown = (forcedState) => {
    const nextState = typeof forcedState === 'boolean' ? forcedState : !showDateDropdown;
    setShowDateDropdown(nextState);
    if (nextState) {
      setShowDestDropdown(false);
      setShowGuestsDropdown(false);
      openPopup('hero-date');
    }
  };

  const toggleGuestsDropdown = (forcedState) => {
    const nextState = typeof forcedState === 'boolean' ? forcedState : !showGuestsDropdown;
    setShowGuestsDropdown(nextState);
    if (nextState) {
      setShowDestDropdown(false);
      setShowDateDropdown(false);
      openPopup('hero-guests');
    }
  };

  // Top Search Bar Submit
  const handleTopSearchSubmit = (e) => {
    e.preventDefault();
    if (!topSearchQuery.trim()) return;
    setDestination(topSearchQuery.trim());
    if (onSearch) {
      onSearch({ destination: topSearchQuery.trim(), travelDate, guests });
    }
    const packagesEl = document.getElementById('packages');
    if (packagesEl) {
      packagesEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper when destination changes
  const handleDestinationSelect = (selectedDest) => {
    setDestination(selectedDest);
    setShowDestDropdown(false);
    if (onSearch) {
      onSearch({ destination: selectedDest, travelDate, guests });
    }
  };

  // Helper when travel date changes
  const handleTravelDateSelect = (selectedDate) => {
    setTravelDate(selectedDate);
    setShowDateDropdown(false);
    if (onSearch) {
      onSearch({ destination, travelDate: selectedDate, guests });
    }
  };

  // Helper when guests change
  const handleGuestsChange = (newGuests) => {
    setGuests(newGuests);
    if (onSearch) {
      onSearch({ destination, travelDate, guests: newGuests });
    }
  };

  // Filtered destinations list from database
  const filteredDestinations = destinations
    .map(d => d.destinationName || d.title || d.name)
    .filter(Boolean)
    .filter(d => d.toLowerCase().includes(destFilter.toLowerCase()));

  // Calendar Helpers
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const monthName = calendarMonth.toLocaleString('bn-BD', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  const getHeadlineSizeClass = (size) => {
    switch (size) {
      case '2xl': return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl';
      case '3xl': return 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl';
      case '4xl': return 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl';
      case '5xl': return 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl';
      case '6xl': return 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl';
      default: return 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl';
    }
  };

  const getSubtitleSizeClass = (size) => {
    switch (size) {
      case 'sm': return 'text-xs sm:text-sm md:text-base';
      case 'base': return 'text-sm sm:text-base md:text-lg lg:text-xl';
      case 'lg': return 'text-base sm:text-lg md:text-xl lg:text-2xl';
      case 'xl': return 'text-lg sm:text-xl md:text-2xl lg:text-3xl';
      default: return 'text-sm sm:text-base md:text-lg lg:text-xl';
    }
  };

  const HERO_SEARCH_TABS = [
    { id: 'hotels', label: 'Hotels', icon: Building2 },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'restaurant', label: 'Restaurant', icon: Utensils }
  ];

  const SUB_OPTIONS_MAP = {
    hotels: ['Resort / Hotel', 'Entire Villa / Suite'],
    transport: ['Road Services', 'River Services', 'Air Services'],
    restaurant: ['Full Board (3 Meals)', 'Buffet / BBQ']
  };

  const TRANSPORT_CATEGORY_ID_MAP = {
    'Road Services': 'road',
    'River Services': 'waterway',
    'Air Services': 'air'
  };

  const transportPickupOptions = React.useMemo(() => {
    const fromRoutes = allTransports.flatMap((t) =>
      Array.isArray(t.routeFares) ? t.routeFares.map((r) => (r.from || '').trim()).filter(Boolean) : []
    );
    const destNames = destinations.map((d) => d.destinationName || d.title || '').filter(Boolean);
    return Array.from(new Set([...fromRoutes, ...destNames]));
  }, [allTransports, destinations]);

  const transportDropoffOptions = React.useMemo(() => {
    const toRoutes = allTransports.flatMap((t) =>
      Array.isArray(t.routeFares) ? t.routeFares.map((r) => (r.to || '').trim()).filter(Boolean) : []
    );
    const destNames = destinations.map((d) => d.destinationName || d.title || '').filter(Boolean);
    return Array.from(new Set([...toRoutes, ...destNames]));
  }, [allTransports, destinations]);

  const formatDateParts = (isoStr) => {
    const parts = String(isoStr || '2026-11-14').split('-').map(Number);
    const d = new Date(parts[0] || 2026, (parts[1] || 11) - 1, parts[2] || 14);
    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: monthsEn[d.getMonth()] || 'November',
      year: d.getFullYear()
    };
  };

  const formatTime12h = (timeStr = '10:00') => {
    const [hRaw, mRaw] = String(timeStr).split(':').map(Number);
    const h = Number.isFinite(hRaw) ? hRaw : 10;
    const m = Number.isFinite(mRaw) ? mRaw : 0;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
  };

  const handleSwapLocations = () => {
    setSwapRotation((prev) => prev + 180);
    setPickupLocation(dropoffLocation);
    setDropoffLocation(pickupLocation);
  };

  const handleHeroSearchSubmit = () => {
    setActivePopover(null);
    const activeSub = subOptionByTab[activeSearchTab];
    const transportCategory =
      activeSearchTab === 'transport'
        ? TRANSPORT_CATEGORY_ID_MAP[activeSub] || 'road'
        : null;
    const query =
      activeSearchTab === 'transport'
        ? [pickupLocation, dropoffLocation].filter(Boolean).join(' ')
        : activeSearchTab === 'hotels'
          ? hotelQuery || destination
          : restQuery || mealPlan;

    if (onSearch) {
      onSearch({
        activeTab: activeSearchTab,
        subOption: activeSub,
        transportCategory,
        destination: query,
        query,
        pickup: pickupLocation,
        dropoff: dropoffLocation,
        travelDate,
        checkOutDate,
        arrivalTime,
        rooms,
        adults,
        children: childrenCount,
        guests: adults + childrenCount,
        mealPlan
      });
    }
  };

  return (
    <section id="home" className="relative pt-[72px] sm:pt-[76px] pb-[5px] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      
      {/* ========================================================================= */}
      {/* STICKY SEARCH BAR: DOCKS WITH EXACT 2PX GAP BELOW NAVBAR ON SCROLL        */}
      {/* ========================================================================= */}
      {isSearchSticky && (
        <div 
          style={{ top: `${navBottom}px` }}
          className="fixed left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl z-40 animate-in fade-in slide-in-from-top-1 duration-200 transition-[top] duration-150"
        >
          <form 
            onSubmit={handleTopSearchSubmit}
            className="
              relative flex items-center p-1.5 sm:p-2 rounded-full
              bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl
              border border-[#69EBDA]/60 dark:border-white/30
              shadow-[0_10px_35px_rgba(15,23,42,0.35)] hover:border-[#69EBDA]
              transition-all group
            "
          >
            <div className="flex items-center gap-2.5 pl-3.5 sm:pl-4 flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#69EBDA] shrink-0 group-focus-within:scale-110 transition-transform" />
              <input
                type="text"
                value={topSearchQuery}
                onChange={(e) => setTopSearchQuery(e.target.value)}
                placeholder="গন্তব্য, রিসোর্ট বা ভ্রমণের স্থান খুঁজুন..."
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-white placeholder:text-slate-300 focus:outline-none"
              />
            </div>

            {topSearchQuery && (
              <button
                type="button"
                onClick={() => setTopSearchQuery('')}
                className="p-1 rounded-full text-slate-300 hover:text-white mr-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="submit"
              className="
                px-4 sm:px-5 py-2 sm:py-2.5 rounded-full
                bg-gradient-to-r from-[#69EBDA] to-cyan-400 hover:from-[#69EBDA] hover:to-cyan-300
                text-slate-950 font-black text-xs tracking-wider uppercase
                shadow-md shadow-[#69EBDA]/30 flex items-center gap-1.5
                transform active:scale-95 transition-all cursor-pointer
              "
            >
              <span>অনুসন্ধান</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNIFIED CONTAINER: EXACT SAME WIDTH AS NAVBAR & ALL WEBSITE SECTIONS       */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center text-center">
        
        {/* ========================================================================= */}
        {/* CARD 1: BANNER PHOTO BACKGROUND CARD (HEADLINE, SUBTEXT & ROTATING PHOTOS) */}
        {/* ========================================================================= */}
        <div className="relative w-full rounded-3xl overflow-hidden px-4 pt-[2px] pb-28 sm:px-8 sm:pt-[2px] sm:pb-32 md:px-12 md:pt-[2px] md:pb-36 lg:px-14 lg:pt-[2px] lg:pb-40 border border-[#69EBDA]/40 dark:border-white/20 shadow-2xl flex flex-col items-center justify-start text-center">
          
          {/* Animated Background Banner Photos directly behind headline text */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentBannerIndex}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${currentSlide.url || ''}')`
                }}
              />
            </AnimatePresence>

            {/* Lightened Scrim without blur so banner photos look crisp & clear */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/35 to-slate-950/45" />
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#69EBDA]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          </div>

          {/* Top Quick Search Bar inside Card 1 (2px below top edge, hidden when scrolled sticky) */}
          <div className={`w-full max-w-xl mx-auto mb-3 sm:mb-4 transition-opacity duration-200 ${isSearchSticky ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <form 
              onSubmit={handleTopSearchSubmit}
              className="
                relative flex items-center p-1.5 sm:p-2 rounded-full
                bg-slate-900/60 backdrop-blur-2xl
                border border-[#69EBDA]/50
                shadow-lg shadow-[#69EBDA]/15 hover:border-[#69EBDA]
                transition-all group
              "
            >
              <div className="flex items-center gap-2.5 pl-3.5 sm:pl-4 flex-1">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#69EBDA] shrink-0 group-focus-within:scale-110 transition-transform" />
                <input
                  type="text"
                  value={topSearchQuery}
                  onChange={(e) => setTopSearchQuery(e.target.value)}
                  placeholder="গন্তব্য, রিসোর্ট বা ভ্রমণের স্থান খুঁজুন..."
                  className="w-full bg-transparent text-xs sm:text-sm font-bold text-white placeholder:text-slate-300 focus:outline-none"
                />
              </div>

              {topSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTopSearchQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-white mr-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="submit"
                className="
                  px-4 sm:px-5 py-2 sm:py-2.5 rounded-full
                  bg-gradient-to-r from-[#69EBDA] to-cyan-400 hover:from-[#69EBDA] hover:to-cyan-300
                  text-slate-950 font-black text-xs tracking-wider uppercase
                  shadow-md shadow-[#69EBDA]/30 flex items-center gap-1.5
                  transform active:scale-95 transition-all cursor-pointer
                "
              >
                <span>অনুসন্ধান</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Headline over rotating banner photo */}
          <h1 
            className={`tracking-tight mb-2 sm:mb-3 font-['Outfit',sans-serif] leading-[1.15] drop-shadow-md transition-all ${getHeadlineSizeClass(heroBanner?.headlineSize)}`}
            style={{
              color: heroBanner?.headlineColor || '#FFFFFF',
              fontWeight: heroBanner?.headlineBold !== false ? '800' : '400'
            }}
          >
            {heroBanner?.headline || 'সবার মুখে মুখে ফেরা'} <br className="hidden sm:inline" />
            <span 
              className="drop-shadow-sm transition-all"
              style={{
                color: heroBanner?.highlightColor || '#69EBDA',
                fontWeight: heroBanner?.headlineBold !== false ? '800' : '400'
              }}
            >
              {heroBanner?.headlineHighlight || 'স্বপ্নের ভ্রমণ অভিজ্ঞতা'}
            </span>
          </h1>

          {/* Subtext */}
          <p 
            className={`max-w-2xl mx-auto leading-relaxed mb-3 sm:mb-4 drop-shadow-sm transition-all ${getSubtitleSizeClass(heroBanner?.subtitleSize)}`}
            style={{
              color: heroBanner?.subtitleColor || '#F1F5F9',
              fontWeight: heroBanner?.subtitleBold ? '700' : '400'
            }}
          >
            {heroBanner?.subtitle || 'শীর্ষস্থানীয় ট্রাভেল স্থপতিদের নিখুঁত পরিকল্পনায় অংশ নিন নান্দনিক অ্যাডভেঞ্চার, নিরিবিলি লাক্সারি রিসোর্ট ও খাঁটি সাংস্কৃতিক অভিজ্ঞতায়।'}
          </p>

          {/* Banner Location Indicator at bottom of Card 1 */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#69EBDA] animate-spin" style={{ animationDuration: '8s' }} />
              <span>Selected destination :</span>
              <button
                type="button"
                onClick={() => {
                  if (onSelectCategory && currentSlide.destinationId) {
                    onSelectCategory(currentSlide.destinationId);
                  } else if (onSearch && (currentSlide.destinationName || currentSlide.location)) {
                    onSearch({
                      destination: currentSlide.destinationName || currentSlide.location,
                      travelDate,
                      guests
                    });
                    const el = document.getElementById('packages');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-2.5 py-0.5 rounded-full bg-[#69EBDA]/20 hover:bg-[#69EBDA] text-[#69EBDA] hover:text-slate-950 border border-[#69EBDA]/50 font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1 shadow-sm"
                title="এই গন্তব্যের সকল প্যাকেজ দেখতে ক্লিক করুন"
              >
                <span>{currentSlide.destinationName || currentSlide.location || ''}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              {slides.map((banner, idx) => (
                <button
                  key={banner.id || idx}
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={`
                    h-1.5 rounded-full transition-all duration-300 cursor-pointer
                    ${currentBannerIndex === idx 
                      ? 'w-6 bg-[#69EBDA] shadow-sm shadow-[#69EBDA]' 
                      : 'w-2 bg-white/30 hover:bg-white/60'
                    }
                  `}
                  title={banner.destinationName || banner.title}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* CARD 2: CONSOLIDATED CONTROLS & TRUST HIGHLIGHTS IN ONE SINGLE CARD       */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* CARD 2: FLOATING POP-UP FILTER CARD (40% ON BANNER / 60% BELOW, 80% WIDTH) */}
        {/* ========================================================================= */}
        <div className="w-[94%] sm:w-[88%] md:w-[80%] mx-auto -mt-24 sm:-mt-28 md:-mt-32 relative z-20 rounded-3xl p-4 sm:p-6 bg-[#5C6977]/95 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/25 shadow-[0_24px_60px_rgba(15,23,42,0.42)] text-left transition-all duration-300">

          {/* 1. Top Horizontal Service Category Tabs with Sliding #69EBDA Underline */}
          <div className="relative flex items-center border-b border-white/15 pb-0 mb-4">
            <div
              ref={tabsScrollRef}
              className="flex items-center justify-start sm:justify-center gap-6 sm:gap-10 overflow-x-auto no-scrollbar pr-8 sm:pr-0 flex-1"
            >
              {HERO_SEARCH_TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeSearchTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      if (!StorageService.isServiceEnabled(tab.id)) {
                        StorageService.notifyDisabledService(tab.id);
                        return;
                      }
                      setActiveSearchTab(tab.id);
                      setActivePopover(null);
                    }}
                    className={`relative pb-3.5 flex items-center gap-2 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                      isActive ? 'text-white' : 'text-slate-200/75 hover:text-white'
                    }`}
                  >
                    <TabIcon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#69EBDA]' : 'text-slate-300/80'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#69EBDA]/20 text-[#69EBDA] border border-[#69EBDA]/45 shadow-[0_0_12px_rgba(105,235,218,0.3)]">
                        {tab.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="heroSearchTabUnderline"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#69EBDA] shadow-[0_0_10px_rgba(105,235,218,0.65)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => tabsScrollRef.current?.scrollBy({ left: 140, behavior: 'smooth' })}
              className="md:hidden absolute right-0 top-0 bottom-2 w-8 flex items-center justify-end bg-gradient-to-l from-[#5C6977] dark:from-slate-900 to-transparent text-white/80 hover:text-[#69EBDA] cursor-pointer"
              aria-label="Scroll tabs right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. Middle Sub-Option Pills (Dynamic Radio Toggle Pills per Tab) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
            {(SUB_OPTIONS_MAP[activeSearchTab] || []).map((opt) => {
              const isSelected = subOptionByTab[activeSearchTab] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setSubOptionByTab((prev) => ({ ...prev, [activeSearchTab]: opt }))
                  }
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#69EBDA] text-slate-950 border-[#69EBDA] shadow-sm shadow-[#69EBDA]/30'
                      : 'bg-white/10 hover:bg-white/15 text-slate-100 border-white/15'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-slate-950' : 'border-white/50'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Bottom Structured Input Boxes & Square #69EBDA Search Button */}
          <div ref={searchBarRef} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">

            {/* TRANSPORT TAB INPUTS */}
            {activeSearchTab === 'transport' && (
              <>
                <div className="relative flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Box 1: Pickup Location */}
                  <div className="relative p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3">
                    <Plane className="w-5 h-5 text-[#69EBDA] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={pickupLocation}
                        onFocus={() => setActivePopover('pickup')}
                        onChange={(e) => {
                          setPickupLocation(e.target.value);
                          setActivePopover('pickup');
                        }}
                        placeholder="Dhaka (DAC)"
                        className="w-full bg-transparent text-sm sm:text-base font-extrabold text-white placeholder:text-slate-300/70 focus:outline-none truncate"
                      />
                      <span className="block text-[11px] font-semibold text-slate-300/80">
                        Pickup
                      </span>
                    </div>
                    {activePopover === 'pickup' && transportPickupOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 p-2 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 max-h-52 overflow-y-auto space-y-1">
                        {transportPickupOptions
                          .filter((loc) => !pickupLocation || loc.toLowerCase().includes(pickupLocation.toLowerCase()))
                          .slice(0, 8)
                          .map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                setPickupLocation(loc);
                                setActivePopover(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-[#69EBDA]/20 hover:text-[#69EBDA] flex items-center gap-2 cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#69EBDA] shrink-0" />
                              <span>{loc}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Center Circular Swap Button */}
                  <motion.button
                    type="button"
                    onClick={handleSwapLocations}
                    animate={{ rotate: swapRotation }}
                    transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                    className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900 border border-[#69EBDA]/60 text-[#69EBDA] hover:bg-[#69EBDA] hover:text-slate-950 items-center justify-center shadow-lg cursor-pointer transition-colors"
                    title="Swap Pickup & Drop-Off"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </motion.button>

                  {/* Box 2: Drop-Off Location */}
                  <div className="relative p-3.5 md:pl-6 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#69EBDA] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={dropoffLocation}
                        onFocus={() => setActivePopover('dropoff')}
                        onChange={(e) => {
                          setDropoffLocation(e.target.value);
                          setActivePopover('dropoff');
                        }}
                        placeholder="Cox's Bazar (CXB)"
                        className="w-full bg-transparent text-sm sm:text-base font-extrabold text-white placeholder:text-slate-300/70 focus:outline-none truncate"
                      />
                      <span className="block text-[11px] font-semibold text-slate-300/80">
                        Drop-Off
                      </span>
                    </div>
                    {activePopover === 'dropoff' && transportDropoffOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 p-2 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 max-h-52 overflow-y-auto space-y-1">
                        {transportDropoffOptions
                          .filter((loc) => !dropoffLocation || loc.toLowerCase().includes(dropoffLocation.toLowerCase()))
                          .slice(0, 8)
                          .map((loc) => (
                            <button
                              key={loc}
                              type="button"
                              onClick={() => {
                                setDropoffLocation(loc);
                                setActivePopover(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-[#69EBDA]/20 hover:text-[#69EBDA] flex items-center gap-2 cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#69EBDA] shrink-0" />
                              <span>{loc}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Box 3: Arrival Date & Time Picker */}
                <div
                  className="relative lg:w-72 p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3 cursor-pointer"
                  onClick={() => setActivePopover((prev) => (prev === 'datetime' ? null : 'datetime'))}
                >
                  <span className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] leading-none">
                    {formatDateParts(travelDate).day}
                  </span>
                  <div className="w-px h-8 bg-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                      {formatDateParts(travelDate).month}, {formatTime12h(arrivalTime)}
                    </div>
                    <span className="block text-[11px] font-semibold text-slate-300/80">
                      Arrival Date & Time
                    </span>
                  </div>
                  <Clock className="w-4 h-4 text-[#69EBDA] shrink-0" />
                  {activePopover === 'datetime' && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full mt-2 p-3.5 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 space-y-2.5"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-[#69EBDA] mb-1">Date</label>
                        <input
                          type="date"
                          value={travelDate}
                          onChange={(e) => setTravelDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/15 text-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#69EBDA] mb-1">Time</label>
                        <input
                          type="time"
                          value={arrivalTime}
                          onChange={(e) => setArrivalTime(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/15 text-white text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* HOTELS TAB INPUTS */}
            {activeSearchTab === 'hotels' && (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Box 1: Destination / Hotel Name */}
                <div className="relative p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-[#69EBDA] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={hotelQuery}
                      onFocus={() => setActivePopover('hotel-dest')}
                      onChange={(e) => {
                        setHotelQuery(e.target.value);
                        setActivePopover('hotel-dest');
                      }}
                      placeholder="Where are you staying?"
                      className="w-full bg-transparent text-sm sm:text-base font-extrabold text-white placeholder:text-slate-300/70 focus:outline-none truncate"
                    />
                    <span className="block text-[11px] font-semibold text-slate-300/80">
                      Destination / Hotel Name
                    </span>
                  </div>
                  {activePopover === 'hotel-dest' && (
                    <div className="absolute left-0 right-0 top-full mt-2 p-2 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 max-h-52 overflow-y-auto space-y-1">
                      {Array.from(new Set([
                        ...allHotels.map((h) => h.name).filter(Boolean),
                        ...destinations.map((d) => d.destinationName || d.title).filter(Boolean)
                      ]))
                        .filter((item) => !hotelQuery || item.toLowerCase().includes(hotelQuery.toLowerCase()))
                        .slice(0, 8)
                        .map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setHotelQuery(item);
                              setActivePopover(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-[#69EBDA]/20 hover:text-[#69EBDA] flex items-center gap-2 cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#69EBDA] shrink-0" />
                            <span className="truncate">{item}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Box 2: Check-in — Check-out Date Range */}
                <div
                  onClick={() => setActivePopover((prev) => (prev === 'hotel-dates' ? null : 'hotel-dates'))}
                  className="relative p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] leading-none">
                    {formatDateParts(travelDate).day}
                  </span>
                  <div className="w-px h-8 bg-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                      {formatDateParts(travelDate).month} — {formatDateParts(checkOutDate).day} {formatDateParts(checkOutDate).month.slice(0, 3)}
                    </div>
                    <span className="block text-[11px] font-semibold text-slate-300/80">
                      Check-in — Check-out
                    </span>
                  </div>
                  <Calendar className="w-4 h-4 text-[#69EBDA] shrink-0" />
                  {activePopover === 'hotel-dates' && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full mt-2 p-3.5 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 space-y-2.5"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-[#69EBDA] mb-1">Check-in</label>
                        <input
                          type="date"
                          value={travelDate}
                          onChange={(e) => setTravelDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/15 text-white text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#69EBDA] mb-1">Check-out</label>
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/15 text-white text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Box 3: Rooms & Guests */}
                <div
                  onClick={() => setActivePopover((prev) => (prev === 'hotel-guests' ? null : 'hotel-guests'))}
                  className="relative p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3 cursor-pointer"
                >
                  <Users className="w-5 h-5 text-[#69EBDA] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                      {rooms} Room, {adults} Adults{childrenCount > 0 ? `, ${childrenCount} Children` : ''}
                    </div>
                    <span className="block text-[11px] font-semibold text-slate-300/80">
                      Rooms, Adults & Children
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
                  {activePopover === 'hotel-guests' && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full mt-2 p-3.5 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>Rooms</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setRooms((r) => Math.max(1, r - 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">-</button>
                          <span className="w-5 text-center">{rooms}</span>
                          <button type="button" onClick={() => setRooms((r) => Math.min(10, r + 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">+</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <div>
                          <span className="block">Adults</span>
                          <span className="block text-[10px] font-semibold text-slate-300/80">17+ years</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setAdults((a) => Math.max(1, a - 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">-</button>
                          <span className="w-5 text-center">{adults}</span>
                          <button type="button" onClick={() => setAdults((a) => Math.min(20, a + 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">+</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <div>
                          <span className="block">Children</span>
                          <span className="block text-[10px] font-semibold text-slate-300/80">1 - 17 years</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setChildrenCount((c) => Math.max(0, c - 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">-</button>
                          <span className="w-5 text-center">{childrenCount}</span>
                          <button type="button" onClick={() => setChildrenCount((c) => Math.min(15, c + 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">+</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TOUR PACKAGES TAB INPUTS */}
            {activeSearchTab === 'packages' && (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Box 1: Destination */}
                <div className="relative p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#69EBDA] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={destination}
                      onFocus={() => setActivePopover('pkg-dest')}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setActivePopover('pkg-dest');
                      }}
                      placeholder="Where to?"
                      className="w-full bg-transparent text-sm sm:text-base font-extrabold text-white placeholder:text-slate-300/70 focus:outline-none truncate"
                    />
                    <span className="block text-[11px] font-semibold text-slate-300/80">
                      Destination
                    </span>
                  </div>
                  {activePopover === 'pkg-dest' && destinations.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 p-2 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 max-h-52 overflow-y-auto space-y-1">
                      {destinations
                        .map((d) => d.destinationName || d.title || '')
                        .filter((name) => name && (!destination || name.toLowerCase().includes(destination.toLowerCase())))
                        .slice(0, 8)
                        .map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => {
                              setDestination(name);
                              setActivePopover(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-[#69EBDA]/20 hover:text-[#69EBDA] flex items-center gap-2 cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#69EBDA] shrink-0" />
                            <span>{name}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Box 2: Category */}
                <div className="relative p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3">
                  <Compass className="w-5 h-5 text-[#69EBDA] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={pkgCategory}
                      onFocus={() => setActivePopover('pkg-cat')}
                      onChange={(e) => {
                        setPkgCategory(e.target.value);
                        setActivePopover('pkg-cat');
                      }}
                      placeholder="Adventure, Beach, Family..."
                      className="w-full bg-transparent text-sm sm:text-base font-extrabold text-white placeholder:text-slate-300/70 focus:outline-none truncate"
                    />
                    <span className="block text-[11px] font-semibold text-slate-300/80">
                      Category
                    </span>
                  </div>
                  {activePopover === 'pkg-cat' && (
                    <div className="absolute left-0 right-0 top-full mt-2 p-2 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 max-h-52 overflow-y-auto space-y-1">
                      {(packageCategories.length > 0
                        ? packageCategories.map((c) => c.name)
                        : ['Adventure', 'Beach', 'Family', 'Honeymoon', 'Nature']
                      ).map((catName) => (
                        <button
                          key={catName}
                          type="button"
                          onClick={() => {
                            setPkgCategory(catName);
                            setActivePopover(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-[#69EBDA]/20 hover:text-[#69EBDA] cursor-pointer"
                        >
                          {catName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Box 3: Travel Date & Guests */}
                <div
                  onClick={() => setActivePopover((prev) => (prev === 'pkg-date' ? null : 'pkg-date'))}
                  className="relative p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] leading-none">
                    {formatDateParts(travelDate).day}
                  </span>
                  <div className="w-px h-8 bg-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                      {formatDateParts(travelDate).month} • {guests} Guests
                    </div>
                    <span className="block text-[11px] font-semibold text-slate-300/80">
                      Travel Date & Guests
                    </span>
                  </div>
                  <Calendar className="w-4 h-4 text-[#69EBDA] shrink-0" />
                  {activePopover === 'pkg-date' && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full mt-2 p-3.5 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 space-y-2.5"
                    >
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/15 text-white text-xs font-bold"
                      />
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>Guests</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">-</button>
                          <span className="w-5 text-center">{guests}</span>
                          <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">+</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RESTAURANT TAB INPUTS */}
            {activeSearchTab === 'restaurant' && (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Box 1: Location / Dining Venue */}
                <div className="relative p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#69EBDA] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={restQuery}
                      onFocus={() => setActivePopover('rest-loc')}
                      onChange={(e) => {
                        setRestQuery(e.target.value);
                        setActivePopover('rest-loc');
                      }}
                      placeholder="Location / Dining Venue"
                      className="w-full bg-transparent text-sm sm:text-base font-extrabold text-white placeholder:text-slate-300/70 focus:outline-none truncate"
                    />
                    <span className="block text-[11px] font-semibold text-slate-300/80">
                      Venue or Cuisine
                    </span>
                  </div>
                  {activePopover === 'rest-loc' && allRestaurants.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 p-2 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 max-h-52 overflow-y-auto space-y-1">
                      {allRestaurants
                        .filter((r) => !restQuery || (r.name || '').toLowerCase().includes(restQuery.toLowerCase()))
                        .slice(0, 8)
                        .map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setRestQuery(r.name);
                              setActivePopover(null);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-[#69EBDA]/20 hover:text-[#69EBDA] cursor-pointer truncate"
                          >
                            {r.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Box 2: Meal Plan */}
                <div
                  onClick={() => setActivePopover((prev) => (prev === 'rest-meal' ? null : 'rest-meal'))}
                  className="relative p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3 cursor-pointer"
                >
                  <Utensils className="w-5 h-5 text-[#69EBDA] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                      {mealPlan}
                    </div>
                    <span className="block text-[11px] font-semibold text-slate-300/80">
                      Meal Plan
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
                  {activePopover === 'rest-meal' && (
                    <div className="absolute left-0 right-0 top-full mt-2 p-2 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 space-y-1">
                      {['Breakfast, Lunch & Dinner', 'Buffet & BBQ Night', 'Sea-View Candlelight Dinner'].map((mp) => (
                        <button
                          key={mp}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMealPlan(mp);
                            setActivePopover(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-[#69EBDA]/20 hover:text-[#69EBDA] cursor-pointer"
                        >
                          {mp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Box 3: Dining Date & Guests */}
                <div
                  onClick={() => setActivePopover((prev) => (prev === 'rest-date' ? null : 'rest-date'))}
                  className="relative p-3.5 rounded-2xl bg-slate-900/45 hover:bg-slate-900/60 border border-white/20 transition-all min-h-[68px] flex items-center gap-3 cursor-pointer"
                >
                  <span className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] leading-none">
                    {formatDateParts(travelDate).day}
                  </span>
                  <div className="w-px h-8 bg-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-extrabold text-white truncate">
                      {formatDateParts(travelDate).month} • {adults} Adults{childrenCount > 0 ? `, ${childrenCount} Child` : ''}
                    </div>
                    <span className="block text-[11px] font-semibold text-slate-300/80">
                      Dining Date, Adults & Children
                    </span>
                  </div>
                  <Calendar className="w-4 h-4 text-[#69EBDA] shrink-0" />
                  {activePopover === 'rest-date' && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute left-0 right-0 top-full mt-2 p-3.5 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 space-y-2.5"
                    >
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950/60 border border-white/15 text-white text-xs font-bold"
                      />
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <div>
                          <span className="block">Adults</span>
                          <span className="block text-[10px] font-semibold text-slate-300/80">17+ years</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setAdults((a) => Math.max(1, a - 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">-</button>
                          <span className="w-5 text-center">{adults}</span>
                          <button type="button" onClick={() => setAdults((a) => Math.min(20, a + 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">+</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <div>
                          <span className="block">Children</span>
                          <span className="block text-[10px] font-semibold text-slate-300/80">1 - 17 years</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setChildrenCount((c) => Math.max(0, c - 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">-</button>
                          <span className="w-5 text-center">{childrenCount}</span>
                          <button type="button" onClick={() => setChildrenCount((c) => Math.min(15, c + 1))} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">+</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Square #69EBDA Search Action Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleHeroSearchSubmit}
              className="w-full lg:w-14 h-14 shrink-0 rounded-2xl bg-[#69EBDA] hover:bg-[#52decb] text-slate-950 flex items-center justify-center shadow-lg shadow-[#69EBDA]/35 transition-colors cursor-pointer"
              aria-label="Search"
              title="Search"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </motion.button>
          </div>

          {/* Bottom Row inside CARD 2: Consolidated Realtime Trust Highlights */}
          {(() => {
            const reviewCount = allReviews.length;
            const avgRating = reviewCount > 0
              ? (allReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviewCount).toFixed(2)
              : '0.00';
            const totalServices = allHotels.length + allTransports.length + allRestaurants.length + allPackages.length;
            const bookingCount = allBookings.length;

            return (
              <div className="mt-5 pt-4 border-t border-white/15 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left transition-colors">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="p-2 rounded-xl bg-teal-600/20 border border-teal-600/30 text-teal-800 dark:text-[#69EBDA]">
                    <Star className="w-4 h-4 fill-teal-700 dark:fill-[#69EBDA]" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-white">
                      {reviewCount > 0 ? `${avgRating} / 5.0` : '0.0 / 5.0'}
                    </div>
                    <div className="text-[11px] text-slate-200 dark:text-slate-400 font-semibold">
                      {reviewCount > 0 ? `${reviewCount} টি ভেরিফাইড রিভিউ` : 'এখনো কোনো রিভিউ নেই'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="p-2 rounded-xl bg-cyan-600/20 border border-cyan-600/30 text-cyan-800 dark:text-cyan-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-white">
                      {bookingCount} টি বুকিং
                    </div>
                    <div className="text-[11px] text-slate-200 dark:text-slate-400 font-semibold">
                      {totalServices} টি ভেরিফাইড সার্ভিস
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-600/30 text-violet-800 dark:text-violet-300">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-white">
                      {destinations.length} টি গন্তব্য
                    </div>
                    <div className="text-[11px] text-slate-200 dark:text-slate-400 font-semibold">
                      {allPackages.length} টি ট্যুর ও {allTransports.length} টি রুট
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-600/30 text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-white">
                      {allHotels.length + allRestaurants.length} টি প্রপার্টি
                    </div>
                    <div className="text-[11px] text-slate-200 dark:text-slate-400 font-semibold">
                      {allHotels.length} হোটেল • {allRestaurants.length} রেস্টুরেন্ট
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

      </div>
    </section>
  );
};
