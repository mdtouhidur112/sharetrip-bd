import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Check, 
  Sparkles, 
  CreditCard, 
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  User, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  Hotel,
  Car,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Lock,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';

const formatISO = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDaysISO = (isoStr, days) => {
  const parts = (isoStr || '').split('-').map(Number);
  const dt = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date();
  dt.setDate(dt.getDate() + days);
  return formatISO(dt);
};

const diffDaysISO = (startIso, endIso) => {
  if (!startIso || !endIso) return 1;
  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
};

export const BookingInquiryWidget = ({ 
  pkg, 
  isOpenAsModal = false, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('booking'); // 'booking' | 'inquiry'
  const [selectedPkgId, setSelectedPkgId] = useState(pkg?.id || 'bali-escape');

  // Booking Form State - Pre-filled from logged-in user
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [specialNotes, setSpecialNotes] = useState('');

  // Sync user changes when logged in / switched
  useEffect(() => {
    if (user) {
      if (user.name && !fullName) setFullName(user.name);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.email && !email) setEmail(user.email);
    }
  }, [user]);

  // Inquiry Form State
  const [inquiryTopic, setInquiryTopic] = useState('কাস্টম তারিখ ও রুটের নমনীয়তা');
  const [inquiryMessage, setInquiryMessage] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [availablePackages, setAvailablePackages] = useState(() => StorageService.getPackages() || []);
  const [bookingsVersion, setBookingsVersion] = useState(0);

  useEffect(() => {
    const syncPkgs = () => {
      setAvailablePackages(StorageService.getPackages() || []);
    };
    const syncBookings = () => {
      setBookingsVersion((v) => v + 1);
    };
    window.addEventListener('app:packages-updated', syncPkgs);
    window.addEventListener('app:bookings-updated', syncBookings);
    return () => {
      window.removeEventListener('app:packages-updated', syncPkgs);
      window.removeEventListener('app:bookings-updated', syncBookings);
    };
  }, []);

  // Keep selectedPkg in sync
  const packagePool = availablePackages.length > 0 ? availablePackages : (pkg ? [pkg] : []);
  const currentPkg =
    packagePool.find((p) => p.id === selectedPkgId) ||
    pkg ||
    packagePool[0] || {
      id: 'custom-tour',
      title: 'কাস্টম ট্যুর প্যাকেজ',
      shortTitle: 'কাস্টম ট্যুর প্যাকেজ',
      duration: '3 Days / 2 Nights',
      price: 299,
      advancePaymentPercent: 50
    };

  useEffect(() => {
    if (pkg?.id) {
      setSelectedPkgId(pkg.id);
    }
  }, [pkg]);

  // Booked date ranges from Supabase / StorageService
  const bookedRanges = useMemo(() => {
    return StorageService.getBookedDateRanges(currentPkg?.id, currentPkg?.title);
  }, [currentPkg?.id, currentPkg?.title, bookingsVersion]);

  const nextAvailable = useMemo(() => {
    return StorageService.getNextAvailableDate(currentPkg?.id, currentPkg?.title);
  }, [currentPkg?.id, currentPkg?.title, bookingsVersion]);

  // Interactive Range Calendar State
  const [checkInDate, setCheckInDate] = useState(() => nextAvailable.iso);
  const [checkOutDate, setCheckOutDate] = useState(() => addDaysISO(nextAvailable.iso, 3));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const [y, m] = (nextAvailable.iso || formatISO(new Date())).split('-').map(Number);
    return new Date(y, (m || 1) - 1, 1);
  });
  const [bookedPopoverDate, setBookedPopoverDate] = useState(null);
  const [showCalendarGrid, setShowCalendarGrid] = useState(true);

  // Default Guests defined by Admin
  const defaultAdminGuests = Number(currentPkg?.pricingMeta?.defaultGuests) || 2;
  const [travelers, setTravelers] = useState(defaultAdminGuests);

  useEffect(() => {
    const adminDef = Number(currentPkg?.pricingMeta?.defaultGuests) || 2;
    setTravelers(adminDef);
    const nextIso = StorageService.getNextAvailableDate(currentPkg?.id, currentPkg?.title).iso;
    setCheckInDate(nextIso);
    setCheckOutDate(addDaysISO(nextIso, 3));
  }, [currentPkg?.id]);

  // Modular 3-Service Multi-Select State
  const [selectedServices, setSelectedServices] = useState({
    hotel: true,
    transport: true,
    dining: true
  });

  const toggleService = (key) => {
    setSelectedServices((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Ensure at least 1 service remains active or allow flexible toggle
      return next;
    });
  };

  // Dynamic Real-Time Total Calculation Engine (Part 2 Formula)
  const selectedDays = useMemo(() => diffDaysISO(checkInDate, checkOutDate), [checkInDate, checkOutDate]);
  const guestsCount = Number(travelers) || 1;

  const hotelPerDayRate = Number(currentPkg?.hotelService?.perDayRate ?? 85);
  const transportPerDayPerPersonRate = Number(currentPkg?.transportService?.perDayPerPersonRate ?? 35);
  const diningPerDayPerPersonRate = Number(currentPkg?.diningService?.perDayPerPersonRate ?? 28);

  const baseUnitPrice = Number(currentPkg?.price || 299);
  const basePackageCost = baseUnitPrice * guestsCount;
  const hotelCost = selectedServices.hotel ? hotelPerDayRate * selectedDays : 0;
  const transportCost = selectedServices.transport ? transportPerDayPerPersonRate * guestsCount * selectedDays : 0;
  const diningCost = selectedServices.dining ? diningPerDayPerPersonRate * guestsCount * selectedDays : 0;

  const totalNumeric = basePackageCost + hotelCost + transportCost + diningCost;
  const totalPrice = totalNumeric.toFixed(2);
  const advancePercent = Number(currentPkg?.advancePaymentPercent ?? 50);
  const advanceAmount = ((totalNumeric * advancePercent) / 100).toFixed(2);

  // Calendar Grid Builder
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayIso = formatISO(new Date());

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = iso < todayIso;
      const isBooked = StorageService.isDateStrBooked(iso, bookedRanges);
      const isSelectedStart = iso === checkInDate;
      const isSelectedEnd = iso === checkOutDate;
      const isInRange = checkInDate && checkOutDate && iso > checkInDate && iso < checkOutDate;

      cells.push({
        day: d,
        iso,
        isPast,
        isBooked,
        isSelectedStart,
        isSelectedEnd,
        isInRange
      });
    }
    return cells;
  }, [calendarMonth, bookedRanges, checkInDate, checkOutDate]);

  // Check if a range [startIso, endIso] contains any booked dates
  const rangeHasBookedDates = (startIso, endIso) => {
    if (!startIso || !endIso) return false;
    return bookedRanges.some((r) => !(endIso < r.start || startIso > r.end));
  };

  const handleCalendarDayClick = (cell) => {
    if (!cell) return;
    if (cell.isBooked) {
      setBookedPopoverDate(cell.iso);
      setTimeout(() => {
        setBookedPopoverDate((prev) => (prev === cell.iso ? null : prev));
      }, 2600);
      return;
    }
    if (cell.isPast) return;

    setBookedPopoverDate(null);

    // Range selection logic
    if (!checkInDate || (checkInDate && checkOutDate && checkInDate !== checkOutDate) || cell.iso < checkInDate) {
      setCheckInDate(cell.iso);
      const nextDay = addDaysISO(cell.iso, 1);
      if (!StorageService.isDateStrBooked(nextDay, bookedRanges)) {
        setCheckOutDate(nextDay);
      } else {
        setCheckOutDate(cell.iso);
      }
    } else {
      // Selecting checkOutDate
      if (rangeHasBookedDates(checkInDate, cell.iso)) {
        // If range crosses a booked date, start fresh at clicked date
        setBookedPopoverDate(cell.iso);
        setCheckInDate(cell.iso);
        setCheckOutDate(addDaysISO(cell.iso, 1));
      } else {
        setCheckOutDate(cell.iso === checkInDate ? addDaysISO(cell.iso, 1) : cell.iso);
      }
    }
  };

  // Handle WhatsApp direct click from within widget
  const handleDirectWhatsApp = () => {
    const pkgTitle = currentPkg?.shortTitle || currentPkg?.title || 'ট্যুর প্যাকেজ';
    const contactInfo = StorageService.getContactInfo();
    const rawWa = (contactInfo?.whatsapp || '18005550199').replace(/[^0-9]/g, '') || '18005550199';

    const activeServiceNames = [
      selectedServices.hotel ? 'হোটেল' : null,
      selectedServices.transport ? 'পরিবহন' : null,
      selectedServices.dining ? 'রেস্তোরাঁ/ডাইনিং' : null
    ].filter(Boolean).join(', ');

    const msg = encodeURIComponent(
      `হ্যালো এথেরিয়া ট্রাভেলস, আমি ${checkInDate} থেকে ${checkOutDate} (${selectedDays} দিন, ${guestsCount} জন) "${pkgTitle}" প্যাকেজে [সার্ভিস: ${activeServiceNames || 'বেস প্যাকেজ'}] বুকিং করতে আগ্রহী। সর্বমোট হিসাব: $${totalPrice}। বিস্তারিত জানাবেন কি?`
    );
    window.open(`https://wa.me/${rawWa}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'booking' && rangeHasBookedDates(checkInDate, checkOutDate)) {
      setBookedPopoverDate(checkInDate);
      return;
    }

    setIsSubmitting(true);

    const refNumber = `AETH-${Math.floor(1000 + Math.random() * 9000)}-${activeTab === 'booking' ? 'BK' : 'INQ'}`;

    const submissionPayload = {
      id: refNumber,
      type: activeTab,
      packageId: currentPkg.id,
      packageTitle: currentPkg.shortTitle || currentPkg.title,
      fullName,
      phone,
      email,
      travelDate: activeTab === 'booking' ? `${checkInDate} to ${checkOutDate}` : 'Flexible',
      checkInDate: activeTab === 'booking' ? checkInDate : '',
      checkOutDate: activeTab === 'booking' ? checkOutDate : '',
      selectedDays: activeTab === 'booking' ? selectedDays : 1,
      selectedServices: activeTab === 'booking' ? selectedServices : {},
      priceBreakdown: activeTab === 'booking' ? {
        basePackageCost,
        hotelCost,
        transportCost,
        diningCost,
        selectedDays,
        guestsCount,
        totalPrice: totalNumeric
      } : {},
      travelers: activeTab === 'booking' ? guestsCount : 1,
      totalPrice: activeTab === 'booking' ? `$${totalPrice}` : 'N/A',
      specialNotes: activeTab === 'booking' ? specialNotes : inquiryMessage,
      inquiryTopic: activeTab === 'inquiry' ? inquiryTopic : null,
      status: 'Confirmed',
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      StorageService.saveBooking(submissionPayload);
      setIsSubmitting(false);
      setConfirmationData(submissionPayload);

      if (onSuccess) {
        onSuccess(submissionPayload);
      }
    }, 650);
  };

  const handleReset = () => {
    setConfirmationData(null);
    setSpecialNotes('');
    setInquiryMessage('');
  };

  const content = (
    <div className="relative rounded-3xl overflow-hidden liquid-glass border border-[#69EBDA]/35 dark:border-white/25 shadow-[0_20px_60px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
      {/* Top Accent Sheen */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Tabs */}
      <div className="p-5 sm:p-6 border-b border-white/15 dark:border-white/10 relative z-10">
        {isOpenAsModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 transition-colors cursor-pointer"
            aria-label="Close booking widget"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#69EBDA]/20 text-[#69EBDA] text-xs font-bold border border-[#69EBDA]/40">
            <Sparkles className="w-3.5 h-3.5" />
            ৩-ইন-১ স্মার্ট বুকিং ইঞ্জিন
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
            <CalendarCheck className="w-3 h-3 text-[#69EBDA]" />
            পরবর্তী খালি তারিখ: {nextAvailable.formattedBn}
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit',sans-serif]">
          {activeTab === 'booking' ? 'সার্ভিস ও তারিখ কাস্টমাইজ করে বুক করুন' : 'সরাসরি ভ্রমণ অনুসন্ধান'}
        </h3>
        <p className="mt-1 text-slate-100 dark:text-slate-300 text-xs font-medium">
          {activeTab === 'booking'
            ? 'ক্যালেন্ডার থেকে চেক-ইন/চেক-আউট তারিখ এবং হোটেল, গাড়ি বা ডাইনিং সার্ভিস পছন্দমতো বেছে নিন।'
            : 'কাস্টম ভ্রমণ পরিকল্পনা বা প্রাইভেট গ্রুপ অফার জানতে আমাদের লিখুন।'}
        </p>

        {/* Tab Switcher Pills */}
        {!confirmationData && (
          <div className="mt-4 p-1 rounded-2xl bg-slate-800/50 dark:bg-slate-950/70 backdrop-blur-md border border-white/20 dark:border-white/15 grid grid-cols-2 gap-1 relative">
            <button
              type="button"
              onClick={() => setActiveTab('booking')}
              className={`
                relative py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-colors flex items-center justify-center gap-2 z-10 cursor-pointer
                ${activeTab === 'booking'
                  ? 'text-slate-950'
                  : 'text-slate-200 dark:text-slate-300 hover:text-white'
                }
              `}
            >
              {activeTab === 'booking' && (
                <motion.div
                  layoutId="activeBookingTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#69EBDA] to-cyan-400 rounded-xl shadow-md shadow-[#69EBDA]/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                />
              )}
              <CreditCard className="w-4 h-4 relative z-10" />
              <span className="relative z-10">স্মার্ট বুকিং</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inquiry')}
              className={`
                relative py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-colors flex items-center justify-center gap-2 z-10 cursor-pointer
                ${activeTab === 'inquiry'
                  ? 'text-slate-950'
                  : 'text-slate-200 dark:text-slate-300 hover:text-white'
                }
              `}
            >
              {activeTab === 'inquiry' && (
                <motion.div
                  layoutId="activeBookingTabPill"
                  className="absolute inset-0 bg-gradient-to-r from-[#69EBDA] to-cyan-400 rounded-xl shadow-md shadow-[#69EBDA]/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                />
              )}
              <MessageSquare className="w-4 h-4 relative z-10" />
              <span className="relative z-10">দ্রুত অনুসন্ধান</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Body */}
      {confirmationData ? (
        /* Sleek VisionOS Confirmation Receipt State */
        <div className="p-6 sm:p-8 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-400">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-400 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(20,184,166,0.6)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold tracking-wider">
              রেফারেন্স #{confirmationData.id}
            </div>

            <h4 className="text-2xl font-black text-white font-['Outfit',sans-serif]">
              {confirmationData.type === 'booking' ? 'ভ্রমণ বুকিং ও তারিখ লক নিশ্চিত হয়েছে!' : 'অনুসন্ধান বার্তা পাঠানো হয়েছে!'}
            </h4>

            <p className="text-slate-100 dark:text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              ধন্যবাদ, <strong className="text-white">{confirmationData.fullName}</strong>। আপনার নির্বাচিত তারিখ ক্যালেন্ডারে সংরক্ষিত হয়েছে এবং বিবরণ <span className="text-[#69EBDA] font-semibold">{confirmationData.email}</span> ঠিকানায় পাঠানো হয়েছে।
            </p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="p-5 rounded-2xl bg-slate-800/50 dark:bg-white/[0.04] backdrop-blur-xl border border-white/20 dark:border-white/15 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/15">
              <span className="text-slate-300">নির্বাচিত প্যাকেজ</span>
              <span className="font-bold text-white text-right">{confirmationData.packageTitle}</span>
            </div>

            {confirmationData.type === 'booking' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">চেক-ইন ➔ চেক-আউট</span>
                  <span className="font-bold text-[#69EBDA]">{confirmationData.checkInDate} ➔ {confirmationData.checkOutDate} ({confirmationData.selectedDays} দিন)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">মোট অতিথি (Guests)</span>
                  <span className="font-semibold text-white">{confirmationData.travelers} জন</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">নির্বাচিত সার্ভিসসমূহ</span>
                  <span className="font-semibold text-emerald-300">
                    {[
                      confirmationData.selectedServices?.hotel ? '🏨 হোটেল' : null,
                      confirmationData.selectedServices?.transport ? '🚗 পরিবহন' : null,
                      confirmationData.selectedServices?.dining ? '🍽️ ডাইনিং' : null
                    ].filter(Boolean).join(' • ') || 'বেস প্যাকেজ'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/15 text-sm">
                  <span className="font-bold text-[#69EBDA]">সর্বমোট মূল্য</span>
                  <span className="font-black text-white text-base">{confirmationData.totalPrice}</span>
                </div>
              </>
            )}
          </div>

          {/* Quick Follow-up Actions */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleDirectWhatsApp}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>তাৎক্ষণিক চ্যাটের জন্য হোয়াটসঅ্যাপে যান</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-white/20 text-xs text-white font-semibold transition-colors cursor-pointer"
              >
                আরেকটি বুকিং করুন
              </button>

              {isOpenAsModal && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  উইন্ডো বন্ধ করুন
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Form Inputs */
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 relative z-10">
          {/* Selected Package Selector */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#69EBDA] block mb-1">
              নির্বাচিত প্যাকেজ ({currentPkg?.duration || '5 Days / 4 Nights'})
            </label>
            <select
              value={selectedPkgId}
              onChange={(e) => setSelectedPkgId(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-800/55 dark:bg-white/[0.05] border border-white/20 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-[#69EBDA] cursor-pointer"
            >
              {packagePool.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white font-medium">
                  {p.shortTitle || p.title} ({p.duration}) — ${Number(p.price || 0).toFixed(2)}/জন
                </option>
              ))}
            </select>
          </div>

          {/* TAB 1: BOOKING SPECIFIC FIELDS */}
          {activeTab === 'booking' && (
            <>
              {/* 1. REAL-TIME RANGE CALENDAR WITH SLOT LOCKING */}
              <div className="rounded-2xl bg-slate-900/60 dark:bg-slate-950/65 border border-white/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#69EBDA]" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                      ভ্রমণের তারিখ ও রিয়েল-টাইম স্লট ক্যালেন্ডার
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCalendarGrid(!showCalendarGrid)}
                    className="text-[11px] font-bold text-[#69EBDA] hover:underline cursor-pointer"
                  >
                    {showCalendarGrid ? 'সংক্ষিপ্ত করুন' : 'ক্যালেন্ডার খুলুন'}
                  </button>
                </div>

                {/* Selected Check-in / Check-out Summary Pills */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-800/70 border border-white/15">
                    <span className="text-[10px] text-slate-300 block font-semibold">চেক-ইন (Check-in)</span>
                    <span className="text-xs font-black text-[#69EBDA]">{checkInDate}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/70 border border-white/15">
                    <span className="text-[10px] text-slate-300 block font-semibold">চেক-আউট (Check-out)</span>
                    <span className="text-xs font-black text-cyan-300">{checkOutDate}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/35">
                    <span className="text-[10px] text-slate-200 block font-semibold">মোট দিন (Days)</span>
                    <span className="text-xs font-black text-white">{selectedDays} দিন</span>
                  </div>
                </div>

                {showCalendarGrid && (
                  <div className="pt-1">
                    {/* Month Switcher */}
                    <div className="flex items-center justify-between mb-2 px-1">
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-white/15 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-extrabold text-white">
                        {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-white/15 cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                        <div key={d}>{d}</div>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 relative">
                      {calendarDays.map((cell, idx) => {
                        if (!cell) return <div key={`empty-${idx}`} className="h-8" />;

                        const isSelected = cell.isSelectedStart || cell.isSelectedEnd;
                        return (
                          <div key={cell.iso} className="relative">
                            <button
                              type="button"
                              onClick={() => handleCalendarDayClick(cell)}
                              onMouseEnter={() => {
                                if (cell.isBooked) setBookedPopoverDate(cell.iso);
                              }}
                              onMouseLeave={() => {
                                if (cell.isBooked && bookedPopoverDate === cell.iso) setBookedPopoverDate(null);
                              }}
                              className={`
                                w-full h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all relative
                                ${cell.isBooked
                                  ? 'bg-rose-950/60 border border-rose-500/35 text-slate-400 line-through opacity-50 cursor-not-allowed'
                                  : cell.isPast
                                  ? 'text-slate-600 cursor-not-allowed opacity-40'
                                  : isSelected
                                  ? 'bg-[#69EBDA] text-slate-950 font-black shadow-[0_0_12px_rgba(105,235,218,0.6)] cursor-pointer'
                                  : cell.isInRange
                                  ? 'bg-[#69EBDA]/25 text-white border border-[#69EBDA]/40 cursor-pointer'
                                  : 'bg-slate-800/50 hover:bg-slate-700/80 text-white border border-white/10 cursor-pointer'
                                }
                              `}
                            >
                              <span>{cell.day}</span>
                              {cell.isBooked && <Lock className="w-2.5 h-2.5 text-rose-400 absolute top-0.5 right-0.5" />}
                            </button>

                            {/* Micro-Popover for Booked Date */}
                            <AnimatePresence>
                              {bookedPopoverDate === cell.iso && cell.isBooked && (
                                <motion.div
                                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-30 w-44 p-2 rounded-xl bg-slate-950/95 border border-rose-400/50 text-center shadow-xl pointer-events-none"
                                >
                                  <p className="text-[10px] font-extrabold text-rose-300">
                                    Already Booked for this period
                                  </p>
                                  <p className="text-[9px] text-slate-300 mt-0.5">
                                    এই তারিখে বুকিং পূর্ণ রয়েছে
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10 text-[10px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#69EBDA] inline-block" /> নির্বাচিত তারিখ
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-900 border border-rose-400/50 inline-block" /> বুকড (Locked)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. GUESTS COUNTER */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/55 border border-white/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/35 flex items-center justify-center text-[#69EBDA]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-white block">মোট ভ্রমণকারী (Guests Count)</span>
                    <span className="text-[10px] text-slate-300">ডিফল্ট: {defaultAdminGuests} জন (পরিবর্তনযোগ্য)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-sm font-black text-[#69EBDA]">{travelers}</span>
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.min(30, travelers + 1))}
                    className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-black text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 3. MODULAR 3-SERVICE MULTI-SELECT CARDS */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#69EBDA] block">
                  ৩-ইন-১ মডুলার সার্ভিস নির্বাচন করুন (১টি, ২টি বা সবগুলো)
                </label>

                {/* [x] Hotel Accommodation */}
                <div
                  onClick={() => toggleService('hotel')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedServices.hotel
                      ? 'bg-[#69EBDA]/15 border-[#69EBDA]/60 shadow-[0_0_20px_rgba(105,235,218,0.15)]'
                      : 'bg-slate-800/40 border-white/15 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      selectedServices.hotel ? 'bg-[#69EBDA] border-[#69EBDA] text-slate-950' : 'border-white/30'
                    }`}>
                      {selectedServices.hotel && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <Hotel className="w-4 h-4 text-[#69EBDA] shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold text-white block">Hotel Accommodation (হোটেল ও রুম)</span>
                      <span className="text-[10px] text-slate-300">
                        ${hotelPerDayRate}/দিন × {selectedDays} দিন
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#69EBDA]">
                    {selectedServices.hotel ? `+$${hotelCost.toFixed(0)}` : '$0'}
                  </span>
                </div>

                {/* [x] Transport Service */}
                <div
                  onClick={() => toggleService('transport')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedServices.transport
                      ? 'bg-[#69EBDA]/15 border-[#69EBDA]/60 shadow-[0_0_20px_rgba(105,235,218,0.15)]'
                      : 'bg-slate-800/40 border-white/15 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      selectedServices.transport ? 'bg-[#69EBDA] border-[#69EBDA] text-slate-950' : 'border-white/30'
                    }`}>
                      {selectedServices.transport && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <Car className="w-4 h-4 text-cyan-300 shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold text-white block">Transport Service (পরিবহন ও গাড়ি)</span>
                      <span className="text-[10px] text-slate-300">
                        ${transportPerDayPerPersonRate}/জন/দিন × {guestsCount} জন × {selectedDays} দিন
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-cyan-300">
                    {selectedServices.transport ? `+$${transportCost.toFixed(0)}` : '$0'}
                  </span>
                </div>

                {/* [x] Dining Service */}
                <div
                  onClick={() => toggleService('dining')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedServices.dining
                      ? 'bg-[#69EBDA]/15 border-[#69EBDA]/60 shadow-[0_0_20px_rgba(105,235,218,0.15)]'
                      : 'bg-slate-800/40 border-white/15 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      selectedServices.dining ? 'bg-[#69EBDA] border-[#69EBDA] text-slate-950' : 'border-white/30'
                    }`}>
                      {selectedServices.dining && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <UtensilsCrossed className="w-4 h-4 text-amber-300 shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold text-white block">Dining Service (৩ বেলা খাবার ও ডাইনিং)</span>
                      <span className="text-[10px] text-slate-300">
                        ${diningPerDayPerPersonRate}/জন/দিন × {guestsCount} জন × {selectedDays} দিন
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-amber-300">
                    {selectedServices.dining ? `+$${diningCost.toFixed(0)}` : '$0'}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Customer Contact Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 block mb-1">
                পূর্ণ নাম *
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-800/50 border border-white/20 focus-within:border-[#69EBDA]">
                <User className="w-4 h-4 text-[#69EBDA] shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white font-medium placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 block mb-1">
                মোবাইল / হোয়াটসঅ্যাপ *
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-800/50 border border-white/20 focus-within:border-[#69EBDA]">
                <Phone className="w-4 h-4 text-[#69EBDA] shrink-0" />
                <input
                  type="tel"
                  required
                  placeholder="+৮৮০ ১৭১২-৩৪৫৬৭৮"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white font-medium placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 block mb-1">
              ইমেইল ঠিকানা *
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-800/50 border border-white/20 focus-within:border-[#69EBDA]">
              <Mail className="w-4 h-4 text-[#69EBDA] shrink-0" />
              <input
                type="email"
                required
                placeholder="tanvir@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-white font-medium placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {activeTab === 'booking' && (
            <>
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 block mb-1">
                  বিশেষ অনুরোধ (ঐচ্ছিক)
                </label>
                <div className="p-2.5 rounded-2xl bg-slate-800/50 border border-white/20 focus-within:border-[#69EBDA]">
                  <textarea
                    rows={2}
                    placeholder="রুমের পছন্দ, খাবার বা ফ্লাইট সংক্রান্ত নোট..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full bg-transparent text-xs text-white font-medium placeholder-slate-400 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* AUTO-RECALCULATING LIVE PRICE SUMMARY BAR */}
              <div className="p-4 rounded-2xl bg-slate-900/75 border border-[#69EBDA]/40 space-y-2">
                <div className="space-y-1 text-[11px] text-slate-300 border-b border-white/10 pb-2">
                  <div className="flex justify-between">
                    <span>বেস প্যাকেজ (${baseUnitPrice} × {guestsCount} জন):</span>
                    <span className="font-bold text-white">${basePackageCost.toFixed(2)}</span>
                  </div>
                  {selectedServices.hotel && (
                    <div className="flex justify-between text-teal-200">
                      <span>হোটেল চার্জ (${hotelPerDayRate} × {selectedDays} দিন):</span>
                      <span className="font-bold">+${hotelCost.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedServices.transport && (
                    <div className="flex justify-between text-cyan-200">
                      <span>পরিবহন (${transportPerDayPerPersonRate} × {guestsCount} জন × {selectedDays} দিন):</span>
                      <span className="font-bold">+${transportCost.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedServices.dining && (
                    <div className="flex justify-between text-amber-200">
                      <span>ডাইনিং (${diningPerDayPerPersonRate} × {guestsCount} জন × {selectedDays} দিন):</span>
                      <span className="font-bold">+${diningCost.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">
                      সর্বমোট মূল্য ({selectedDays} দিন, {guestsCount} জন)
                    </span>
                    <span className="text-2xl font-black text-white font-['Outfit',sans-serif]">
                      ${totalPrice}
                    </span>
                    <span className="text-[11px] text-[#69EBDA] font-bold block">
                      অগ্রিম বুকিং ({advancePercent}%): মাত্র ${advanceAmount} এখন পরিশোধযোগ্য
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: INQUIRY SPECIFIC FIELDS */}
          {activeTab === 'inquiry' && (
            <>
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 block mb-1">
                  অনুসন্ধানের ধরণ
                </label>
                <select
                  value={inquiryTopic}
                  onChange={(e) => setInquiryTopic(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-800/55 border border-white/20 text-xs text-white font-bold focus:outline-none focus:border-[#69EBDA] cursor-pointer"
                >
                  <option value="কাস্টম তারিখ ও রুটের নমনীয়তা" className="bg-slate-900 text-white">কাস্টম তারিখ ও রুটের নমনীয়তা</option>
                  <option value="প্রাইভেট গ্রুপ ও ফ্যামিলি ডিসকাউন্ট" className="bg-slate-900 text-white">প্রাইভেট গ্রুপ ও ফ্যামিলি ডিসকাউন্ট</option>
                  <option value="ভিসা সহায়তা ও ট্রাভেল পারমিট" className="bg-slate-900 text-white">ভিসা সহায়তা ও ট্রাভেল পারমিট</option>
                  <option value="বিশেষ খাবারের ব্যবস্থা ও প্রবেশযোগ্যতা" className="bg-slate-900 text-white">বিশেষ খাবারের ব্যবস্থা ও প্রবেশযোগ্যতা</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200 block mb-1">
                  আপনার বিস্তারিত প্রশ্ন বা বার্তা *
                </label>
                <div className="p-3 rounded-2xl bg-slate-800/50 border border-white/20 focus-within:border-[#69EBDA]">
                  <textarea
                    rows={4}
                    required
                    placeholder="এই ভ্রমণ প্যাকেজ সম্পর্কে আপনার যা কিছু জানার আছে লিখুন..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full bg-transparent text-xs text-white font-medium placeholder-slate-400 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit & WhatsApp Inquiry Buttons */}
          <div className="pt-1 space-y-2.5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#69EBDA] via-teal-300 to-cyan-300 hover:from-[#69EBDA]/90 hover:to-cyan-200 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-[0_8px_25px_rgba(105,235,218,0.5)] flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            >
              {activeTab === 'booking' ? (
                <>
                  <CreditCard className="w-4 h-4 text-slate-950" />
                  <span>{isSubmitting ? 'স্লট লক ও বুকিং হচ্ছে...' : 'এখনই বুক করুন (Book Now)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>{isSubmitting ? 'বার্তা পাঠানো হচ্ছে...' : 'অনুসন্ধান বার্তা পাঠান'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDirectWhatsApp}
              className="w-full py-3 px-5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/45 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>হোয়াটসঅ্যাপে জিজ্ঞাসা করুন (Inquire on WhatsApp)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <div className="mt-1 text-center text-[11px] text-slate-200 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="line-clamp-1">{currentPkg?.cancellationPolicy || 'ভ্রমণের ৭ দিন পূর্বে বাতিল করলে ৯০% রিফান্ড প্রযোজ্য'}</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  if (isOpenAsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-2xl animate-in fade-in duration-300">
        <div className="w-full max-w-xl my-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
