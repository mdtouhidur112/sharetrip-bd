import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Quote, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { StorageService } from '../services/storageService';

export const ClientReviewsSection = ({ onOpenAllReviews }) => {
  const [reviewsList, setReviewsList] = useState(() => StorageService.getReviews());
  const [reviewSettings, setReviewSettings] = useState(() => StorageService.getReviewSettings());
  const [secText, setSecText] = useState(() => StorageService.getSectionSettings().clientReviews);
  const [filter, setFilter] = useState('all');
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setReviewsList(StorageService.getReviews());
    };
    const syncReviewSettings = () => {
      setReviewSettings(StorageService.getReviewSettings());
    };
    const syncSection = () => {
      setSecText(StorageService.getSectionSettings().clientReviews);
    };
    window.addEventListener('app:reviews-updated', handleUpdate);
    window.addEventListener('app:review-settings-updated', syncReviewSettings);
    window.addEventListener('app:section-settings-updated', syncSection);
    return () => {
      window.removeEventListener('app:reviews-updated', handleUpdate);
      window.removeEventListener('app:review-settings-updated', syncReviewSettings);
      window.removeEventListener('app:section-settings-updated', syncSection);
    };
  }, []);

  const activeReviews =
    Array.isArray(reviewSettings?.selectedReviews) && reviewSettings.selectedReviews.length > 0
      ? reviewSettings.selectedReviews
      : Array.isArray(reviewsList)
      ? reviewsList
      : [];

  const dynamicTrips = Array.from(
    new Set(
      activeReviews
        .map((rev) => (rev.trip || rev.location || '').trim())
        .filter(Boolean)
    )
  ).slice(0, 5);

  const categories = [
    { id: 'all', label: 'All Reviews' },
    ...dynamicTrips.map((t) => ({ id: t, label: t }))
  ];

  const filteredReviews = activeReviews.filter(rev => {
    if (filter === 'all') return true;
    return rev.trip?.includes(filter) || rev.location?.includes(filter);
  });

  const visibleReviews = filteredReviews.slice(0, 4);

  return (
    <section id="reviews" className="scroll-mt-24 relative py-[5px] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Background Lighting Flare */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[300px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6 relative z-10">
        <div>
          {secText?.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/25 border border-[#69EBDA]/45 backdrop-blur-md mb-4 text-xs font-bold tracking-wider text-teal-950 dark:text-[#69EBDA] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {secText.badge}
            </div>
          )}
          {secText?.title && (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
              {secText.title}
            </h2>
          )}
          {secText?.subtitle && (
            <p className="mt-3 text-black/70 dark:text-slate-300 text-sm sm:text-base max-w-xl font-medium">
              {secText.subtitle}
            </p>
          )}
        </div>

        {/* Aggregate Trust Badge */}
        <div className="p-4 rounded-3xl bg-[#5C6977]/85 border border-[#69EBDA]/35 backdrop-blur-xl shadow-md flex items-center gap-4 text-white">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#69EBDA]/20 text-[#69EBDA] font-bold border border-[#69EBDA]/30">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-base font-extrabold text-white">
              <span>4.98</span>
              <span className="text-xs text-slate-200 font-normal">/ 5.0 Rating</span>
            </div>
            <div className="text-xs font-bold text-[#69EBDA]">{activeReviews.length}+ Verified Travelers</div>
          </div>
        </div>
      </div>

      {/* Filter Category Pills with iOS Spring Indicator */}
      <div className="flex flex-wrap items-center gap-2 mb-10 relative z-10">
        {categories.map((cat) => {
          const isSelected = filter === cat.id;
          return (
            <motion.button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative px-4 py-2 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200
                ${isSelected
                  ? 'bg-[#69EBDA] text-slate-950 border border-teal-500 font-black shadow-md shadow-[#69EBDA]/20'
                  : 'bg-[#5C6977]/85 hover:bg-[#5C6977] text-white border border-[#69EBDA]/35'
                }
              `}
            >
              {cat.label}
            </motion.button>
          );
        })}
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 liquid-glass rounded-3xl p-8 max-w-md mx-auto relative z-10 border border-white/15">
          <p className="text-slate-200 text-base font-medium">No reviews saved yet.</p>
          <p className="text-slate-300 dark:text-slate-400 text-xs mt-1">Real guest experiences will appear here once added.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {visibleReviews.map((review) => (
          <motion.div
            key={review.id}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
            className="
              group min-w-0 overflow-hidden p-5 sm:p-6 rounded-3xl
              bg-[#5C6977]/85 dark:bg-slate-900/45 backdrop-blur-2xl
              border border-[#69EBDA]/35 dark:border-white/20
              shadow-[0_10px_30px_0_rgba(15,23,42,0.18),inset_0_1px_1px_0_rgba(255,255,255,0.25)]
              hover:border-[#69EBDA]
              hover:shadow-[0_20px_50px_rgba(105,235,218,0.3)]
              transition-all duration-300
              flex flex-col justify-between gap-4
            "
          >
            <div className="min-w-0">
              {/* Stars & Quote Icon */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(Math.max(1, Math.min(5, Number(review.rating || 5))))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 shrink-0" />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-[#69EBDA]/60 group-hover:text-[#69EBDA] transition-colors shrink-0" />
              </div>

              {/* User Review */}
              <p className="text-slate-100 text-sm leading-relaxed italic font-medium break-words whitespace-pre-line">
                "{review.quote}"
              </p>
            </div>

            {/* User Photo & Name Only */}
            <div className="pt-4 border-t border-white/15 flex items-center gap-3 min-w-0">
              <img
                src={review.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={review.name}
                className="w-11 h-11 rounded-2xl object-cover border border-white/40 shadow-sm shrink-0"
              />
              <span className="text-sm font-extrabold text-white font-['Outfit',sans-serif] truncate block min-w-0">
                {review.name}
              </span>
            </div>

          </motion.div>
        ))}
      </div>
      )}

      {onOpenAllReviews && (
        <div className="mt-8 flex justify-center relative z-10">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenAllReviews}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-[#69EBDA]/25 hover:opacity-95 transition-all cursor-pointer"
          >
            <span>See All Reviews ({activeReviews.length})</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

    </section>
  );
};
