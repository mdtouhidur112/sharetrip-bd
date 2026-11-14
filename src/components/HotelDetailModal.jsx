import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MapPin, Wifi, Coffee, Waves, Eye, ShieldCheck, Check, Sparkles } from 'lucide-react';

export const HotelDetailModal = ({ hotel, onClose }) => {
  if (!hotel) return null;

  const getAmenityIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-3.5 h-3.5 text-cyan-400" />;
    if (lower.includes('breakfast')) return <Coffee className="w-3.5 h-3.5 text-amber-400" />;
    if (lower.includes('pool') || lower.includes('beach') || lower.includes('water')) return <Waves className="w-3.5 h-3.5 text-teal-400" />;
    if (lower.includes('view') || lower.includes('ocean')) return <Eye className="w-3.5 h-3.5 text-emerald-400" />;
    return <Sparkles className="w-3.5 h-3.5 text-teal-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-xl">
      
      {/* Liquid Glass Dialog */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(8px)' }}
        transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/25 shadow-[0_20px_60px_rgba(15,23,42,0.3)] dark:shadow-2xl my-8 text-white"
      >
        
        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 backdrop-blur-lg transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${hotel.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/30" />

          {/* Location & Rating Badge */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[#69EBDA] text-xs font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{hotel.location}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
                {hotel.name}
              </h2>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{hotel.rating}</span>
              <span className="text-slate-400 font-normal">({hotel.reviewsCount})</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="text-xs uppercase font-bold text-[#69EBDA] tracking-wider mb-1">
              অন্তর্ভুক্ত স্যুটের ধরণ
            </div>
            <div className="text-base font-bold text-white">
              {hotel.roomType}
            </div>
            <p className="mt-2 text-sm text-slate-100 dark:text-slate-300 leading-relaxed font-medium">
              {hotel.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div>
            <div className="text-xs uppercase font-bold text-slate-200 dark:text-slate-300 tracking-wider mb-3">
              রিসোর্টের অন্তর্ভুক্ত সুবিধাসমূহ
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {hotel.amenities.map((amenity, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/50 dark:bg-white/[0.05] border border-white/15 dark:border-white/10 text-xs text-slate-100 dark:text-slate-200 font-medium"
                >
                  {getAmenityIcon(amenity)}
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Info */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 dark:text-slate-400 block font-medium">হোটেলের মূল মূল্যমান</span>
              <span className="text-2xl font-black text-white font-['Outfit',sans-serif]">
                ${hotel.pricePerNight.toFixed(2)}
              </span>
              <span className="text-xs text-slate-300 dark:text-slate-400"> / রাত (প্যাকেজে সম্পূর্ণ অন্তর্ভুক্ত)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
              <Check className="w-3.5 h-3.5" />
              ভেরিফাইড পার্টনার
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-800/60 dark:bg-slate-950/70 border-t border-white/15 dark:border-white/10 flex items-center justify-between">
          <span className="text-xs text-slate-200 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#69EBDA]" />
            প্রাপ্যতা সাপেক্ষে নিশ্চিত রুম আপগ্রেড সুবিধা
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-700/80 hover:bg-slate-700 dark:bg-white/10 hover:dark:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
};
