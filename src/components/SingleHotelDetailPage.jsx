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

export const SingleHotelDetailPage = ({ hotel: initialHotel, initialFilter = null, onBack, onBookingSuccess }) => {
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

  const { user, wishlist = [], toggleWishlist, openAuthModal } = useAuth();
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
    if (!user) {
      openAuthModal?.('login');
      return;
    }
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
    if (!user) {
      openAuthModal?.('login');
      return;
    }
    const trimmedComment = reviewCommentText.trim();
    if (!trimmedComment) return;

    const targetEditId = editingReviewId;
    const finalRating = reviewRatingValue || userPrevRating || 5;

    // Immediately hide/close the "Write Your Review" box on submit
    setIsReviewModalOpen(false);
    setReviewCommentText('');
    setEditingReviewId(null);

    HotelReviewService.saveHotelReview(
      hotel.id,
      {
        id: targetEditId,
        userName: user?.name || 'Guest Traveler',
        userAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: finalRating,
        comment: trimmedComment
      },
      userKey
    );

    setHotelReviews(HotelReviewService.getHotelReviews(hotel.id));
  };

  const hasUserSubmittedReview = Boolean(
    user &&
      hotelReviews.some(
        (rev) =>
          (rev.userId === userKey || rev.userKey === userKey || rev.userId === user?.id) &&
          String(rev.comment || '').trim().length > 0
      )
  );

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete your comment?')) {
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
    if (!user) {
      openAuthModal?.('login');
      return;
    }
    const result = HotelReviewService.submitQuickRating(
      hotel.id,
      starValue,
      userKey,
      user?.name || 'Guest Traveler'
    );
    setDetailRatingFeedback({
      message: result.message,
      isError: !result.success
    });
    setHotelReviews(HotelReviewService.getHotelReviews(hotel.id));
    setTimeout(() => setDetailRatingFeedback(null), 3200);
  };

  // Booking & Calendar Date State (Auto-seeded from Hero Search Filter when available)
  const todayISO = useMemo(() => formatISO(new Date()), []);
  const tomorrowISO = useMemo(() => addDaysISO(todayISO, 1), [todayISO]);
  const dayAfterTomorrowISO = useMemo(() => addDaysISO(todayISO, 2), [todayISO]);

  const isIsoDate = (val) => typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim());
  const resolvedCheckIn = isIsoDate(initialFilter?.travelDate) ? initialFilter.travelDate.trim() : tomorrowISO;
  const resolvedCheckOut = (() => {
    if (isIsoDate(initialFilter?.checkOutDate) && initialFilter.checkOutDate.trim() >= resolvedCheckIn) {
      return initialFilter.checkOutDate.trim();
    }
    return isIsoDate(initialFilter?.travelDate) ? addDaysISO(resolvedCheckIn, 1) : dayAfterTomorrowISO;
  })();
  const resolvedAdults = Number.isFinite(Number(initialFilter?.adults)) && Number(initialFilter.adults) >= 1
    ? Number(initialFilter.adults)
    : (Number.isFinite(Number(initialFilter?.guests)) && Number(initialFilter.guests) >= 1 ? Number(initialFilter.guests) : 2);
  const resolvedChildren = Number.isFinite(Number(initialFilter?.children)) && Number(initialFilter.children) >= 0
    ? Number(initialFilter.children)
    : 0;
  const resolvedRooms = Number.isFinite(Number(initialFilter?.rooms)) && Number(initialFilter.rooms) >= 1
    ? Number(initialFilter.rooms)
    : 1;
  const resolvedTotalGuests = Math.max(1, resolvedAdults + resolvedChildren);
  const resolvedTripType = (() => {
    const sub = String(initialFilter?.subOption || '').toLowerCase();
    if (sub.includes('round')) return 'Round-Trip';
    if (initialFilter?.activeTab === 'transport' && isIsoDate(initialFilter?.checkOutDate)) return 'Round-Trip';
    return 'One-Way';
  })();
  const resolvedMealTab = (() => {
    const meal = String(initialFilter?.mealPlan || '').toLowerCase();
    if (meal.includes('lunch')) return 'lunch';
    if (meal.includes('dinner')) return 'dinner';
    return 'breakfast';
  })();

  const [checkInDate, setCheckInDate] = useState(resolvedCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(resolvedCheckOut);
  const [isSelectingCheckOut, setIsSelectingCheckOut] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);
  const [adultCount, setAdultCount] = useState(resolvedAdults);
  const [childrenCount, setChildrenCount] = useState(resolvedChildren);
  const guestCount = adultCount + childrenCount;
  const [roomCount, setRoomCount] = useState(resolvedRooms);
  const [seatCount, setSeatCount] = useState(resolvedTotalGuests);
  const [tripType, setTripType] = useState(resolvedTripType);
  const [routeFrom, setRouteFrom] = useState(initialFilter?.pickup || '');
  const [routeTo, setRouteTo] = useState(initialFilter?.dropoff || '');

  // Restaurant-specific booking states
  const [restaurantGuests, setRestaurantGuests] = useState(resolvedTotalGuests);
  const [selectedRestaurantDates, setSelectedRestaurantDates] = useState(() => [resolvedCheckIn]);
  const [isFoodMenuModalOpen, setIsFoodMenuModalOpen] = useState(false);
  const [isSelectedFoodsModalOpen, setIsSelectedFoodsModalOpen] = useState(false);
  const [showAllDaysInSummary, setShowAllDaysInSummary] = useState(false);
  const [previewFoodItem, setPreviewFoodItem] = useState(null);
  const [activeMealTab, setActiveMealTab] = useState(resolvedMealTab); // 'breakfast' | 'lunch' | 'dinner'
  const [activeFoodGuest, setActiveFoodGuest] = useState(1);
  const [activeFoodDate, setActiveFoodDate] = useState(() => resolvedCheckIn);
  const [selectedFoodByDateGuest, setSelectedFoodByDateGuest] = useState({});
  const [hasConfirmedFoodMenu, setHasConfirmedFoodMenu] = useState(false);

  // Sync booking fields automatically when Hero filter or selected service changes
  useEffect(() => {
    if (!initialFilter) return;
    const nextIn = isIsoDate(initialFilter.travelDate) ? initialFilter.travelDate.trim() : tomorrowISO;
    const nextOut = isIsoDate(initialFilter.checkOutDate) && initialFilter.checkOutDate.trim() >= nextIn
      ? initialFilter.checkOutDate.trim()
      : (isIsoDate(initialFilter.travelDate) ? addDaysISO(nextIn, 1) : dayAfterTomorrowISO);
    const nextAdults = Number.isFinite(Number(initialFilter.adults)) && Number(initialFilter.adults) >= 1
      ? Number(initialFilter.adults)
      : (Number.isFinite(Number(initialFilter.guests)) && Number(initialFilter.guests) >= 1 ? Number(initialFilter.guests) : 2);
    const nextChildren = Number.isFinite(Number(initialFilter.children)) && Number(initialFilter.children) >= 0
      ? Number(initialFilter.children)
      : 0;
    const nextRooms = Number.isFinite(Number(initialFilter.rooms)) && Number(initialFilter.rooms) >= 1
      ? Number(initialFilter.rooms)
      : 1;
    const nextGuestsTotal = Math.max(1, nextAdults + nextChildren);

    setCheckInDate(nextIn);
    setCheckOutDate(nextOut);
    setAdultCount(nextAdults);
    setChildrenCount(nextChildren);
    setRoomCount(nextRooms);
    setSeatCount(nextGuestsTotal);
    setRestaurantGuests(nextGuestsTotal);
    setSelectedRestaurantDates([nextIn]);
    setActiveFoodDate(nextIn);
    if (initialFilter.pickup) setRouteFrom(initialFilter.pickup);
    if (initialFilter.dropoff) setRouteTo(initialFilter.dropoff);

    const sub = String(initialFilter.subOption || '').toLowerCase();
    if (sub.includes('round') || (initialFilter.activeTab === 'transport' && isIsoDate(initialFilter.checkOutDate))) {
      setTripType('Round-Trip');
    } else if (sub.includes('one')) {
      setTripType('One-Way');
    }

    const meal = String(initialFilter.mealPlan || '').toLowerCase();
    if (meal.includes('lunch')) setActiveMealTab('lunch');
    else if (meal.includes('dinner')) setActiveMealTab('dinner');
    else if (meal.includes('breakfast')) setActiveMealTab('breakfast');
  }, [initialHotel?.id, initialFilter, tomorrowISO, dayAfterTomorrowISO]);

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
        items: ['Buffet Breakfast Platter', 'Paratha & Bhuna Khichuri', 'Coffee & Fresh Juice'],
        photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80'
      },
      lunch: {
        items: ['Special Kacchi / Polao', 'Grilled Chicken & Naan', 'Fresh Salad & Drinks'],
        photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
      },
      dinner: {
        items: ['Live BBQ Platter', 'Tandoori Chicken & Naan', 'Special Dessert'],
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
            name: entry.name || entry.title || `Menu Item ${idx + 1}`,
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
          name: cleanName || `Menu Item ${idx + 1}`,
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
    const parts = resolvedCheckIn.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, 1);
  });

  useEffect(() => {
    if (!initialFilter?.travelDate || !isIsoDate(initialFilter.travelDate)) return;
    const parts = initialFilter.travelDate.trim().split('-').map(Number);
    if (parts.length === 3) {
      setCalendarViewDate(new Date(parts[0], parts[1] - 1, 1));
    }
  }, [initialFilter?.travelDate]);

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

      if (isSelectingCheckOut && checkInDate) {
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

  // Helper to build a consecutive serial of ISO date strings from start..end inclusive
  const buildSerialDates = (startStr, endStr) => {
    if (!startStr) return [];
    const end = endStr && endStr >= startStr ? endStr : startStr;
    const dates = [];
    let cur = startStr;
    let guard = 0;
    while (cur <= end && guard < 90) {
      dates.push(cur);
      cur = addDaysISO(cur, 1);
      guard += 1;
    }
    return dates;
  };

  // Calendar click handler: consecutive serial multi-date selection (2+ or more days in a serial) for all services
  const handleCalendarDayClick = (dayObj) => {
    if (!dayObj) return;
    const clickedStr = dayObj.dateStr;

    const applyRange = (startStr, endStr) => {
      setCheckInDate(startStr);
      setCheckOutDate(endStr);
      setIsSelectingCheckOut(false);
      setHoverDate(null);
      if (isRestaurant) {
        setSelectedRestaurantDates(buildSerialDates(startStr, endStr));
      }
    };

    if (isSelectingCheckOut && checkInDate) {
      if (clickedStr > checkInDate) {
        applyRange(checkInDate, clickedStr);
      } else if (clickedStr < checkInDate) {
        applyRange(clickedStr, checkInDate);
      } else {
        applyRange(clickedStr, addDaysISO(clickedStr, 1));
      }
    } else if (checkInDate && checkOutDate && clickedStr === addDaysISO(checkOutDate, 1)) {
      // Extend consecutive serial forward by 1 day
      applyRange(checkInDate, clickedStr);
    } else if (checkInDate && checkOutDate && clickedStr === addDaysISO(checkInDate, -1)) {
      // Extend consecutive serial backward by 1 day
      applyRange(clickedStr, checkOutDate);
    } else {
      // First click: Starts new consecutive serial range selection
      setCheckInDate(clickedStr);
      setCheckOutDate(null);
      setIsSelectingCheckOut(true);
      setHoverDate(null);
      if (isRestaurant) {
        setSelectedRestaurantDates([clickedStr]);
      }
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
      setPromoError('Please enter a promo code');
      return;
    }
    if (code === 'DISCOUNT10' || code === 'SAVE10') {
      const discount = Math.round(baseRentPrice * 0.1);
      setAppliedPromo({ code, discount, label: '10% discount applied!' });
    } else if (code === 'WELCOME500' || code === 'PROMO500') {
      const discount = Math.min(500, baseRentPrice);
      setAppliedPromo({ code, discount, label: 'BDT 500 special discount applied!' });
    } else if (code === 'AETHERIA20') {
      const discount = Math.round(baseRentPrice * 0.2);
      setAppliedPromo({ code, discount, label: '20% VIP discount applied!' });
    } else {
      setPromoError('Invalid promo code. Please enter a valid code (e.g. DISCOUNT10, SAVE10)');
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
      setFormError('Please enter your full name');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Please enter an active phone number');
      return;
    }
    if (!customerWhatsApp.trim()) {
      setFormError('Please enter your WhatsApp number');
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
          ? `Trip: ${tripType} | Seats: ${seatCount}${routeFrom.trim() || routeTo.trim() ? ` | Route: ${routeFrom.trim() || 'Not specified'} → ${routeTo.trim() || 'Not specified'}` : ''}`
          : isRestaurant
            ? `Guests: ${restaurantGuests} | Dates (${selectedRestaurantDates.length} days): ${selectedRestaurantDates.join(', ')}${selectedFoodList.length > 0 ? ` | Food: ${selectedFoodList.map((f) => `${f.dateStr} (Guest ${f.guestIndex}): ${f.name} x${f.qty}`).join(', ')}` : ''}`
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
      setFormError('There was an issue completing the booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct WhatsApp contact link
  const whatsAppMessage = encodeURIComponent(
    `Hello! I am interested in booking a room at ${hotel.name}.\n` +
    `Destination: ${hotel.location || hotel.destinationId || 'Bangladesh'}\n` +
    `Dates: ${toDisplayDate(checkInDate)} to ${toDisplayDate(checkOutDate)} (${calculatedDays} days)\n` +
    `Daily Rate: BDT ${perDayPrice}\n` +
    `Total Payable: BDT ${grandTotal}`
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
          <span>Go Back</span>
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
            title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 transition-transform ${isFav ? 'fill-white scale-110' : ''}`} />
            <span className="hidden sm:inline">{isFav ? 'Saved' : 'Wishlist'}</span>
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
                Photo & Video Gallery ({galleryPhotos.length + (youtubeThumb ? 1 : 0)})
              </span>
              <span className="text-[11px] text-teal-600 dark:text-[#69EBDA] font-semibold">Click to view</span>
            </div>

            {/* Scrollable Gallery Container */}
            <div className="flex-1 max-h-[280px] sm:max-h-[420px] md:max-h-[460px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {/* YouTube Video Thumbnail Card (If available) */}
              {hotel.youtubeLink && (
                <div
                  onClick={() => window.open(toYouTubeWatchUrl(hotel.youtubeLink), '_blank', 'noopener,noreferrer')}
                  className="relative h-24 sm:h-28 rounded-2xl overflow-hidden cursor-pointer border-2 border-red-500/70 hover:border-red-500 shadow-md group transition-all duration-200"
                  title="Watch YouTube Video"
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
                    <span className="truncate">Video Preview</span>
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
                <span>Back to Hotel Details</span>
              </button>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                All Customer Reviews & Community Opinions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hotel.name} • Total {ratingMeta.totalReviews} Reviews & Ratings
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Direct Card Rating Widget */}
              <div className="px-3.5 py-2 rounded-2xl bg-teal-50/80 dark:bg-slate-800/80 border border-teal-200/80 dark:border-white/10 flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Your Rating:
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
                        title={`Rate ${s} stars`}
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
                <span className="text-[11px] text-slate-500 dark:text-slate-400">/ 5</span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenReviewModal()}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-500 to-[#69EBDA] hover:from-teal-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Write a Comment</span>
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
              <p className="text-sm text-slate-500 dark:text-slate-400">No customer reviews found yet.</p>
              <button
                type="button"
                onClick={() => handleOpenReviewModal()}
                className="mt-3 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500 shadow-md hover:shadow-teal-500/25 transition-all cursor-pointer"
              >
                Be the first to review
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
                                Your Review
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
                              {rev.date || 'Recently'}
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
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(rev.id)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/15 font-semibold cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
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
                      <span>{rev.likes || 0} Likes</span>
                    </button>

                    <span className="text-xs text-slate-400">
                      {isLiked ? '✓ You liked this' : '1 like per person'}
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
                Amenities & Highlights
              </h2>
              {shortInfoList.length > 4 && (
                <button
                  onClick={() => setIsMoreShortInfoOpen(true)}
                  className="text-xs font-bold text-teal-700 dark:text-[#69EBDA] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View more ({shortInfoList.length})</span>
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
                Comprehensive amenities list will be added soon.
              </p>
            )}

            {/* "More" Button for Short Info */}
            {shortInfoList.length > 6 && (
              <button
                onClick={() => setIsMoreShortInfoOpen(true)}
                className="mt-4 w-full py-2.5 rounded-2xl bg-teal-500/10 dark:bg-[#69EBDA]/15 hover:bg-teal-500/20 text-teal-800 dark:text-[#69EBDA] font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-teal-500/20 cursor-pointer"
              >
                <span>Click to view all ({shortInfoList.length}) amenities</span>
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
                Daily Booking Fare
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
                  BDT {perDayPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                  / {hotel.bookingDays || 'Per Day'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                VAT & taxes applied subsequently • No hidden charges
              </p>
            </div>

            {/* Right side: Route Fares for Transport (if provided) OR Check-in & Check-out Timing */}
            {isTransport && Array.isArray(hotel.routeFares) && hotel.routeFares.length > 0 ? (
              <div className="flex flex-col gap-2 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-teal-500/20 dark:border-white/10 w-full sm:w-auto sm:min-w-[260px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-[#69EBDA] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Route & Seat Fares
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
                      title="Click to select route and seat"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                        {rf.from || 'From'} → {rf.to || 'To'}
                      </span>
                      <span className="font-extrabold text-teal-700 dark:text-[#69EBDA] shrink-0">
                        {rf.seats ? `${rf.seats} Seats • ` : ''}BDT {Number(rf.price || 0).toLocaleString('en-IN')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : isRestaurant ? null : (
              <div className="flex flex-col sm:items-end gap-2 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-teal-500/20 dark:border-white/10 w-full sm:w-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-[#69EBDA] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Hotel Timings
                </span>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex sm:flex-col gap-3 sm:gap-1">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Check-in: </span>
                    <span className="font-bold text-slate-900 dark:text-white">{hotel.checkInTime || '14:00 (2:00 PM)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Check-out: </span>
                    <span className="font-bold text-slate-900 dark:text-white">{hotel.checkOutTime || '12:00 (12:00 PM)'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section C: Hotel Details (4 to 5 lines + See More) */}
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-300/80 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-3">
              Hotel Details & Overview
            </h2>

            <div className="relative">
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-5 whitespace-pre-line">
                {hotel.details || hotel.description || hotel.shortDescription || 'Detailed hotel overview will be published soon.'}
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
                <span>Read Full Description</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Section D: Location Box with Embedded Live Map & Directions */}
          <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-300/80 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600 dark:text-[#69EBDA]" />
              Hotel Location & Live Map
            </h2>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {hotel.location || hotel.destinationId || 'Prime Tourist Zone, Bangladesh'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Destination Area: {hotel.destinationId || hotel.location || 'Popular Tourist Spot'}
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
                  <span>Live Directions on Google Maps</span>
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
                  <span>Search on Google Maps</span>
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
                  Room Booking Calendar
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Select Dates
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Per Day</span>
                <p className="text-base sm:text-lg font-bold text-teal-700 dark:text-[#69EBDA]">
                  BDT {perDayPrice.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Selected Dates Display */}
            {isRestaurant ? (
              <div className="mb-5 p-3.5 rounded-2xl bg-teal-50/80 dark:bg-slate-800/80 border border-teal-200/80 dark:border-teal-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-[#69EBDA]">
                    Selected Days ({selectedRestaurantDates.length} days)
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    Click dates to select / unselect
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
                        title="Click to unselect"
                      >
                        <span>{toDisplayDate(d)}</span>
                        <X className="w-3 h-3 text-rose-500" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Please select at least 1 day from the calendar
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
                      Select date...
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
                  {MONTH_NAMES[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
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
                      * Click ending date for check-out (e.g. 5, 10, 22, or 25)
                    </span>
                  ) : (
                    <span>* Click start and end dates to select your stay</span>
                  )}
                </span>
                <span className="font-bold text-teal-700 dark:text-[#69EBDA]">{calculatedDays} Days Selected</span>
              </div>
            </div>

            {/* Rooms & Guests Selection (Adapts for Transport & Restaurant) */}
            {isTransport ? (
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Trip Type
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
                    Seat Count
                  </label>
                  <select
                    value={seatCount}
                    onChange={(e) => setSeatCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  >
                    {adminSeatOptions.map((n) => (
                      <option key={n} value={n}>{n} Seats</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      From (Departure Location)
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
                        placeholder="e.g. Dhaka"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#69EBDA]"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      To (Destination Location)
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
                        placeholder="e.g. Cox's Bazar"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-[#69EBDA]"
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : isRestaurant ? (
              <div className="mb-5 space-y-2.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Number of Guests ({restaurantGuests} Guests)
                </label>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Guest</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Total dining guests</p>
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
                      Food Menu
                    </button>
                    {hasConfirmedFoodMenu && selectedFoodList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsSelectedFoodsModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white/15 hover:bg-slate-800 text-[#69EBDA] border border-[#69EBDA]/40 font-extrabold text-xs shadow-sm cursor-pointer transition-all"
                      >
                        Selected Items ({totalSelectedFoodQty})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Number of Rooms
                  </label>
                  <select
                    value={roomCount}
                    onChange={(e) => handleRoomCountChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n} Rooms</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Guests (Adults & Children • Total: {guestCount})
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
                    ? `Transport Fare (${calculatedDays} days × BDT ${perDayPrice.toLocaleString('en-IN')} • ${seatCount} seats)`
                    : isRestaurant
                      ? selectedFoodList.length > 0
                        ? `Selected Food (${totalSelectedFoodQty} items × ${calculatedDays} days)`
                        : `Dining Charge (${calculatedDays} days × ${restaurantGuests} guests × BDT ${perDayPrice.toLocaleString('en-IN')})`
                      : `Room Fare (${calculatedDays} days × ${roomCount} rooms × BDT ${perDayPrice.toLocaleString('en-IN')})`}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  BDT {baseRentPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>VAT & Service Charge ({vatTaxPercentage}%)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  + BDT {vatTaxAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2.5 border-t border-teal-200 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-teal-800 dark:text-[#69EBDA] block">
                    Total Price
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
                  BDT {grandTotal.toLocaleString('en-IN')}
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
              <span>Book Now</span>
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
                  <span>Chat Directly on WhatsApp</span>
                </a>
              )}

              {cleanHotlineTel && (
                <a
                  href={`tel:${cleanHotlineTel}`}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-[#69EBDA] shrink-0" />
                  <span>Call 24/7: {hotlinePhone}</span>
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
                      Customer Reviews & Comments
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-amber-500 font-mono">⭐ {ratingMeta.averageRating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{ratingMeta.totalReviews} Reviews</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenReviewModal()}
                  className="px-2.5 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-700 dark:text-[#69EBDA] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Comment</span>
                </button>
              </div>

              {/* Direct Rating directly on Card */}
              <div className="p-3 mb-3.5 rounded-2xl bg-teal-500/10 dark:bg-slate-800/90 border border-teal-500/25 dark:border-white/10 flex items-center justify-between gap-2 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Rate directly from card:
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {userPrevRating ? `Your rating: ${userPrevRating}★` : 'Click stars to rate'}
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
                        title={`Rate ${s} stars`}
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
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">No comments yet.</p>
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal()}
                      className="mt-1.5 text-[11px] font-bold text-teal-600 dark:text-[#69EBDA] hover:underline cursor-pointer"
                    >
                      Be the first to comment
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
                                    You
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
                                  {rev.date || 'Recently'}
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
                                title="Options"
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
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReview(rev.id)}
                                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/15 font-semibold cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
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
                            <span>{rev.likes || 0} Likes</span>
                          </button>

                          <span className="text-[9px] text-slate-400">
                            {isLiked ? '✓ Liked' : '1 like per person'}
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
                    <span>See all comments</span>
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
                    All Amenities & Info
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">Full Description & Guide</p>
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
                    Booking Completed Successfully!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto mb-3 leading-relaxed">
                    Thank you, <span className="font-bold">{customerName}</span>! Your booking order has been received. Booking ID: <span className="font-mono font-bold text-teal-600 dark:text-[#69EBDA]">{completedBookingId}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-5">
                    Our travel concierge will contact you via WhatsApp and phone shortly.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={whatsAppDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Get Updates on WhatsApp</span>
                    </a>
                    <button
                      onClick={() => {
                        setIsCheckoutModalOpen(false);
                        setBookingCompleted(false);
                      }}
                      className="py-2.5 px-5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm hover:bg-slate-300 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Checkout Form */
                <form onSubmit={handleConfirmCheckout} className="space-y-3 sm:space-y-3.5">
                  <div className="flex items-start justify-between pb-2.5 sm:pb-3 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-[#69EBDA]">
                        Checkout & Booking Form
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {hotel.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {toDisplayDate(checkInDate)} to {toDisplayDate(checkOutDate)} ({calculatedDays} Days, {roomCount} Rooms)
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
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Ariful Islam"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email (Optional / Gmail)
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
                          Phone Number <span className="text-red-500">*</span>
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
                          WhatsApp Number <span className="text-red-500">*</span>
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
                      <span>Phone number and WhatsApp number are the same</span>
                    </label>
                  </div>

                  {/* Promo Code Box */}
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Promo Code
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
                        Apply
                      </button>
                    </div>

                    {appliedPromo && (
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ {appliedPromo.label} (-BDT {appliedPromo.discount.toLocaleString('en-IN')})
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
                          ? `Transport Fare (${calculatedDays} days • ${seatCount} seats${routeFrom || routeTo ? ` • ${routeFrom || '?'} → ${routeTo || '?'}` : ''})`
                          : isRestaurant
                            ? selectedFoodList.length > 0
                              ? `Selected Food (${totalSelectedFoodQty} items × ${calculatedDays} days • ${restaurantGuests} guests)`
                              : `Dining Charge (${calculatedDays} days × ${restaurantGuests} guests)`
                            : `Room Fare (${calculatedDays} days × ${roomCount} rooms)`}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        BDT {baseRentPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Promo Discount ({appliedPromo.code})</span>
                        <span>- BDT {discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>VAT & Taxes ({vatTaxPercentage}%)</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        + BDT {vatTaxAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-300 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        Grand Total
                      </span>
                      <span className="text-lg sm:text-xl font-black text-teal-600 dark:text-[#69EBDA] font-['Outfit',sans-serif]">
                        BDT {grandTotal.toLocaleString('en-IN')}
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
                      <span>Processing Order...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm Booking Order</span>
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
                      Hotel Help Center & Support
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Guest Capacity Guidelines
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
                  Up to {roomCount * 3} guests can stay across {roomCount} room(s) (maximum 3 guests per room).
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  You have selected <span className="font-bold">{pendingGuestCount} guests</span>. For comfortable stay of {pendingGuestCount} guests, please book at least <span className="font-bold">{Math.max(roomCount + 1, Math.ceil(pendingGuestCount / 3))} room(s)</span> or contact the hotel support for extra beds and special arrangements.
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
                <span>Book {Math.max(roomCount + 1, Math.ceil(pendingGuestCount / 3))} Rooms (Add Required Rooms)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Direct Help Center Contacts */}
              {(rawWa || cleanHotlineTel) && (
              <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block text-center">
                  Or Contact Directly
                </span>
                {rawWa && (
                  <a
                    href={`https://wa.me/${rawWa}?text=${encodeURIComponent(
                      `Hello! I would like to inquire about guest policies / extra bed facilities for ${pendingGuestCount} guests across ${roomCount} room(s) at ${hotel.name}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Message Support on WhatsApp</span>
                  </a>
                )}

                {cleanHotlineTel && (
                  <a
                    href={`tel:${cleanHotlineTel}`}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-[#69EBDA]" />
                    <span>Call 24/7 Helpline: {hotlinePhone}</span>
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
                    {editingReviewId ? 'Update Review' : 'Write Your Review'}
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
                    Rate
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
                    Comment
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewCommentText}
                    onChange={(e) => setReviewCommentText(e.target.value)}
                    placeholder="Write your experience and feedback here..."
                    className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-white/15 focus:border-[#69EBDA] focus:ring-2 focus:ring-[#69EBDA]/25 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 hover:brightness-105 text-slate-950 text-xs font-extrabold shadow-md shadow-[#69EBDA]/25 cursor-pointer transition-all"
                  >
                    {editingReviewId ? 'Update Review' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 6: Restaurant Food Menu Modal (Breakfast / Lunch / Dinner) */}
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
                      Food Menu
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
                    title="Previous Date"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {showAllDaysInSummary
                        ? `All Days (${availableFoodDates.length} Days)`
                        : `Day ${activeFoodDateIndex + 1} • ${toDisplayDate(activeFoodDate)}`}
                    </span>
                    {availableFoodDates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowAllDaysInSummary((v) => !v)}
                        className="px-2 py-0.5 rounded-lg bg-teal-500/15 text-[10px] font-extrabold text-teal-700 dark:text-[#69EBDA] cursor-pointer hover:bg-teal-500/25"
                      >
                        {showAllDaysInSummary ? 'Single Day' : 'All Days'}
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
                    title="Next Date"
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

              {/* Top 3 Meal Switching Buttons: Breakfast / Lunch / Dinner */}
              <div className="px-5 sm:px-6 pt-3 pb-2 grid grid-cols-3 gap-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/40">
                {[
                  { id: 'breakfast', label: 'Breakfast' },
                  { id: 'lunch', label: 'Lunch' },
                  { id: 'dinner', label: 'Dinner' }
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
                          title="Click to preview enlarged photo"
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-white/10 cursor-pointer hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs font-black text-teal-700 dark:text-[#69EBDA] mt-0.5">
                            BDT {item.price.toLocaleString('en-IN')}
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
                    Total Selected: {totalSelectedFoodQty} items
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    Total: BDT {selectedFoodTotalAllDates.toLocaleString('en-IN')}
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
                      Selected Foods List
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Total {totalSelectedFoodQty} items • Total BDT {selectedFoodTotalAllDates.toLocaleString('en-IN')}
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
                    title="Previous Date"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {showAllDaysInSummary
                        ? `All Days (${availableFoodDates.length} Days)`
                        : `Day ${activeFoodDateIndex + 1} • ${toDisplayDate(activeFoodDate)}`}
                    </span>
                    {availableFoodDates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setShowAllDaysInSummary((v) => !v)}
                        className="px-2 py-0.5 rounded-lg bg-teal-500/15 text-[10px] font-extrabold text-teal-700 dark:text-[#69EBDA] cursor-pointer hover:bg-teal-500/25"
                      >
                        {showAllDaysInSummary ? 'Single Day' : 'All Days'}
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
                    title="Next Date"
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
                          No food selected for Guest {activeFoodGuest} yet.
                        </p>
                        <p className="text-xs text-slate-400">
                          Click another guest tab above or click "Add More Food" button.
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
                                BDT {daySubtotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {grp.items.map((item) => {
                              const mealLabel =
                                item.meal === 'breakfast' ? 'Breakfast' : item.meal === 'lunch' ? 'Lunch' : 'Dinner';
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
                                      title="Click to preview enlarged photo"
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
                                        BDT {item.price.toLocaleString('en-IN')} × {item.qty} ={' '}
                                        <span className="text-teal-700 dark:text-[#69EBDA] font-black">
                                          BDT {(item.price * item.qty).toLocaleString('en-IN')}
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
                        <span>Guest {activeFoodGuest} Total ({guestDayGroups.length} days):</span>
                        <span className="text-teal-700 dark:text-[#69EBDA]">
                          BDT {guestAllDaysTotal.toLocaleString('en-IN')}
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
                  Add More Food
                </button>
                <button
                  type="button"
                  onClick={() => setIsSelectedFoodsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 text-xs font-black cursor-pointer"
                >
                  Got It
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
                  BDT {Number(previewFoodItem.price || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
