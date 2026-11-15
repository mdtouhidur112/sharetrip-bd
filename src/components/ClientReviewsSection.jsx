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

export const ClientReviewsSection = () => {
  const [reviewsList, setReviewsList] = useState(() => StorageService.getReviews());
  const [filter, setFilter] = useState('all');
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setReviewsList(StorageService.getReviews());
    };
    window.addEventListener('app:reviews-updated', handleUpdate);
    return () => window.removeEventListener('app:reviews-updated', handleUpdate);
  }, []);

  if (!Array.isArray(reviewsList) || reviewsList.length === 0) {
    return null;
  }

  const dynamicTrips = Array.from(
    new Set(
      reviewsList
        .map((rev) => (rev.trip || rev.location || '').trim())
        .filter(Boolean)
    )
  ).slice(0, 5);

  const categories = [
    { id: 'all', label: 'সব রিভিউ' },
    ...dynamicTrips.map((t) => ({ id: t, label: t }))
  ];

  const filteredReviews = reviewsList.filter(rev => {
    if (filter === 'all') return true;
    return rev.trip?.includes(filter) || rev.location?.includes(filter);
  });

  return (
    <section id="reviews" className="relative py-[5px] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Background Lighting Flare */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[300px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/25 border border-[#69EBDA]/45 backdrop-blur-md mb-4 text-xs font-bold tracking-wider text-teal-950 dark:text-[#69EBDA] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            ভেরিফাইড ভ্রমণকারীদের গল্প
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
            গ্রাহকদের রিভিউ
          </h2>
          <p className="mt-3 text-black/70 dark:text-slate-300 text-sm sm:text-base max-w-xl font-medium">
            আমাদের নির্ভরযোগ্য সেবায় স্মরণীয় ও বিলাসবহুল ভ্রমণ উপভোগকারী ক্লায়েন্টদের বাস্তব অভিজ্ঞতা।
          </p>
        </div>

        {/* Aggregate Trust Badge */}
        <div className="p-4 rounded-3xl bg-[#5C6977]/85 border border-[#69EBDA]/35 backdrop-blur-xl shadow-md flex items-center gap-4 text-white">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#69EBDA]/20 text-[#69EBDA] font-bold border border-[#69EBDA]/30">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-base font-extrabold text-white">
              <span>৪.৯৮</span>
              <span className="text-xs text-slate-200 font-normal">/ ৫.০ রেটিং</span>
            </div>
            <div className="text-xs font-bold text-[#69EBDA]">৩,৪২০+ ভেরিফাইড ভ্রমণকারী</div>
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
          <p className="text-slate-200 text-base font-medium">বর্তমানে কোনো রিভিউ সংরক্ষিত নেই।</p>
          <p className="text-slate-300 dark:text-slate-400 text-xs mt-1">অতিথিদের বাস্তব অভিজ্ঞতা যুক্ত হলে তা এখানে প্রদর্শিত হবে।</p>
        </div>
      ) : (
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scroll-smooth pb-3 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:w-[85%] [&>*]:sm:w-[340px] [&>*]:md:w-auto [&>*]:snap-start relative z-10">
          {filteredReviews.map((review) => (
          <motion.div
            key={review.id}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
            className="
              group p-7 rounded-3xl
              bg-[#5C6977]/85 dark:bg-slate-900/45 backdrop-blur-2xl
              border border-[#69EBDA]/35 dark:border-white/20
              shadow-[0_10px_30px_0_rgba(15,23,42,0.18),inset_0_1px_1px_0_rgba(255,255,255,0.25)]
              hover:border-[#69EBDA]
              hover:shadow-[0_20px_50px_rgba(105,235,218,0.3)]
              transition-all duration-300
              flex flex-col justify-between
            "
          >
            <div>
              {/* Stars & Quote Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#69EBDA]/60 group-hover:text-[#69EBDA] transition-colors" />
              </div>

              {/* Authentic Quote */}
              <p className="text-slate-100 text-sm leading-relaxed mb-6 italic font-medium">
                "{review.quote}"
              </p>
            </div>

            {/* Client Bio & Avatar */}
            <div className="pt-4 border-t border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-white/40 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-white font-['Outfit',sans-serif]">
                      {review.name}
                    </span>
                    {review.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#69EBDA] shrink-0" title="ভেরিফাইড ভ্রমণকারী" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-200 font-medium block">{review.location}</span>
                </div>
              </div>

              {/* Trip Tag */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#69EBDA] block max-w-[120px] truncate">
                  {(review.trip || '').split('&')[0]}
                </span>
                <span className="text-[10px] text-slate-300 font-medium">{review.date}</span>
              </div>
            </div>

          </motion.div>
        ))}
      </div>
      )}

    </section>
  );
};
