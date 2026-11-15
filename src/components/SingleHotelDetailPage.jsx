import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  Calendar as CalendarIcon,
  CheckCircle2,
  ExternalLink,
  Phone,
  MessageCircle,
  Tag,
  ShieldCheck,
  Play,
  ChevronRight,
  ChevronLeft,
  X,
  Hotel as HotelIcon,
  Users,
  Check,
  AlertCircle,
  Star,
  Heart,
  MessageSquare,
  MessageSquarePlus,
  MoreVertical,
  Edit2,
  Trash2,
  Send,
  ThumbsUp
} from 'lucide-react';
import { DynamicReactIcon, parseReactIconInput } from '../utils/reactIconParser';
import { StorageService } from '../services/storageService';
import { HotelReviewService } from '../services/hotelReviewService';
import {
  normalizeTransportToCardShape,
  normalizeRestaurantToCardShape
} from '../utils/serviceCardNormalizer';
import { useAuth } from '../context/AuthContext';

// Helper: YouTube URL parser & thumbnail extractor
const extractYouTubeId = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  const watchMatch = trimmed.match(/(?:watch\?v=|embed\/|youtu\.be\/|v\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];
  return null;
};

const toYouTubeWatchUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return 'https://www.youtube.com';
  const id = extractYouTubeId(rawUrl);
  return id ? `https://www.youtube.com/watch?v=${id}` : rawUrl;
};

// Date helper functions
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

