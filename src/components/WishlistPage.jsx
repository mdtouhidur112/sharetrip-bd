import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Search, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { SingleHotelCard } from './SingleHotelCard';
import {
  normalizeTransportToCardShape,
  normalizeRestaurantToCardShape
} from '../utils/serviceCardNormalizer';

export const WishlistPage = ({ onBack, onSelectHotel }) => {
  const { wishlist = [], toggleWishlist } = useAuth();
  const [hotels, setHotels] = useState(() => StorageService.getHotels() || []);
  const [transports, setTransports] = useState(() => StorageService.getTransports() || []);
  const [restaurants, setRestaurants] = useState(() => StorageService.getRestaurants() || []);
  const [packages, setPackages] = useState(() => StorageService.getPackages() || []);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const syncAll = () => {
      setHotels(StorageService.getHotels() || []);
      setTransports(StorageService.getTransports() || []);
      setRestaurants(StorageService.getRestaurants() || []);
      setPackages(StorageService.getPackages() || []);
    };
    window.addEventListener('app:hotels-updated', syncAll);
    window.addEventListener('app:transports-updated', syncAll);
    window.addEventListener('app:restaurants-updated', syncAll);
    window.addEventListener('app:packages-updated', syncAll);
    return () => {
      window.removeEventListener('app:hotels-updated', syncAll);
      window.removeEventListener('app:transports-updated', syncAll);
      window.removeEventListener('app:restaurants-updated', syncAll);
      window.removeEventListener('app:packages-updated', syncAll);
    };
  }, []);

  const savedItems = useMemo(() => {
    const wishSet = new Set(Array.isArray(wishlist) ? wishlist : []);
    const items = [];

    hotels.forEach((h) => {
      if (wishSet.has(h.id)) {
        items.push({ ...h, _wishCategory: 'hotels' });
      }
    });

    transports.forEach((t) => {
      if (wishSet.has(t.id)) {
        const normalized = normalizeTransportToCardShape(t);
        items.push({ ...normalized, _wishCategory: 'transport' });
      }
    });

    restaurants.forEach((r) => {
      if (wishSet.has(r.id)) {
        const normalized = normalizeRestaurantToCardShape(r);
        items.push({ ...normalized, _wishCategory: 'restaurant' });
      }
    });

    packages.forEach((p) => {
      if (wishSet.has(p.id)) {
        items.push({
          ...p,
          name: p.name || p.title || 'Tour Package',
          bookingPrice: p.bookingPrice || p.price || 0,
          defaultPhoto: p.defaultPhoto || p.image || '',
          _wishCategory: 'packages'
        });
      }
    });

    return items;
  }, [wishlist, hotels, transports, restaurants, packages]);

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return savedItems.filter((item) => {
      if (activeFilter !== 'all' && item._wishCategory !== activeFilter) return false;
      if (!q) return true;
      return (
        (item.name || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.shortDescription || '').toLowerCase().includes(q)
      );
    });
  }, [savedItems, activeFilter, searchTerm]);

  const tabs = [
    { id: 'all', label: `All (${savedItems.length})` },
    { id: 'hotels', label: `Hotels (${savedItems.filter((i) => i._wishCategory === 'hotels').length})` },
    { id: 'transport', label: `Transport (${savedItems.filter((i) => i._wishCategory === 'transport').length})` },
    { id: 'restaurant', label: `Restaurant (${savedItems.filter((i) => i._wishCategory === 'restaurant').length})` },
    { id: 'packages', label: `Packages (${savedItems.filter((i) => i._wishCategory === 'packages').length})` }
  ];

  return (
    <section className="relative min-h-screen pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      {/* Header & Back Button */}
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
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Saved Travel Wishlist ({savedItems.length})</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
              My Wishlist
            </h1>
            <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm sm:text-base max-w-2xl font-medium">
              All hotels, transport, dining plans, and packages you saved for your upcoming trips.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved items..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/75 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium outline-none focus:border-[#69EBDA]"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              activeFilter === tab.id
                ? 'bg-[#69EBDA] text-slate-950 border-teal-500 font-black shadow-md shadow-[#69EBDA]/20'
                : 'bg-[#5C6977]/85 hover:bg-[#5C6977] text-white border-[#69EBDA]/35'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Saved Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#5C6977]/85 dark:bg-slate-900/70 border border-white/20 text-center space-y-3">
          <Heart className="w-12 h-12 text-rose-400/70 mx-auto" />
          <h3 className="text-xl font-black text-white">Your Wishlist is Empty</h3>
          <p className="text-sm text-slate-200 max-w-md mx-auto">
            Click the heart icon on any hotel, transport, restaurant, or tour package card to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative">
              <SingleHotelCard hotel={item} onSelectHotel={onSelectHotel} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
