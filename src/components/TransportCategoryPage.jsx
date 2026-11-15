// src/components/TransportCategoryPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Car, 
  Ship, 
  Plane, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  Search, 
  ShieldCheck, 
  Tag, 
  ArrowUpRight 
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { SingleHotelCard } from './SingleHotelCard';
import { normalizeTransportToCardShape } from '../utils/serviceCardNormalizer';

export const TransportCategoryPage = ({ categoryId, initialSearchQuery = '', onBack, onOpenBookCall, onSelectHotel }) => {
  const [categories, setCategories] = useState(() => StorageService.getTransportCategories());
  const [transports, setTransports] = useState(() => StorageService.getTransports());
  const [servicesControl, setServicesControl] = useState(() => StorageService.getServicesControl());
  const [activeCatId, setActiveCatId] = useState(categoryId || 'all');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');

  useEffect(() => {
    setActiveCatId(categoryId || 'all');
  }, [categoryId]);

  useEffect(() => {
    setSearchQuery(initialSearchQuery || '');
  }, [initialSearchQuery]);

  useEffect(() => {
    const handleSync = () => {
      setCategories(StorageService.getTransportCategories());
      setTransports(StorageService.getTransports());
      setServicesControl(StorageService.getServicesControl());
    };
    window.addEventListener('app:transports-updated', handleSync);
    window.addEventListener('app:transport-categories-updated', handleSync);
    window.addEventListener('app:services-control-updated', handleSync);
    return () => {
      window.removeEventListener('app:transports-updated', handleSync);
      window.removeEventListener('app:transport-categories-updated', handleSync);
      window.removeEventListener('app:services-control-updated', handleSync);
    };
  }, []);

  const currentCategory = useMemo(() => {
    if (activeCatId === 'all') {
      return {
        id: 'all',
        name: 'সকল যানবাহন ও পরিবহন সেবা',
        subtitle: 'সড়ক, নদী ও আকাশ পথ',
        icon: 'Car',
        description: 'আমাদের বহরের সকল প্রিমিয়াম বাহন ও বিশেষ সেবা। যেকোনো বাহন বুক করতে হোয়াটসঅ্যাপে সরাসরি যোগাযোগ করুন।',
        photo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
      };
    }
    return categories.find((c) => c.id === activeCatId) || categories[0] || {
      id: 'road',
      name: 'রোড সার্ভিস',
      subtitle: 'সড়ক পথ',
      icon: 'Car',
      description: 'লাক্সারি প্রাইভেট সিডান, ৪x৪ এসইউভি ও ভিআইপি মাইক্রোবাসে আরামদায়ক সড়ক ভ্রমণ।',
      photo: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
    };
  }, [activeCatId, categories]);

  const filteredTransports = useMemo(() => {
    const tokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return transports.filter((t) => {
      if (servicesControl?.transport === false || servicesControl?.[t.category] === false) {
        return false;
      }
      const matchCat = activeCatId === 'all' || t.category === activeCatId;
      if (tokens.length === 0) return matchCat;
      const routesStr = Array.isArray(t.routeFares)
        ? t.routeFares.map((r) => `${r.from || ''} ${r.to || ''}`).join(' ')
        : '';
      const hay = `${t.name || ''} ${t.model || ''} ${t.route || ''} ${t.airports || ''} ${t.description || ''} ${routesStr}`.toLowerCase();
      const matchSearch = tokens.some((tok) => hay.includes(tok));
      return matchCat && matchSearch;
    });
  }, [transports, activeCatId, searchQuery, servicesControl]);

  const getCategoryIcon = (catIdOrIcon) => {
    if (catIdOrIcon === 'waterway' || catIdOrIcon === 'Ship') {
      return <Ship className="w-5 h-5 text-[#69EBDA]" />;
    }
    if (catIdOrIcon === 'air' || catIdOrIcon === 'Plane') {
      return <Plane className="w-5 h-5 text-[#69EBDA]" />;
    }
    return <Car className="w-5 h-5 text-[#69EBDA]" />;
  };

  const handleInquireTransport = (item) => {
    const rawWa = (StorageService.getContactInfo()?.whatsapp || '18005550199').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `হ্যালো এথেরিয়া কনসিয়ার্জ, আমি আপনাদের "${item.name}" (${item.categoryName || item.category || 'পরিবহন'}) বুকিং বা ভাড়া সম্পর্কে বিস্তারিত জানতে আগ্রহী।`
    );
    window.open(`https://wa.me/${rawWa}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-28 pt-24 sm:pt-28">
      
      {/* 1. Top Bar: Back Button & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-300/80 dark:border-white/20 text-slate-800 dark:text-white hover:border-[#69EBDA] dark:hover:border-[#69EBDA] hover:text-teal-600 dark:hover:text-[#69EBDA] shadow-sm transition-all cursor-pointer font-bold text-xs sm:text-sm group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>মূল পাতায় ফিরে যান (Back)</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-[#69EBDA] border border-[#69EBDA]/30 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>নিরাপদ ও নির্ভরযোগ্য পরিবহন</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Stage for Selected Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 min-h-[220px] sm:min-h-[280px] flex items-end p-6 sm:p-10 border border-slate-300/80 dark:border-white/20 shadow-xl">
          <img
            src={currentCategory.photo}
            alt={currentCategory.name}
            className="absolute inset-0 w-full h-full object-cover opacity-45 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-teal-200 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#69EBDA]" />
              <span>{currentCategory.subtitle || 'পরিবহন ক্যাটাগরি'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-['Outfit',sans-serif]">
              {currentCategory.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              {currentCategory.description}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Category Switcher Tabs & Search Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 backdrop-blur-md">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveCatId('all')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeCatId === 'all'
                  ? 'bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 shadow-md font-black'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>সকল বাহন ({transports.filter((t) => servicesControl?.transport !== false && servicesControl?.[t.category] !== false).length})</span>
            </button>

            {categories.map((cat) => {
              const isSelected = activeCatId === cat.id;
              const isCatDisabled = servicesControl?.transport === false || servicesControl?.[cat.id] === false;
              const count = isCatDisabled ? 'Off' : transports.filter((t) => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (isCatDisabled) {
                      StorageService.notifyDisabledService(cat.id);
                      return;
                    }
                    setActiveCatId(cat.id);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {getCategoryIcon(cat.icon || cat.id)}
                  <span>{cat.name} ({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বাহন বা মডেল খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 outline-none focus:border-[#69EBDA]"
            />
          </div>
        </div>
      </div>

      {/* 4. Vehicles Grid under Selected Category */}
      <div className="max-w-7xl min-[1650px]:max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8">
        {filteredTransports.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 min-[1650px]:grid-cols-3 min-[2200px]:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {filteredTransports.map((item) => {
              const normalized = normalizeTransportToCardShape(item);
              return (
                <SingleHotelCard
                  key={item.id}
                  hotel={normalized}
                  onSelectHotel={onSelectHotel}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 max-w-lg mx-auto space-y-4">
            <Car className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              এই ক্যাটাগরিতে কোনো বাহন পাওয়া যায়নি
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              অন্য কোনো ক্যাটাগরি বেছে নিন অথবা সকল বাহন দেখতে নিচের বাটনে ক্লিক করুন।
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCatId('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#69EBDA] text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
            >
              সকল বাহন দেখুন
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
