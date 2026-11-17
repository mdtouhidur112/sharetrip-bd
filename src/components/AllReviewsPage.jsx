import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Quote, CheckCircle2, Sparkles, Search } from 'lucide-react';
import { StorageService } from '../services/storageService';

export const AllReviewsPage = ({ onBack }) => {
  const [reviewSettings, setReviewSettings] = useState(() => StorageService.getReviewSettings());
  const [legacyReviews, setLegacyReviews] = useState(() => StorageService.getReviews());
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const syncSettings = () => setReviewSettings(StorageService.getReviewSettings());
    const syncLegacy = () => setLegacyReviews(StorageService.getReviews());
    window.addEventListener('app:review-settings-updated', syncSettings);
    window.addEventListener('app:reviews-updated', syncLegacy);
    return () => {
      window.removeEventListener('app:review-settings-updated', syncSettings);
      window.removeEventListener('app:reviews-updated', syncLegacy);
    };
  }, []);

  const allReviews = useMemo(() => {
    const selected = Array.isArray(reviewSettings?.selectedReviews) ? reviewSettings.selectedReviews : [];
    if (selected.length > 0) return selected;
    return Array.isArray(legacyReviews) ? legacyReviews : [];
  }, [reviewSettings, legacyReviews]);

  const filteredReviews = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return allReviews.filter((rev) => {
      if (minRating > 0 && Number(rev.rating || 5) < minRating) return false;
      if (!q) return true;
      return (
        (rev.name || '').toLowerCase().includes(q) ||
        (rev.quote || '').toLowerCase().includes(q) ||
        (rev.location || rev.trip || '').toLowerCase().includes(q)
      );
    });
  }, [allReviews, searchTerm, minRating]);

  return (
    <section className="relative min-h-screen pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#5C6977]/85 hover:bg-[#5C6977] text-white border border-white/25 hover:border-[#69EBDA] text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-[#69EBDA]" />
            <span>Back</span>
          </button>

          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 backdrop-blur-md mb-2 text-xs font-bold tracking-wider text-teal-950 dark:text-[#69EBDA] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              All Verified Traveler Reviews ({allReviews.length})
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
              Client Reviews &amp; Experiences
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[0, 5, 4].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setMinRating(r)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  minRating === r
                    ? 'bg-[#69EBDA] text-slate-950 border-teal-500 font-black'
                    : 'bg-[#5C6977]/80 text-white border-white/20 hover:border-[#69EBDA]'
                }`}
              >
                {r === 0 ? 'All' : `${r}★+`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/75 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium outline-none focus:border-[#69EBDA]"
            />
          </div>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-white/20 text-center text-slate-600 dark:text-slate-300 font-semibold">
          No reviews found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="group min-w-0 overflow-hidden p-5 sm:p-6 rounded-3xl bg-[#5C6977]/85 dark:bg-slate-900/50 backdrop-blur-2xl border border-[#69EBDA]/35 dark:border-white/20 shadow-[0_10px_30px_rgba(15,23,42,0.18)] hover:border-[#69EBDA] transition-all flex flex-col justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(Math.max(1, Math.min(5, Number(review.rating || 5))))].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 shrink-0" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-[#69EBDA]/60 group-hover:text-[#69EBDA] transition-colors shrink-0" />
                </div>

                <p className="text-slate-100 text-sm leading-relaxed italic font-medium break-words whitespace-pre-line">
                  "{review.quote}"
                </p>
              </div>

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
    </section>
  );
};
