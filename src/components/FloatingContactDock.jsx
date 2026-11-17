import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  ArrowUpRight, 
  MessageCircle, 
  Send, 
  Sparkles, 
  X, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { StorageService } from '../services/storageService';

/**
 * Inline Instant Contact Action Bar
 * Can be placed at the top/hero of the Package Details Page
 */
export const InstantContactBar = ({ pkg, onOpenBookCall, onOpenInquiry }) => {
  const [contactInfo, setContactInfo] = useState(() => StorageService.getContactInfo());
  useEffect(() => {
    const sync = () => setContactInfo(StorageService.getContactInfo());
    window.addEventListener('app:contact-info-updated', sync);
    return () => window.removeEventListener('app:contact-info-updated', sync);
  }, []);

  const packageTitle = pkg ? (pkg.shortTitle || pkg.title) : 'Luxury Travel Package';
  const packagePrice = pkg ? `$${pkg.price.toFixed(2)}/person` : 'Special Customized Tour';
  const rawWa = (contactInfo?.whatsapp || '').replace(/[^0-9]/g, '');

  const handleWhatsAppClick = () => {
    if (!rawWa) return;
    const text = encodeURIComponent(
      `Hello Etheria Travels Concierge! 🌟\n\nI am interested in booking the "${packageTitle}" (${packagePrice}) package.\n\nCould you please share details on date availability and private itinerary options?`
    );
    window.open(`https://wa.me/${rawWa}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
      
      {/* 1. WhatsApp Action Pill */}
      {rawWa && (
      <button
        onClick={handleWhatsAppClick}
        className="
          group relative px-4 py-2 rounded-2xl
          bg-emerald-500/15 hover:bg-emerald-500/25
          border border-emerald-500/35 hover:border-emerald-500/60
          text-emerald-700 dark:text-emerald-200 hover:text-emerald-900 dark:hover:text-emerald-100
          text-xs sm:text-sm font-semibold tracking-wide
          backdrop-blur-xl
          shadow-[0_4px_16px_rgba(16,185,129,0.15),inset_0_1px_1px_rgba(255,255,255,0.4)]
          hover:shadow-[0_6px_22px_rgba(16,185,129,0.3)]
          flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
        "
        title="Direct WhatsApp with Travel Specialist"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
        <span>WhatsApp</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
      )}

      {/* 2. Book a Call Action Pill */}
      <button
        onClick={onOpenBookCall}
        className="
          group px-4 py-2 rounded-2xl
          bg-cyan-500/15 hover:bg-cyan-500/25
          border border-cyan-500/35 hover:border-cyan-500/60
          text-cyan-700 dark:text-cyan-200 hover:text-cyan-900 dark:hover:text-cyan-100
          text-xs sm:text-sm font-semibold tracking-wide
          backdrop-blur-xl
          shadow-[0_4px_16px_rgba(6,182,212,0.15),inset_0_1px_1px_rgba(255,255,255,0.4)]
          hover:shadow-[0_6px_22px_rgba(6,182,212,0.3)]
          flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
        "
      >
        <PhoneCall className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
        <span>Book a Call</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-300/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* 3. Quick Contact Action Pill */}
      <button
        onClick={onOpenInquiry}
        className="
          group px-4 py-2 rounded-2xl
          bg-slate-800/60 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/15
          border border-[#69EBDA]/35 dark:border-white/20 hover:border-[#69EBDA]
          text-white
          text-xs sm:text-sm font-semibold tracking-wide
          backdrop-blur-xl
          shadow-[0_4px_16px_rgba(15,23,42,0.2)]
          hover:shadow-[0_6px_20px_rgba(105,235,218,0.25)]
          flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer
        "
      >
        <Send className="w-4 h-4 text-[#69EBDA] group-hover:scale-110 transition-transform" />
        <span>Contact Concierge</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>

    </div>
  );
};

/**
 * Persistent Floating Liquid Glass Action Dock
 * Visible across pages at the bottom-right for instant client touchpoints
 */
export const FloatingContactDock = ({ pkg, onOpenBookCall, onOpenBookingModal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contactInfo, setContactInfo] = useState(() => StorageService.getContactInfo());
  useEffect(() => {
    const sync = () => setContactInfo(StorageService.getContactInfo());
    window.addEventListener('app:contact-info-updated', sync);
    return () => window.removeEventListener('app:contact-info-updated', sync);
  }, []);

  const packageTitle = pkg ? (pkg.shortTitle || pkg.title) : 'Luxury Travel Package';
  const packagePrice = pkg ? `$${pkg.price.toFixed(2)}/person` : 'Custom Travel Plan';
  const rawWa = (contactInfo?.whatsapp || '').replace(/[^0-9]/g, '');

  const handleWhatsAppClick = () => {
    if (!rawWa) return;
    const text = encodeURIComponent(
      `Hello Etheria Travels! 🌟 I am interested in "${packageTitle}" (${packagePrice}). Please share the latest availability and VIP amenities.`
    );
    window.open(`https://wa.me/${rawWa}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
      
      {/* Expanded Quick Contact Speed Dial */}
      {isExpanded && (
        <div className="p-3 rounded-3xl bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/40 dark:border-white/25 shadow-2xl flex flex-col gap-2.5 animate-in slide-in-from-bottom-3 fade-in duration-300 min-w-[210px]">
          
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-200 dark:text-slate-400 border-b border-white/15 dark:border-white/10 pb-1.5 flex items-center justify-between">
            <span>Direct Concierge</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* WhatsApp Direct */}
          <button
            onClick={() => {
              setIsExpanded(false);
              handleWhatsAppClick();
            }}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-semibold transition-all group cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>WhatsApp Chat</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Book a Call */}
          <button
            onClick={() => {
              setIsExpanded(false);
              if (onOpenBookCall) onOpenBookCall();
            }}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold transition-all group cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-cyan-300" />
              <span>Book a Consultant Call</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Instant Reservation / Inquiry */}
          <button
            onClick={() => {
              setIsExpanded(false);
              if (onOpenBookingModal) onOpenBookingModal();
            }}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#69EBDA]/20 hover:bg-[#69EBDA]/30 border border-[#69EBDA]/40 text-[#69EBDA] text-xs font-semibold transition-all group cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#69EBDA]" />
              <span>Booking & Inquiry</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

        </div>
      )}

      {/* Master Concierge Dock Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          p-3.5 rounded-full
          border backdrop-blur-2xl
          shadow-[0_12px_36px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]
          transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer
          ${isExpanded 
            ? 'bg-white dark:bg-slate-900 border-[#69EBDA] text-[#0d9488] dark:text-[#69EBDA] rotate-90' 
            : 'bg-gradient-to-tr from-[#69EBDA] to-cyan-400 border-white/40 text-slate-950 shadow-md shadow-[#69EBDA]/40'
          }
        `}
        aria-label="Open or close concierge contact options"
      >
        {isExpanded ? (
          <X className="w-5 h-5 text-[#0d9488] dark:text-[#69EBDA]" />
        ) : (
          <MessageCircle className="w-5 h-5 text-slate-950" />
        )}
      </button>

    </div>
  );
};
