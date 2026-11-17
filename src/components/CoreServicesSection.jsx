import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel,
  Car,
  UtensilsCrossed,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { StorageService } from '../services/storageService';

export const CoreServicesSection = ({ onSelectService }) => {
  const [serviceItems, setServiceItems] = useState(() => ({
    hotels: StorageService.getHotels() || [],
    transport: StorageService.getTransports() || [],
    restaurant: StorageService.getRestaurants() || []
  }));
  const [rotationTick, setRotationTick] = useState(0);
  const [servicesControl, setServicesControl] = useState(() => StorageService.getServicesControl());
  const [secText, setSecText] = useState(() => StorageService.getSectionSettings().coreServices);
  const [disabledServiceModal, setDisabledServiceModal] = useState(null);

  useEffect(() => {
    const syncItems = () => {
      setServiceItems({
        hotels: StorageService.getHotels() || [],
        transport: StorageService.getTransports() || [],
        restaurant: StorageService.getRestaurants() || []
      });
    };
    const syncServicesControl = () => {
      setServicesControl(StorageService.getServicesControl());
    };
    const syncSection = () => {
      setSecText(StorageService.getSectionSettings().coreServices);
    };

    window.addEventListener('app:hotels-updated', syncItems);
    window.addEventListener('app:transports-updated', syncItems);
    window.addEventListener('app:restaurants-updated', syncItems);
    window.addEventListener('app:services-control-updated', syncServicesControl);
    window.addEventListener('app:section-settings-updated', syncSection);

    return () => {
      window.removeEventListener('app:hotels-updated', syncItems);
      window.removeEventListener('app:transports-updated', syncItems);
      window.removeEventListener('app:restaurants-updated', syncItems);
      window.removeEventListener('app:services-control-updated', syncServicesControl);
      window.removeEventListener('app:section-settings-updated', syncSection);
    };
  }, []);

  // Rotate each service card's package default photo every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRotationTick((prev) => prev + 1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const extractServiceDefaultPhotos = (items = []) => {
    const seen = new Set();
    const list = [];
    items.forEach((item) => {
      const url = String(item?.defaultPhoto || item?.photo || item?.image || '').trim();
      if (url && !seen.has(url)) {
        seen.add(url);
        list.push(url);
      }
    });
    return list;
  };

  const hotelPhotos = extractServiceDefaultPhotos(serviceItems.hotels);
  const transportPhotos = extractServiceDefaultPhotos(serviceItems.transport);
  const restaurantPhotos = extractServiceDefaultPhotos(serviceItems.restaurant);

  const serviceCards = [
    {
      id: 'hotels',
      title: 'Hotels & Resorts',
      subtitleBn: 'Luxury Stays & Resorts',
      summary: 'Luxury stays, curated rooms, floor & bath specs with real-time calendar availability.',
      countBadge: servicesControl?.hotels === false ? 'Currently Off' : `${serviceItems.hotels.length}+ Verified Stays`,
      photos: hotelPhotos,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      icon: Hotel
    },
    {
      id: 'transport',
      title: 'Transport & Vehicles',
      subtitleBn: 'Private Cars & Tourist Fleet',
      summary: 'Private cars, executive microbuses, 4x4 tourist jeeps, and full scenic route coverage.',
      countBadge: servicesControl?.transport === false ? 'Currently Off' : `${serviceItems.transport.length}+ Vehicles`,
      photos: transportPhotos,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      icon: Car
    },
    {
      id: 'restaurant',
      title: 'Restaurant & Dining',
      subtitleBn: 'Dining & 3-Time Meal Plans',
      summary: '3-time daily meal plans, signature buffets, traditional heritage thali, and live BBQ.',
      countBadge: servicesControl?.restaurant === false ? 'Currently Off' : `${serviceItems.restaurant.length}+ Dining Plans`,
      photos: restaurantPhotos,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      icon: UtensilsCrossed
    }
  ];

  return (
    <section id="services" className="scroll-mt-24 relative py-[5px] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Ambient Background Glow */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#69EBDA]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 relative z-10">
        <div>
          {secText?.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 backdrop-blur-md mb-4 text-xs font-bold tracking-wider text-teal-900 dark:text-[#69EBDA] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {secText.badge}
            </div>
          )}
          {secText?.title && (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
              {secText.title}
            </h2>
          )}
          {secText?.subtitle && (
            <p className="mt-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base max-w-xl font-medium">
              {secText.subtitle}
            </p>
          )}
        </div>

        {secText?.trustBadge && (
          <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-bold px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-[#5C6977]/60 border border-white/40 dark:border-white/15 backdrop-blur-xl shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#69EBDA]" />
            <span>{secText.trustBadge}</span>
          </div>
        )}
      </div>

      {/* 3-Service Premium Liquid Glass Cards Grid */}
      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scroll-smooth pb-3 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:w-[85%] [&>*]:sm:w-[340px] [&>*]:md:w-auto [&>*]:snap-start relative z-10">
        {serviceCards.map((card, idx) => {
          const IconComponent = card.icon;
          const activePhotos = card.photos.length > 0 ? card.photos : [card.image];
          const activePhotoIndex = rotationTick % activePhotos.length;
          const currentPhoto = activePhotos[activePhotoIndex] || card.image;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26, delay: idx * 0.05 }}
              onClick={() => {
                if (servicesControl?.[card.id] === false) {
                  setDisabledServiceModal({ title: card.title });
                  return;
                }
                onSelectService && onSelectService(card.id);
              }}
              className="group relative rounded-[2rem] overflow-hidden cursor-pointer bg-[#5C6977]/90 dark:bg-slate-900/65 backdrop-blur-2xl border border-white/25 dark:border-white/15 hover:border-[#69EBDA]/70 shadow-[0_14px_38px_rgba(15,23,42,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_24px_55px_rgba(105,235,218,0.28)] transition-colors duration-300 flex flex-col justify-between min-h-[390px]"
            >
              {/* Cover Image with 6-Second Package Default Photo Rotation */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${card.id}-${activePhotoIndex}-${currentPhoto}`}
                    src={currentPhoto}
                    alt={card.title}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b]/95 via-slate-900/45 to-black/25" />

                {/* Slide indicator dots when multiple package photos exist */}
                {activePhotos.length > 1 && (
                  <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-slate-950/55 backdrop-blur-md border border-white/15">
                    {activePhotos.map((_, pIdx) => (
                      <span
                        key={`${card.id}-dot-${pIdx}`}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          pIdx === activePhotoIndex ? 'w-3.5 bg-[#69EBDA]' : 'w-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Top Floating Row: Glowing Icon Badge + Live Count Pill */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-slate-950/65 backdrop-blur-xl border border-[#69EBDA]/50 flex items-center justify-center shadow-[0_0_20px_rgba(105,235,218,0.35)]">
                    <IconComponent className="w-5 h-5 text-[#69EBDA]" />
                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-slate-950/65 backdrop-blur-xl border border-white/20 text-[11px] font-extrabold text-[#69EBDA] tracking-wide shadow-sm">
                    {card.countBadge}
                  </span>
                </div>

                {/* Bengali Subtitle Tag at Bottom of Image */}
                <div className="absolute bottom-3 left-5 right-5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#69EBDA]">
                    {card.subtitleBn}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit',sans-serif] group-hover:text-[#69EBDA] transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-200/90 leading-relaxed line-clamp-2 font-medium">
                    {card.summary}
                  </p>
                </div>

                {/* Interactive Explore Service Glass Pill Button */}
                <div className="pt-2 flex items-center justify-between border-t border-white/15">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 group-hover:bg-[#69EBDA] text-white group-hover:text-slate-950 border border-white/25 group-hover:border-[#69EBDA] text-xs font-extrabold tracking-wide transition-all duration-300 shadow-sm">
                    <span>Explore Service</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Disabled Service Notice Modal (English) */}
      <AnimatePresence>
        {disabledServiceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDisabledServiceModal(null)}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-6 sm:p-7 text-center"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
