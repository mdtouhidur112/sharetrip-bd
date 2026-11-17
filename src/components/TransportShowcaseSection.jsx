// src/components/TransportShowcaseSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Ship, 
  Plane, 
  Hotel,
  UtensilsCrossed,
  ArrowUpRight, 
  Compass, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StorageService } from '../services/storageService';

export const TransportShowcaseSection = ({ onSelectCategory, onSelectService }) => {
  const [categories, setCategories] = useState(() => StorageService.getTransportCategories());
  const [transports, setTransports] = useState(() => StorageService.getTransports());
  const [hotels, setHotels] = useState(() => StorageService.getHotels());
  const [restaurants, setRestaurants] = useState(() => StorageService.getRestaurants());
  const [servicesControl, setServicesControl] = useState(() => StorageService.getServicesControl());
  const [secText, setSecText] = useState(() => StorageService.getSectionSettings().transportShowcase);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleSync = () => {
      setCategories(StorageService.getTransportCategories());
      setTransports(StorageService.getTransports());
      setHotels(StorageService.getHotels());
      setRestaurants(StorageService.getRestaurants());
      setServicesControl(StorageService.getServicesControl());
      setSecText(StorageService.getSectionSettings().transportShowcase);
    };
    window.addEventListener('app:transports-updated', handleSync);
    window.addEventListener('app:transport-categories-updated', handleSync);
    window.addEventListener('app:hotels-updated', handleSync);
    window.addEventListener('app:restaurants-updated', handleSync);
    window.addEventListener('app:services-control-updated', handleSync);
    window.addEventListener('app:section-settings-updated', handleSync);
    return () => {
      window.removeEventListener('app:transports-updated', handleSync);
      window.removeEventListener('app:transport-categories-updated', handleSync);
      window.removeEventListener('app:hotels-updated', handleSync);
      window.removeEventListener('app:restaurants-updated', handleSync);
      window.removeEventListener('app:services-control-updated', handleSync);
      window.removeEventListener('app:section-settings-updated', handleSync);
    };
  }, []);

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Ship':
        return <Ship className="w-6 h-6 text-[#69EBDA]" />;
      case 'Plane':
        return <Plane className="w-6 h-6 text-[#69EBDA]" />;
      case 'Hotel':
        return <Hotel className="w-6 h-6 text-[#69EBDA]" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-6 h-6 text-[#69EBDA]" />;
      case 'Car':
      default:
        return <Car className="w-6 h-6 text-[#69EBDA]" />;
    }
  };

  const allCards = [
    ...categories.map((cat) => {
      const isCatDisabled = servicesControl?.transport === false || servicesControl?.[cat.id] === false;
      const availableCount = isCatDisabled ? 0 : transports.filter((t) => t.category === cat.id).length;
      return {
        ...cat,
        countLabel: isCatDisabled ? 'Currently Off' : `${availableCount} Vehicles Available`,
        ctaLabel: 'View Vehicles',
        onClick: () => onSelectCategory?.(cat.id)
      };
    }),
    {
      id: 'hotel-services',
      name: 'Hotel Services',
      subtitle: 'Luxury Hotels & Resorts',
      badge: 'Hotel Services',
      icon: 'Hotel',
      photo:
        servicesControl?.hotels === false
          ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80'
          : hotels[0]?.image ||
            hotels[0]?.photo ||
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
      description:
        'Premium resorts, overwater villas & 5-star hotel room booking with real-time pricing and reviews.',
      countLabel: servicesControl?.hotels === false ? 'Currently Off' : `${hotels.length} Hotels Available`,
      ctaLabel: 'View Hotels',
      onClick: () => onSelectService?.('hotels')
    },
    {
      id: 'restaurant-services',
      name: 'Restaurant Services',
      subtitle: 'Fine Dining & Buffet',
      badge: 'Restaurant Services',
      icon: 'UtensilsCrossed',
      photo:
        servicesControl?.restaurant === false
          ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'
          : restaurants[0]?.photo ||
            restaurants[0]?.defaultPhoto ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
      description:
        'Live seafood BBQ, 3-time full-board meal plans & exclusive dining table reservations.',
      countLabel: servicesControl?.restaurant === false ? 'Currently Off' : `${restaurants.length} Menus Available`,
      ctaLabel: 'View Dining',
      onClick: () => onSelectService?.('restaurant')
    }
  ];

  const scrollToCard = (index) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(allCards.length - 1, index));
    const cardEl = container.children[clamped];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setActiveIndex(clamped);
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || !container.children.length) return;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.children[0].offsetWidth + 24;
    if (cardWidth > 0) {
      const idx = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.max(0, Math.min(allCards.length - 1, idx)));
    }
  };

  return (
    <section id="transport" className="relative py-[5px] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Accent Sheen */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 relative z-10">
        <div>
          {secText?.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 backdrop-blur-md mb-3 text-xs font-bold tracking-wider text-teal-800 dark:text-[#69EBDA] uppercase">
              <Compass className="w-3.5 h-3.5" />
              {secText.badge}
            </div>
          )}
          {secText?.title && (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
              {secText.title}
            </h2>
          )}
          {secText?.subtitle && (
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl font-medium">
              {secText.subtitle}
            </p>
          )}
        </div>

        {/* Controls: Shield Badge + Left/Right Switch Arrows */}
        <div className="flex items-center gap-3 self-start md:self-end">
          {secText?.trustBadge && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold px-3.5 py-2 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#69EBDA]" />
              <span>{secText.trustBadge}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollToCard(activeIndex - 1)}
              aria-label="Previous card"
              className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-800 dark:text-white hover:border-[#69EBDA] hover:text-[#69EBDA] transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToCard(activeIndex + 1)}
              aria-label="Next card"
              className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-800 dark:text-white hover:border-[#69EBDA] hover:text-[#69EBDA] transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Switch Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 relative z-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {allCards.map((card, idx) => (
          <button
            key={`pill-${card.id}`}
            type="button"
            onClick={() => scrollToCard(idx)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border ${
              activeIndex === idx
                ? 'bg-[#69EBDA] text-slate-950 border-[#69EBDA] shadow-md shadow-[#69EBDA]/25'
                : 'bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/15 hover:border-[#69EBDA]/60'
            }`}
          >
            <span>{card.name}</span>
          </button>
        ))}
      </div>

      {/* Horizontal Left-to-Right Scrollable Cards Strip */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 relative z-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {allCards.map((cat, idx) => (
          <motion.div
            key={cat.id || idx}
            whileHover={{ y: -8, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            onClick={cat.onClick}
            className="
              group relative shrink-0 snap-start w-[85%] sm:w-[350px] lg:w-[385px]
              flex flex-col justify-between rounded-3xl overflow-hidden cursor-pointer
              bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl
              border border-slate-200/90 dark:border-white/10
              hover:border-[#69EBDA] dark:hover:border-[#69EBDA]
              shadow-[0_12px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]
              hover:shadow-[0_20px_50px_rgba(105,235,218,0.25)]
              transition-all duration-300 min-h-[420px]
            "
          >
            {/* Photo Area */}
            <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
              <img
                src={cat.photo || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

              {/* Top Badge: Category tag */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-950/80 text-[#69EBDA] border border-[#69EBDA]/40 backdrop-blur-md">
                  {cat.badge || cat.subtitle || 'Category'}
                </span>
              </div>

              {/* Top Right: Available count */}
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/85 text-white border border-white/20 backdrop-blur-md">
                  {cat.countLabel}
                </span>
              </div>

              {/* Bottom Floating Icon */}
              <div className="absolute bottom-3 right-3 w-12 h-12 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-white/25 flex items-center justify-center text-[#69EBDA] shadow-lg group-hover:scale-110 group-hover:border-[#69EBDA] transition-all">
                {getCategoryIcon(cat.icon)}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#69EBDA]" />
                  <span className="text-xs text-teal-600 dark:text-[#69EBDA] font-bold">
                    {cat.subtitle || 'Exclusive Service'}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif] group-hover:text-teal-600 dark:group-hover:text-[#69EBDA] transition-colors">
                  {cat.name}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {cat.description}
                </p>
              </div>

              {/* Bottom Action Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  View details on dedicated page
                </span>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 group-hover:bg-gradient-to-r group-hover:from-[#69EBDA] group-hover:to-teal-400 text-slate-800 dark:text-white group-hover:text-slate-950 font-bold text-xs transition-all duration-200">
                  <span>{cat.ctaLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
