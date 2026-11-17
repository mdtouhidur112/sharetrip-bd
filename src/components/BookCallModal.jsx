import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  PhoneCall, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles, 
  User, 
  Mail, 
  Globe 
} from 'lucide-react';

export const BookCallModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [destinationPreference, setDestinationPreference] = useState('Any featured destination');
  const [preferredTime, setPreferredTime] = useState('Morning (9 AM - 12 PM)');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-xl">
      
      {/* Liquid Glass Dialog Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(8px)' }}
        transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
        className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/30 shadow-[0_20px_60px_rgba(15,23,42,0.3)] dark:shadow-2xl my-8 text-white"
      >
        
        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 backdrop-blur-lg transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Dialog Header */}
        <div className="p-6 sm:p-8 border-b border-white/15 dark:border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#69EBDA]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[#69EBDA] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Free 1-on-1 Consultation
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
            Book a Call with a Travel Specialist
          </h2>
          <p className="mt-2 text-slate-100 dark:text-slate-300 text-xs sm:text-sm font-medium">
            Speak directly with our premier travel specialists to design your dream itinerary with no obligations.
          </p>
        </div>

        {/* Form Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 border border-teal-500 text-[#69EBDA] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(105,235,218,0.5)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-white font-['Outfit',sans-serif]">
              Your consultation booking is confirmed!
            </h3>
            <p className="text-slate-100 dark:text-slate-300 text-sm max-w-xs mx-auto font-medium">
              Our lead travel specialist will be in touch shortly. Please check your email for the calendar invitation and further details.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            <div>
              <label className="text-xs font-extrabold text-slate-200 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Full Name
              </label>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 dark:border-white/15 focus-within:border-[#69EBDA] focus-within:bg-slate-800/70 transition-colors">
                <User className="w-4 h-4 text-[#69EBDA]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-sm text-white font-medium placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-200 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 dark:border-white/15 focus-within:border-[#69EBDA] focus-within:bg-slate-800/70 transition-colors">
                <Mail className="w-4 h-4 text-[#69EBDA]" />
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm text-white font-medium placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-200 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Preferred Destination
                </label>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 dark:border-white/15">
                  <Globe className="w-4 h-4 text-[#69EBDA]" />
                  <select
                    value={destinationPreference}
                    onChange={(e) => setDestinationPreference(e.target.value)}
                    className="w-full bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="Any featured destination" className="bg-slate-900 text-white">Any featured destination</option>
                    <option value="Bali & Indonesia" className="bg-slate-900 text-white">Bali & Indonesia</option>
                    <option value="Peru & The Andes" className="bg-slate-900 text-white">Peru & The Andes</option>
                    <option value="Amalfi Coast, Italy" className="bg-slate-900 text-white">Amalfi Coast, Italy</option>
                    <option value="Kyoto & Japan" className="bg-slate-900 text-white">Kyoto & Japan</option>
                    <option value="Swiss Alps" className="bg-slate-900 text-white">Swiss Alps</option>
                    <option value="Santorini & Cyclades" className="bg-slate-900 text-white">Santorini & Cyclades</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-200 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                  Preferred Time Slot
                </label>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 dark:border-white/15">
                  <Clock className="w-4 h-4 text-[#69EBDA]" />
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="Morning (9 AM - 12 PM)" className="bg-slate-900 text-white">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (1 PM - 5 PM)" className="bg-slate-900 text-white">Afternoon (1 PM - 5 PM)</option>
                    <option value="Evening (6 PM - 9 PM)" className="bg-slate-900 text-white">Evening (6 PM - 9 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                className="
                  w-full py-3.5 px-6 rounded-2xl
                  bg-gradient-to-r from-[#69EBDA] via-teal-300 to-cyan-400
                  hover:from-[#69EBDA]/90 hover:to-cyan-300
                  text-slate-950 font-black text-sm tracking-wide
                  shadow-[0_6px_25px_rgba(105,235,218,0.5)]
                  flex items-center justify-center gap-2
                  transition-all
                  cursor-pointer
                "
              >
                <PhoneCall className="w-4 h-4" />
                Schedule Free Call
              </motion.button>
            </div>
          </form>
        )}

      </motion.div>
    </div>
  );
};
