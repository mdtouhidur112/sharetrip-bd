import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { openPopup } from '../utils/popupManager';

export const ThemeSwitcher = ({ className = '' }) => {
  const { themeMode, effectiveTheme, setThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  const options = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'System',
      icon: Monitor,
    },
  ];

  // Close popup if another popup opens
  useEffect(() => {
    const handleOtherPopupOpened = (e) => {
      if (e.detail !== 'theme-switcher') {
        setIsOpen(false);
      }
    };
    window.addEventListener('app:open-popup', handleOtherPopupOpened);
    return () => window.removeEventListener('app:open-popup', handleOtherPopupOpened);
  }, []);

  // Close popup when clicking outside
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
      openPopup('theme-switcher');
    }
  };

  // Determine current active icon for trigger button
  const currentOption = options.find((opt) => opt.id === themeMode) || options[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Trigger Button showing only the active theme icon */}
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
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
        aria-label="Theme switcher"
        title="Switch theme"
      >
        <CurrentIcon className="w-4 h-4 text-[#69EBDA] transition-transform duration-300" />
      </motion.button>

      {/* Theme Popup Box: ONLY icons inside (Opens 4px directly below button) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -4 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="
              absolute top-[calc(100%+4px)] right-0
              z-50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl
              bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl
              border border-[#69EBDA]/40 dark:border-white/25
              shadow-2xl flex items-center gap-0.5 sm:gap-1 text-white
              max-h-[50vh] overflow-x-auto custom-scrollbar
            "
          >
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = themeMode === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThemeMode(option.id);
                    setIsOpen(false);
                  }}
                  className={`
                    relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200
                    flex items-center justify-center cursor-pointer
                    ${isSelected
                      ? 'bg-gradient-to-r from-[#69EBDA] to-teal-300 text-slate-950 shadow-md shadow-[#69EBDA]/35 font-bold'
                      : 'text-slate-200 dark:text-slate-300 hover:text-white hover:bg-white/15'
                    }
                  `}
                  aria-label={option.label}
                  title={option.label}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
