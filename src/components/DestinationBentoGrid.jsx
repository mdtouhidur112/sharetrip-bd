import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Compass, Sun, Mountain, Trees, Sparkles, Hotel, ChevronLeft, ChevronRight } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { DestinationInfoModal } from './DestinationInfoModal';

export const DestinationBentoGrid = ({ onSelectCategory, selectedCategory, onOpenAllDestinations }) => {
  const [destinations, setDestinations] = useState(() => StorageService.getDestinations());
  const [allPackages, setAllPackages] = useState(() => StorageService.getPackages());
  const [secText, setSecText] = useState(() => StorageService.getSectionSettings().destinations);
  const [rotationTick, setRotationTick] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewDestination, setPreviewDestination] = useState(null);
  const scrollContainerRef = useRef(null);

  // Sync destinations and packages in real time
  useEffect(() => {
    const syncDestinations = () => setDestinations(StorageService.getDestinations());
    const syncPackages = () => setAllPackages(StorageService.getPackages());
    const syncSection = () => setSecText(StorageService.getSectionSettings().destinations);

    window.addEventListener('app:destinations-updated', syncDestinations);
    window.addEventListener('app:packages-updated', syncPackages);
    window.addEventListener('app:section-settings-updated', syncSection);
    return () => {
      window.removeEventListener('app:destinations-updated', syncDestinations);
      window.removeEventListener('app:packages-updated', syncPackages);
      window.removeEventListener('app:section-settings-updated', syncSection);
    };
  }, []);

  // Rotate destination card package photos every 6 seconds (6000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationTick((prev) => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (id) => {
    switch (id) {
      case 'adventure':
        return <Mountain className="w-5 h-5 text-amber-300" />;
      case 'beach':
        return <Sun className="w-5 h-5 text-cyan-300" />;
      case 'nature':
        return <Trees className="w-5 h-5 text-emerald-300" />;
      default:
        return <Compass className="w-5 h-5 text-teal-300" />;
    }
  };

  const scrollToCard = (index) => {
    const container = scrollContainerRef.current;
    if (!container || !destinations.length) return;
    const clamped = Math.max(0, Math.min(destinations.length - 1, index));
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
      setActiveIndex(Math.max(0, Math.min(destinations.length - 1, idx)));
    }
  };

  if (!Array.isArray(destinations) || destinations.length === 0) {
    return null;
  }

  return (
    <section id="destinations" className="relative py-[5px] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          {secText?.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/25 border border-[#69EBDA]/45 backdrop-blur-md mb-4 text-xs font-bold tracking-wider text-teal-950 dark:text-[#69EBDA] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {secText.badge}
            </div>
          )}
          {secText?.title && (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif] transition-colors">
              {secText.title}
            </h2>
          )}
          {secText?.subtitle && (
            <p className="mt-3 text-black/70 dark:text-slate-300 text-base max-w-xl font-medium transition-colors">
              {secText.subtitle}
            </p>
          )}
        </div>

        {/* Filter All Pill + Left/Right Scroll Arrows */}
        <div className="flex items-center gap-2.5">
          {secText?.buttonText && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (onOpenAllDestinations ? onOpenAllDestinations() : onSelectCategory('all'))}
              className={`
                px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer
                ${selectedCategory === 'all'
                  ? 'bg-[#69EBDA] text-slate-950 border border-teal-400 shadow-[0_0_15px_rgba(105,235,218,0.5)] font-extrabold'
                  : 'bg-[#5C6977]/85 hover:bg-[#5C6977] text-white border border-[#69EBDA]/35 shadow-sm'
                }
              `}
            >
              {secText.buttonText}
            </motion.button>
          )}

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollToCard(activeIndex - 1)}
              aria-label="Previous destination"
              className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-800 dark:text-white hover:border-[#69EBDA] hover:text-[#69EBDA] transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToCard(activeIndex + 1)}
              aria-label="Next destination"
              className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-800 dark:text-white hover:border-[#69EBDA] hover:text-[#69EBDA] transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Switch Destination Pills */}
      {destinations.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {destinations.map((dest, idx) => (
            <button
              key={`dest-pill-${dest.id}`}
              type="button"
              onClick={() => scrollToCard(idx)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border ${
                activeIndex === idx
                  ? 'bg-[#69EBDA] text-slate-950 border-[#69EBDA] shadow-md shadow-[#69EBDA]/25'
                  : 'bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/15 hover:border-[#69EBDA]/60'
              }`}
            >
              <span>{dest.destinationName || dest.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Horizontal Left-to-Right Scrollable Destination Cards */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {destinations.map((cat) => {
          const isSelected = selectedCategory?.toLowerCase() === (cat.id || '').toLowerCase();
          const matchingPackages = StorageService.getPackagesForDestination(cat, allPackages);
          const packageCount = matchingPackages.length;

          // Build rotating slides from the default first photos & resort names of packages under this destination
          const packageSlides = matchingPackages
            .map((pkg) => ({
              pkgId: pkg.id,
              photoUrl: StorageService.getPackageDefaultPhoto(pkg),
              resortName: StorageService.getPackageResortName(pkg),
              pkgTitle: pkg.shortTitle || pkg.title || ''
            }))
            .filter((s) => Boolean(s.photoUrl));

          const activeSlides =
            packageSlides.length > 0
              ? packageSlides
              : [
                  {
                    pkgId: cat.id,
                    photoUrl:
                      cat.image ||
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                    resortName: '',
                    pkgTitle: cat.title
                  }
                ];

          const activeSlideIndex = rotationTick % activeSlides.length;
          const activeSlide = activeSlides[activeSlideIndex] || activeSlides[0];

          return (
            <motion.div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
              className={`
                group relative shrink-0 snap-start w-[82%] sm:w-[320px] lg:w-[350px] h-[280px] sm:h-[320px] lg:h-[340px] rounded-3xl overflow-hidden cursor-pointer
                border transition-all duration-500
                ${isSelected 
                  ? 'border-[#69EBDA] shadow-[0_0_35px_rgba(105,235,218,0.4)] ring-2 ring-[#69EBDA]/50' 
                  : 'border-slate-400/40 dark:border-white/20 hover:border-[#69EBDA]/60 shadow-[0_16px_36px_0_rgba(0,0,0,0.35)]'
                }
              `}
            >
              {/* 6-Second Premium Rotating Package Photo Background */}
              <div className="absolute inset-0 overflow-hidden bg-slate-950">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={`${cat.id}-${activeSlide.pkgId}-${activeSlideIndex}`}
                    initial={{ opacity: 0, scale: 1.12, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1.0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                    style={{ backgroundImage: `url('${activeSlide.photoUrl}')` }}
                  />
                </AnimatePresence>
              </div>

              {/* Strong Gradient Scrims for 100% readable text in both themes */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.accent || 'from-teal-500/20 to-cyan-500/10'} opacity-40 group-hover:opacity-65 transition-opacity duration-500`} />

              {/* Top Glass Overlay Badges: Left = Destination Name, Right = Exact Package Count */}
              <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2 z-10">
                {/* Floating Glass Pill Badge (Destination Name) */}
                <div className="px-3.5 py-1.5 rounded-full bg-slate-950/55 backdrop-blur-xl border border-white/25 shadow-lg flex items-center gap-2 min-w-0">
                  {getIcon(cat.id)}
                  <span className="text-xs font-bold text-white tracking-wide truncate">
                    {cat.destinationName || cat.badge || cat.title}
                  </span>
                </div>

                {/* Top-Right Exact Package Count Badge */}
                <div className="px-3.5 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-xl border border-[#69EBDA]/50 text-xs font-extrabold text-[#69EBDA] shadow-lg shrink-0 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#69EBDA] animate-pulse" />
                  <span>{packageCount} Packages</span>
                </div>
              </div>

              {/* Slide Progress Dots when multiple packages exist under this destination */}
              {activeSlides.length > 1 && (
                <div className="absolute top-16 right-5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/45 backdrop-blur-md border border-white/15">
                  {activeSlides.map((s, idx) => (
                    <span
                      key={`${s.pkgId}-${idx}`}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        idx === activeSlideIndex ? 'w-4 bg-[#69EBDA]' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Bottom Liquid Glass Card Info */}
              <div className="absolute bottom-5 left-5 right-5 z-10">
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/75 backdrop-blur-2xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)] group-hover:border-[#69EBDA]/50 transition-all duration-300">
                  
                  {/* Resort Name Badge from the currently displayed package (if present) */}
                  <AnimatePresence mode="wait">
                    {activeSlide.resortName && (
                      <motion.div
                        key={`resort-${activeSlide.pkgId}-${activeSlideIndex}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.45 }}
                        className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/35 text-[11px] font-bold text-[#69EBDA] max-w-full"
                      >
                        <Hotel className="w-3.5 h-3.5 text-[#69EBDA] shrink-0" />
                        <span className="truncate">Resort: {activeSlide.resortName}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif] truncate">
                      {cat.title}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewDestination({ dest: cat, packageCount });
                      }}
                      onMouseEnter={() => setPreviewDestination({ dest: cat, packageCount })}
                      title="View Destination Info"
                      className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#69EBDA] hover:text-slate-950 text-white flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-[#69EBDA] shadow-md shrink-0 cursor-pointer"
                    >
                      <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>

                  {(cat.subtitle || cat.tagline) && (
                    <p className="text-[#69EBDA] text-xs sm:text-sm font-semibold mb-2 line-clamp-1">
                      {cat.subtitle || cat.tagline}
                    </p>
                  )}

                  {(cat.shortDescription || cat.description) && (
                    <p className="text-slate-300/85 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {cat.shortDescription || cat.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span className="group-hover:text-[#69EBDA] transition-colors font-medium truncate">
                      {cat.destinationName || cat.title} ({packageCount} Packages)
                    </span>
                    <span className="text-[#69EBDA] font-bold group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                      View Packages &rarr;
                    </span>
                  </div>

                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      <DestinationInfoModal
        destination={previewDestination?.dest}
        packageCount={previewDestination?.packageCount || 0}
        onClose={() => setPreviewDestination(null)}
        onExplore={onSelectCategory}
      />
    </section>
  );
};
