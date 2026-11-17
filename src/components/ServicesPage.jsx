import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Hotel,
  Car,
  Ship,
  Plane,
  UtensilsCrossed,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { SingleHotelCard } from './SingleHotelCard';
import {
  normalizeTransportToCardShape,
  normalizeRestaurantToCardShape
} from '../utils/serviceCardNormalizer';

export const ServicesPage = ({
  initialTab = 'hotels',
  initialSearchQuery = '',
  onBack,
  onSelectHotel,
  onSelectTransportCategory
}) => {
  const [activeService, setActiveService] = useState(initialTab || 'hotels');
  const [filterQuery, setFilterQuery] = useState(initialSearchQuery || '');
  const [hotels, setHotels] = useState(() => StorageService.getHotels());
  const [transports, setTransports] = useState(() => StorageService.getTransports());
  const [restaurants, setRestaurants] = useState(() => StorageService.getRestaurants());
  const [servicesControl, setServicesControl] = useState(() => StorageService.getServicesControl());
  const [secText, setSecText] = useState(() => StorageService.getSectionSettings().servicesPage);

  useEffect(() => {
    if (initialTab) {
      setActiveService(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    setFilterQuery(initialSearchQuery || '');
  }, [initialSearchQuery]);

  useEffect(() => {
    const syncHotels = () => setHotels(StorageService.getHotels());
    const syncTransports = () => setTransports(StorageService.getTransports());
    const syncRestaurants = () => setRestaurants(StorageService.getRestaurants());
    const syncServicesControl = () => setServicesControl(StorageService.getServicesControl());
    const syncSection = () => setSecText(StorageService.getSectionSettings().servicesPage);

    window.addEventListener('app:hotels-updated', syncHotels);
    window.addEventListener('app:hotel-reviews-updated', syncHotels);
    window.addEventListener('app:transports-updated', syncTransports);
    window.addEventListener('app:restaurants-updated', syncRestaurants);
    window.addEventListener('app:services-control-updated', syncServicesControl);
    window.addEventListener('app:section-settings-updated', syncSection);

    return () => {
      window.removeEventListener('app:hotels-updated', syncHotels);
      window.removeEventListener('app:hotel-reviews-updated', syncHotels);
      window.removeEventListener('app:transports-updated', syncTransports);
      window.removeEventListener('app:restaurants-updated', syncRestaurants);
      window.removeEventListener('app:services-control-updated', syncServicesControl);
      window.removeEventListener('app:section-settings-updated', syncSection);
    };
  }, []);

  const tokens = filterQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matchesTokens = (text) => {
    if (tokens.length === 0) return true;
    const hay = String(text || '').toLowerCase();
    return tokens.some((tok) => hay.includes(tok));
  };

  const filteredHotels = servicesControl?.hotels === false
    ? []
    : hotels.filter((h) =>
        matchesTokens(`${h.name || ''} ${h.location || ''} ${h.destinationId || ''} ${h.shortDescription || ''}`)
      );

  const filteredTransports = servicesControl?.transport === false
    ? []
    : transports.filter((t) => {
        if (servicesControl?.[t.category] === false) return false;
        const routesStr = Array.isArray(t.routeFares)
          ? t.routeFares.map((r) => `${r.from || ''} ${r.to || ''}`).join(' ')
          : '';
        return matchesTokens(`${t.name || ''} ${t.categoryName || ''} ${t.route || ''} ${t.description || ''} ${routesStr}`);
      });

  const filteredRestaurants = servicesControl?.restaurant === false
    ? []
    : restaurants.filter((r) =>
        matchesTokens(`${r.name || ''} ${r.mealPlanType || ''} ${r.badge || ''} ${r.details || ''}`)
      );

  const switcherTabs = [
    {
      id: 'hotels',
      label: 'Hotels & Resorts',
      sublabel: servicesControl?.hotels === false ? 'Currently Off' : `${hotels.length}+ Verified Stays`,
      icon: Hotel
    },
    {
      id: 'transport',
      label: 'Transport & Vehicles',
      sublabel: servicesControl?.transport === false ? 'Currently Off' : `${transports.length}+ Vehicles`,
      icon: Car
    },
    {
      id: 'restaurant',
      label: 'Restaurant & Dining',
      sublabel: servicesControl?.restaurant === false ? 'Currently Off' : `${restaurants.length}+ Dining Plans`,
      icon: UtensilsCrossed
    }
  ];

  const transportCategoryCards = [
    {
      id: 'road',
      title: 'Road Services',
      subtitleBn: 'Roadway Services',
      description: 'Chander Gari, private cars, CNG, microbuses & 4x4 SUVs.',
      count: servicesControl?.transport === false || servicesControl?.road === false ? 'Off' : transports.filter((t) => t.category === 'road').length,
      icon: Car,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'waterway',
      title: 'River Services',
      subtitleBn: 'Waterway Services',
      description: 'Luxury river cruises, speedboats, tourist boats & private yachts.',
      count: servicesControl?.transport === false || servicesControl?.waterway === false ? 'Off' : transports.filter((t) => t.category === 'waterway').length,
      icon: Ship,
      image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 'air',
      title: 'Air Services',
      subtitleBn: 'Airway Services',
      description: 'Flight schedules for every airport, point-to-point routes & charters.',
      count: servicesControl?.transport === false || servicesControl?.air === false ? 'Off' : transports.filter((t) => t.category === 'air').length,
      icon: Plane,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80'
    }
  ];

  return (
    <section className="relative min-h-screen pt-28 pb-20 px-3 sm:px-6 lg:px-10 max-w-[2400px] mx-auto">
      {/* Ambient Background Accents */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#69EBDA]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top Back Bar & Header */}
      <div className="max-w-7xl mx-auto relative z-10 mb-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-[#5C6977]/70 border border-white/50 dark:border-white/20 backdrop-blur-xl text-xs font-extrabold text-slate-900 dark:text-white hover:border-[#69EBDA] transition-all cursor-pointer mb-6 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#69EBDA]" />
          <span>Back</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {secText?.badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 backdrop-blur-md mb-3 text-xs font-bold tracking-wider text-teal-900 dark:text-[#69EBDA] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                {secText.badge}
              </div>
            )}
            {secText?.title && (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
                {secText.title}
              </h1>
            )}
            {secText?.subtitle && (
              <p className="mt-2 text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium max-w-2xl">
                {secText.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top Interactive 3-Service Switcher Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 relative z-10">
        {switcherTabs.map((tab) => {
          const isActive = activeService === tab.id;
          const IconComponent = tab.icon;
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => {
                if (servicesControl?.[tab.id] === false) {
                  StorageService.notifyDisabledService(tab.id);
                  return;
                }
                setActiveService(tab.id);
              }}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`relative p-5 rounded-3xl text-left backdrop-blur-2xl transition-all cursor-pointer overflow-hidden border ${
                isActive
                  ? 'bg-[#5C6977]/95 dark:bg-slate-900/85 border-[#69EBDA] shadow-[0_16px_40px_rgba(105,235,218,0.28)] scale-[1.01]'
                  : 'bg-[#5C6977]/75 dark:bg-slate-900/50 border-white/25 dark:border-white/15 hover:border-[#69EBDA]/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeServiceGlow"
                  className="absolute inset-0 bg-gradient-to-br from-[#69EBDA]/15 via-transparent to-cyan-400/10 pointer-events-none"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                      isActive
                        ? 'bg-[#69EBDA] text-slate-950 border-[#69EBDA] shadow-[0_0_20px_rgba(105,235,218,0.45)]'
                        : 'bg-slate-950/50 text-[#69EBDA] border-white/20'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white font-['Outfit',sans-serif]">
                      {tab.label}
                    </h3>
                    <p className="text-xs font-bold text-[#69EBDA] mt-0.5">{tab.sublabel}</p>
                  </div>
                </div>

                {isActive && (
                  <span className="px-2.5 py-1 rounded-full bg-[#69EBDA] text-slate-950 text-[10px] font-black uppercase tracking-wider shrink-0">
                    Active
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Dynamic Service-Specific Content & Data Grid */}
      <AnimatePresence mode="wait">
        {activeService === 'hotels' && (
          <motion.div
            key="hotels-tab"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl min-[1650px]:max-w-[2200px] mx-auto grid grid-cols-1 lg:grid-cols-2 min-[1650px]:grid-cols-3 min-[2200px]:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 relative z-10"
          >
            {filteredHotels.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-3xl bg-[#5C6977]/80 dark:bg-slate-900/60 border border-white/20 text-white font-bold space-y-3">
                <p>No hotels found at this moment.</p>
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterQuery('')}
                    className="px-4 py-1.5 rounded-full bg-[#69EBDA] text-slate-950 text-xs font-extrabold cursor-pointer"
                  >
                    View All Hotels
                  </button>
                )}
              </div>
            ) : (
              filteredHotels.map((hotel) => (
                <SingleHotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onSelectHotel={onSelectHotel}
                />
              ))
            )}
          </motion.div>
        )}

        {activeService === 'transport' && (
          <motion.div
            key="transport-tab"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="space-y-10 relative z-10"
          >
            {/* 3 Transport Category Cards: Road, River, Air */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
              {transportCategoryCards.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <motion.div
                    key={cat.id}
                    whileHover={{ y: -5, scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                    onClick={() => onSelectTransportCategory && onSelectTransportCategory(cat.id)}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer bg-[#5C6977]/90 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/25 hover:border-[#69EBDA] shadow-xl hover:shadow-[0_20px_45px_rgba(105,235,218,0.28)] transition-all min-h-[230px] flex flex-col justify-between"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${cat.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/70 to-slate-900/35" />

                    <div className="relative z-10 p-5 flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-[#69EBDA]/50 flex items-center justify-center shadow-[0_0_18px_rgba(105,235,218,0.35)]">
                        <CatIcon className="w-5 h-5 text-[#69EBDA]" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-950/75 border border-white/20 text-[11px] font-extrabold text-[#69EBDA]">
                        {cat.count} Services
                      </span>
                    </div>

                    <div className="relative z-10 p-5 pt-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#69EBDA] block">
                        {cat.subtitleBn}
                      </span>
                      <h3 className="text-xl font-black text-white font-['Outfit',sans-serif] mt-0.5 group-hover:text-[#69EBDA] transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-200/90 mt-1.5 line-clamp-2">
                        {cat.description}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 group-hover:bg-[#69EBDA] text-white group-hover:text-slate-950 border border-white/25 group-hover:border-[#69EBDA] text-xs font-extrabold transition-all">
                        <span>View All Vehicles</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* All Transport Services Grid Below */}
            <div className="max-w-7xl min-[1650px]:max-w-[2200px] mx-auto space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
                  All Transport Services ({filteredTransports.length})
                </h2>
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterQuery('')}
                    className="px-3.5 py-1.5 rounded-full bg-[#69EBDA] text-slate-950 text-xs font-extrabold cursor-pointer"
                  >
                    Clear filter ({filterQuery})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 min-[1650px]:grid-cols-3 min-[2200px]:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
                {filteredTransports.length === 0 ? (
                  <div className="col-span-full p-12 text-center rounded-3xl bg-[#5C6977]/80 dark:bg-slate-900/60 border border-white/20 text-white font-bold">
                    No vehicles found at this moment.
                  </div>
                ) : (
                  filteredTransports.map((item) => {
                    const normalized = normalizeTransportToCardShape(item);
                    return (
                      <SingleHotelCard
                        key={item.id}
                        hotel={normalized}
                        onSelectHotel={onSelectHotel}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeService === 'restaurant' && (
          <motion.div
            key="restaurant-tab"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl min-[1650px]:max-w-[2200px] mx-auto grid grid-cols-1 lg:grid-cols-2 min-[1650px]:grid-cols-3 min-[2200px]:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 relative z-10"
          >
            {filteredRestaurants.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-3xl bg-[#5C6977]/80 dark:bg-slate-900/60 border border-white/20 text-white font-bold space-y-3">
                <p>No restaurants or dining plans found at this moment.</p>
                {filterQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterQuery('')}
                    className="px-4 py-1.5 rounded-full bg-[#69EBDA] text-slate-950 text-xs font-extrabold cursor-pointer"
                  >
                    View All Restaurants
                  </button>
                )}
              </div>
            ) : (
              filteredRestaurants.map((rest) => {
                const normalized = normalizeRestaurantToCardShape(rest);
                return (
                  <SingleHotelCard
                    key={rest.id}
                    hotel={normalized}
                    onSelectHotel={onSelectHotel}
                  />
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
