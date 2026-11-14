import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Star, Heart } from 'lucide-react';
import { DynamicReactIcon } from '../utils/reactIconParser';
import { HotelReviewService } from '../services/hotelReviewService';
import { useAuth } from '../context/AuthContext';

export const SingleHotelCard = ({ hotel, onSelectHotel }) => {
  const { user, wishlist = [], toggleWishlist } = useAuth();
  const userKey = user?.email || user?.id || 'guest_user';

  const [hoverStars, setHoverStars] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState(null);

  const handleCardRating = (e, hotelId, starValue) => {
    e.stopPropagation();
    const result = HotelReviewService.submitQuickRating(
      hotelId,
      starValue,
      userKey,
      user?.name || 'গেস্ট ট্রাভেলার'
    );
    setRatingFeedback({
      message: result.message,
      isError: !result.success
    });
    setTimeout(() => {
      setRatingFeedback(null);
    }, 2800);
  };

  const rawShortInfo =
    Array.isArray(hotel.shortInfoItems) && hotel.shortInfoItems.length > 0
      ? hotel.shortInfoItems
      : Array.isArray(hotel.amenities)
        ? hotel.amenities.map((a) => (typeof a === 'string' ? { icon: '', text: a } : a))
        : [];

  const previewShortInfo = rawShortInfo.slice(0, 5);
  const photoUrl =
    hotel.defaultPhoto ||
    hotel.image ||
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
  const perDayPrice = Number(hotel.bookingPrice ?? hotel.pricePerNight ?? 0);
  const dayLabel = hotel.bookingDays || '১ দিন';
  const isFav = wishlist.includes(hotel.id);

  const ratingMeta = HotelReviewService.getHotelRatingMeta(
    hotel.id,
    hotel.rating || 4.8,
    hotel.reviewsCount || 0
  );
  const userPrev = HotelReviewService.getUserPreviousRating(hotel.id, userKey);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.006 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      onClick={() => onSelectHotel && onSelectHotel(hotel)}
      className="
        group relative flex flex-row rounded-3xl overflow-hidden cursor-pointer
        border border-slate-300/80 dark:border-white/20
        hover:border-[#69EBDA] dark:hover:border-[#69EBDA]
        shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]
        hover:shadow-[0_18px_45px_rgba(105,235,218,0.25)]
        transition-all duration-300 min-h-[270px] sm:min-h-[310px]
      "
    >
      {/* Top Right Corner: Wishlist Heart Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (toggleWishlist) toggleWishlist(hotel.id);
        }}
        className={`
          absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-30
          w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center
          backdrop-blur-xl border transition-all duration-200 shrink-0 cursor-pointer shadow-md
          hover:scale-110 active:scale-95
          ${isFav
            ? 'bg-rose-500 border-rose-400 text-white shadow-rose-500/40'
            : 'bg-slate-900/60 hover:bg-slate-900/85 border-white/30 text-white hover:text-rose-400'
          }
        `}
        title={isFav ? 'উইশলিস্ট থেকে সরান' : 'উইশলিস্টে যুক্ত করুন'}
      >
        <Heart
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-200 ${
            isFav ? 'fill-white text-white scale-110' : 'text-white'
          }`}
        />
      </button>

      {/* Full-Size Default Photo Across Entire Card */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
        style={{ backgroundImage: `url('${photoUrl}')` }}
      />

      {/* Seamless Progressive Blur & Color Overlay */}
      <div
        className="absolute inset-0 pointer-events-none backdrop-blur-md"
        style={{
          maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 54%)',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0) 54%)'
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent"
        style={{
          maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 32%, rgba(0,0,0,0.6) 44%, rgba(0,0,0,0) 56%)',
          WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 32%, rgba(0,0,0,0.6) 44%, rgba(0,0,0,0) 56%)'
        }}
      />

      {/* Content Area: Text on left ~56% */}
      <div className="relative z-10 w-[58%] sm:w-[56%] md:w-[54%] p-3.5 sm:p-5 md:p-6 flex flex-col justify-between text-slate-900 dark:text-white transition-colors duration-300">
        <div>
          <h3 className="text-sm sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-[#69EBDA] transition-colors font-['Outfit',sans-serif] leading-tight line-clamp-2">
            {hotel.name}
          </h3>

          {(hotel.shortDescription || hotel.description) && (
            <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
              {hotel.shortDescription || hotel.description}
            </p>
          )}

          {previewShortInfo.length > 0 && (
            <div className="mt-2.5 sm:mt-3 space-y-1 sm:space-y-1.5">
              {previewShortInfo.slice(0, 4).map((info, idx) => {
                const itemText = typeof info === 'string' ? info : info?.text || '';
                const itemIcon = typeof info === 'object' ? info?.icon || '' : '';
                if (!itemText && !itemIcon) return null;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 ${idx >= 2 ? 'hidden sm:flex' : ''}`}
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-teal-500/20 dark:bg-[#69EBDA]/20 border border-teal-500/30 dark:border-[#69EBDA]/35 flex items-center justify-center text-teal-800 dark:text-[#69EBDA] shrink-0">
                      {itemIcon ? (
                        <DynamicReactIcon iconCode={itemIcon} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-700 dark:text-[#69EBDA]" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-700 dark:text-[#69EBDA]" />
                      )}
                    </span>
                    <span className="truncate">{itemText}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Area: Per Day Rent + Show Details Button + Rating */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-300/80 dark:border-white/10 space-y-2">
          <div className="flex items-baseline justify-between gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-slate-600 dark:text-slate-400">
              ভাড়া
            </span>
            <div className="text-right">
              <span className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
                ৳ {perDayPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-teal-700 dark:text-[#69EBDA] ml-1">
                / {dayLabel}
              </span>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectHotel) onSelectHotel(hotel);
            }}
            className="
              w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl
              bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400
              text-slate-950 font-black text-[11px] sm:text-xs md:text-sm tracking-wide
              shadow-md shadow-[#69EBDA]/20 hover:shadow-lg hover:shadow-[#69EBDA]/40
              flex items-center justify-center gap-1.5 sm:gap-2
              transition-all cursor-pointer
            "
          >
            <span>Show Details</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] transition-transform group-hover:translate-x-1" />
          </motion.button>

          {/* 5-Star Rating & Dynamic Review Score */}
          <div className="pt-2 px-1 border-t border-slate-200/50 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="flex items-center gap-0.5 text-amber-400 group/stars"
                  onMouseLeave={() => setHoverStars(0)}
                >
                  {[1, 2, 3, 4, 5].map((starIdx) => {
                    const isFilled = hoverStars
                      ? starIdx <= hoverStars
                      : starIdx <= Math.round(ratingMeta.averageRating);

                    return (
                      <button
                        key={starIdx}
                        type="button"
                        onClick={(e) => handleCardRating(e, hotel.id, starIdx)}
                        onMouseEnter={() => setHoverStars(starIdx)}
                        className="p-0.5 rounded transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                        title={
                          userPrev
                            ? `আপনার রেটিং: ${userPrev}★ (ক্লিক করে রেটিং বাড়াতে পারেন)`
                            : `${starIdx} স্টার রেটিং দিন`
                        }
                      >
                        <Star
                          className={`w-3.5 h-3.5 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.6)]'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono text-xs">
                  {ratingMeta.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                ({ratingMeta.totalReviews} রিভিউ)
              </span>
            </div>

            <AnimatePresence>
              {ratingFeedback && (
                <motion.p
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    ratingFeedback.isError
                      ? 'text-amber-700 bg-amber-500/15 dark:text-amber-300'
                      : 'text-teal-700 bg-teal-500/15 dark:text-[#69EBDA]'
                  }`}
                >
                  {ratingFeedback.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right Side: Transparent view showing the full photo */}
      <div className="flex-1 pointer-events-none" />
    </motion.div>
  );
};
