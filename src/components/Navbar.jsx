import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  PhoneCall, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Briefcase, 
  Heart, 
  Settings, 
  LogOut, 
  LogIn, 
  MessageSquare,
  Shield,
  Sun,
  Moon,
  Monitor,
  Globe,
  Check,
  Palette
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSelector } from './LanguageSelector';
import { SyncStatusBadge } from './SyncStatusBadge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { StorageService } from '../services/storageService';
import { openPopup } from '../utils/popupManager';

const NAVBAR_LINKS = [
  { name: 'Home', href: '#home' },
  { name: 'Destination', href: '#destinations' },
  { name: 'Services', href: '#services' },
  { name: 'Reviews', href: '#reviews' },
  { name: 'Contact', href: '#contact-info' },
  { name: 'About', href: '#about' }
];

export const Navbar = ({ 
  onOpenBookCall, 
  onNavigateHome, 
  onOpenAdmin,
  isAdminMode = false 
}) => {
  const { 
    user, 
    wishlist, 
    openAuthModal, 
    openUserModal, 
    logout 
  } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [guestSettingsOpen, setGuestSettingsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('Home');
  const [usersVersion, setUsersVersion] = useState(0);

  // Live Dynamic Branding State
  const [branding, setBranding] = useState(() => StorageService.getBranding());

  useEffect(() => {
    const handleUsersSync = () => setUsersVersion(v => v + 1);
    const handleBrandingSync = () => setBranding(StorageService.getBranding());

    window.addEventListener('app:users-updated', handleUsersSync);
    window.addEventListener('app:branding-updated', handleBrandingSync);

    return () => {
      window.removeEventListener('app:users-updated', handleUsersSync);
      window.removeEventListener('app:branding-updated', handleBrandingSync);
    };
  }, []);

  const dropdownRef = useRef(null);
  const mobileProfileRef = useRef(null);
  const settingsRef = useRef(null);
  const mobileSettingsRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const themeOptions = [
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'system', label: 'System Theme', icon: Monitor },
  ];

  const languageOptions = [
    { code: 'bn', label: 'Bengali', flag: '🇧🇩' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const handleLinkClick = (linkName, href) => {
    setActiveLink(linkName);
    if (onNavigateHome) {
      onNavigateHome(href);
    }
  };

  // Listen to global popup manager: auto-close if another popup opens
  useEffect(() => {
    const handleOtherPopupOpened = (e) => {
      // Do not close profile dropdown if theme-switcher inside it was opened
      if (e.detail !== 'navbar-profile' && e.detail !== 'theme-switcher') {
        setProfileDropdownOpen(false);
      }
      // Do not close mobile navigation menu if language-selector inside it was opened
      if (e.detail !== 'navbar-mobile-menu' && e.detail !== 'language-selector') {
        setMobileMenuOpen(false);
      }
      if (e.detail !== 'guest-settings') {
        setGuestSettingsOpen(false);
      }
    };
    window.addEventListener('app:open-popup', handleOtherPopupOpened);
    return () => window.removeEventListener('app:open-popup', handleOtherPopupOpened);
  }, []);

  const handleToggleProfile = () => {
    const nextState = !profileDropdownOpen;
    setProfileDropdownOpen(nextState);
    if (nextState) {
      setMobileMenuOpen(false);
      setGuestSettingsOpen(false);
      openPopup('navbar-profile');
    }
  };

  const handleToggleMobileMenu = () => {
    const nextState = !mobileMenuOpen;
    setMobileMenuOpen(nextState);
    if (nextState) {
      setProfileDropdownOpen(false);
      setGuestSettingsOpen(false);
      openPopup('navbar-mobile-menu');
    }
  };

  const handleToggleGuestSettings = () => {
    const nextState = !guestSettingsOpen;
    setGuestSettingsOpen(nextState);
    if (nextState) {
      setMobileMenuOpen(false);
      setProfileDropdownOpen(false);
      openPopup('guest-settings');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      // Profile dropdown outside check (covers both desktop dropdown and mobile popup)
      const isInsideProfile = 
        (dropdownRef.current && dropdownRef.current.contains(e.target)) ||
        (mobileProfileRef.current && mobileProfileRef.current.contains(e.target));
      if (!isInsideProfile) {
        setProfileDropdownOpen(false);
      }

      // Guest settings outside check (covers both desktop dropdown and mobile popup)
      const isInsideSettings = 
        (settingsRef.current && settingsRef.current.contains(e.target)) ||
        (mobileSettingsRef.current && mobileSettingsRef.current.contains(e.target));
      if (!isInsideSettings) {
        setGuestSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // -------------------------------------------------------------
  // Content Renderers (Shared between Desktop & Mobile Views)
  // -------------------------------------------------------------
  const renderQuickPreferencesContent = (isMobile = false) => (
    <div className="space-y-2 sm:space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-white/15">
        <span className="text-[11px] sm:text-xs font-extrabold text-white flex items-center gap-1.5 font-['Outfit',sans-serif]">
          <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#69EBDA]" />
          <span>Quick Preferences</span>
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#69EBDA] tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-[#69EBDA]/15 border border-[#69EBDA]/30">
            Guest
          </span>
          {isMobile && (
            <button
              type="button"
              onClick={() => setGuestSettingsOpen(false)}
              className="p-1 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close preferences"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Theme Change Option (Icons Only) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-200">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#69EBDA]" />
            <span>Theme Mode</span>
          </span>
          <span className="text-[9px] sm:text-[10px] text-[#69EBDA] capitalize">
            {themeMode}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl sm:rounded-2xl bg-slate-900/50 dark:bg-slate-950/50 border border-white/10">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = themeMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setThemeMode(opt.id)}
                className={`
                  relative py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200
                  flex items-center justify-center cursor-pointer
                  ${isSelected
                    ? 'bg-gradient-to-r from-[#69EBDA] to-teal-300 text-slate-950 shadow-md shadow-[#69EBDA]/35 font-bold'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }
                `}
                title={opt.label}
                aria-label={opt.label}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Language Change Option (Bangla & English) */}
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-200">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#69EBDA]" />
            <span>Language</span>
          </span>
          <span className="text-[9px] sm:text-[10px] text-[#69EBDA]">
            {language === 'en' ? 'English' : 'Bengali'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl sm:rounded-2xl bg-slate-900/50 dark:bg-slate-950/50 border border-white/10">
          {languageOptions.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                className={`
                  flex items-center justify-center gap-1 py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? 'bg-gradient-to-r from-[#69EBDA] to-teal-300 text-slate-950 shadow-md shadow-[#69EBDA]/35'
                    : 'text-slate-100 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <span className="text-xs">{item.flag}</span>
                <span>{item.label}</span>
                {isSelected && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-950 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderProfileMenuContent = (isMobile = false) => {
    const isUserAdmin = Boolean(user && (user.role === 'admin' || user.role === 'normal_admin' || StorageService.isNormalAdmin(user?.email)));

    return (
      <div>
        {/* User Info Header with Top-Right Theme Switcher & Close button */}
        <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 border-b border-white/15">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 pr-1">
              <div className="font-extrabold text-white text-xs sm:text-sm truncate">{user.name}</div>
              <div className="text-[10px] sm:text-[11px] text-slate-200 font-mono truncate">{user.email || user.phone}</div>
              <div className="mt-1 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#69EBDA]/25 text-[#69EBDA] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-[#69EBDA]/40">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#69EBDA]" />
                <span>{isUserAdmin ? '🛡️ Standard Admin' : (user.membership || 'VIP Voyager')}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
              {/* Theme Switcher in Top-Right of Profile Pop-up Box */}
              <ThemeSwitcher />
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="p-1 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close profile menu"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-1.5 sm:px-2 py-1 sm:py-1.5 space-y-0.5 sm:space-y-1">
          <button
            onClick={() => {
              setProfileDropdownOpen(false);
              openUserModal('bookings');
            }}
            className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-slate-100 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#69EBDA]" />
              <span>{t('my_bookings', 'My Bookings & Inquiries')}</span>
            </span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" />
          </button>

          <button
            onClick={() => {
              setProfileDropdownOpen(false);
              openUserModal('wishlist');
            }}
            className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-slate-100 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 fill-rose-400/30" />
              <span>{t('wishlist', 'Saved Packages')}</span>
            </span>
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-300 text-[9px] sm:text-[10px] font-bold">
              {wishlist.length}
            </span>
          </button>

          <button
            onClick={() => {
              setProfileDropdownOpen(false);
              openUserModal('settings');
            }}
            className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-slate-100 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#69EBDA]" />
              <span>{t('account_settings', 'Account Settings')}</span>
            </span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" />
          </button>

          {/* Admin Portal Access (Strictly shown ONLY when user is an admin) */}
          {isUserAdmin && (
            <button
              onClick={() => {
                setProfileDropdownOpen(false);
                onOpenAdmin('profile');
              }}
              className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer bg-gradient-to-r from-[#69EBDA]/25 to-teal-400/20 text-[#69EBDA] hover:from-[#69EBDA]/35 hover:to-teal-400/30 border border-[#69EBDA]/40 shadow-xs"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#69EBDA]" />
                <span>Admin Panel Access</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-[#69EBDA] text-slate-950 shadow-sm">
                Admin Access
              </span>
            </button>
          )}
        </div>

        {/* Sign Out */}
        <div className="pt-1.5 px-1.5 sm:px-2 border-t border-white/15">
          <button
            onClick={() => {
              setProfileDropdownOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('sign_out', 'Voyager ID Sign Out')}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-[5px] pb-2 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <nav 
          className={`
            relative flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3
            rounded-3xl transition-all duration-500
            ${scrolled 
              ? 'bg-[#5C6977]/90 dark:bg-slate-900/80 backdrop-blur-2xl border border-[#69EBDA]/35 dark:border-white/20 shadow-[0_12px_36px_0_rgba(15,23,42,0.18)] dark:shadow-[0_16px_36px_0_rgba(0,0,0,0.4)]' 
              : 'bg-[#5C6977]/85 dark:bg-white/[0.08] backdrop-blur-xl border border-[#69EBDA]/35 dark:border-white/25 shadow-[0_10px_30px_0_rgba(15,23,42,0.18)] dark:shadow-[0_8px_32px_0_rgba(31,38,135,0.18)]'
            }
          `}
        >
          {/* ========================================================================= */}
          {/* 1. LEFT ZONE: BRAND IDENTITY */}
          {/* ========================================================================= */}
          <a 
            href="#home" 
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('Home', '#home');
            }}
          >
            <div 
              className="flex items-center justify-center shrink-0 overflow-hidden rounded-xl transition-all"
              style={{
                width: `${branding?.logoWidth || 40}px`,
                height: `${branding?.logoHeight || 40}px`
              }}
            >
              <img 
                src={branding?.logoUrl || '/stb-logo.png'} 
                alt={branding?.brandName || 'STB Brand Logo'}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="flex flex-col">
              <span 
                className="text-base sm:text-lg font-extrabold tracking-wider flex items-center gap-1 font-['Outfit',sans-serif] transition-colors leading-tight"
                style={{ color: branding?.textColor || '#FFFFFF' }}
              >
                {branding?.brandName || 'AETHERIA'}
                <span 
                  className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" 
                  style={{ backgroundColor: branding?.accentColor || '#69EBDA' }}
                />
              </span>
            </div>
          </a>

          {/* ========================================================================= */}
          {/* 2. CENTER ZONE: SMART NAVIGATION PILLS (Desktop lg:) */}
          {/* ========================================================================= */}
          <div className="hidden lg:flex items-center px-1.5 py-1 rounded-full bg-slate-800/50 dark:bg-slate-900/60 border border-white/20 backdrop-blur-md shadow-inner">
            <ul className="flex items-center gap-1">
              {NAVBAR_LINKS.map((link) => {
                const isActive = activeLink === link.name;
                return (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.name, link.href);
                      }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.94 }}
                      className={`
                        relative px-4 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-colors duration-200 block
                        ${isActive 
                          ? 'text-slate-950 font-black' 
                          : 'text-slate-100 hover:text-white'
                        }
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#69EBDA] via-teal-300 to-cyan-400 shadow-[0_2px_12px_rgba(105,235,218,0.5)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                        />
                      )}
                      <span className="relative z-10">{link.name}</span>
                    </motion.a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ========================================================================= */}
          {/* 3. RIGHT ZONE: PREFERENCES, CTA, USER PROFILE */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* GUEST MODE (!user): Settings icon that opens pop-up box with Theme & Language options */}
            {!user && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Settings icon that opens pop-up box with Theme & Language options */}
                <div className="relative" ref={settingsRef}>
                  <motion.button
                    type="button"
                    onClick={handleToggleGuestSettings}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    className={`
                      relative flex items-center justify-center
                      w-8 h-8 sm:w-9 sm:h-9 rounded-2xl
                      bg-slate-800/60 dark:bg-slate-900/70
                      hover:bg-slate-800 dark:hover:bg-slate-900
                      border transition-all duration-300 shadow-md cursor-pointer focus:outline-none
                      ${guestSettingsOpen
                        ? 'border-[#69EBDA] ring-2 ring-[#69EBDA]/30 shadow-[0_0_15px_rgba(105,235,218,0.4)]'
                        : 'border-[#69EBDA]/40 dark:border-white/20 hover:border-[#69EBDA]'
                      }
                    `}
                    aria-label="Settings"
                    title="Settings (Theme & Language)"
                  >
                    <Settings 
                      className={`w-4 h-4 text-[#69EBDA] transition-transform duration-500 ease-out ${
                        guestSettingsOpen ? 'rotate-90' : 'group-hover:rotate-45'
                      }`} 
                    />
                  </motion.button>

                  {/* DESKTOP QUICK PREFERENCES DROPDOWN (Anchored on desktop/tablet screens) */}
                  <div className="hidden sm:block">
                    <AnimatePresence>
                      {guestSettingsOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.92, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.92, y: -4 }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                          onClick={(e) => e.stopPropagation()}
                          className="
                            absolute top-[calc(100%+4px)] right-0 z-50
                            w-52 sm:w-56 md:w-60 lg:w-64 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl
                            bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-2xl
                            border border-[#69EBDA]/40 dark:border-white/25
                            shadow-2xl text-white
                            max-h-[70vh] overflow-y-auto overscroll-contain custom-scrollbar
                          "
                        >
                          {renderQuickPreferencesContent(false)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* LOGGED IN MODE (user): Language option in navbar on desktop (on mobile it shows in navigate pop up box top-right corner) */}
            {user && (
              <div className="hidden lg:flex items-center">
                <LanguageSelector />
              </div>
            )}

            {/* Live RxDB + Supabase Sync Status Pill */}
            <div className="hidden xl:flex items-center">
              <SyncStatusBadge compact />
            </div>

            {/* Glowing "Book a Call" CTA button (hidden on very small mobile) */}
            <button
              onClick={onOpenBookCall}
              className="
                hidden sm:flex relative group overflow-hidden px-3.5 sm:px-4 py-2 min-h-[40px] rounded-2xl
                bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400
                hover:from-[#69EBDA] hover:to-cyan-300
                text-slate-950 font-bold text-xs tracking-wide
                border border-white/60
                shadow-[0_4px_16px_-2px_rgba(105,235,218,0.5),inset_0_1px_1px_0_rgba(255,255,255,0.7)]
                hover:shadow-[0_8px_24px_0_rgba(105,235,218,0.7)]
                transform hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-300 items-center gap-1.5 cursor-pointer
              "
              aria-label="Book a consultation call"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-950 transition-transform group-hover:scale-110 shrink-0" />
              <span>{t('book_a_call', 'Book a Call')}</span>
            </button>

            {/* User Profile / Auth Trigger on Far Right */}
            {user ? (
              /* LOGGED IN USER PROFILE TRIGGER - AVATAR ONLY */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleToggleProfile}
                  className="relative p-0.5 rounded-full hover:ring-2 hover:ring-[#69EBDA] transition-all duration-200 transform active:scale-95 cursor-pointer focus:outline-none group"
                  title={`${user.name} - Voyager Hub`}
                  aria-label="Open user profile menu"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={user.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-[#69EBDA] shadow-md shadow-[#69EBDA]/25 group-hover:shadow-[0_0_15px_rgba(105,235,218,0.5)] transition-shadow"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-sm" />
                  </div>
                </button>

                {/* DESKTOP PROFILE DROPDOWN (Anchored on desktop/tablet screens) */}
                <div className="hidden sm:block">
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                        onClick={(e) => e.stopPropagation()}
                        className="
                          absolute top-[calc(100%+4px)] right-0 z-50
                          w-60 sm:w-64 md:w-68 lg:w-72 rounded-2xl sm:rounded-3xl
                          bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl
                          border border-[#69EBDA]/35 dark:border-white/25
                          shadow-2xl py-2 sm:py-2.5 text-white
                          max-h-[75vh] overflow-y-auto overscroll-contain custom-scrollbar
                        "
                      >
                        {renderProfileMenuContent(false)}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* LOGGED OUT SIGN IN BUTTON */
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 min-h-[40px] rounded-2xl bg-white/15 hover:bg-[#69EBDA]/25 border border-[#69EBDA]/40 dark:border-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-xl transition-all duration-300 shadow-sm cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#69EBDA]" />
                <span>{t('sign_in', 'Sign In')}</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={handleToggleMobileMenu}
              className="lg:hidden p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-2xl bg-slate-800/40 dark:bg-white/10 hover:bg-slate-800/60 dark:hover:bg-white/15 border border-[#69EBDA]/35 dark:border-white/20 text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* ========================================================================= */}
        {/* MOBILE POP-UP BOXES: ALL SHARE THE EXACT 100% IDENTICAL POSITION          */}
        {/* ========================================================================= */}

        {/* 1. MOBILE/TABLET NAVIGATE POP-UP BOX */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              <motion.div
                ref={mobileMenuRef}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                className="
                  relative mt-[4px] mx-auto z-50
                  w-[calc(100vw-24px)] max-w-[280px] xs:max-w-[300px] sm:w-[320px] md:w-[340px]
                  p-2.5 xs:p-3 sm:p-4 rounded-2xl sm:rounded-3xl
                  bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl
                  border border-[#69EBDA]/40 dark:border-white/20
                  shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white
                  max-h-[calc(100vh-80px)] sm:max-h-[calc(100vh-96px)] overflow-y-auto overscroll-contain custom-scrollbar
                "
              >
                <div className="flex items-center justify-between pb-1.5 sm:pb-2 mb-1 sm:mb-2 border-b border-white/15">
                  <span className="text-[11px] sm:text-xs font-extrabold text-[#69EBDA] tracking-wider uppercase font-['Outfit',sans-serif]">
                    Navigation Menu
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {user && <LanguageSelector />}
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                      aria-label="Close menu"
                    >
                      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                <ul className="flex flex-col space-y-0.5 sm:space-y-1">
                  {NAVBAR_LINKS.map((link) => {
                    return (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            setMobileMenuOpen(false);
                            handleLinkClick(link.name, link.href);
                          }}
                          className="flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-slate-100 hover:text-white hover:bg-white/15 transition-all"
                        >
                          <span className="font-bold text-xs sm:text-sm">{link.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </a>
                      </li>
                    );
                  })}

                  <li className="pt-1.5 sm:pt-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenBookCall();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#69EBDA] via-[#2dd4bf] to-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-[#69EBDA]/30 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-slate-950" />
                      <span>{t('book_a_call', 'Book a Call')}</span>
                    </button>
                  </li>
                </ul>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 2. MOBILE PROFILE POP-UP BOX */}
        <AnimatePresence>
          {profileDropdownOpen && (
            <div className="sm:hidden">
              <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
                onClick={() => setProfileDropdownOpen(false)}
              />

              <motion.div
                ref={mobileProfileRef}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                className="
                  relative mt-[4px] mx-auto z-50
                  w-[calc(100vw-24px)] max-w-[280px] xs:max-w-[300px] rounded-2xl
                  bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl
                  border border-[#69EBDA]/40 dark:border-white/20
                  shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white py-1.5 px-1
                  max-h-[calc(100vh-80px)] overflow-y-auto overscroll-contain custom-scrollbar
                "
              >
                {renderProfileMenuContent(true)}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 3. MOBILE QUICK PREFERENCES POP-UP BOX */}
        <AnimatePresence>
          {guestSettingsOpen && (
            <div className="sm:hidden">
              <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
                onClick={() => setGuestSettingsOpen(false)}
              />

              <motion.div
                ref={mobileSettingsRef}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                className="
                  relative mt-[4px] mx-auto z-50
                  w-[calc(100vw-24px)] max-w-[280px] xs:max-w-[300px] p-2.5 xs:p-3 rounded-2xl
                  bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl
                  border border-[#69EBDA]/40 dark:border-white/20
                  shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white
                  max-h-[calc(100vh-80px)] overflow-y-auto overscroll-contain custom-scrollbar
                "
              >
                {renderQuickPreferencesContent(true)}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
};
