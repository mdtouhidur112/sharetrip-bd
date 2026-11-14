import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  ArrowUpRight, 
  Send, 
  Copy, 
  Check, 
  Globe, 
  Building2,
  ShieldCheck
} from 'lucide-react';
import { StorageService } from '../services/storageService';

export const ContactBentoSection = ({ onOpenBookCall }) => {
  const [contactInfo, setContactInfo] = useState(() => StorageService.getContactInfo());
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setContactInfo(StorageService.getContactInfo());
    };
    window.addEventListener('app:contact-info-updated', handleUpdate);
    return () => {
      window.removeEventListener('app:contact-info-updated', handleUpdate);
    };
  }, []);

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 3000);
  };

  const handleWhatsApp = () => {
    const rawWa = (contactInfo?.whatsapp || '').replace(/[^0-9]/g, '');
    if (!rawWa) return;
    const text = encodeURIComponent(
      'হ্যালো এথেরিয়া ট্রাভেলস, আমি ট্যুর রিজার্ভেশন এবং ভ্রমণ পরিকল্পনা সম্পর্কে একজন পরামর্শকের সাথে সরাসরি কথা বলতে চাই।'
    );
    window.open(`https://wa.me/${rawWa}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="contact-info" className="relative py-[5px] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-1/2 left-1/3 w-[650px] h-[350px] bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-transparent blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/25 border border-[#69EBDA]/45 backdrop-blur-md mb-4 text-xs font-bold tracking-wider text-teal-950 dark:text-[#69EBDA] uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          সরাসরি যোগাযোগ
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif]">
          যোগাযোগ ও অফিসের ঠিকানা
        </h2>
        <p className="mt-3 text-black/70 dark:text-slate-300 text-sm sm:text-base font-medium">
          ঢাকা বা নিউইয়র্কে আমাদের ট্রাভেল স্থপতিদের সাথে সরাসরি যোগাযোগ করুন অথবা ২৪/৭ হেল্পডেস্কে কথা বলুন।
        </p>
      </div>

      {/* Contact Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 text-white">
        
        {/* Bento 1: Primary Office Address (7 Cols) */}
        <div className="md:col-span-7 p-7 sm:p-8 rounded-3xl bg-[#5C6977]/85 dark:bg-slate-900/50 backdrop-blur-2xl border border-[#69EBDA]/35 dark:border-white/20 shadow-[0_10px_30px_rgba(15,23,42,0.18)] flex flex-col justify-between hover:border-[#69EBDA] transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-white/20 text-[#69EBDA] flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[#69EBDA]">
                প্রধান কার্যালয়
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 font-['Outfit',sans-serif]">
              অফিসের ঠিকানা ও লাউঞ্জ
            </h3>
            <p className="text-sm text-slate-100 leading-relaxed max-w-lg mb-6 font-medium">
              {contactInfo.address?.primary}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/15 text-xs text-slate-200 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-[#69EBDA] shrink-0" />
              <span>উত্তর আমেরিকা পার্টনার লাউঞ্জ: {contactInfo.address?.satellite}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
            <span className="text-xs text-slate-300">ভ্যালেট পার্কিং ও ভিআইপি প্রাইভেট লাউঞ্জ সুবিধা উপলব্ধ</span>
            <a
              href={contactInfo.address?.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#69EBDA] hover:underline flex items-center gap-1 group"
            >
              <span>ম্যাপে দেখুন</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Bento 2: Office Hours & 24/7 Availability (5 Cols) */}
        <div className="md:col-span-5 p-7 sm:p-8 rounded-3xl bg-[#5C6977]/85 dark:bg-slate-900/50 backdrop-blur-2xl border border-[#69EBDA]/35 dark:border-white/20 shadow-[0_10px_30px_rgba(15,23,42,0.18)] flex flex-col justify-between hover:border-[#69EBDA] transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-white/20 text-[#69EBDA] flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[#69EBDA]">
                সোম–শনিবার খোলা
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 font-['Outfit',sans-serif]">
              অফিস সময়সূচী
            </h3>
            
            <div className="space-y-2 mt-4 text-xs sm:text-sm text-slate-200">
              <div className="flex justify-between pb-2 border-b border-white/15">
                <span className="text-slate-300">সোমবার – শুক্রবার:</span>
                <span className="font-semibold text-white">সকাল ০৮:০০ – রাত ০৯:০০</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/15">
                <span className="text-slate-300">শনিবার:</span>
                <span className="font-semibold text-white">সকাল ০৯:০০ – সন্ধ্যা ০৬:০০</span>
              </div>
              <div className="flex justify-between text-[#69EBDA] pt-1 font-semibold">
                <span>রবিবার:</span>
                <span className="font-bold">শুধুমাত্র অ্যাপয়েন্টমেন্ট সাপেক্ষে</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/15 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>২৪/৭ জরুরি ভ্রমণ সহায়তা ডেস্ক সার্বক্ষণিক সচল</span>
          </div>
        </div>

        {/* Bento 3: WhatsApp Support (4 Cols) */}
        <div 
          onClick={handleWhatsApp}
          className="md:col-span-4 p-6 sm:p-7 rounded-3xl bg-[#5C6977]/85 hover:bg-[#5C6977] backdrop-blur-2xl border border-[#69EBDA]/35 hover:border-[#69EBDA] shadow-[0_10px_30px_rgba(15,23,42,0.18)] cursor-pointer transition-all duration-300 group transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

          <h4 className="text-lg font-extrabold text-white mb-1 font-['Outfit',sans-serif]">
            হোয়াটসঅ্যাপ সাপোর্ট
          </h4>
          <p className="text-xs text-slate-200 mb-4 font-medium">
            সার্টিফায়েড ট্রাভেল আর্কিটেক্টের সাথে সরাসরি ইনস্ট্যান্ট চ্যাট।
          </p>
          <div className="text-sm font-mono font-bold text-emerald-300">
            +১ (৮০০) ৫৫৫-০১৯৯
          </div>
          <span className="text-[11px] text-slate-300 mt-1 block font-medium">সাধারণত ২ মিনিটের মধ্যে রিপ্লাই দেওয়া হয়</span>
        </div>

        {/* Bento 4: Gmail & Official Inquiries (4 Cols) */}
        <div className="md:col-span-4 p-6 sm:p-7 rounded-3xl bg-[#5C6977]/85 dark:bg-slate-900/50 backdrop-blur-2xl border border-[#69EBDA]/35 dark:border-white/20 shadow-[0_10px_30px_rgba(15,23,42,0.18)] hover:border-[#69EBDA] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-slate-800/50 border border-white/20 text-[#69EBDA] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <button
                onClick={() => copyToClipboard(contactInfo.email?.concierge)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="ইমেইল কপি করুন"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <h4 className="text-lg font-extrabold text-white mb-1 font-['Outfit',sans-serif]">
              জিমেইল ও কনসিয়ার্জ ডেস্ক
            </h4>
            <p className="text-xs text-slate-200 mb-4 font-medium">
              অফিসিয়াল ভ্রমণ পরিকল্পনা, প্রেস ও পার্টনার অনুসন্ধানের জন্য।
            </p>
          </div>

          <div>
            <a 
              href={`mailto:${contactInfo.email?.concierge}`}
              className="text-xs sm:text-sm font-bold text-[#69EBDA] hover:underline truncate block"
            >
              {contactInfo.email?.concierge}
            </a>
            <span className="text-[11px] text-slate-300 block mt-1 font-medium">সরাসরি সিনিয়র আর্কিটেক্টদের ইনবক্স</span>
          </div>
        </div>

        {/* Bento 5: Phone Hotline (4 Cols) */}
        <div className="md:col-span-4 p-6 sm:p-7 rounded-3xl bg-[#5C6977]/85 dark:bg-slate-900/50 backdrop-blur-2xl border border-[#69EBDA]/35 dark:border-white/20 shadow-[0_10px_30px_rgba(15,23,42,0.18)] hover:border-[#69EBDA] transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-slate-800/50 border border-white/20 text-[#69EBDA] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#69EBDA] px-2 py-0.5 rounded-lg bg-teal-500/20 border border-teal-500/30">
                হটলাইন
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-white mb-1 font-['Outfit',sans-serif]">
              টেলিফোন অনুসন্ধান
            </h4>
            <p className="text-xs text-slate-200 mb-4 font-medium">
              অগ্রাধিকারমূলক রিজার্ভেশনের জন্য সরাসরি ভয়েস সহায়তা।
            </p>
          </div>

          <div>
            <a
              href={`tel:${contactInfo.phone?.hotline}`}
              className="text-sm font-bold text-white hover:text-[#69EBDA] transition-colors block"
            >
              {contactInfo.phone?.hotline}
            </a>
            <span className="text-[11px] text-slate-300 block mt-0.5 font-medium">টোল-ফ্রি: {contactInfo.phone?.tollFree}</span>
          </div>
        </div>

        {/* Bento 6: Quick Digital Consultation Message Form (Full 12 Cols) */}
        <div className="md:col-span-12 p-8 sm:p-10 rounded-3xl bg-[#5C6977]/85 dark:bg-slate-900/50 backdrop-blur-2xl border border-[#69EBDA]/35 dark:border-white/20 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            <div className="max-w-md">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[#69EBDA] inline-block mb-3">
                সরাসরি বার্তা পাঠান
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
                ট্রাভেল স্থপতির সাথে পরিকল্পনা করুন
              </h3>
              <p className="mt-2 text-slate-100 text-sm leading-relaxed font-medium">
                আপনার পছন্দের গন্তব্য ও সম্ভাব্য সময় জানিয়ে বার্তা দিন। আমাদের বিশেষজ্ঞ দল আপনার জন্য সেরা পরিকল্পনা সাজিয়ে দেবে।
              </p>
              
              <div className="mt-6 flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={onOpenBookCall}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors"
                >
                  প্রাইভেট ভিডিও কল শিডিউল করুন &rarr;
                </motion.button>
              </div>
            </div>

            {/* Quick Message Form */}
            {formSent ? (
              <div className="w-full lg:max-w-xl p-8 rounded-2xl bg-[#69EBDA]/15 border border-[#69EBDA]/40 text-center space-y-2">
                <Check className="w-8 h-8 text-[#69EBDA] mx-auto" />
                <h4 className="text-lg font-extrabold text-white">বার্তা সফলভাবে পাঠানো হয়েছে!</h4>
                <p className="text-xs text-slate-200 font-medium">
                  ধন্যবাদ! আমাদের একজন প্রতিনিধি ১৫ মিনিটের মধ্যে আপনার সাথে যোগাযোগ করবেন।
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="w-full lg:max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="আপনার নাম *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-800/45 border border-white/20 text-xs text-white placeholder:text-slate-300 font-bold focus:outline-none focus:border-[#69EBDA]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="আপনার ইমেইল ঠিকানা *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-800/45 border border-white/20 text-xs text-white placeholder:text-slate-300 font-bold focus:outline-none focus:border-[#69EBDA]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <textarea
                    rows={2}
                    required
                    placeholder="পছন্দের গন্তব্য, সম্ভাব্য ভ্রমণের মাস বা যাত্রীর সংখ্যা..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-800/45 border border-white/20 text-xs text-white placeholder:text-slate-300 font-bold focus:outline-none focus:border-[#69EBDA] resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="
                      w-full py-3.5 px-6 rounded-2xl
                      bg-gradient-to-r from-[#69EBDA] via-teal-300 to-cyan-400
                      hover:from-[#69EBDA]/90 hover:to-cyan-300
                      text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide
                      shadow-lg shadow-[#69EBDA]/30
                      flex items-center justify-center gap-2
                      transition-all cursor-pointer
                    "
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>কনসিয়ার্জকে বার্তা পাঠান</span>
                  </motion.button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};
