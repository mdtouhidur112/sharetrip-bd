import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  X, 
  Sparkles, 
  KeyRound, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { AdminAuthService } from '../../services/adminAuthService';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('ইউজারনেম এবং পাসওয়ার্ড উভয় ফিল্ড পূরণ করুন।');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await AdminAuthService.login(username, password);
      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess(result.admin);
        }
      } else {
        setErrorMessage(result.message || 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়।');
      }
    } catch (err) {
      setErrorMessage('লগইন করার সময় একটি ত্রুটি ঘটেছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop with Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="
            relative w-full max-w-md my-8
            rounded-3xl p-6 sm:p-8
            bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl
            border border-[#69EBDA]/40 dark:border-white/20
            shadow-[0_25px_60px_rgba(0,0,0,0.6)]
            text-white z-10 overflow-hidden
          "
        >
          {/* Ambient Corner Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#69EBDA]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#69EBDA] to-cyan-400 p-[1px] shadow-lg shadow-[#69EBDA]/30 mb-3">
              <div className="w-full h-full bg-slate-950/80 rounded-[15px] flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="w-7 h-7 text-[#69EBDA]" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-[#69EBDA]/25 blur-sm" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#69EBDA]/15 text-[#69EBDA] text-[10px] font-extrabold uppercase tracking-widest border border-[#69EBDA]/30 mb-1.5">
              <KeyRound className="w-3 h-3" />
              <span>Admin Gateway Access</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
              অ্যাডমিন পোর্টাল লগইন
            </h2>
            <p className="mt-1 text-slate-200 text-xs sm:text-sm">
              এথেরিয়া ট্রাভেল ম্যানেজমেন্ট সিস্টেমের অ্যাডমিন প্যানেলে প্রবেশ করুন
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                ইউজারনেম (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="ইউজারনেম দিন (e.g. admin)"
                  className="
                    w-full pl-10 pr-4 py-2.5 rounded-xl
                    bg-slate-900/60 dark:bg-slate-950/60
                    border border-[#69EBDA]/30 dark:border-white/15
                    focus:border-[#69EBDA] focus:ring-2 focus:ring-[#69EBDA]/30
                    text-white placeholder:text-slate-400 text-sm font-medium
                    outline-none transition-all
                  "
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="পাসওয়ার্ড দিন (e.g. admin123)"
                  className="
                    w-full pl-10 pr-11 py-2.5 rounded-xl
                    bg-slate-900/60 dark:bg-slate-950/60
                    border border-[#69EBDA]/30 dark:border-white/15
                    focus:border-[#69EBDA] focus:ring-2 focus:ring-[#69EBDA]/30
                    text-white placeholder:text-slate-400 text-sm font-medium
                    outline-none transition-all
                  "
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full mt-2 py-3 px-4 rounded-xl
                bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400
                hover:from-[#69EBDA] hover:to-cyan-300
                text-slate-950 font-black text-sm tracking-wide
                shadow-[0_4px_20px_rgba(105,235,218,0.5)]
                flex items-center justify-center gap-2
                transform hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-200 cursor-pointer disabled:opacity-60
              "
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>লগইন করুন (Login)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
