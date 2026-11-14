import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Check, 
  Sparkles, 
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

export const BookingCheckoutModal = ({ pkg, isOpen, onClose, onBookingSuccess }) => {
  const [guestsCount, setGuestsCount] = useState(2);
  const [departureDate, setDepartureDate] = useState('2026-11-20');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [vipAddon, setVipAddon] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !pkg) return null;

  const basePrice = pkg.price * guestsCount;
  const addonCost = vipAddon ? 120 : 0;
  const totalPrice = (basePrice + addonCost).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false);
        if (onBookingSuccess) onBookingSuccess(pkg, guestsCount, totalPrice);
        onClose();
      }, 1800);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-300">
      
      {/* Liquid Glass Dialog Card */}
      <div className="relative w-full max-w-xl rounded-3xl overflow-hidden bg-slate-900/90 backdrop-blur-3xl border border-white/25 shadow-[0_24px_70px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.35)] my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white/80 hover:text-white border border-white/20 backdrop-blur-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dialog Header with Scenic Backdrop */}
        <div className="relative p-6 sm:p-8 border-b border-white/10 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
            style={{ backgroundImage: `url('${pkg.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-900/95" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              তাৎক্ষণিক বুকিং সংরক্ষণ
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
              {pkg.shortTitle || pkg.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-300 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                {pkg.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {pkg.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        {confirmed ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-400 text-teal-300 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(20,184,166,0.5)]">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white font-['Outfit',sans-serif]">
              ভ্রমণ প্যাকেজ সংরক্ষিত হয়েছে!
            </h3>
            <p className="text-slate-300 text-sm max-w-sm mx-auto leading-relaxed">
              আপনার ভ্রমণ প্যাকেজ সংরক্ষিত হয়েছে। আমাদের প্রাইভেট কনসিয়ার্জ আপনার ইমেইলে বিস্তারিত ভ্রমণ নির্দেশিকা ও ডিপোজিট লিংক পাঠিয়েছেন।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            
            {/* Guest Counter & Date Pick */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Departure Date */}
              <div>
                <label className="text-xs uppercase font-bold text-slate-300 tracking-wider block mb-1.5">
                  ভ্রমণের তারিখ
                </label>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.05] border border-white/15">
                  <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-transparent text-xs text-white focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Number of Voyagers */}
              <div>
                <label className="text-xs uppercase font-bold text-slate-300 tracking-wider block mb-1.5">
                  ভ্রমণকারী সংখ্যা ({guestsCount})
                </label>
                <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.05] border border-white/15">
                  <div className="flex items-center gap-2 pl-2">
                    <Users className="w-4 h-4 text-teal-400" />
                    <span className="text-xs text-white font-medium">{guestsCount} জন</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-white">{guestsCount}</span>
                    <button
                      type="button"
                      onClick={() => setGuestsCount(Math.min(10, guestsCount + 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Traveler Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-bold text-slate-300 tracking-wider block mb-1.5">
                  প্রধান ভ্রমণকারীর নাম
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ফারহান চৌধুরী"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-slate-300 tracking-wider block mb-1.5">
                  নিশ্চিতকরণের জন্য ইমেইল
                </label>
                <input
                  type="email"
                  required
                  placeholder="farhan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Optional VIP Addon */}
            <div 
              onClick={() => setVipAddon(!vipAddon)}
              className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/15 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${vipAddon ? 'bg-teal-400 border-teal-300 text-slate-950' : 'border-white/30'}`}>
                  {vipAddon && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">ভিআইপি এয়ারপোর্ট ফাস্ট-ট্র্যাক ও হেলিকপ্টার ট্রান্সফার সুবিধা</div>
                  <div className="text-[11px] text-slate-400">প্রাইভেট এয়ারপোর্ট লাউঞ্জ পাস ও বিলাসবহুল গাড়ি আপগ্রেড অন্তর্ভুক্ত</div>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-300 shrink-0">+$১২০.০০</span>
            </div>

            {/* Price Breakdown Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/15 via-cyan-500/10 to-transparent border border-white/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 block">মোট প্যাকেজ খরচ</span>
                <span className="text-3xl font-black text-white font-['Outfit',sans-serif]">
                  ${totalPrice}
                </span>
                <span className="text-[11px] text-teal-300 block">বিলাসবহুল হোটেল, পরিবহন ও সমস্ত পারমিট অন্তর্ভুক্ত</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">${pkg.price} × {guestsCount} জন</span>
                {vipAddon && <span className="text-xs text-teal-300 block">+ $১২০ ভিআইপি আপগ্রেড</span>}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full py-3.5 px-6 rounded-2xl
                  bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-300
                  hover:from-teal-300 hover:to-cyan-200
                  text-slate-950 font-bold text-sm tracking-wide
                  shadow-[0_8px_30px_rgba(20,184,166,0.6)]
                  flex items-center justify-center gap-2
                  transition-all transform active:scale-95
                  cursor-pointer
                "
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                <span>{isSubmitting ? 'বুকিং নিশ্চিত করা হচ্ছে...' : 'বুকিং নিশ্চিত করুন'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="mt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ভ্রমণের ১৪ দিন পূর্ব পর্যন্ত কোনো প্রকার বাতিলকরণ ফি নেই</span>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
