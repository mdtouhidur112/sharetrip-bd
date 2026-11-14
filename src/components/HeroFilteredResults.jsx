import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Hotel,
  Car,
  UtensilsCrossed,
  MapPin,
  Calendar,
  Users,
  ArrowUpRight,
  SearchX
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { SingleHotelCard } from './SingleHotelCard';

export const HeroFilteredResults = ({ filter, onResetFilter, onSelectItem }) => {
  const [hotels, setHotels] = useState(() => StorageService.getHotels() || []);
  const [transports, setTransports] = useState(() => StorageService.getTransports() || []);
  const [restaurants, setRestaurants] = useState(() => StorageService.getRestaurants() || []);

  useEffect(() => {
    const syncHotels = () => setHotels(StorageService.getHotels() || []);
    const syncTransports = () => setTransports(StorageService.getTransports() || []);
    const syncRestaurants = () => setRestaurants(StorageService.getRestaurants() || []);

    window.addEventListener('app:hotels-updated', syncHotels);
    window.addEventListener('app:transports-updated', syncTransports);
    window.addEventListener('app:restaurants-updated', syncRestaurants);
    return () => {
      window.removeEventListener('app:hotels-updated', syncHotels);
      window.removeEventListener('app:transports-updated', syncTransports);
      window.removeEventListener('app:restaurants-updated', syncRestaurants);
    };
  }, []);

  if (!filter) return null;

  const activeTab = filter.activeTab || 'hotels';
  const rawQuery = (filter.query || filter.destination || '').toLowerCase().trim();

  // Compute filtered items based on activeTab
  let filteredItems = [];

  if (activeTab === 'hotels') {
    filteredItems = hotels.filter((h) => {
      if (!rawQuery) return true;
      const haystack = [
        h.name,
        h.location,
        h.destinationId,
        h.shortDescription,
        h.details,
        h.badge
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return rawQuery.split(/\s+/).some((term) => haystack.includes(term));
    });
  } else if (activeTab === 'transport') {
    const cat = (filter.transportCategory || '').toLowerCase().trim();
    const pickup = (filter.pickup || '').toLowerCase().trim();
    const dropoff = (filter.dropoff || '').toLowerCase().trim();
    const terms = [pickup, dropoff].filter(Boolean);

    filteredItems = transports.filter((t) => {
      const matchesCat = !cat || (t.category || '').toLowerCase() === cat;
      if (!matchesCat) return false;
      if (terms.length === 0) return true;

      const routeFaresText = Array.isArray(t.routeFares)
        ? t.routeFares.map((r) => `${r.from || ''} ${r.to || ''}`).join(' ')
        : '';
      const haystack = [
        t.name,
        t.categoryName,
        t.route,
        t.airports,
        t.description,
        t.details,
        routeFaresText
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return terms.some((term) => haystack.includes(term));
    });
  } else if (activeTab === 'restaurant') {
    const mealPlan = (filter.mealPlan || '').toLowerCase().trim();
    const q = rawQuery;

    filteredItems = restaurants.filter((r) => {
      const haystack = [
        r.name,
        r.mealPlanType,
        r.badge,
        r.details,
        ...(Array.isArray(r.tags) ? r.tags : []),
        ...(Array.isArray(r.breakfastMenu) ? r.breakfastMenu : []),
        ...(Array.isArray(r.lunchMenu) ? r.lunchMenu : []),
        ...(Array.isArray(r.dinnerMenu) ? r.dinnerMenu : [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesQuery = !q || q.split(/\s+/).some((term) => haystack.includes(term));
      const matchesMeal = !mealPlan || haystack.includes(mealPlan.split(' ')[0]) || true;
      return matchesQuery && matchesMeal;
    });
  }

  const getTabMeta = () => {
    if (activeTab === 'transport') {
      return {
        label: `ট্রান্সপোর্ট (${filter.subOption || 'Road Services'})`,
        icon: <Car className="w-4 h-4 text-[#69EBDA]" />
      };
    }
    if (activeTab === 'restaurant') {
      return {
        label: 'রেস্টুরেন্ট ও ডাইনিং',
        icon: <UtensilsCrossed className="w-4 h-4 text-[#69EBDA]" />
      };
    }
    return {
      label: 'হোটেল ও রিসোর্ট',
      icon: <Hotel className="w-4 h-4 text-[#69EBDA]" />
    };
  };

  const tabMeta = getTabMeta();

  return (
    <section
      id="hero-filtered-results"
      className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[5px] pb-10"
    >
      {/* Active Filter Bar Header */}
      <div className="rounded-3xl bg-[#5C6977]/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 p-4 sm:p-6 mb-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-xs font-extrabold text-[#69EBDA]">
              {tabMeta.icon}
              <span>{tabMeta.label}</span>
            </span>

            {(filter.pickup || filter.dropoff || filter.destination) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white">
                <MapPin className="w-3.5 h-3.5 text-[#69EBDA]" />
                <span>
                  {activeTab === 'transport'
                    ? [filter.pickup, filter.dropoff].filter(Boolean).join(' → ')
                    : filter.destination}
                </span>
              </span>
            )}

            {filter.travelDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white">
                <Calendar className="w-3.5 h-3.5 text-[#69EBDA]" />
                <span>{filter.travelDate}</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white">
              <Users className="w-3.5 h-3.5 text-[#69EBDA]" />
              <span>
                {filter.adults ?? filter.guests ?? 2} Adults
                {filter.children ? `, ${filter.children} Children` : ''}
              </span>
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            আপনার ফিল্টার অনুযায়ী পাওয়া সার্ভিসসমূহ ({filteredItems.length} টি)
          </h2>
        </div>

        <button
          type="button"
          onClick={onResetFilter}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#69EBDA] text-slate-950 font-black text-xs sm:text-sm shadow-md hover:brightness-105 transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ফিল্টার রিসেট / সব সেকশন দেখুন</span>
        </button>
      </div>

      {/* Filtered Results Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#5C6977]/70 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/20 text-center space-y-4">
          <SearchX className="w-10 h-10 text-[#69EBDA] mx-auto" />
          <h3 className="text-lg font-extrabold text-white">
            আপনার ফিল্টার অনুযায়ী কোনো সার্ভিস পাওয়া যায়নি
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 max-w-md mx-auto">
            অনুগ্রহ করে লোকেশন বা অন্যান্য তথ্য পরিবর্তন করে আবার চেষ্টা করুন, অথবা সব সেকশন দেখতে রিসেট করুন।
          </p>
          <button
            type="button"
            onClick={onResetFilter}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#69EBDA] text-slate-950 font-black text-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>সব সেকশন দেখুন</span>
          </button>
        </div>
      ) : activeTab === 'hotels' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-[1650px]:grid-cols-3 gap-6">
          {filteredItems.map((hotel) => (
            <SingleHotelCard
              key={hotel.id}
              hotel={hotel}
              onSelectHotel={onSelectItem}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isTrans = activeTab === 'transport';
            const photo =
              item.photo ||
              item.defaultPhoto ||
              item.image ||
              'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
            const priceLabel = isTrans
              ? item.fare || `৳ ${Number(item.bookingPrice || 0).toLocaleString('en-IN')}`
              : item.rateLabel || `৳ ${Number(item.ratePerPerson || 0).toLocaleString('en-IN')} / জন`;

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  onSelectItem({
                    ...item,
                    serviceType: isTrans ? 'transport' : 'restaurant',
                    pricePerDay: isTrans ? Number(item.bookingPrice || 0) : Number(item.ratePerPerson || 0),
                    image: photo
                  })
                }
                className="group rounded-3xl overflow-hidden cursor-pointer bg-white/90 dark:bg-slate-900/85 backdrop-blur-2xl border border-white/25 hover:border-[#69EBDA] shadow-xl flex flex-col justify-between transition-all"
              >
                <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                  <img
                    src={photo}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-black bg-slate-950/80 text-[#69EBDA] border border-[#69EBDA]/40">
                    {isTrans ? item.categoryName || 'Transport' : item.badge || item.mealPlanType || 'Dining'}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-[#69EBDA] transition-colors">
                      {item.name}
                    </h3>
                    {(item.route || item.airports || item.mealPlanType) && (
                      <p className="text-xs font-bold text-teal-600 dark:text-[#69EBDA] mt-1">
                        {item.route || item.airports || item.mealPlanType}
                      </p>
                    )}
                    {(item.description || item.details) && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                        {item.description || item.details}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 dark:text-[#69EBDA]">
                      {priceLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#69EBDA]/15 text-teal-800 dark:text-[#69EBDA] text-xs font-extrabold group-hover:bg-[#69EBDA] group-hover:text-slate-950 transition-all">
                      <span>বিস্তারিত</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
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
