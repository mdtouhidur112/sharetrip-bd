import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Compass, Sun, Mountain, Trees, Sparkles, Search, Hotel } from 'lucide-react';
import { StorageService } from '../services/storageService';

export const AllDestinationsPage = ({ onBack, onSelectDestination, selectedCategory }) => {
  const [destinations, setDestinations] = useState(() => StorageService.getDestinations());
  const [allPackages, setAllPackages] = useState(() => StorageService.getPackages());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const syncDestinations = () => setDestinations(StorageService.getDestinations());
    const syncPackages = () => setAllPackages(StorageService.getPackages());

    window.addEventListener('app:destinations-updated', syncDestinations);
    window.addEventListener('app:packages-updated', syncPackages);
    return () => {
      window.removeEventListener('app:destinations-updated', syncDestinations);
      window.removeEventListener('app:packages-updated', syncPackages);
    };
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

  const filteredDestinations = destinations.filter((cat) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (cat.destinationName || '').toLowerCase().includes(q) ||
      (cat.title || '').toLowerCase().includes(q) ||
      (cat.subtitle || '').toLowerCase().includes(q) ||
      (cat.shortDescription || cat.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <section className="relative min-h-screen pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Back Button & Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#5C6977]/85 hover:bg-[#5C6977] text-white border border-white/25 hover:border-[#69EBDA] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-[#69EBDA]" />
            <span>ফিরে যান</span>
          </button>

          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 backdrop-blur-md mb-2 text-xs font-bold tracking-wider text-teal-950 dark:text-[#69EBDA] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              All Travel Destinations ({destinations.length})
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
              সকল ভ্রমণ গন্তব্য ও প্যাকেজ
            </h1>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm sm:text-base max-w-2xl font-medium">
              আমাদের সকল গন্তব্যের কার্ডগুলো এখান থেকে দেখে আপনার পছন্দের গন্তব্য বেছে নিন।
            </p>
          </div>
        </div>

        {/* Search Destinations */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="গন্তব্য খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/75 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium outline-none focus:border-[#69EBDA]"
          />
        </div>
      </div>

      {/* All Destination Cards Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-white/20 text-center text-slate-600 dark:text-slate-300 font-semibold">
          কোনো গন্তব্য পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredDestinations.map((cat) => {
            const isSelected = selectedCategory?.toLowerCase() === (cat.id || '').toLowerCase();
            const matchingPackages = StorageService.getPackagesForDestination(cat, allPackages);
            const packageCount = matchingPackages.length;
            const firstPkg = matchingPackages[0];
            const cardImage =
              (firstPkg ? StorageService.getPackageDefaultPhoto(firstPkg) : '') ||
              cat.image ||
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
            const resortName = firstPkg ? StorageService.getPackageResortName(firstPkg) : '';

            return (
              <motion.div
                key={cat.id}
                onClick={() => onSelectDestination(cat.id)}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                className={`
                  group relative h-[480px] sm:h-[520px] rounded-3xl overflow-hidden cursor-pointer
                  border transition-all duration-500
                  ${isSelected
                    ? 'border-[#69EBDA] shadow-[0_0_35px_rgba(105,235,218,0.4)] ring-2 ring-[#69EBDA]/50'
                    : 'border-slate-400/40 dark:border-white/20 hover:border-[#69EBDA]/60 shadow-[0_16px_36px_0_rgba(0,0,0,0.35)]'
                  }
                `}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 bg-slate-950"
                  style={{ backgroundImage: `url('${cardImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.accent || 'from-teal-500/20 to-cyan-500/10'} opacity-40 group-hover:opacity-65 transition-opacity duration-500`} />

                {/* Top Overlay Badges */}
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2 z-10">
                  <div className="px-3.5 py-1.5 rounded-full bg-slate-950/55 backdrop-blur-xl border border-white/25 shadow-lg flex items-center gap-2 min-w-0">
                    {getIcon(cat.id)}
                    <span className="text-xs font-bold text-white tracking-wide truncate">
                      {cat.destinationName || cat.badge || cat.title}
                    </span>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-xl border border-[#69EBDA]/50 text-xs font-extrabold text-[#69EBDA] shadow-lg shrink-0 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#69EBDA] animate-pulse" />
                    <span>{packageCount} টি প্যাকেজ</span>
                  </div>
                </div>

                {/* Bottom Liquid Glass Card Info */}
                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/75 backdrop-blur-2xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:border-[#69EBDA]/50 transition-all duration-300">
                    {resortName && (
                      <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/35 text-[11px] font-bold text-[#69EBDA] max-w-full">
                        <Hotel className="w-3.5 h-3.5 text-[#69EBDA] shrink-0" />
                        <span className="truncate">রিসোর্ট: {resortName}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif] truncate">
                        {cat.title}
                      </h3>
                      <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-[#69EBDA] group-hover:text-slate-950 text-white flex items-center justify-center transition-all duration-300 border border-white/20 group-hover:border-[#69EBDA] shadow-md shrink-0">
                        <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
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
                        {cat.destinationName || cat.title} ({packageCount} টি প্যাকেজ)
                      </span>
                      <span className="text-[#69EBDA] font-bold group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                        প্যাকেজ দেখুন &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};
