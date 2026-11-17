import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sun, Moon, Monitor, Globe, Check, Palette, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { openPopup } from '../utils/popupManager';

export const GuestSettingsPopover = ({ className = '' }) => {
  const { themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const themeOptions = [
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'system', label: 'System Theme', icon: Monitor },
  ];

  const languageOptions = [
    { code: 'bn', label: 'Bengali', flag: '🇧🇩' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  // Listen to global popup manager to close if another popup opens
  useEffect(() => {
    const handleOtherPopupOpened = (e) => {
      if (e.detail !== 'guest-settings') {
        setIsOpen(false);
      }
    };
    window.addEventListener('app:open-popup', handleOtherPopupOpened);
    return () => window.removeEventListener('app:open-popup', handleOtherPopupOpened);
  }, []);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      openPopup('guest-settings');
    }
  };

  return (
    <div className={`sm:relative inline-block ${className}`} ref={popoverRef}>
      {/* Settings Icon Trigger Button */}
      <motion.button
        type="button"
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        className={`
          relative flex items-center justify-center
          w-8 h-8 sm:w-9 sm:h-9 rounded-2xl
          bg-slate-800/60 dark:bg-slate-900/70
          hover:bg-slate-800 dark:hover:bg-slate-900
          border transition-all duration-300 shadow-md cursor-pointer focus:outline-none
          ${isOpen
            ? 'border-[#69EBDA] ring-2 ring-[#69EBDA]/30 shadow-[0_0_15px_rgba(105,235,218,0.4)]'
            : 'border-[#69EBDA]/40 dark:border-white/20 hover:border-[#69EBDA]'
          }
        `}
        aria-label="Settings"
        title="Settings (Theme & Language)"
      >
        <Settings 
          className={`w-4 h-4 text-[#69EBDA] transition-transform duration-500 ease-out ${
            isOpen ? 'rotate-90' : 'group-hover:rotate-45'
          }`} 
        />
      </motion.button>

      {/* Pop-up Box containing Theme & Language Controls */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop for easy dismissal and focus on mobile center */}
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 sm:hidden" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
              className="
                absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2
                sm:top-[calc(100%+4px)] sm:left-auto sm:right-0 sm:translate-x-0
                z-50 w-[calc(100vw-32px)] sm:w-64 max-w-sm p-4 sm:p-3 rounded-3xl
                bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl
                border border-[#69EBDA]/40 dark:border-white/25
                shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white space-y-3
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/15">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5 font-['Outfit',sans-serif]">
                  <Settings className="w-3.5 h-3.5 text-[#69EBDA]" />
                  <span>Quick Preferences</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#69EBDA] tracking-wider px-2 py-0.5 rounded-full bg-[#69EBDA]/15 border border-[#69EBDA]/30">
                    Guest
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="sm:hidden p-1 rounded-lg text-slate-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 1. Theme Change Option (Icons Only) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#69EBDA]" />
                    <span>Theme Mode</span>
                  </span>
                  <span className="text-[10px] text-[#69EBDA] capitalize">
                    {themeMode}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-900/50 dark:bg-slate-950/50 border border-white/10">
                  {themeOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = themeMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setThemeMode(opt.id)}
                        className={`
                          relative py-2 rounded-xl transition-all duration-200
                          flex items-center justify-center cursor-pointer
                          ${isSelected
                            ? 'bg-gradient-to-r from-[#69EBDA] to-teal-300 text-slate-950 shadow-md shadow-[#69EBDA]/35 font-bold'
                            : 'text-slate-200 hover:text-white hover:bg-white/10'
                          }
                        `}
                        title={opt.label}
                        aria-label={opt.label}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Language Change Option (Bangla & English) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#69EBDA]" />
                    <span>Language</span>
                  </span>
                  <span className="text-[10px] text-[#69EBDA]">
                    {language === 'en' ? 'English' : 'Bengali'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-900/50 dark:bg-slate-950/50 border border-white/10">
                  {languageOptions.map((item) => {
                    const isSelected = language === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => setLanguage(item.code)}
                        className={`
                          flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                          ${isSelected
                            ? 'bg-gradient-to-r from-[#69EBDA] to-teal-300 text-slate-950 shadow-md shadow-[#69EBDA]/35'
                            : 'text-slate-100 hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