// Formats YYYY-MM-DD to MM/DD/YYYY as requested (e.g. 11/11/2026)
const toDisplayDate = (isoStr) => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${m}/${d}/${y}`;
  }
  return isoStr;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const SingleHotelDetailPage = ({ hotel: initialHotel, onBack, onBookingSuccess }) => {
  const [contactInfo, setContactInfo] = useState(() => StorageService.getContactInfo());
  useEffect(() => {
    const sync = () => setContactInfo(StorageService.getContactInfo());
    window.addEventListener('app:contact-info-updated', sync);
    return () => window.removeEventListener('app:contact-info-updated', sync);
  }, []);
  const rawWa = (contactInfo?.whatsapp || '').replace(/[^0-9]/g, '');
  const hotlinePhone = contactInfo?.phone?.hotline || contactInfo?.phone?.tollFree || '';
  const cleanHotlineTel = hotlinePhone.replace(/[^0-9+]/g, '');
  const [hotel, setHotel] = useState(initialHotel);

  useEffect(() => {
    setHotel(initialHotel);
  }, [initialHotel]);

  useEffect(() => {
    if (!initialHotel?.id) return;
    const syncLiveHotel = () => {
      const svcType = initialHotel.serviceType;
      if (svcType === 'transport') {
        const found = StorageService.getTransports().find((t) => t.id === initialHotel.id);
        if (found) setHotel(normalizeTransportToCardShape(found));
      } else if (svcType === 'restaurant') {
        const found = StorageService.getRestaurants().find((r) => r.id === initialHotel.id);
        if (found) setHotel(normalizeRestaurantToCardShape(found));
      } else {
        const found = StorageService.getHotels().find((h) => h.id === initialHotel.id);
        if (found) setHotel(found);
      }
    };

    syncLiveHotel();
    window.addEventListener('app:hotels-updated', syncLiveHotel);
    window.addEventListener('app:transports-updated', syncLiveHotel);
    window.addEventListener('app:restaurants-updated', syncLiveHotel);
    window.addEventListener('storage', syncLiveHotel);
    return () => {
      window.removeEventListener('app:hotels-updated', syncLiveHotel);
      window.removeEventListener('app:transports-updated', syncLiveHotel);
      window.removeEventListener('app:restaurants-updated', syncLiveHotel);
      window.removeEventListener('storage', syncLiveHotel);
    };
  }, [initialHotel?.id, initialHotel?.serviceType]);

  const { user, wishlist = [], toggleWishlist } = useAuth();
  const isFav = wishlist.includes(hotel.id);
  const isTransport = hotel.serviceType === 'transport';
  const isRestaurant = hotel.serviceType === 'restaurant';

  // Active Main Photo state
  const defaultPhotoUrl =
    hotel.defaultPhoto ||
    hotel.image ||
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80';

  const [activePhoto, setActivePhoto] = useState(defaultPhotoUrl);

  useEffect(() => {
    setActivePhoto(defaultPhotoUrl);
  }, [defaultPhotoUrl]);

  // Gallery array
  const galleryPhotos = useMemo(() => {
    let list = [];
    if (Array.isArray(hotel.galleryPhotos) && hotel.galleryPhotos.length > 0) {
      list = hotel.galleryPhotos.filter(Boolean);
    } else if (Array.isArray(hotel.images) && hotel.images.length > 0) {
      list = hotel.images.filter(Boolean);
    }
    if (!list.includes(defaultPhotoUrl)) {
      list = [defaultPhotoUrl, ...list];
    }
    return list;
  }, [hotel, defaultPhotoUrl]);

  // YouTube Video metadata
  const youtubeId = extractYouTubeId(hotel.youtubeLink);
  const youtubeThumb = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

  // Short Info items
  const shortInfoList = useMemo(() => {
    if (Array.isArray(hotel.shortInfoItems) && hotel.shortInfoItems.length > 0) {
      return hotel.shortInfoItems.filter(item => item && (item.text || item.info));
    }
    if (Array.isArray(hotel.amenities) && hotel.amenities.length > 0) {
      return hotel.amenities.map(a => (typeof a === 'string' ? { icon: '', text: a } : a));
    }
    return [];
  }, [hotel]);

  // Modals state
  const [isMoreShortInfoOpen, setIsMoreShortInfoOpen] = useState(false);
  const [isFullDetailsOpen, setIsFullDetailsOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isHotelHelpCenterModalOpen, setIsHotelHelpCenterModalOpen] = useState(false);
  const [pendingGuestCount, setPendingGuestCount] = useState(4);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [completedBookingId, setCompletedBookingId] = useState(null);

  // User identifier for reviews, ratings, and likes
  const userKey = user?.email || user?.id || 'guest_user';

  // Customer Reviews & Community Ratings State
  const [hotelReviews, setHotelReviews] = useState(() => HotelReviewService.getHotelReviews(hotel.id));
  const ratingMeta = useMemo(() => {
    return HotelReviewService.getHotelRatingMeta(hotel.id, hotel.rating, hotel.reviewsCount);
  }, [hotel.id, hotel.rating, hotel.reviewsCount, hotelReviews]);
  const userPrevRating = useMemo(() => {
    return HotelReviewService.getUserPreviousRating(hotel.id, userKey);
  }, [hotel.id, userKey, hotelReviews]);

  // Review Modals and Controls
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewCommentText, setReviewCommentText] = useState('');
  const [reviewRatingValue, setReviewRatingValue] = useState(5);
  const [reviewAuthorName, setReviewAuthorName] = useState(user?.name || '');
  const [reviewHoverStar, setReviewHoverStar] = useState(0);
  const [activeReviewMenuId, setActiveReviewMenuId] = useState(null);
  const [isAllCommentsView, setIsAllCommentsView] = useState(false);

  // Sync reviews when updated
  useEffect(() => {
    const handleSyncReviews = (e) => {
      if (!e.detail?.hotelId || e.detail.hotelId === hotel.id) {
        setHotelReviews(HotelReviewService.getHotelReviews(hotel.id));
      }
    };
    window.addEventListener('app:hotel-reviews-updated', handleSyncReviews);
    return () => window.removeEventListener('app:hotel-reviews-updated', handleSyncReviews);
  }, [hotel.id]);

  const handleOpenReviewModal = (existingReview = null) => {
    if (existingReview) {
      setEditingReviewId(existingReview.id);
      setReviewCommentText(existingReview.comment || '');
    } else {
      setEditingReviewId(null);
      setReviewCommentText('');
    }
    setActiveReviewMenuId(null);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewCommentText.trim()) return;

    const finalRating = userPrevRating || 5;

    HotelReviewService.saveHotelReview(
      hotel.id,
      {
        id: editingReviewId,
        userName: user?.name || 'গেস্ট ট্রাভেলার',
        userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: finalRating,
        comment: reviewCommentText.trim()
      },
      userKey
    );

    setHotelReviews(HotelReviewService.getHotelReviews(hotel.id));
    setIsReviewModalOpen(false);
    setReviewCommentText('');
    setEditingReviewId(null);
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনার কমেন্টটি মুছে ফেলতে চান?')) {
      HotelReviewService.deleteHotelReview(hotel.id, reviewId);
      setHotelReviews(HotelReviewService.getHotelReviews(hotel.id));
      setActiveReviewMenuId(null);
    }
  };

  const handleToggleLike = (reviewId) => {
    HotelReviewService.toggleReviewLike(hotel.id, reviewId, userKey);
    setHotelReviews(HotelReviewService.getHotelReviews(hotel.id));
  };

  // Direct card rating state & handler
  const [detailRatingFeedback, setDetailRatingFeedback] = useState(null);
  const [detailHoverStar, setDetailHoverStar] = useState(0);

  const handleDetailCardRating = (starValue) => {
    const result = HotelReviewService.submitQuickRating(
      hotel.id,
      starValue,
      userKey,
      user?.name || 'গেস্ট ট্রাভেলার'
    );
    setDetailRatingFeedback({
      message: result.message,
      isError: !result.success
    });
    setHotelReviews(HotelReviewService.getHotelReviews(hotel.id));
    setTimeout(() => setDetailRatingFeedback(null), 3200);
  };

  // Booking & Calendar Date State
  const todayISO = useMemo(() => formatISO(new Date()), []);
  const tomorrowISO = useMemo(() => addDaysISO(todayISO, 1), [todayISO]);
  const dayAfterTomorrowISO = useMemo(() => addDaysISO(todayISO, 2), [todayISO]);

  const [checkInDate, setCheckInDate] = useState(tomorrowISO);
  const [checkOutDate, setCheckOutDate] = useState(dayAfterTomorrowISO);
  const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);
  const [adultCount, setAdultCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const guestCount = adultCount + childrenCount;
  const [roomCount, setRoomCount] = useState(1);
  const [seatCount, setSeatCount] = useState(1);
  const [tripType, setTripType] = useState('One-Way');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');

  // Restaurant-specific booking states
  const [restaurantGuests, setRestaurantGuests] = useState(2);
  const [selectedRestaurantDates, setSelectedRestaurantDates] = useState(() => [tomorrowISO]);
  const [isFoodMenuModalOpen, setIsFoodMenuModalOpen] = useState(false);
  const [isSelectedFoodsModalOpen, setIsSelectedFoodsModalOpen] = useState(false);
  const [showAllDaysInSummary, setShowAllDaysInSummary] = useState(false);
  const [previewFoodItem, setPreviewFoodItem] = useState(null);
  const [activeMealTab, setActiveMealTab] = useState('breakfast'); // 'breakfast' | 'lunch' | 'dinner'
  const [activeFoodGuest, setActiveFoodGuest] = useState(1);
  const [activeFoodDate, setActiveFoodDate] = useState(() => tomorrowISO);
  const [selectedFoodByDateGuest, setSelectedFoodByDateGuest] = useState({});
  const [hasConfirmedFoodMenu, setHasConfirmedFoodMenu] = useState(false);

  useEffect(() => {
    if (activeFoodGuest > restaurantGuests) {
      setActiveFoodGuest(Math.max(1, restaurantGuests));
    }
  }, [restaurantGuests, activeFoodGuest]);

  const availableFoodDates = useMemo(
    () => (selectedRestaurantDates.length > 0 ? selectedRestaurantDates : [tomorrowISO]),
    [selectedRestaurantDates, tomorrowISO]
  );

  useEffect(() => {
    if (!availableFoodDates.includes(activeFoodDate)) {
      setActiveFoodDate(availableFoodDates[0]);
    }
  }, [availableFoodDates, activeFoodDate]);

  const activeFoodDateIndex = Math.max(0, availableFoodDates.indexOf(activeFoodDate));

  const handleStepFoodDate = (delta) => {
    if (availableFoodDates.length <= 1) return;
    const nextIdx = Math.min(
      availableFoodDates.length - 1,
      Math.max(0, activeFoodDateIndex + delta)
    );
    setActiveFoodDate(availableFoodDates[nextIdx]);
  };

  const restaurantGuestNumbers = useMemo(
    () => Array.from({ length: Math.max(1, restaurantGuests) }, (_, i) => i + 1),
    [restaurantGuests]
  );

  const restaurantMenuByMeal = useMemo(() => {
    if (!isRestaurant) return { breakfast: [], lunch: [], dinner: [] };
    const defaultItemPrice = Math.max(
      120,
      Math.round(Number(hotel.bookingPrice ?? hotel.ratePerPerson ?? 600) / 3)
    );
    const mealFallbacks = {
      breakfast: {
        items: ['বুফে ব্রেকফাস্ট প্ল্যাটার', 'পরাটা ও ভুনা খিচুড়ি', 'কফি ও ফ্রেশ জুস'],
        photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80'
      },
      lunch: {
        items: ['স্পেশাল কাচ্চি / পোলাও', 'গ্রিলড চিকেন ও নান', 'ফ্রেশ সালাদ ও ড্রিঙ্কস'],
        photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
      },
      dinner: {
        items: ['লাইভ বারবিকিউ প্ল্যাটার', 'তান্দুরি চিকেন ও নান', 'স্পেশাল ডেজার্ট'],
        photo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
      }
    };

    const normalizeList = (rawList, mealKey) => {
      const source = Array.isArray(rawList) && rawList.length > 0 ? rawList : mealFallbacks[mealKey].items;
      return source.map((entry, idx) => {
        if (entry && typeof entry === 'object') {
          return {
            key: `${mealKey}-${idx}`,
            meal: mealKey,
            name: entry.name || entry.title || `মেনু আইটেম ${idx + 1}`,
            price: Number(entry.price) > 0 ? Number(entry.price) : defaultItemPrice,
            photo: entry.photo || entry.image || hotel.photo || mealFallbacks[mealKey].photo
          };
        }
        const rawStr = String(entry || '').trim();
        const priceMatch = rawStr.match(/[:\-–]\s*(\d+)\s*$/);
        const parsedPrice = priceMatch ? Number(priceMatch[1]) : defaultItemPrice;
        const cleanName = priceMatch ? rawStr.replace(/[:\-–]\s*\d+\s*$/, '').trim() : rawStr;
        return {
          key: `${mealKey}-${idx}`,
          meal: mealKey,
          name: cleanName || `মেনু আইটেম ${idx + 1}`,
          price: parsedPrice > 0 ? parsedPrice : defaultItemPrice,
          photo: hotel.photo || hotel.defaultPhoto || mealFallbacks[mealKey].photo
        };
      });
    };

    return {
      breakfast: normalizeList(hotel.breakfastMenu, 'breakfast'),
      lunch: normalizeList(hotel.lunchMenu, 'lunch'),
      dinner: normalizeList(hotel.dinnerMenu, 'dinner')
    };
  }, [isRestaurant, hotel]);

  const selectedFoodList = useMemo(() => {
    const items = [];
    availableFoodDates.forEach((dateStr) => {
      const dateMap = selectedFoodByDateGuest[dateStr] || {};
      for (let g = 1; g <= restaurantGuests; g++) {
        const guestMap = dateMap[g] || {};
        Object.values(guestMap).forEach((item) => {
          if (item && item.qty > 0) {
            items.push({ ...item, dateStr, guestIndex: g });
          }
        });
      }
    });
    return items;
  }, [selectedFoodByDateGuest, availableFoodDates, restaurantGuests]);

  const activeGuestFoodMap =
    (selectedFoodByDateGuest[activeFoodDate] &&
      selectedFoodByDateGuest[activeFoodDate][activeFoodGuest]) ||
    {};

  const activeGuestFoodList = useMemo(
    () => Object.values(activeGuestFoodMap).filter((item) => item && item.qty > 0),
    [activeGuestFoodMap]
  );

  const activeGuestFoodTotal = useMemo(
    () => activeGuestFoodList.reduce((sum, item) => sum + item.price * item.qty, 0),
    [activeGuestFoodList]
  );

  const totalSelectedFoodQty = useMemo(
    () => selectedFoodList.reduce((sum, item) => sum + item.qty, 0),
    [selectedFoodList]
  );

  const selectedFoodTotalAllDates = useMemo(
    () => selectedFoodList.reduce((sum, item) => sum + item.price * item.qty, 0),
    [selectedFoodList]
  );

  const handleToggleSelectFood = (item, guestIdx = activeFoodGuest, dateStr = activeFoodDate) => {
    setSelectedFoodByDateGuest((prev) => {
      const dateMap = prev[dateStr] || {};
      const guestMap = dateMap[guestIdx] || {};
      const existing = guestMap[item.key];
      if (existing && existing.qty > 0) {
        const nextGuestMap = { ...guestMap };
        delete nextGuestMap[item.key];
        return { ...prev, [dateStr]: { ...dateMap, [guestIdx]: nextGuestMap } };
      }
      return {
        ...prev,
        [dateStr]: {
          ...dateMap,
          [guestIdx]: {
            ...guestMap,
            [item.key]: { ...item, qty: 1, dateStr, guestIndex: guestIdx }
          }
        }
      };
    });
  };

  const handleUpdateFoodQty = (key, delta, guestIdx = activeFoodGuest, dateStr = activeFoodDate) => {
    setSelectedFoodByDateGuest((prev) => {
      const dateMap = prev[dateStr] || {};
      const guestMap = dateMap[guestIdx] || {};
      const existing = guestMap[key];
      if (!existing) return prev;
      const nextQty = existing.qty + delta;
      if (nextQty <= 0) {
        const nextGuestMap = { ...guestMap };
        delete nextGuestMap[key];
        return { ...prev, [dateStr]: { ...dateMap, [guestIdx]: nextGuestMap } };
      }
      return {
        ...prev,
        [dateStr]: {
          ...dateMap,
          [guestIdx]: {
            ...guestMap,
            [key]: { ...existing, qty: Math.min(99, nextQty) }
          }
        }
      };
    });
  };

  const routeFares = useMemo(
    () => (isTransport && Array.isArray(hotel.routeFares) ? hotel.routeFares : []),
    [isTransport, hotel.routeFares]
  );

  const adminFromOptions = useMemo(() => {
    const vals = routeFares.map((r) => (r.from || '').trim()).filter(Boolean);
    return Array.from(new Set(vals));
  }, [routeFares]);

  const adminToOptions = useMemo(() => {
    const forFrom = routeFrom
      ? routeFares.filter((r) => (r.from || '').trim() === routeFrom)
      : routeFares;
    const source = forFrom.length > 0 ? forFrom : routeFares;
    const vals = source.map((r) => (r.to || '').trim()).filter(Boolean);
    return Array.from(new Set(vals));
  }, [routeFares, routeFrom]);

  const adminSeatOptions = useMemo(() => {
    const matching = routeFares.filter((r) => {
      const fMatch = !routeFrom || (r.from || '').trim() === routeFrom;
      const tMatch = !routeTo || (r.to || '').trim() === routeTo;
      return fMatch && tMatch;
    });
    const source = matching.length > 0 ? matching : routeFares;
    const vals = source
      .map((r) => Number(r.seats))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (vals.length > 0) {
      const maxSeats = Math.min(Math.max(...vals), 60);
      return Array.from({ length: maxSeats }, (_, i) => i + 1);
    }
    return [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15];
  }, [routeFares, routeFrom, routeTo]);

  useEffect(() => {
    if (!isTransport || routeFares.length === 0) return;
    if (adminFromOptions.length > 0 && !adminFromOptions.includes(routeFrom)) {
      setRouteFrom(adminFromOptions[0]);
      return;
    }
    if (adminToOptions.length > 0 && !adminToOptions.includes(routeTo)) {
      setRouteTo(adminToOptions[0]);
    }
    if (adminSeatOptions.length > 0 && !adminSeatOptions.includes(seatCount)) {
      setSeatCount(adminSeatOptions[0]);
    }
  }, [isTransport, hotel?.id, routeFares.length, adminFromOptions, adminToOptions, adminSeatOptions, routeFrom, routeTo, seatCount]);

  // Handler for Room Count (Changing rooms immediately updates price in real-time & checks guest capacity)
  const handleRoomCountChange = (newRooms) => {
    setRoomCount(newRooms);
    const maxAllowed = newRooms * 3;
    if (guestCount > maxAllowed) {
      setPendingGuestCount(guestCount);
      setIsHotelHelpCenterModalOpen(true);
    }
  };

  // Handler for Guests: 3 guests per room rule (1 room -> max 3, 2 rooms -> max 6, etc.)
  const handleAdultsChange = (newAdults) => {
    const safeAdults = Math.max(1, newAdults);
    const newTotal = safeAdults + childrenCount;
    const maxAllowed = roomCount * 3;
    if (newTotal > maxAllowed) {
      setPendingGuestCount(newTotal);
      setIsHotelHelpCenterModalOpen(true);
      return;
    }
    setAdultCount(safeAdults);
  };

  const handleChildrenChange = (newChildren) => {
    const safeChildren = Math.max(0, newChildren);
    const newTotal = adultCount + safeChildren;
    const maxAllowed = roomCount * 3;
    if (newTotal > maxAllowed) {
      setPendingGuestCount(newTotal);
      setIsHotelHelpCenterModalOpen(true);
      return;
    }
    setChildrenCount(safeChildren);
  };

  // Calendar View Month Navigation (Default to Check-in Month)
  const [calendarViewDate, setCalendarViewDate] = useState(() => {
    const parts = tomorrowISO.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, 1);
  });

  // Dynamic Day, Price & VAT/Tax Calculations
  const matchedRouteFare = useMemo(() => {
    if (!isTransport || routeFares.length === 0) return null;
    return (
      routeFares.find(
        (r) =>
          (r.from || '').trim() === routeFrom &&
          (r.to || '').trim() === routeTo
      ) ||
      routeFares.find((r) => (r.from || '').trim() === routeFrom) ||
      null
    );
  }, [isTransport, routeFares, routeFrom, routeTo]);

  const perDayPrice =
    isTransport && matchedRouteFare && Number(matchedRouteFare.price) > 0
      ? Number(matchedRouteFare.price)
      : Number(hotel.bookingPrice ?? hotel.pricePerNight ?? 3500);
  const effectiveCheckOutDate = checkOutDate || (checkInDate ? addDaysISO(checkInDate, 1) : addDaysISO(todayISO, 1));
  const calculatedDays = useMemo(() => {
    if (isRestaurant) {
      return selectedRestaurantDates.length;
    }
    if (!checkInDate) return 1;
    if (isSelectingCheckOut && hoverDate) {
      const minD = hoverDate < checkInDate ? hoverDate : checkInDate;
      const maxD = hoverDate > checkInDate ? hoverDate : checkInDate;
      return Math.max(1, diffDaysISO(minD, maxD));
    }
    return Math.max(1, diffDaysISO(checkInDate, effectiveCheckOutDate));
  }, [isRestaurant, selectedRestaurantDates, checkInDate, effectiveCheckOutDate, isSelectingCheckOut, hoverDate]);
  const effectiveGuestCount = isRestaurant ? restaurantGuests : guestCount;
  const baseRentPrice = isTransport
    ? perDayPrice * calculatedDays * seatCount * (tripType === 'Round-Trip' ? 2 : 1)
    : isRestaurant
      ? (selectedFoodList.length > 0
          ? selectedFoodTotalAllDates
          : perDayPrice * calculatedDays * restaurantGuests)
      : perDayPrice * calculatedDays * roomCount;
  const vatTaxPercentage = Number(hotel.vatTaxPercentage ?? 5);

  // Promo code in Checkout Modal
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Contact form inputs in Checkout Modal
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerWhatsApp, setCustomerWhatsApp] = useState(user?.phone || '');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (sameAsPhone) {
      setCustomerWhatsApp(customerPhone);
    }
  }, [customerPhone, sameAsPhone]);

  // Calendar Grid Generator (All 1 to 30/31 days clickable for flexible ranges like 1-5, 5-10, 20-25)
  const calendarDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = [];
    // Padding before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push(null);
    }
    // Days 1 to 30/31
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      let isStart = false;
      let isEnd = false;
      let isInRange = false;

      if (isRestaurant) {
        isStart = selectedRestaurantDates.includes(dateStr);
      } else if (isSelectingCheckOut && checkInDate) {
        if (hoverDate) {
          const minDate = hoverDate < checkInDate ? hoverDate : checkInDate;
          const maxDate = hoverDate > checkInDate ? hoverDate : checkInDate;
          isStart = dateStr === minDate;
          isEnd = dateStr === maxDate && minDate !== maxDate;
          isInRange = dateStr > minDate && dateStr < maxDate;
        } else {
          isStart = dateStr === checkInDate;
          isEnd = false;
          isInRange = false;
        }
      } else if (checkInDate && checkOutDate) {
        isStart = dateStr === checkInDate;
        isEnd = dateStr === checkOutDate;
        isInRange = dateStr > checkInDate && dateStr < checkOutDate;
      } else if (checkInDate) {
        isStart = dateStr === checkInDate;
      }

      daysArray.push({
        dayNumber: d,
        dateStr,
        isPast: false, // Ensure custom range testing (1 to 5, 5 to 10, 20 to 25) is never blocked!
        isStart,
        isEnd,
        isInRange
      });
    }
    return daysArray;
  }, [isRestaurant, selectedRestaurantDates, calendarViewDate, checkInDate, checkOutDate, isSelectingCheckOut, hoverDate]);

  // Calendar click handler for 2 dates range selection (or multi-day toggle for Restaurant)
  const handleCalendarDayClick = (dayObj) => {
    if (!dayObj) return;
    const clickedStr = dayObj.dateStr;

    if (isRestaurant) {
      setSelectedRestaurantDates((prev) =>
        prev.includes(clickedStr)
          ? prev.filter((d) => d !== clickedStr)
          : [...prev, clickedStr].sort()
      );
      return;
    }

    if (isSelectingCheckOut && checkInDate) {
      // Second click:
      if (clickedStr > checkInDate) {
        // Normal order: 1 to 5, 5 to 10, 20 to 25, etc.
        setCheckOutDate(clickedStr);
        setIsSelectingCheckOut(false);
        setHoverDate(null);
      } else if (clickedStr < checkInDate) {
        // Reverse order (e.g. clicked 25 then 20): earlier date becomes check-in, original becomes check-out!
        setCheckInDate(clickedStr);
        setCheckOutDate(checkInDate);
        setIsSelectingCheckOut(false);
        setHoverDate(null);
      } else {
        // Clicked the exact same date: set checkout as +1 day (1 night stay)
        setCheckOutDate(addDaysISO(clickedStr, 1));
        setIsSelectingCheckOut(false);
        setHoverDate(null);
      }
    } else {
      // First click: Starts new range selection
      setCheckInDate(clickedStr);
      setCheckOutDate(null);
      setIsSelectingCheckOut(true);
      setHoverDate(null);
    }
  };

  const handlePrevMonth = () => {
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1));
  };

  // Promo code apply
  const handleApplyPromo = () => {
    setPromoError('');
    const code = (promoCode || '').trim().toUpperCase();
    if (!code) {
      setPromoError('দয়া করে একটি প্রোমো কোড লিখুন');
      return;
    }
    if (code === 'DISCOUNT10' || code === 'SAVE10') {
      const discount = Math.round(baseRentPrice * 0.1);
      setAppliedPromo({ code, discount, label: '১০% ছাড় প্রযোজ্য হয়েছে!' });
    } else if (code === 'WELCOME500' || code === 'PROMO500') {
      const discount = Math.min(500, baseRentPrice);
      setAppliedPromo({ code, discount, label: '৳৫০০ বিশেষ ছাড় প্রযোজ্য হয়েছে!' });
    } else if (code === 'AETHERIA20') {
      const discount = Math.round(baseRentPrice * 0.2);
      setAppliedPromo({ code, discount, label: '২০% ভিআইপি ছাড় প্রযোজ্য হয়েছে!' });
    } else {
      setPromoError('অকার্যকর প্রোমো কোড। অনুগ্রহ করে সঠিক কোড দিন (যেমন: DISCOUNT10, SAVE10)');
    }
  };

  // Grand Total calculation with dynamic VAT & Tax rate
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const taxableBase = Math.max(0, baseRentPrice - discountAmount);
  const vatTaxAmount = Math.round(taxableBase * (vatTaxPercentage / 100));
  const grandTotal = taxableBase + vatTaxAmount;

  // Checkout submission
  const handleConfirmCheckout = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('অনুগ্রহ করে আপনার সচল ফোন নম্বর লিখুন');
      return;
    }
    if (!customerWhatsApp.trim()) {
      setFormError('অনুগ্রহ করে আপনার হোয়াটসঅ্যাপ নম্বর দিন');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        type: isTransport ? 'transport_booking' : isRestaurant ? 'restaurant_booking' : 'hotel_booking',
        itemType: isTransport ? 'transport' : isRestaurant ? 'restaurant' : 'hotel',
        itemId: hotel.id,
        itemTitle: hotel.name,
        hotelName: hotel.name,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim(),
        customerWhatsApp: customerWhatsApp.trim(),
        checkInDate: isRestaurant ? (selectedRestaurantDates[0] || checkInDate) : checkInDate,
        checkOutDate: isRestaurant ? (selectedRestaurantDates[selectedRestaurantDates.length - 1] || checkOutDate) : checkOutDate,
        selectedDates: isRestaurant ? selectedRestaurantDates : undefined,
        days: calculatedDays,
        rooms: isTransport || isRestaurant ? 1 : roomCount,
        guests: isTransport ? seatCount : effectiveGuestCount,
        adults: isTransport || isRestaurant ? undefined : adultCount,
        children: isTransport || isRestaurant ? undefined : childrenCount,
        seats: isTransport ? seatCount : undefined,
        tripType: isTransport ? tripType : undefined,
        routeFrom: isTransport ? routeFrom.trim() : undefined,
        routeTo: isTransport ? routeTo.trim() : undefined,
        selectedFoods: isRestaurant && selectedFoodList.length > 0 ? selectedFoodList : undefined,
        specialNotes: isTransport
          ? `ট্রিপ: ${tripType} | সিট: ${seatCount} টি${routeFrom.trim() || routeTo.trim() ? ` | রুট: ${routeFrom.trim() || 'নির্ধারিত নয়'} → ${routeTo.trim() || 'নির্ধারিত নয়'}` : ''}`
          : isRestaurant
            ? `গেস্ট: ${restaurantGuests} জন | তারিখ (${selectedRestaurantDates.length} দিন): ${selectedRestaurantDates.join(', ')}${selectedFoodList.length > 0 ? ` | খাবার: ${selectedFoodList.map((f) => `${f.dateStr} (Guest ${f.guestIndex}): ${f.name} x${f.qty}`).join(', ')}` : ''}`
            : `Adults: ${adultCount}, Children: ${childrenCount}`,
        perDayPrice,
        basePrice: baseRentPrice,
        discount: discountAmount,
        promoCode: appliedPromo?.code || null,
        taxAmount: vatTaxAmount,
        vatTaxPercentage,
        totalPrice: grandTotal,
        paymentStatus: 'Pending',
        status: 'Confirmed',
        hotelDetails: {
          location: hotel.location || hotel.destinationId || '',
          checkInTime: hotel.checkInTime || '14:00',
          checkOutTime: hotel.checkOutTime || '12:00'
        }
      };

      const result = await StorageService.saveBooking(bookingData);
      const generatedId = result?.[0]?.id || `AETH-${Math.floor(1000 + Math.random() * 9000)}-BK`;
      setCompletedBookingId(generatedId);
      setBookingCompleted(true);
      if (onBookingSuccess) onBookingSuccess(bookingData);
    } catch (err) {
      console.error('Hotel booking error:', err);
      setFormError('বুকিং সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct WhatsApp contact link
  const whatsAppMessage = encodeURIComponent(
    `হ্যালো! আমি ${hotel.name}-এ রুম বুকিং সম্পর্কে জানতে আগ্রহী।\n` +
    `গন্তব্য: ${hotel.location || hotel.destinationId || 'বাংলাদেশ'}\n` +
    `তারিখ: ${toDisplayDate(checkInDate)} থেকে ${toDisplayDate(checkOutDate)} (${calculatedDays} দিন)\n` +
    `প্রতিদিনের ভাড়া: ৳${perDayPrice}\n` +
    `মোট প্রদেয় মূল্য: ৳${grandTotal}`
  );
  const whatsAppDirectUrl = rawWa ? `https://wa.me/${rawWa}?text=${whatsAppMessage}` : '';

  return (
    <div className="relative min-h-screen pt-24 sm:pt-28 pb-10 sm:pb-12 px-3 sm:px-6 lg:px-12 max-w-[2100px] mx-auto text-slate-900 dark:text-white transition-colors duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & BACK BUTTON (SINGLE HOTELS & RESORTS text removed, clean back button) */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-row items-center justify-between gap-4">
        {/* Clean Back Button added directly at the top */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-300/80 dark:border-white/10 hover:border-[#69EBDA] text-slate-800 dark:text-slate-100 font-bold shadow-sm hover:shadow-md transition-all duration-200 w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-600 dark:text-[#69EBDA]" />
          <span>পেছনে ফিরে যান (Back)</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {hotel.location && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 w-fit">
              <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-[#69EBDA]" />
              <span>{hotel.location}</span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => toggleWishlist && toggleWishlist(hotel.id)}
            className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-bold ${
              isFav
                ? 'bg-rose-500 border-rose-400 text-white shadow-rose-500/30'
                : 'bg-white/90 dark:bg-slate-800/90 border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-rose-500'
            }`}
            title={isFav ? 'উইশলিস্ট থেকে সরান' : 'উইশলিস্টে যুক্ত করুন'}
          >
            <Heart className={`w-4 h-4 transition-transform ${isFav ? 'fill-white scale-110' : ''}`} />
            <span className="hidden sm:inline">{isFav ? 'সংরক্ষিত' : 'উইশলিস্ট'}</span>
          </button>
        </div>
      </div>

      {/* Hotel Name & Short Description */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Outfit',sans-serif] leading-tight">
          {hotel.name}
        </h1>

        {hotel.shortDescription && (
          <p className="mt-2.5 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-medium max-w-4xl leading-relaxed">
            {hotel.shortDescription}
          </p>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. LARGE MEDIA STAGE (Desktop 3:1 Ratio Split) - Photo text overlay removed */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto mb-10 sm:mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* LEFT 3 PARTS (~75% width): Large Featured Photo Frame */}
          <div className="lg:col-span-3 relative h-[280px] sm:h-[420px] md:h-[500px] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-300/80 dark:border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_50px_rgba(0,0,0,0.6)] group">
            <img
              src={activePhoto}
              alt={hotel.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

            {/* Note: "Selected images Cox's Bazar Hotel" text overlay removed per instruction */}
            {hotel.location && (
              <div className="absolute bottom-4 right-4 bg-teal-500/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                <MapPin className="w-3.5 h-3.5" />
                <span>{hotel.location}</span>
              </div>
            )}
          </div>

          {/* RIGHT 1 PART (~25% width): Vertically Scrollable Gallery & YouTube Video Cards */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                ফটো ও ভিডিও গ্যালারি ({galleryPhotos.length + (youtubeThumb ? 1 : 0)})
              </span>
              <span className="text-[11px] text-teal-600 dark:text-[#69EBDA] font-semibold">ক্লিক করে দেখুন</span>
            </div>

            {/* Scrollable Gallery Container */}
            <div className="flex-1 max-h-[280px] sm:max-h-[420px] md:max-h-[460px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {/* YouTube Video Thumbnail Card (If available) */}
              {hotel.youtubeLink && (
                <div
                  onClick={() => window.open(toYouTubeWatchUrl(hotel.youtubeLink), '_blank', 'noopener,noreferrer')}
                  className="relative h-24 sm:h-28 rounded-2xl overflow-hidden cursor-pointer border-2 border-red-500/70 hover:border-red-500 shadow-md group transition-all duration-200"
                  title="ইউটিউব ভিডিও দেখুন"
                >
                  <img
                    src={youtubeThumb || defaultPhotoUrl}
                    alt="YouTube Video Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center justify-between text-white text-[11px] font-bold">
                    <span className="truncate">ভিডিও প্রিভিউ</span>
                    <ExternalLink className="w-3 h-3 text-red-400 shrink-0" />
                  </div>
                </div>
              )}

              {/* Gallery Photos */}
              {galleryPhotos.map((photo, index) => {
                const isActive = activePhoto === photo;
                return (
                  <div
                    key={index}
                    onClick={() => setActivePhoto(photo)}
                    className={`
                      relative h-20 sm:h-24 md:h-28 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200
                      ${isActive
                        ? 'ring-4 ring-teal-500 dark:ring-[#69EBDA] shadow-lg scale-[1.02]'
                        : 'border border-slate-300/80 dark:border-white/10 opacity-80 hover:opacity-100 hover:border-teal-400'
                      }
                    `}
                  >
                    <img
                      src={photo}
                      alt={`Gallery view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-500 dark:bg-[#69EBDA] text-white dark:text-slate-900 flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LOWER CONTENT: Customer Reviews All View OR Regular Two-Column Layout   */}
      {/* ========================================================================= */}
      {isAllCommentsView ? (
        /* ========================================================================= */
        /* FULL-PAGE ALL CUSTOMER REVIEWS & COMMUNITY SECTION                        */
        /* (Hides calendar, pricing, short info, and location; keeps photo gallery)  */
        /* ========================================================================= */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Top Bar with Back Button & Direct Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-300/80 dark:border-white/15 shadow-xl">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setIsAllCommentsView(false)}
                className="mb-2 px-3.5 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-700 dark:text-[#69EBDA] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>হোটেল ডিটেইলস ভিউতে ফিরুন</span>
              </button>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                সকল কাস্টমার রিভিউ ও কমিউনিটি মতামত
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hotel.name} • সর্বমোট {ratingMeta.totalReviews} টি রিভিউ ও রেটিং
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Direct Card Rating Widget */}
              <div className="px-3.5 py-2 rounded-2xl bg-teal-50/80 dark:bg-slate-800/80 border border-teal-200/80 dark:border-white/10 flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  আপনার রেটিং দিন:
                </span>
                <div
                  className="flex items-center gap-0.5 text-amber-400"
                  onMouseLeave={() => setDetailHoverStar(0)}
                >
                  {[1, 2, 3, 4, 5].map((s) => {
                    const isFilled = detailHoverStar
                      ? s <= detailHoverStar
                      : s <= (userPrevRating || Math.round(ratingMeta.averageRating));
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleDetailCardRating(s)}
                        onMouseEnter={() => setDetailHoverStar(s)}
                        className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                        title={`${s} স্টার রেটিং দিন`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isFilled ? 'fill-amber-400 text-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.6)]' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-3 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-base font-black text-amber-500 font-mono">
                  {ratingMeta.averageRating.toFixed(1)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">/ ৫</span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenReviewModal()}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-[#69EBDA] hover:from-teal-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>কমেন্ট লিখুন</span>
              </button>
            </div>
          </div>

          {/* Feedback banner if rated */}
          <AnimatePresence>
            {detailRatingFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-2xl text-xs font-bold text-center ${
                  detailRatingFeedback.isError
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-teal-500/15 text-teal-800 dark:text-[#69EBDA] border border-teal-500/30'
                }`}
              >
                {detailRatingFeedback.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full Grid of All Reviews */}
          {hotelReviews.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-50/80 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-white/10">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-50" />
              <p className="text-sm text-slate-500 dark:text-slate-400">এখনো কোনো কাস্টমার রিভিউ পাওয়া যায়নি।</p>
              <button
                type="button"
                onClick={() => handleOpenReviewModal()}
                className="mt-3 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500 shadow-md hover:shadow-teal-500/25 transition-all cursor-pointer"
              >
                প্রথম রিভিউটি আপনিই দিন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotelReviews.map((rev) => {
              const isMyReview = rev.userId === userKey || rev.userKey === userKey || rev.userId === user?.id;
              const isLiked = HotelReviewService.isReviewLiked(hotel.id, rev.id);
              const isMenuOpen = activeReviewMenuId === rev.id;

              return (
                <div
                  key={rev.id}
                  className="p-5 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-300/80 dark:border-white/10 shadow-md transition-all hover:border-teal-500/40 relative flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={rev.userName}
                          className="w-10 h-10 rounded-full object-cover border border-teal-500/40"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {rev.userName}
                            </span>
                            {isMyReview && (
                              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-700 dark:text-[#69EBDA] text-[10px] font-black">
                                আপনার রিভিউ
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= Number(rev.rating || 5)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400">
                              {rev.date || 'সম্প্রতি'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3 dots */}
                      {isMyReview && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveReviewMenuId(isMenuOpen ? null : rev.id);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                className="absolute right-0 top-9 z-20 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 p-1 text-xs"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleOpenReviewModal(rev)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-teal-500" />
                                  <span>এডিট করুন</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(rev.id)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/15 font-semibold cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>মুছে ফেলুন</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line mb-4">
                      {rev.comment}
                    </p>
                  </div>

                  {/* Like Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(rev.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
                        isLiked
                          ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current scale-110' : ''}`} />
                      <span>{rev.likes || 0} টি লাইক</span>
                    </button>

                    <span className="text-xs text-slate-400">
                      {isLiked ? '✓ আপনি পছন্দ করেছেন' : '১ জন ১টি লাইক দিতে পারেন'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </motion.div>
      ) : (
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* LEFT COLUMN: Short Info, Fare Card (with Check-in/out), Details, Location (7 cols) */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Section A: Short Info Grid */}
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-300/80 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600 dark:text-[#69EBDA]" />
                সুবিধাসমূহ ও বৈশিষ্ট্য (Short Info)
              </h2>
              {shortInfoList.length > 4 && (
                <button
                  onClick={() => setIsMoreShortInfoOpen(true)}
                  className="text-xs font-bold text-teal-700 dark:text-[#69EBDA] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>আরও দেখুন ({shortInfoList.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* First 4-6 Short Info Items */}
            {shortInfoList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shortInfoList.slice(0, 6).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 hover:border-teal-500/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 dark:bg-[#69EBDA]/20 text-teal-700 dark:text-[#69EBDA] flex items-center justify-center shrink-0">
                      {(() => {
                        const rawIcon = item.icon || item.iconCode || item.iconInput || '';
                        if (rawIcon && parseReactIconInput(rawIcon)) {
                          return <DynamicReactIcon iconCode={rawIcon} className="w-4 h-4" />;
                        }
                        if (rawIcon) {
                          return <span className="text-base leading-none">{rawIcon}</span>;
                        }
                        return <CheckCircle2 className="w-4 h-4" />;
                      })()}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {item.text || item.info}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                এই হোটেলের জন্য পর্যাপ্ত সুবিধার তালিকা শীঘ্রই যোগ করা হবে।
              </p>
            )}

            {/* "More" Button for Short Info */}
            {shortInfoList.length > 6 && (
              <button
                onClick={() => setIsMoreShortInfoOpen(true)}
                className="mt-4 w-full py-2.5 rounded-2xl bg-teal-500/10 dark:bg-[#69EBDA]/15 hover:bg-teal-500/20 text-teal-800 dark:text-[#69EBDA] font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-teal-500/20 cursor-pointer"
              >
                <span>সবগুলো ({shortInfoList.length}টি) সুবিধা দেখতে ক্লিক করুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* Section B: Daily Booking Fare Card (No Book Now button, Check-in/out on right) */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-transparent dark:from-teal-900/30 dark:via-slate-900 rounded-3xl p-5 sm:p-7 border border-teal-500/30 dark:border-[#69EBDA]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left side: Booking Fare */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-[#69EBDA] flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5" />
                Daily Booking Fare (প্রতিদিনের বুকিং ভাড়া)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
                  ৳ {perDayPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                  / {hotel.bookingDays || 'প্রতি দিন'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                ভ্যাট ও ট্যাক্স পরবর্তীতে প্রযোজ্য হবে • কোনো গোপন চার্জ নেই
              </p>
            </div>

            {/* Right side: Route Fares for Transport (if provided) OR Check-in & Check-out Timing */}
            {isTransport && Array.isArray(hotel.routeFares) && hotel.routeFares.length > 0 ? (
              <div className="flex flex-col gap-2 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-teal-500/20 dark:border-white/10 w-full sm:w-auto sm:min-w-[260px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-[#69EBDA] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  রুট ও সিট ভাড়া (Route & Seat Fares)
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {hotel.routeFares.map((rf, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (rf.from) setRouteFrom(rf.from);
                        if (rf.to) setRouteTo(rf.to);
                        if (rf.seats) setSeatCount(Number(rf.seats) || 1);
                      }}
                      className="w-full text-left flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-teal-500/20 transition-all cursor-pointer text-xs"
                      title="ক্লিক করে রুট ও সিট সিলেক্ট করুন"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                        {rf.from || 'From'} → {rf.to || 'To'}
                      </span>
                      <span className="font-extrabold text-teal-700 dark:text-[#69EBDA] shrink-0">
                        {rf.seats ? `${rf.seats} সিট • ` : ''}৳ {Number(rf.price || 0).toLocaleString('en-IN')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : isRestaurant ? null : (
              <div className="flex flex-col sm:items-end gap-2 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-teal-500/20 dark:border-white/10 w-full sm:w-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-[#69EBDA] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  সময়সূচি (Hotel Timings)
                </span>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex sm:flex-col gap-3 sm:gap-1">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Check-in: </span>
                    <span className="font-bold text-slate-900 dark:text-white">{hotel.checkInTime || '14:00 (দুপুর ২:০০)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Check-out: </span>
                    <span className="font-bold text-slate-900 dark:text-white">{hotel.checkOutTime || '12:00 (দুপুর ১২:০০)'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section C: Hotel Details (4 to 5 lines + See More) */}
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-300/80 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-3">
              হোটেলের বিস্তারিত বিবরণ
            </h2>

            <div className="relative">
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-5 whitespace-pre-line">
                {hotel.details || hotel.description || hotel.shortDescription || 'হোটেলের বিস্তারিত বিবরণ খুব শীঘ্রই প্রকাশিত হচ্ছে।'}
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
            </div>

            {/* "Read the full description" Button (Premium Style matching Click to see all button) */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setIsFullDetailsOpen(true)}
                className="w-full py-3 px-5 rounded-2xl bg-teal-500/10 dark:bg-[#69EBDA]/15 hover:bg-teal-500/20 border border-teal-500/30 text-teal-900 dark:text-[#69EBDA] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <span>Read the full description (সম্পূর্ণ বিবরণ পড়ুন)</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Section D: Location Box with Embedded Live Map & Directions */}
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-300/80 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600 dark:text-[#69EBDA]" />
              হোটেলের অবস্থান ও লাইভ ম্যাপ
            </h2>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {hotel.location || hotel.destinationId || 'মূল পর্যটন কেন্দ্র, বাংলাদেশ'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  গন্তব্য এলাকা: {hotel.destinationId || hotel.location || 'জনপ্রিয় পর্যটন স্পট'}
                </p>
              </div>

              {/* Clickable Live Location Link */}
              {hotel.locationLink ? (
                <a
                  href={hotel.locationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>গুগল ম্যাপে লাইভ ডিরেকশন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + (hotel.location || ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white font-bold text-xs transition-all shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-[#69EBDA]" />
                  <span>গুগল ম্যাপে খুঁজুন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Embedded Live Google Map Box */}
            <div className="rounded-2xl overflow-hidden border border-slate-300/80 dark:border-white/10 h-52 sm:h-64 relative bg-slate-100 dark:bg-slate-800/90 shadow-inner">
              <iframe
                title="Hotel Live Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent((hotel.name || '') + ' ' + (hotel.location || hotel.destinationId || 'Bangladesh'))}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full filter contrast-[1.03]"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Full Interactive 30-Day Range Calendar, Dynamic Total, Booking */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white/95 dark:bg-slate-900/95 rounded-3xl p-5 sm:p-7 border border-slate-300/80 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.14)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-[#69EBDA]">
                  রুম বুকিং ক্যালেন্ডার
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  তারিখ নির্বাচন করুন
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">প্রতিদিন</span>
                <p className="text-base sm:text-lg font-bold text-teal-700 dark:text-[#69EBDA]">
                  ৳{perDayPrice.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Selected Dates Display */}
            {isRestaurant ? (
              <div className="mb-5 p-3.5 rounded-2xl bg-teal-50/80 dark:bg-slate-800/80 border border-teal-200/80 dark:border-teal-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-[#69EBDA]">
                    নির্বাচিত দিন ({selectedRestaurantDates.length} দিন)
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    তারিখে ক্লিক করে সিলেক্ট / আনসিলেক্ট করুন
                  </span>
                </div>
                {selectedRestaurantDates.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRestaurantDates.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() =>
                          setSelectedRestaurantDates((prev) => prev.filter((item) => item !== d))
                        }
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-teal-300 dark:border-[#69EBDA]/40 text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1 cursor-pointer hover:border-rose-400"
                        title="আনসিলেক্ট করতে ক্লিক করুন"
                      >
                        <span>{toDisplayDate(d)}</span>
                        <X className="w-3 h-3 text-rose-500" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    ক্যালেন্ডার থেকে কমপক্ষে ১টি দিন সিলেক্ট করুন
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 mb-5 p-3.5 rounded-2xl bg-teal-50/80 dark:bg-slate-800/80 border border-teal-200/80 dark:border-teal-500/25">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-[#69EBDA] block">
                    Since when (Check-in)
                  </span>
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                    {toDisplayDate(checkInDate)}
                  </span>
                </div>
                <div className="space-y-0.5 text-right sm:text-left">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-[#69EBDA] block">
                    Until when (Check-out)
                  </span>
                  <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                    {checkOutDate ? (
                      toDisplayDate(checkOutDate)
                    ) : isSelectingCheckOut && hoverDate ? (
                    <span className="text-teal-600 dark:text-[#69EBDA] font-bold">
                      {toDisplayDate(hoverDate)}
                    </span>
                  ) : (
                    <span className="text-teal-600 dark:text-[#69EBDA] animate-pulse text-xs sm:text-sm font-semibold">
                      তারিখ নির্বাচন করুন...
                    </span>
                  )}
                </span>
              </div>
            </div>
            )}

            {/* Full Visual Monthly Interactive Calendar (30 Days with Month Name) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 mb-5">
              {/* Calendar Month & Navigation */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {MONTH_NAMES[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()} ({MONTH_NAMES_BN[calendarViewDate.getMonth()]})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                    title="আগের মাস"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                    title="পরের মাস"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>রবি</span>
                <span>সোম</span>
                <span>মঙ্গল</span>
                <span>বুধ</span>
                <span>বৃহ</span>
                <span>শুক্র</span>
                <span>শনি</span>
              </div>

              {/* 30 Days Calendar Grid */}
              <div
                className="grid grid-cols-7 gap-1"
                onMouseLeave={() => isSelectingCheckOut && setHoverDate(null)}
              >
                {calendarDays.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="h-8 sm:h-9" />;
                  }

                  const isSelectedEdge = day.isStart || day.isEnd;
                  const isRangeMid = day.isInRange;

                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onMouseEnter={() => isSelectingCheckOut && setHoverDate(day.dateStr)}
                      onClick={() => handleCalendarDayClick(day)}
                      className={`
                        h-8 sm:h-9 text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center relative cursor-pointer select-none
                        ${isSelectedEdge
                          ? 'bg-teal-600 dark:bg-[#69EBDA] text-white dark:text-slate-950 font-black shadow-md z-10 scale-105 rounded-xl'
                          : isRangeMid
                            ? 'bg-teal-500/20 dark:bg-[#69EBDA]/25 text-teal-900 dark:text-[#69EBDA] font-extrabold rounded-none'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-teal-500/15 dark:hover:bg-slate-700'
                        }
                      `}
                    >
                      {day.dayNumber}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                <span>
                  {isSelectingCheckOut ? (
                    <span className="text-teal-700 dark:text-[#69EBDA] font-bold animate-pulse">
                      * চেক-আউটের জন্য শেষ তারিখে ক্লিক করুন (যেমন: ৫, ১০, ২২ বা ২৫)
                    </span>
                  ) : (
                    <span>* শুরুর ও শেষের তারিখে ক্লিক করে সহজে দিন নির্বাচন করুন</span>
                  )}
                </span>
                <span className="font-bold text-teal-700 dark:text-[#69EBDA]">{calculatedDays} দিন নির্বাচিত</span>
              </div>
            </div>

            {/* Rooms & Guests Selection (Adapts for Transport & Restaurant) */}
            {isTransport ? (
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    ট্রিপের ধরন (Trip Type)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['One-Way', 'Round-Trip'].map((type) => {
                      const active = tripType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setTripType(type)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            active
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                          }`}
                        >
                          <span>{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    সিট সংখ্যা (Seat Count)
                  </label>
                  <select
                    value={seatCount}
                    onChange={(e) => setSeatCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  >
                    {adminSeatOptions.map((n) => (
                      <option key={n} value={n}>{n} টি সিট</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      From (যেখান থেকে যাবেন)
                    </label>
                    {adminFromOptions.length > 0 ? (
                      <select
                        value={routeFrom}
                        onChange={(e) => {
                          const nextFrom = e.target.value;
                          setRouteFrom(nextFrom);
                          const paired = routeFares.find((r) => (r.from || '').trim() === nextFrom);
                          if (paired && (paired.to || '').trim()) {
                            setRouteTo((paired.to || '').trim());
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#69EBDA]"
                      >
                        {adminFromOptions.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={routeFrom}
                        onChange={(e) => setRouteFrom(e.target.value)}
                        placeholder="যেমন: ঢাকা"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#69EBDA]"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      To (যেখানে যাবেন)
                    </label>
                    {adminToOptions.length > 0 ? (
                      <select
                        value={routeTo}
                        onChange={(e) => setRouteTo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#69EBDA]"
                      >
                        {adminToOptions.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={routeTo}
                        onChange={(e) => setRouteTo(e.target.value)}
                        placeholder="যেমন: কক্সবাজার"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#69EBDA]"
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : isRestaurant ? (
              <div className="mb-5 space-y-2.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  অতিথি সংখ্যা (Guest: {restaurantGuests} জন)
                </label>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Guest</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">কতজন গেস্ট খাবার খাবে</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRestaurantGuests((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-sm font-black text-slate-800 dark:text-white hover:border-[#69EBDA] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-slate-900 dark:text-white w-6 text-center">{restaurantGuests}</span>
                    <button
                      type="button"
                      onClick={() => setRestaurantGuests((prev) => Math.min(50, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-sm font-black text-slate-800 dark:text-white hover:border-[#69EBDA] cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Choose your favorite food list (below Guest selector) */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 space-y-2.5">
                  <span className="block text-xs font-extrabold text-teal-700 dark:text-[#69EBDA]">
                    Choose your favorite food list
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFoodMenuModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 hover:brightness-105 text-slate-950 font-extrabold text-xs shadow-sm cursor-pointer transition-all"
                    >
                      খাবারের মেনু
                    </button>
                    {hasConfirmedFoodMenu && selectedFoodList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsSelectedFoodsModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white/15 hover:bg-slate-800 text-[#69EBDA] border border-[#69EBDA]/40 font-extrabold text-xs shadow-sm cursor-pointer transition-all"
                      >
                        সিলেক্ট করা খাবার ({totalSelectedFoodQty})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    রুম সংখ্যা
                  </label>
                  <select
                    value={roomCount}
                    onChange={(e) => handleRoomCountChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} টি রুম</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    অতিথি (Adults ও Children • মোট: {guestCount} জন)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Adults */}
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Adults</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">17+ years</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdultsChange(adultCount - 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs font-black text-slate-800 dark:text-white hover:border-[#69EBDA] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-slate-900 dark:text-white w-4 text-center">{adultCount}</span>
                        <button
                          type="button"
                          onClick={() => handleAdultsChange(adultCount + 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs font-black text-slate-800 dark:text-white hover:border-[#69EBDA] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Children</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">1 - 17 years</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleChildrenChange(childrenCount - 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs font-black text-slate-800 dark:text-white hover:border-[#69EBDA] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-slate-900 dark:text-white w-4 text-center">{childrenCount}</span>
                        <button
                          type="button"
                          onClick={() => handleChildrenChange(childrenCount + 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs font-black text-slate-800 dark:text-white hover:border-[#69EBDA] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Total Price Breakdown (Updates automatically in real-time when days or rooms change) */}
            <motion.div
              key={`${calculatedDays}-${roomCount}-${seatCount}-${guestCount}-${grandTotal}`}
              initial={{ scale: 0.98, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-5 rounded-2xl bg-teal-50/90 dark:bg-slate-800/90 border border-teal-200/90 dark:border-teal-500/30 mb-6 space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>
                  {isTransport
                    ? `গাড়ি ভাড়া (${calculatedDays} দিন × ৳${perDayPrice.toLocaleString('en-IN')} • ${seatCount} সিট)`
                    : isRestaurant
                      ? selectedFoodList.length > 0
                        ? `নির্বাচিত খাবার (${totalSelectedFoodQty} টি আইটেম × ${calculatedDays} দিন)`
                        : `ডাইনিং চার্জ (${calculatedDays} দিন × ${restaurantGuests} জন × ৳${perDayPrice.toLocaleString('en-IN')})`
                      : `রুম ভাড়া (${calculatedDays} দিন × ${roomCount} রুম × ৳${perDayPrice.toLocaleString('en-IN')})`}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ৳ {baseRentPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>ভ্যাট ও সার্ভিস চার্জ ({vatTaxPercentage}%)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  + ৳ {vatTaxAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2.5 border-t border-teal-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-teal-800 dark:text-[#69EBDA] block">
                    Total Price (সর্বমোট মূল্য)
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {isTransport
                      ? `Total calculation for ${calculatedDays} day${calculatedDays > 1 ? 's' : ''} (${seatCount} seat${seatCount > 1 ? 's' : ''})`
                      : isRestaurant
                        ? `Total calculation for ${calculatedDays} day${calculatedDays > 1 ? 's' : ''} (${restaurantGuests} guest${restaurantGuests > 1 ? 's' : ''}${selectedFoodList.length > 0 ? ` • ${totalSelectedFoodQty} items` : ''})`
                        : `Total calculation for ${calculatedDays} day${calculatedDays > 1 ? 's' : ''} (${roomCount} room${roomCount > 1 ? 's' : ''})`}
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
                  ৳ {grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </motion.div>

            {/* Booking Now Button */}
            <button
              onClick={() => {
                if (isRestaurant && selectedRestaurantDates.length === 0) {
                  setSelectedRestaurantDates([tomorrowISO]);
                } else if (!isRestaurant && !checkOutDate) {
                  setCheckOutDate(effectiveCheckOutDate);
                  setIsSelectingCheckOut(false);
                }
                setIsCheckoutModalOpen(true);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 via-[#69EBDA] to-teal-500 hover:from-teal-500 hover:to-[#69EBDA] text-slate-950 font-black text-base shadow-[0_10px_25px_rgba(105,235,218,0.4)] hover:shadow-[0_12px_30px_rgba(105,235,218,0.6)] transition-all duration-300 flex items-center justify-center gap-2 group mb-3 cursor-pointer"
            >
              <span>Booking Now (বুকিং করুন)</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Direct Contact Option (Default WhatsApp) */}
            <div className="space-y-2 mb-6">
              {whatsAppDirectUrl && (
                <a
                  href={whatsAppDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] dark:text-[#25D366] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                  <span>সরাসরি হোয়াটসঅ্যাপে কথা বলুন</span>
                </a>
              )}

              {cleanHotlineTel && (
                <a
                  href={`tel:${cleanHotlineTel}`}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-[#69EBDA] shrink-0" />
                  <span>২৪/৭ কল করুন: {hotlinePhone}</span>
                </a>
              )}
            </div>

            {/* ============================================================== */}
            {/* Customer Reviews & Comments Box (Max Height: 500px)           */}
            {/* ============================================================== */}
            <div className="pt-5 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                      কাস্টমার রিভিউ ও কমেন্টস
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-amber-500 font-mono">⭐ {ratingMeta.averageRating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{ratingMeta.totalReviews} টি রিভিউ</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenReviewModal()}
                  className="px-2.5 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-700 dark:text-[#69EBDA] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>কমেন্ট করুন</span>
                </button>
              </div>

              {/* Direct Rating directly on Card */}
              <div className="p-3 mb-3.5 rounded-2xl bg-teal-500/10 dark:bg-slate-800/90 border border-teal-500/25 dark:border-white/10 flex items-center justify-between gap-2 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    কার্ড থেকে সরাসরি রেটিং দিন:
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {userPrevRating ? `আপনার রেটিং: ${userPrevRating}★` : 'স্টারে ক্লিক করে রেটিং দিন'}
                  </span>
                </div>
                <div
                  className="flex items-center gap-0.5 text-amber-400"
                  onMouseLeave={() => setDetailHoverStar(0)}
                >
                  {[1, 2, 3, 4, 5].map((s) => {
                    const isFilled = detailHoverStar
                      ? s <= detailHoverStar
                      : s <= (userPrevRating || Math.round(ratingMeta.averageRating));

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleDetailCardRating(s)}
                        onMouseEnter={() => setDetailHoverStar(s)}
                        className="p-1 rounded-md hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                        title={`${s} স্টার রেটিং দিন`}
                      >
                        <Star
                          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.6)]'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct Card Rating Feedback Toast */}
              <AnimatePresence>
                {detailRatingFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-xl mb-3 shadow-sm ${
                      detailRatingFeedback.isError
                        ? 'text-amber-800 bg-amber-500/15 border border-amber-500/30 dark:text-amber-300'
                        : 'text-teal-800 bg-teal-500/15 border border-teal-500/30 dark:text-[#69EBDA]'
                    }`}
                  >
                    {detailRatingFeedback.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reviews List with Max Height 500px */}
              <div className="max-h-[500px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                {hotelReviews.length === 0 ? (
                  <div className="text-center py-6 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-white/10">
                    <MessageSquare className="w-7 h-7 mx-auto text-slate-400 mb-1.5 opacity-50" />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">এখনো কোনো কমেন্ট করা হয়নি।</p>
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal()}
                      className="mt-1.5 text-[11px] font-bold text-teal-600 dark:text-[#69EBDA] hover:underline cursor-pointer"
                    >
                      প্রথম কমেন্টটি আপনিই করুন
                    </button>
                  </div>
                ) : (
                  hotelReviews.map((rev) => {
                    const isMyReview = rev.userId === userKey || rev.userKey === userKey || rev.userId === user?.id;
                    const isLiked = HotelReviewService.isReviewLiked(hotel.id, rev.id);
                    const isMenuOpen = activeReviewMenuId === rev.id;

                    return (
                      <div
                        key={rev.id}
                        className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 transition-all hover:border-teal-500/30 relative"
                      >
                        {/* Review Header: User info, rating, and 3-dots menu */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                              alt={rev.userName}
                              className="w-7 h-7 rounded-full object-cover border border-teal-500/40 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                  {rev.userName}
                                </span>
                                {isMyReview && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-teal-500/20 text-teal-700 dark:text-[#69EBDA] text-[9px] font-black">
                                    আপনি
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="flex items-center text-amber-400">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`w-2.5 h-2.5 ${
                                        s <= Number(rev.rating || 5)
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-slate-300 dark:text-slate-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[9px] text-slate-400">
                                  {rev.date || 'সম্প্রতি'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 3-dots Menu for Edit / Delete */}
                          {isMyReview && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveReviewMenuId(isMenuOpen ? null : rev.id);
                                }}
                                className="w-6 h-6 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
                                title="অপশন"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              <AnimatePresence>
                                {isMenuOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                    className="absolute right-0 top-7 z-20 w-28 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 p-1 text-[11px]"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReviewModal(rev)}
                                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold cursor-pointer"
                                    >
                                      <Edit2 className="w-3 h-3 text-teal-500" />
                                      <span>এডিট করুন</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReview(rev.id)}
                                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/15 font-semibold cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>মুছে ফেলুন</span>
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        {/* Comment Text */}
                        <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line mb-2 pl-0.5">
                          {rev.comment}
                        </p>

                        {/* Like Button (1 person 1 like) */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-white/5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleToggleLike(rev.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all cursor-pointer font-bold ${
                              isLiked
                                ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                            }`}
                          >
                            <Heart className={`w-3 h-3 ${isLiked ? 'fill-current scale-110' : ''}`} />
                            <span>{rev.likes || 0} লাইক</span>
                          </button>

                          <span className="text-[9px] text-slate-400">
                            {isLiked ? '✓ লাইক দিয়েছেন' : '১ জন ১টি লাইক'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Button to expand into full page: See all comments */}
              {hotelReviews.length > 0 && (
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAllCommentsView(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>See all comments (সব কমেন্ট দেখুন)</span>
                    <ChevronRight className="w-3.5 h-3.5 text-teal-600 dark:text-[#69EBDA]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: All Short Info Modal */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isMoreShortInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreShortInfoOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-300 dark:border-white/15 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-600 dark:text-[#69EBDA] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    সকল সুবিধা ও ইনফো তালিকা
                  </h3>
                </div>
                <button
                  onClick={() => setIsMoreShortInfoOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shortInfoList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-white/5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-[#69EBDA]/20 text-teal-700 dark:text-[#69EBDA] flex items-center justify-center shrink-0">
                      {(() => {
                        const rawIcon = item.icon || item.iconCode || item.iconInput || '';
                        if (rawIcon && parseReactIconInput(rawIcon)) {
                          return <DynamicReactIcon iconCode={rawIcon} className="w-5 h-5" />;
                        }
                        if (rawIcon) {
                          return <span className="text-lg leading-none">{rawIcon}</span>;
                        }
                        return <CheckCircle2 className="w-5 h-5" />;
                      })()}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.text || item.info}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 2: Full Hotel Details Modal */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isFullDetailsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFullDetailsOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-300 dark:border-white/15 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">সম্পূর্ণ বিবরণ ও নির্দেশিকা</p>
                </div>
                <button
                  onClick={() => setIsFullDetailsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {hotel.details || hotel.description || hotel.shortDescription}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 3: All-Device Responsive Checkout & Booking Modal */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-start p-3 sm:p-4 pt-24 sm:pt-28 pb-8 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsCheckoutModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative z-10 w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-300/80 dark:border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.5)] my-auto max-h-[82vh] overflow-y-auto custom-scrollbar"
            >
              {bookingCompleted ? (
                <div className="text-center py-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1.5">
                    বুকিং সফলভাবে সম্পন্ন হয়েছে!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto mb-3 leading-relaxed">
                    ধন্যবাদ, <span className="font-bold">{customerName}</span>! আপনার বুকিং অর্ডার সফলভাবে গ্রহণ করা হয়েছে। বুকিং আইডি: <span className="font-mono font-bold text-teal-600 dark:text-[#69EBDA]">{completedBookingId}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-5">
                    আমাদের ট্রাভেল এজেন্ট খুব শীঘ্রই আপনার হোয়াটসঅ্যাপ ও ফোনে যোগাযোগ করবেন।
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={whatsAppDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>হোয়াটসঅ্যাপে আপডেট নিন</span>
                    </a>
                    <button
                      onClick={() => {
                        setIsCheckoutModalOpen(false);
                        setBookingCompleted(false);
                      }}
                      className="py-2.5 px-5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm hover:bg-slate-300 cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>
              ) : (
                /* Checkout Form */
                <form onSubmit={handleConfirmCheckout} className="space-y-3 sm:space-y-3.5">
                  <div className="flex items-start justify-between pb-2.5 sm:pb-3 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-[#69EBDA]">
                        চেকআউট ও বুকিং ফরম
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {hotel.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {toDisplayDate(checkInDate)} থেকে {toDisplayDate(checkOutDate)} ({calculatedDays} দিন, {roomCount}টি রুম)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutModalOpen(false)}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {formError && (
                    <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Customer Info Fields */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        আপনার পূর্ণ নাম <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="যেমন: মোঃ আরিফুল ইসলাম"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        ইমেইল (ঐচ্ছিক / Gmail)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          ফোন নম্বর <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          হোয়াটসঅ্যাপ নম্বর <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={customerWhatsApp}
                          onChange={(e) => setCustomerWhatsApp(e.target.value)}
                          placeholder="017XXXXXXXX"
                          disabled={sameAsPhone}
                          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-75"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={(e) => setSameAsPhone(e.target.checked)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>ফোন নম্বর এবং হোয়াটসঅ্যাপ নম্বর একই</span>
                    </label>
                  </div>

                  {/* Promo Code Box */}
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      প্রোমো কোড (Promo Code)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="DISCOUNT10 / SAVE10"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 dark:bg-teal-600 text-white font-bold text-xs hover:bg-slate-900 dark:hover:bg-teal-500 transition-colors cursor-pointer"
                      >
                        প্রয়োগ
                      </button>
                    </div>

                    {appliedPromo && (
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ {appliedPromo.label} (-৳{appliedPromo.discount.toLocaleString('en-IN')})
                      </p>
                    )}
                    {promoError && (
                      <p className="text-[11px] text-red-500 font-semibold">{promoError}</p>
                    )}
                  </div>

                  {/* Price Calculation Breakdown */}
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>
                        {isTransport
                          ? `গাড়ি ভাড়া (${calculatedDays} দিন • ${seatCount} সিট${routeFrom || routeTo ? ` • ${routeFrom || '?'} → ${routeTo || '?'}` : ''})`
                          : isRestaurant
                            ? selectedFoodList.length > 0
                              ? `নির্বাচিত খাবার (${totalSelectedFoodQty} আইটেম × ${calculatedDays} দিন • ${restaurantGuests} জন)`
                              : `ডাইনিং চার্জ (${calculatedDays} দিন × ${restaurantGuests} জন)`
                            : `রুম ভাড়া (${calculatedDays} দিন × ${roomCount} রুম)`}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ৳ {baseRentPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>প্রোমো ছাড় ({appliedPromo.code})</span>
                        <span>- ৳ {discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>ভ্যাট ও ট্যাক্স ({vatTaxPercentage}%)</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        + ৳ {vatTaxAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-300 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        সর্বমোট মূল্য (Grand Total)
                      </span>
                      <span className="text-lg sm:text-xl font-black text-teal-600 dark:text-[#69EBDA] font-['Outfit',sans-serif]">
                        ৳ {grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Confirm Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>অর্ডার প্রসেস হচ্ছে...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>কনফার্ম বুকিং অর্ডার</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ============================================================== */}
      {/* MODAL 4: Hotel Help Center & Extra Guest Contact Modal         */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isHotelHelpCenterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHotelHelpCenterModalOpen(false)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-300 dark:border-white/15 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      হোটেল হেল্প সেন্টার ও বুকিং সহায়তা
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      অতিথি সংখ্যার বিশেষ নির্দেশিকা
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHotelHelpCenterModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                <p className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-200">
                  {roomCount}টি রুমে সর্বোচ্চ {roomCount * 3} জন অতিথি (প্রতি রুমে সর্বোচ্চ ৩ জন) অবস্থান করতে পারবেন।
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  আপনি <span className="font-bold">{pendingGuestCount} জন অতিথি</span> নির্বাচন করেছেন। {pendingGuestCount} জন অতিথির স্বাচ্ছন্দ্যে থাকার জন্য অনুগ্রহ করে কমপক্ষে <span className="font-bold">{Math.max(roomCount + 1, Math.ceil(pendingGuestCount / 3))}টি রুম</span> বুক করুন অথবা বিশেষ ব্যবস্থা ও অতিরিক্ত বেডের জন্য সরাসরি হোটেল হেল্প সেন্টারের সাথে যোগাযোগ করুন।
                </p>
              </div>

              {/* Recommended Action: Add Required Rooms */}
              <button
                type="button"
                onClick={() => {
                  const needed = Math.max(roomCount + 1, Math.ceil(pendingGuestCount / 3));
                  setRoomCount(needed);
                  setGuestCount(pendingGuestCount);
                  setIsHotelHelpCenterModalOpen(false);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{Math.max(roomCount + 1, Math.ceil(pendingGuestCount / 3))}টি রুম বুক করুন (প্রয়োজনীয় রুম যোগ করুন)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Direct Help Center Contacts */}
              {(rawWa || cleanHotlineTel) && (
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block text-center">
                  অথবা সরাসরি যোগাযোগ করুন
                </span>
                {rawWa && (
                  <a
                    href={`https://wa.me/${rawWa}?text=${encodeURIComponent(
                      `হ্যালো! আমি ${hotel.name}-এ ${roomCount}টি রুমে ${pendingGuestCount} জন অতিথির থাকার নিয়ম/এক্সট্রা বেড সুবিধা সম্পর্কে জানতে চাই।`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>হোয়াটসঅ্যাপে হেল্প সেন্টারে মেসেজ দিন</span>
                  </a>
                )}

                {cleanHotlineTel && (
                  <a
                    href={`tel:${cleanHotlineTel}`}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-[#69EBDA]" />
                    <span>২৪/৭ হেল্পলাইনে কল করুন: {hotlinePhone}</span>
                  </a>
                )}
              </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* FLOATING ACTION BUTTON: Premium "Review" Popup Trigger          */}
      {/* ============================================================== */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => handleOpenReviewModal()}
        className="fixed bottom-6 left-6 z-40 inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-slate-950/90 dark:bg-slate-900/90 backdrop-blur-2xl text-white font-extrabold text-xs sm:text-sm border border-[#69EBDA]/60 shadow-[0_12px_35px_rgba(105,235,218,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_16px_45px_rgba(105,235,218,0.55)] hover:border-[#69EBDA] transition-all cursor-pointer group"
        title="Review"
      >
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#69EBDA] to-teal-400 text-slate-950 flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
          <MessageSquarePlus className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
        <span className="tracking-wider uppercase text-[#69EBDA] group-hover:text-white transition-colors">
          Review
        </span>
      </motion.button>

      {/* ============================================================== */}
      {/* MODAL 5: Clean Simple Review Text Box Popup Modal              */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="relative z-10 w-full max-w-md rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-2xl my-auto p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                    {editingReviewId ? 'রিভিউ আপডেট করুন' : 'আপনার রিভিউ লিখুন'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {hotel.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Star Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    রেটিং দিন
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRatingValue(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRatingValue
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clean Text Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    মতামত
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewCommentText}
                    onChange={(e) => setReviewCommentText(e.target.value)}
                    placeholder="আপনার অভিজ্ঞতা ও মতামত এখানে লিখুন..."
                    className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-white/15 focus:border-[#69EBDA] focus:ring-2 focus:ring-[#69EBDA]/25 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 hover:brightness-105 text-slate-950 text-xs font-extrabold shadow-md shadow-[#69EBDA]/25 cursor-pointer transition-all"
                  >
                    {editingReviewId ? 'আপডেট করুন' : 'রিভিউ সাবমিট করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 6: Restaurant Food Menu Modal (সকাল / দুপুর / রাত)        */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isFoodMenuModalOpen && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFoodMenuModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-2xl my-auto flex flex-col max-h-[88dvh]"
            >
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      খাবারের মেনু (Food Menu)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select multiple foods and quantities as desired.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFoodMenuModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Calendar Date Switcher (< Date >) - Only Selected Dates */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-teal-50/80 dark:bg-slate-800/80 border border-teal-200 dark:border-[#69EBDA]/30">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllDaysInSummary(false);
                      handleStepFoodDate(-1);
                    }}
                    disabled={!showAllDaysInSummary && activeFoodDateIndex <= 0}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#69EBDA]"
                    title="আগের তারিখ"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {showAllDaysInSummary
                        ? `সকল দিন (${availableFoodDates.length} দিন)`
                        : `Day ${activeFoodDateIndex + 1} • ${toDisplayDate(activeFoodDate)}`}
                    </span>
                    {availableFoodDates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowAllDaysInSummary((v) => !v)}
                        className="px-2 py-0.5 rounded-lg bg-teal-500/15 text-[10px] font-extrabold text-teal-700 dark:text-[#69EBDA] cursor-pointer hover:bg-teal-500/25"
                      >
                        {showAllDaysInSummary ? 'একটি দিন' : 'সব দিন'}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllDaysInSummary(false);
                      handleStepFoodDate(1);
                    }}
                    disabled={!showAllDaysInSummary && activeFoodDateIndex >= availableFoodDates.length - 1}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#69EBDA]"
                    title="পরের তারিখ"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Horizontal Scrollable Guest Selector (Guest 1, Guest 2, ...) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {restaurantGuestNumbers.map((gNum) => {
                    const isSelected = activeFoodGuest === gNum;
                    const gCount = Object.values(
                      (selectedFoodByDateGuest[activeFoodDate] && selectedFoodByDateGuest[activeFoodDate][gNum]) || {}
                    ).reduce((s, it) => s + (it?.qty || 0), 0);
                    return (
                      <button
                        key={gNum}
                        type="button"
                        onClick={() => setActiveFoodGuest(gNum)}
                        className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-[#69EBDA] text-[#69EBDA] dark:text-slate-950 border-slate-900 dark:border-[#69EBDA] shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-[#69EBDA]/60'
                        }`}
                      >
                        <span>Guest {gNum}</span>
                        {gCount > 0 && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                              isSelected
                                ? 'bg-[#69EBDA]/20 dark:bg-slate-950/20'
                                : 'bg-teal-500/20 text-teal-700 dark:text-[#69EBDA]'
                            }`}
                          >
                            {gCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Top 3 Meal Switching Buttons: সকাল / দুপুর / রাত */}
              <div className="px-5 sm:px-6 pt-3 pb-2 grid grid-cols-3 gap-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/40">
                {[
                  { id: 'breakfast', label: 'সকাল (Breakfast)' },
                  { id: 'lunch', label: 'দুপুর (Lunch)' },
                  { id: 'dinner', label: 'রাত (Dinner)' }
                ].map((tab) => {
                  const active = activeMealTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveMealTab(tab.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        active
                          ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 border-teal-400 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-[#69EBDA]/60'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Food Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {(restaurantMenuByMeal[activeMealTab] || []).map((item) => {
                  const selected = activeGuestFoodMap[item.key];
                  const qty = selected?.qty || 0;
                  return (
                    <div
                      key={`${activeFoodDate}-${activeFoodGuest}-${item.key}`}
                      className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                        qty > 0
                          ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-400/70 dark:border-[#69EBDA]/50'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.photo}
                          alt={item.name}
                          onClick={() => setPreviewFoodItem(item)}
                          title="বড় করে দেখতে ক্লিক করুন"
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-white/10 cursor-pointer hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs font-black text-teal-700 dark:text-[#69EBDA] mt-0.5">
                            ৳ {item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Select or +/- Qty Controls */}
                      <div className="shrink-0">
                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleToggleSelectFood(item)}
                            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-teal-600 hover:text-white text-white text-xs font-extrabold cursor-pointer transition-colors"
                          >
                            Select
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-teal-400/60">
                            <button
                              type="button"
                              onClick={() => handleUpdateFoodQty(item.key, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 text-slate-800 dark:text-white font-black text-sm cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateFoodQty(item.key, 1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-500/20 text-slate-800 dark:text-white font-black text-sm cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer with Live Total & Done Button */}
              <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
                    মোট সিলেক্ট করা: {totalSelectedFoodQty} টি খাবার
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    সর্বমোট: ৳ {selectedFoodTotalAllDates.toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHasConfirmedFoodMenu(true);
                    setIsFoodMenuModalOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 hover:brightness-105 text-slate-950 font-black text-sm shadow-md cursor-pointer transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 7: Selected Foods Summary Modal                          */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isSelectedFoodsModalOpen && (
          <div className="fixed inset-0 z-[106] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectedFoodsModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-2xl my-auto flex flex-col max-h-[85dvh]"
            >
              <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      সিলেক্ট করা খাবারের তালিকা
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      মোট {totalSelectedFoodQty} টি আইটেম • সর্বমোট ৳ {selectedFoodTotalAllDates.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSelectedFoodsModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Calendar Date Switcher (< Date >) - Only Selected Dates */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-teal-50/80 dark:bg-slate-800/80 border border-teal-200 dark:border-[#69EBDA]/30">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllDaysInSummary(false);
                      handleStepFoodDate(-1);
                    }}
                    disabled={!showAllDaysInSummary && activeFoodDateIndex <= 0}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#69EBDA]"
                    title="আগের তারিখ"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {showAllDaysInSummary
                        ? `সকল দিন (${availableFoodDates.length} দিন)`
                        : `Day ${activeFoodDateIndex + 1} • ${toDisplayDate(activeFoodDate)}`}
                    </span>
                    {availableFoodDates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowAllDaysInSummary((v) => !v)}
                        className="px-2 py-0.5 rounded-lg bg-teal-500/15 text-[10px] font-extrabold text-teal-700 dark:text-[#69EBDA] cursor-pointer hover:bg-teal-500/25"
                      >
                        {showAllDaysInSummary ? 'একটি দিন' : 'সব দিন'}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllDaysInSummary(false);
                      handleStepFoodDate(1);
                    }}
                    disabled={!showAllDaysInSummary && activeFoodDateIndex >= availableFoodDates.length - 1}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#69EBDA]"
                    title="পরের তারিখ"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Horizontal Scrollable Guest Switcher */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {restaurantGuestNumbers.map((gNum) => {
                    const isSelected = activeFoodGuest === gNum;
                    const gCount = availableFoodDates.reduce((total, dStr) => {
                      const map = (selectedFoodByDateGuest[dStr] && selectedFoodByDateGuest[dStr][gNum]) || {};
                      return total + Object.values(map).reduce((s, it) => s + (it?.qty || 0), 0);
                    }, 0);
                    return (
                      <button
                        key={gNum}
                        type="button"
                        onClick={() => setActiveFoodGuest(gNum)}
                        className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-[#69EBDA] text-[#69EBDA] dark:text-slate-950 border-slate-900 dark:border-[#69EBDA] shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-[#69EBDA]/60'
                        }`}
                      >
                        <span>Guest {gNum}</span>
                        {gCount > 0 && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                              isSelected
                                ? 'bg-[#69EBDA]/20 dark:bg-slate-950/20'
                                : 'bg-teal-500/20 text-teal-700 dark:text-[#69EBDA]'
                            }`}
                          >
                            {gCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {(() => {
                  const guestDayGroups = availableFoodDates
                    .map((dStr, dIdx) => {
                      const guestMap = (selectedFoodByDateGuest[dStr] && selectedFoodByDateGuest[dStr][activeFoodGuest]) || {};
                      const items = Object.values(guestMap).filter((it) => it && it.qty > 0);
                      return { dStr, dayNumber: dIdx + 1, items };
                    })
                    .filter((g) => g.items.length > 0 && (showAllDaysInSummary || g.dStr === activeFoodDate));

                  if (guestDayGroups.length === 0) {
                    return (
                      <div className="py-8 text-center space-y-2">
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                          Guest {activeFoodGuest}-এর জন্য এখনো কোনো খাবার সিলেক্ট করা হয়নি।
                        </p>
                        <p className="text-xs text-slate-400">
                          উপরে অন্য গেস্ট ট্যাবে ক্লিক করুন অথবা "আরও খাবার যোগ করুন" বাটনে ক্লিক করুন।
                        </p>
                      </div>
                    );
                  }

                  const guestAllDaysTotal = guestDayGroups.reduce(
                    (sum, grp) => sum + grp.items.reduce((s, it) => s + it.price * it.qty, 0),
                    0
                  );

                  return (
                    <>
                      {guestDayGroups.map((grp) => {
                        const daySubtotal = grp.items.reduce((s, it) => s + it.price * it.qty, 0);
                        return (
                          <div key={grp.dStr} className="space-y-2">
                            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-teal-500/10 dark:bg-[#69EBDA]/15 border border-teal-500/20">
                              <span className="text-xs font-black text-teal-800 dark:text-[#69EBDA]">
                                Day {grp.dayNumber} • {toDisplayDate(grp.dStr)}
                              </span>
                              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">
                                ৳ {daySubtotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {grp.items.map((item) => {
                              const mealLabel =
                                item.meal === 'breakfast' ? 'সকাল' : item.meal === 'lunch' ? 'দুপুর' : 'রাত';
                              return (
                                <div
                                  key={`${grp.dStr}-${item.key}`}
                                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-white/10"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={item.photo}
                                      alt={item.name}
                                      onClick={() => setPreviewFoodItem(item)}
                                      title="বড় করে দেখতে ক্লিক করুন"
                                      className="w-12 h-12 rounded-xl object-cover shrink-0 cursor-pointer hover:scale-105 transition-transform"
                                    />
                                    <div className="min-w-0">
                                      <span className="inline-block px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-[#69EBDA] text-[10px] font-bold mb-0.5">
                                        {mealLabel}
                                      </span>
                                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                                        {item.name}
                                      </h4>
                                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                        ৳ {item.price.toLocaleString('en-IN')} × {item.qty} ={' '}
                                        <span className="text-teal-700 dark:text-[#69EBDA] font-black">
                                          ৳ {(item.price * item.qty).toLocaleString('en-IN')}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateFoodQty(item.key, -1, activeFoodGuest, grp.dStr)}
                                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 font-black text-xs cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <span className="w-5 text-center text-xs font-black text-slate-900 dark:text-white">
                                      {item.qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateFoodQty(item.key, 1, activeFoodGuest, grp.dStr)}
                                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 font-black text-xs cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}

                      <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-extrabold text-slate-700 dark:text-slate-200">
                        <span>Guest {activeFoodGuest} মোট ({guestDayGroups.length} দিন):</span>
                        <span className="text-teal-700 dark:text-[#69EBDA]">
                          ৳ {guestAllDaysTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="px-5 py-3.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectedFoodsModalOpen(false);
                    setIsFoodMenuModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold cursor-pointer"
                >
                  আরও খাবার যোগ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setIsSelectedFoodsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 text-xs font-black cursor-pointer"
                >
                  ঠিক আছে
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 8: Large Food Photo Preview Modal                        */}
      {/* ============================================================== */}
      <AnimatePresence>
        {previewFoodItem && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFoodItem(null)}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="relative z-10 w-full max-w-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setPreviewFoodItem(null)}
                className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-full h-72 sm:h-96 bg-slate-950">
                <img
                  src={previewFoodItem.photo}
                  alt={previewFoodItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  {previewFoodItem.name}
                </h4>
                <span className="text-base sm:text-lg font-black text-teal-700 dark:text-[#69EBDA] shrink-0">
                  ৳ {Number(previewFoodItem.price || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
