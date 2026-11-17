import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Sparkles, ArrowRight, Compass } from 'lucide-react';

export const DestinationInfoModal = ({
  destination,
  packageCount = 0,
  onClose,
  onExplore
}) => {
  return (
    <AnimatePresence>
      {destination && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-2xl"
          >
            {/* Cover Photo */}
            <div className="relative h-52 sm:h-60 w-full bg-slate-950 overflow-hidden">
              <img
                src={
                  destination.image ||
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
                }
                alt={destination.title || destination.destinationName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close destination info"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 text-xs font-bold text-white inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#69EBDA]" />
                  <span>{destination.destinationName || destination.badge || destination.title}</span>
                </span>
              </div>

              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] leading-tight">
                    {destination.title || destination.destinationName}
                  </h3>
                  {(destination.subtitle || destination.tagline) && (
                    <p className="text-xs sm:text-sm font-bold text-[#69EBDA] mt-1">
                      {destination.subtitle || destination.tagline}
                    </p>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[#69EBDA] text-xs font-extrabold shrink-0">
                  {packageCount} Packages
                </span>
              </div>
            </div>

            {/* Full Destination Info Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-[#69EBDA]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Destination Overview</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {destination.shortDescription ||
                    destination.description ||
                    'Explore curated packages, resorts, transport & dining experiences in this destination.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Compass className="w-4 h-4 text-[#69EBDA]" />
                  <span>{destination.destinationName || destination.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  {onExplore && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = destination.id;
                        onClose();
                        onExplore(targetId);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#69EBDA] hover:bg-[#52d8c7] text-slate-950 text-xs font-black inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Packages</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
