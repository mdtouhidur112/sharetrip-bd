import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { SingleHotelCard } from './SingleHotelCard';

export const SingleHotelsGrid = ({ onSelectHotel, selectedCategory, searchQuery }) => {
  const [hotels, setHotels] = useState(() => StorageService.getHotels() || []);
  const [bookings, setBookings] = useState(() => StorageService.getBookings() || []);
  const [servicesControl, setServicesControl] = useState(() => StorageService.getServicesControl());
  const [secText, setSecText] = useState(() => StorageService.getSectionSettings().popularHotels);
  const [, setReviewVersion] = useState(0);

  useEffect(() => {
    const syncHotels = () => {
      setHotels(StorageService.getHotels() || []);
    };
    const syncBookings = () => {
      setBookings(StorageService.getBookings() || []);
    };
    const syncReviews = () => {
      setReviewVersion((v) => v + 1);
    };
    const syncServicesControl = () => {
      setServicesControl(StorageService.getServicesControl());
    };
    const syncSection = () => {
      setSecText(StorageService.getSectionSettings().popularHotels);
    };
    window.addEventListener('app:hotels-updated', syncHotels);
    window.addEventListener('app:bookings-updated', syncBookings);
    window.addEventListener('app:hotel-reviews-updated', syncReviews);
    window.addEventListener('app:services-control-updated', syncServicesControl);
    window.addEventListener('app:section-settings-updated', syncSection);
    return () => {
      window.removeEventListener('app:hotels-updated', syncHotels);
      window.removeEventListener('app:bookings-updated', syncBookings);
      window.removeEventListener('app:hotel-reviews-updated', syncReviews);
      window.removeEventListener('app:services-control-updated', syncServicesControl);
      window.removeEventListener('app:section-settings-updated', syncSection);
    };
  }, []);

  if (servicesControl?.hotels === false) return null;

  // Filter hotels by selected destination/category or search query if active
  const filteredHotels = hotels.filter((h) => {
    const selCat = (selectedCategory || '').toLowerCase().trim();
    const hDest = (h.destinationId || h.location || '').toLowerCase().trim();

    const matchesCategory =
      !selCat ||
      selCat === 'all' ||
      !hDest ||
      hDest === selCat ||
      hDest.includes(selCat);

    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch =
      !q ||
      (h.name || '').toLowerCase().includes(q) ||
      (h.shortDescription || '').toLowerCase().includes(q) ||
      (h.details || '').toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // Base list (real database hotels only)
  const baseHotels = filteredHotels.length > 0 ? filteredHotels : hotels;

  // Rank by popularity: live booking count + review count + rating
  const getPopularityScore = (hotel) => {
    const hName = (hotel.name || '').toLowerCase().trim();
    const bookingCount = (Array.isArray(bookings) ? bookings : []).filter((b) => {
      const bTitle = (b.packageTitle || b.hotelName || b.serviceName || '').toLowerCase();
      return (b.hotelId && b.hotelId === hotel.id) || (hName && bTitle.includes(hName));
    }).length;
    const reviewsCount = Number(hotel.reviewsCount || 0);
    const rating = Number(hotel.rating || 4.5);
    return bookingCount * 100 + reviewsCount * 5 + rating * 10;
  };

  const popularHotels = [...baseHotels].sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
  if (popularHotels.length === 0) return null;

  return (
    <section id="single-hotels" className="relative py-[5px] px-3 sm:px-6 lg:px-10 max-w-[2400px] mx-auto">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {secText?.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/25 border border-[#69EBDA]/45 backdrop-blur-md mb-3 text-xs font-bold tracking-wider text-teal-950 dark:text-[#69EBDA] uppercase">
              <Flame className="w-3.5 h-3.5" />
              {secText.badge}
            </div>
          )}
          {secText?.title && (
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif] transition-colors">
              {secText.title}
            </h2>
          )}
          {secText?.subtitle && (
            <p className="mt-1.5 sm:mt-2 text-slate-700 dark:text-slate-300 text-xs sm:text-base max-w-xl font-medium transition-colors">
              {secText.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Responsive Grid: Top 4 Most Popular Bookings */}
      <div className="max-w-7xl min-[1650px]:max-w-[2200px] mx-auto flex md:grid md:grid-cols-2 min-[1650px]:grid-cols-3 min-[2200px]:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scroll-smooth pb-3 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:w-[85%] [&>*]:sm:w-[340px] [&>*]:md:w-auto [&>*]:snap-start">
        {popularHotels.slice(0, 4).map((hotel) => (
          <SingleHotelCard
            key={hotel.id}
            hotel={hotel}
            onSelectHotel={onSelectHotel}
          />
        ))}
      </div>
    </section>
  );
};
