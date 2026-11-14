import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Hotel,
  Car,
  UtensilsCrossed,
  ArrowUpRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { StorageService } from '../services/storageService';

export const CoreServicesSection = ({ onSelectService }) => {
  const [counts, setCounts] = useState(() => ({
    hotels: StorageService.getHotels().length,
    transport: StorageService.getTransports().length,
    restaurant: StorageService.getRestaurants().length
  }));

  useEffect(() => {
    const syncCounts = () => {
      setCounts({
        hotels: StorageService.getHotels().length,
        transport: StorageService.getTransports().length,
        restaurant: StorageService.getRestaurants().length
      });
    };

    window.addEventListener('app:hotels-updated', syncCounts);
    window.addEventListener('app:transports-updated', syncCounts);
    window.addEventListener('app:restaurants-updated', syncCounts);

    return () => {
      window.removeEventListener('app:hotels-updated', syncCounts);
      window.removeEventListener('app:transports-updated', syncCounts);
      window.removeEventListener('app:restaurants-updated', syncCounts);
    };
  }, []);

  const serviceCards = [
    {
      id: 'hotels',
      title: 'Hotels & Resorts',
      subtitleBn: 'বিলাসবহুল হোটেল ও রিসোর্ট',
      summary: 'Luxury stays, curated rooms, floor & bath specs with real-time calendar availability.',
      countBadge: `${counts.hotels}+ Verified Stays`,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      icon: Hotel
    },
    {
      id: 'transport',
      title: 'Transport & Vehicles',
      subtitleBn: 'প্রাইভেট কার ও ট্যুরিস্ট যানবাহন',
      summary: 'Private cars, executive microbuses, 4x4 tourist jeeps, and full scenic route coverage.',
      countBadge: `${counts.transport}+ Vehicles`,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      icon: Car
    },
    {
      id: 'restaurant',
      title: 'Restaurant & Dining',
      subtitleBn: 'রেস্টুরেন্ট ও ৩-বেলা মিল প্ল্যান',
      summary: '3-time daily meal plans, signature buffets, traditional heritage thali, and live BBQ.',
      countBadge: `${counts.restaurant}+ Dining Plans`,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      icon: UtensilsCrossed
    }
  ];

  return (
    <section id="services" className="scroll-mt-24 relative py-[5px] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Ambient Background Glow */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#69EBDA]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 backdrop-blur-md mb-4 text-xs font-bold tracking-wider text-teal-900 dark:text-[#69EBDA] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Our Core Services
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
            আমাদের মূল সেবাসমূহ
          </h2>
          <p className="mt-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base max-w-xl font-medium">
            বিলাসবহুল রিসোর্ট, প্রাইভেট ট্রান্সপোর্ট এবং প্রিমিয়াম ডাইনিং—সবকিছু এক জায়গায় লাইভ রিয়েল-টাইম বুকিং সুবিধাসহ।
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-bold px-4 py-2.5 rounded-2xl bg-white/60 dark:bg-[#5C6977]/60 border border-white/40 dark:border-white/15 backdrop-blur-xl shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#69EBDA]" />
          <span>রিয়েল-টাইম ভেরিফায়েড সার্ভিস</span>
        </div>
      </div>

      {/* 3-Service Premium Liquid Glass Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {serviceCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26, delay: idx * 0.05 }}
              onClick={() => onSelectService && onSelectService(card.id)}
              className="group relative rounded-[2rem] overflow-hidden cursor-pointer bg-[#5C6977]/90 dark:bg-slate-900/65 backdrop-blur-2xl border border-white/25 dark:border-white/15 hover:border-[#69EBDA]/70 shadow-[0_14px_38px_rgba(15,23,42,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)] hover:shadow-[0_24px_55px_rgba(105,235,218,0.28)] transition-colors duration-300 flex flex-col justify-between min-h-[390px]"
            >
              {/* Cover Image with Dark Gradient Overlay */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b]/95 via-slate-900/45 to-black/25" />

                {/* Top Floating Row: Glowing Icon Badge + Live Count Pill */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-slate-950/65 backdrop-blur-xl border border-[#69EBDA]/50 flex items-center justify-center shadow-[0_0_20px_rgba(105,235,218,0.35)]">
                    <IconComponent className="w-5 h-5 text-[#69EBDA]" />
                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-slate-950/65 backdrop-blur-xl border border-white/20 text-[11px] font-extrabold text-[#69EBDA] tracking-wide shadow-sm">
                    {card.countBadge}
                  </span>
                </div>

                {/* Bengali Subtitle Tag at Bottom of Image */}
                <div className="absolute bottom-3 left-5 right-5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#69EBDA]">
                    {card.subtitleBn}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit',sans-serif] group-hover:text-[#69EBDA] transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-200/90 leading-relaxed line-clamp-2 font-medium">
                    {card.summary}
                  </p>
                </div>

                {/* Interactive Explore Service Glass Pill Button */}
                <div className="pt-2 flex items-center justify-between border-t border-white/15">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 group-hover:bg-[#69EBDA] text-white group-hover:text-slate-950 border border-white/25 group-hover:border-[#69EBDA] text-xs font-extrabold tracking-wide transition-all duration-300 shadow-sm">
                    <span>Explore Service</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
