import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { openPopup } from '../utils/popupManager';

export const LanguageSelector = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const languages = [
    {
      code: 'bn',
      label: 'Bengali',
      englishLabel: 'Bengali',
      flag: '🇧🇩',
      badge: 'BN'
    },
    {
      code: 'en',
      label: 'English',
      englishLabel: 'English',
      flag: '🇬🇧',
      badge: 'EN'
    }
  ];

  // Close popup if another popup opens
  useEffect(() => {
    const handleOtherPopupOpened = (e) => {
      if (e.detail !== 'language-selector') {
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
      openPopup('language-selector');
    }
  };

  const currentLang = languages.find((l) => l.code === language) || languages.find((l) => l.code === 'en') || languages[0];

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        className={`
          relative flex items-center gap-1.5
          h-8 sm:h-9 px-2.5 sm:px-3 rounded-2xl
          bg-slate-800/60 dark:bg-slate-900/70
          hover:bg-slate-800 dark:hover:bg-slate-900
          border text-white text-xs font-bold transition-all duration-300 shadow-md cursor-pointer focus:outline-none
          ${isOpen
            ? 'border-[#69EBDA] ring-2 ring-[#69EBDA]/30 shadow-[0_0_15px_rgba(105,235,218,0.4)]'
            : 'border-[#69EBDA]/40 dark:border-white/20 hover:border-[#69EBDA]'
          }
        `}
        aria-label="Select language"
        title="Switch Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#69EBDA]" />
        <span className="tracking-wide font-extrabold">{currentLang.badge}</span>
        <ChevronDown className={`w-3 h-3 text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Language Select Pop-up Box (Opens 4px directly below button) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="
              absolute top-[calc(100%+4px)] right-0
              z-50 w-28 xs:w-32 sm:w-36 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl
              bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl
              border border-[#69EBDA]/40 dark:border-white/25
              shadow-2xl space-y-0.5 sm:space-y-1 text-white
              max-h-[50vh] sm:max-h-[60vh] overflow-y-auto overscroll-contain custom-scrollbar
            "
          >
            {languages.map((item) => {
              const isSelected = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage(item.code);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer
                    ${isSelected
                      ? 'bg-gradient-to-r from-[#69EBDA] to-teal-300 text-slate-950 shadow-md shadow-[#69EBDA]/30'
                      : 'text-slate-100 dark:text-slate-200 hover:bg-white/15 hover:text-white'
                    }
                  `}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm">{item.flag}</span>
                    <span>{item.label}</span>
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
