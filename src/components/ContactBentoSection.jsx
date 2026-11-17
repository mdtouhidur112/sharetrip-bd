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
  const [secText, setSecText] = useState(() => StorageService.getSectionSettings().contactSection);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setContactInfo(StorageService.getContactInfo());
    };
    const syncSection = () => {
      setSecText(StorageService.getSectionSettings().contactSection);
    };
    window.addEventListener('app:contact-info-updated', handleUpdate);
    window.addEventListener('app:section-settings-updated', syncSection);
    return () => {
      window.removeEventListener('app:contact-info-updated', handleUpdate);
      window.removeEventListener('app:section-settings-updated', syncSection);
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
      'Hello Etheria Travels, I would like to speak directly with a consultant regarding tour reservations and travel planning.'
    );
    window.open(`https://wa.me/${rawWa}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="contact-info" className="relative py-[5px] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-1/2 left-1/3 w-[650px] h-[350px] bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-transparent blur-[140px] pointer-events-none" />

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
                Headquarters
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 font-['Outfit',sans-serif]">
              Office Address & Lounge
            </h3>
            <p className="text-sm text-slate-100 leading-relaxed max-w-lg mb-6 font-medium">
              {contactInfo.address?.primary}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/15 text-xs text-slate-200 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-[#69EBDA] shrink-0" />
              <span>North America Partner Lounge: {contactInfo.address?.satellite}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
            <span className="text-xs text-slate-300">Valet parking & VIP private lounge available</span>
            <a
              href={contactInfo.address?.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#69EBDA] hover:underline flex items-center gap-1 group"
            >
              <span>View on Map</span>
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
                Open Mon–Sat
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 font-['Outfit',sans-serif]">
              Office Hours
            </h3>
            
            <div className="space-y-2 mt-4 text-xs sm:text-sm text-slate-200">
              <div className="flex justify-between pb-2 border-b border-white/15">
                <span className="text-slate-300">Monday – Friday:</span>
                <span className="font-semibold text-white">08:00 AM – 09:00 PM</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/15">
                <span className="text-slate-300">Saturday:</span>
                <span className="font-semibold text-white">09:00 AM – 06:00 PM</span>
              </div>
              <div className="flex justify-between text-[#69EBDA] pt-1 font-semibold">
                <span>Sunday:</span>
                <span className="font-bold">By Appointment Only</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/15 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>24/7 Emergency Travel Assistance Desk Available</span>
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
            WhatsApp Support
          </h4>
          <p className="text-xs text-slate-200 mb-4 font-medium">
            Direct instant chat with certified travel architects.
          </p>
          <div className="text-sm font-mono font-bold text-emerald-300">
            +1 (800) 555-0199
          </div>
          <span className="text-[11px] text-slate-300 mt-1 block font-medium">Typically replies within 2 minutes</span>
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
                title="Copy Email"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <h4 className="text-lg font-extrabold text-white mb-1 font-['Outfit',sans-serif]">
              Email & Concierge Desk
            </h4>
            <p className="text-xs text-slate-200 mb-4 font-medium">
              For official travel planning, press & partner inquiries.
            </p>
          </div>

          <div>
            <a 
              href={`mailto:${contactInfo.email?.concierge}`}
              className="text-xs sm:text-sm font-bold text-[#69EBDA] hover:underline truncate block"
            >
              {contactInfo.email?.concierge}
            </a>
            <span className="text-[11px] text-slate-300 block mt-1 font-medium">Direct to senior architects' inbox</span>
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
                Hotline
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-white mb-1 font-['Outfit',sans-serif]">
              Telephone Inquiries
            </h4>
            <p className="text-xs text-slate-200 mb-4 font-medium">
              Direct voice support for priority reservations.
            </p>
          </div>

          <div>
            <a
              href={`tel:${contactInfo.phone?.hotline}`}
              className="text-sm font-bold text-white hover:text-[#69EBDA] transition-colors block"
            >
              {contactInfo.phone?.hotline}
            </a>
            <span className="text-[11px] text-slate-300 block mt-0.5 font-medium">Toll-Free: {contactInfo.phone?.tollFree}</span>
          </div>
        </div>

        {/* Bento 6: Quick Digital Consultation Message Form (Full 12 Cols) */}
        <div className="md:col-span-12 p-8 sm:p-10 rounded-3xl bg-[#5C6977]/85 dark:bg-slate-900/50 backdrop-blur-2xl border border-[#69EBDA]/35 dark:border-white/20 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            <div className="max-w-md">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[#69EBDA] inline-block mb-3">
                Send Direct Message
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
                Plan with a Travel Architect
              </h3>
              <p className="mt-2 text-slate-100 text-sm leading-relaxed font-medium">
                Send us your preferred destination and tentative timeline. Our expert team will craft the perfect bespoke itinerary for you.
              </p>
              
              <div className="mt-6 flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={onOpenBookCall}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors"
                >
                  Schedule a Private Video Call &rarr;
                </motion.button>
              </div>
            </div>

            {/* Quick Message Form */}
            {formSent ? (
              <div className="w-full lg:max-w-xl p-8 rounded-2xl bg-[#69EBDA]/15 border border-[#69EBDA]/40 text-center space-y-2">
                <Check className="w-8 h-8 text-[#69EBDA] mx-auto" />
                <h4 className="text-lg font-extrabold text-white">Message Sent Successfully!</h4>
                <p className="text-xs text-slate-200 font-medium">
                  Thank you! One of our representatives will contact you within 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="w-full lg:max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-800/45 border border-white/20 text-xs text-white placeholder:text-slate-300 font-bold focus:outline-none focus:border-[#69EBDA]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Your Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-800/45 border border-white/20 text-xs text-white placeholder:text-slate-300 font-bold focus:outline-none focus:border-[#69EBDA]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <textarea
                    rows={2}
                    required
                    placeholder="Preferred destination, tentative travel dates, or group size..."
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
                    <span>Send Message to Concierge</span>
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
