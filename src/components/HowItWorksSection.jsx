import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, SlidersHorizontal, PlaneTakeoff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { StorageService } from '../services/storageService';

export const HowItWorksSection = ({ onExploreTours }) => {
  const [secText, setSecText] = useState(() => StorageService.getSectionSettings().howItWorks);

  useEffect(() => {
    const syncSection = () => setSecText(StorageService.getSectionSettings().howItWorks);
    window.addEventListener('app:section-settings-updated', syncSection);
    return () => window.removeEventListener('app:section-settings-updated', syncSection);
  }, []);

  const steps = [
    {
      step: '01',
      icon: 'Compass',
      badge: 'Discover',
      title: secText?.step1Title ?? 'Choose Your Destination',
      tagline: 'Curated destinations & verified stays',
      description: secText?.step1Desc ?? 'Browse curated destinations or select hotels, transport, and dining tailored to your trip.'
    },
    {
      step: '02',
      icon: 'SlidersHorizontal',
      badge: 'Personalize',
      title: secText?.step2Title ?? 'Customize Your Plan',
      tagline: 'Flexible dates, rooms & meal plans',
      description: secText?.step2Desc ?? 'Select dates, guests, room specs, or meal plans with transparent real-time pricing.'
    },
    {
      step: '03',
      icon: 'PlaneTakeoff',
      badge: 'Confirm',
      title: secText?.step3Title ?? 'Confirm & Travel',
      tagline: 'Instant confirmation & 24/7 support',
      description: secText?.step3Desc ?? 'Complete your booking smoothly with instant confirmation and 24/7 concierge support.'
    }
  ];

  const getStepIcon = (iconName) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-7 h-7 text-teal-700 dark:text-teal-300" />;
      case 'SlidersHorizontal':
        return <SlidersHorizontal className="w-7 h-7 text-cyan-700 dark:text-cyan-300" />;
      case 'PlaneTakeoff':
        return <PlaneTakeoff className="w-7 h-7 text-emerald-700 dark:text-emerald-300" />;
      default:
        return <Sparkles className="w-7 h-7 text-teal-700 dark:text-teal-300" />;
    }
  };

  return (
    <section id="about" className="relative py-[5px] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
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
          <p className="mt-3 text-black/70 dark:text-slate-300 text-sm sm:text-base font-medium">
            {secText.subtitle}
          </p>
        )}
      </div>

      {/* 3-Step Glass Bento Cards */}
      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none scroll-smooth pb-3 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:w-[85%] [&>*]:sm:w-[340px] [&>*]:md:w-auto [&>*]:snap-start relative z-10">
        {steps.map((item, idx) => (
          <motion.div
            key={item.step}
            whileHover={{ y: -6, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
            className={`
              group relative p-8 rounded-3xl
              bg-[#5C6977]/85 dark:bg-slate-900/40 backdrop-blur-2xl
              border border-[#69EBDA]/35 dark:border-white/20
              shadow-[0_10px_30px_0_rgba(15,23,42,0.18),inset_0_1px_1px_0_rgba(255,255,255,0.25)]
              hover:border-[#69EBDA]
              hover:shadow-[0_20px_50px_rgba(105,235,218,0.3)]
              transition-all duration-300
              flex flex-col justify-between
            `}
          >
            {/* Top Indicator & Step Badge */}
            <div>
              <div className="flex items-center justify-between mb-8">
                {/* Step Emblem */}
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-white/20 flex items-center justify-center group-hover:bg-[#69EBDA]/20 group-hover:border-[#69EBDA]/50 transition-all duration-300 shadow-md">
                  {getStepIcon(item.icon)}
                </div>

                {/* Big Futuristic Step Number */}
                <span className="text-4xl sm:text-5xl font-black text-white/25 font-['Outfit',sans-serif] group-hover:text-[#69EBDA]/50 transition-colors">
                  {item.step}
                </span>
              </div>

              {/* Title & Tagline */}
              <div className="inline-block px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[11px] font-extrabold text-[#69EBDA] mb-2">
                {item.badge}
              </div>

              <h3 className="text-2xl font-extrabold text-white mb-2 font-['Outfit',sans-serif] group-hover:text-[#69EBDA] transition-colors">
                {item.title}
              </h3>

              <p className="text-xs text-[#69EBDA] font-bold mb-3">
                {item.tagline}
              </p>

              <p className="text-slate-100 text-sm leading-relaxed font-medium">
                {item.description}
              </p>
            </div>

            {/* Bottom Connector indicator */}
            <div className="mt-8 pt-4 border-t border-white/15 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#69EBDA]" />
                100% Premium Service
              </span>
              <span className="text-[#69EBDA] font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Step {idx + 1} / 3 <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

          </motion.div>
        ))}
      </div>

    </section>
  );
};
