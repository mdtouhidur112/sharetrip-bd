// src/services/hotelReviewService.js
// Dedicated service for Single Hotel Customer Reviews, Ratings, and Realtime Supabase Sync
import { supabase } from './supabaseClient';

export const DEFAULT_HOTEL_REVIEWS = {
  'hotel-royal-tulip-coxsbazar': [
    {
      id: 'hrev-cox-1',
      hotelId: 'hotel-royal-tulip-coxsbazar',
      userId: 'demo-user-1',
      userName: 'তানভীর আহমেদ',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'অসাধারণ সমুদ্রের ভিউ এবং রুম সার্ভিস চমৎকার ছিল! বিশেষ করে প্রাইভেট বিচ ও সুইমিং পুল খুব ভালো লেগেছে। পরিবার নিয়ে সময় কাটানোর জন্য সেরা লাক্সারি রিসোর্ট।',
      date: '২ দিন আগে',
      createdAt: '2026-11-08T10:00:00Z',
      likes: 14,
      likedBy: ['demo-user-1', 'device-guest-1']
    },
    {
      id: 'hrev-cox-2',
      hotelId: 'hotel-royal-tulip-coxsbazar',
      userId: 'demo-user-2',
      userName: 'নুসরাত জাহান',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'খাবার অনেক সুস্বাদু ছিল এবং বাচ্চাদের জন্য পরিবেশ একদম নিরাপদ ও আরামদায়ক। ইনানী বিচের সূর্যাস্ত রুমের ব্যালকনি থেকেই দারুণভাবে উপভোগ করেছি।',
      date: '৪ দিন আগে',
      createdAt: '2026-11-06T14:30:00Z',
      likes: 9,
      likedBy: ['demo-user-2']
    },
    {
      id: 'hrev-cox-3',
      hotelId: 'hotel-royal-tulip-coxsbazar',
      userId: 'demo-user-3',
      userName: 'মোঃ শাহরিয়ার কবির',
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      rating: 4,
      comment: 'লোকেশন এবং পরিবেশ বিশ্বমানের। স্টাফদের ব্যবহার যথেষ্ট আন্তরিক। সুইমিং পুলের পানি সবসময় পরিষ্কার পরিচ্ছন্ন ছিল।',
      date: '১ সপ্তাহ আগে',
      createdAt: '2026-11-03T09:15:00Z',
      likes: 6,
      likedBy: []
    }
  ],
  'hotel-meghmachang-sajek': [
    {
      id: 'hrev-sajek-1',
      hotelId: 'hotel-meghmachang-sajek',
      userId: 'demo-user-4',
      userName: 'রাকিবুল হাসান',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'মেঘমাচাং কটেজের বারান্দা থেকে সকালের মেঘের ভেলা দেখার অনুভূতি সত্যিই অবিশ্বাস্য! কাঠের নান্দনিক কাজ এবং শান্ত পরিবেশ অতুলনীয়।',
      date: '১ দিন আগে',
      createdAt: '2026-11-09T08:00:00Z',
      likes: 18,
      likedBy: ['demo-user-4']
    },
    {
      id: 'hrev-sajek-2',
      hotelId: 'hotel-meghmachang-sajek',
      userId: 'demo-user-5',
      userName: 'সাদিয়া ইসলাম',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'সাজেকের সেরা রিসোর্ট নিঃসন্দেহে। রুইলুই পাড়ায় এমন মেঘের স্পর্শ অন্য কোথাও পাওয়া যায় না। বাঁশের চা এবং স্থানীয় খাবার বেশ ভালো ছিল।',
      date: '৩ দিন আগে',
      createdAt: '2026-11-07T12:00:00Z',
      likes: 11,
      likedBy: []
    }
  ]
};

const getStorageKey = (hotelId) => `aetheria_hotel_reviews_${hotelId}`;
const getLikesKey = (hotelId) => `aetheria_hotel_liked_reviews_${hotelId}`;
const getUserRatingKey = (hotelId, userKey) => `aetheria_hotel_user_rating_${hotelId}_${userKey || 'guest'}`;

// Format relative date in Bengali
const formatRelativeDateBn = (dateString) => {
  if (!dateString) return 'আজকে';
  const now = new Date();
  const created = new Date(dateString);
  if (isNaN(created.getTime())) return 'আজকে';
  const diffMs = now - created;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'কিছুক্ষণ আগে';
  if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'আজকে';
  if (diffDays === 1) return '১ দিন আগে';
  if (diffDays === 2) return '২ দিন আগে';
  if (diffDays === 3) return '৩ দিন আগে';
  if (diffDays < 7) return `${diffDays} দিন আগে`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} সপ্তাহ আগে`;
  return `${Math.floor(diffDays / 30)} মাস আগে`;
};

// Map DB Row <-> Frontend Review object
const rowToReview = (row) => ({
  id: row.id,
  hotelId: row.hotel_id,
  userId: row.user_id || 'guest',
  userName: row.user_name || 'গেস্ট ট্রাভেলার',
  userAvatar: row.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  rating: Number(row.rating || 5),
  comment: row.comment || '',
  likes: Number(row.likes || 0),
  likedBy: Array.isArray(row.liked_by) ? row.liked_by : [],
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at,
  date: formatRelativeDateBn(row.created_at)
});

const reviewToRow = (review) => ({
  id: review.id,
  hotel_id: review.hotelId,
  user_id: review.userId || 'guest',
  user_name: review.userName || 'গেস্ট ট্রাভেলার',
  user_avatar: review.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  rating: Number(review.rating || 5),
  comment: (review.comment || '').trim(),
  likes: Number(review.likes || 0),
  liked_by: Array.isArray(review.likedBy) ? review.likedBy : [],
  created_at: review.createdAt || new Date().toISOString(),
  updated_at: new Date().toISOString()
});

let _realtimeChannel = null;

export const HotelReviewService = {
  // -------------------------------------------------------------
  // SUPABASE REALTIME SYNC ENGINE
  // -------------------------------------------------------------
  initSupabaseSync: async () => {
    if (!supabase) return;
    try {
      // 1. Fetch live hotel reviews from Supabase
      const { data: dbReviews, error } = await supabase
        .from('hotel_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(dbReviews)) {
        if (dbReviews.length > 0) {
          // Group by hotel_id and cache locally
          const grouped = {};
          dbReviews.forEach((row) => {
            const hId = row.hotel_id;
            if (!grouped[hId]) grouped[hId] = [];
            grouped[hId].push(rowToReview(row));
          });

          Object.keys(grouped).forEach((hotelId) => {
            try {
              localStorage.setItem(getStorageKey(hotelId), JSON.stringify(grouped[hotelId]));
            } catch (e) {}
          });

          window.dispatchEvent(new CustomEvent('app:hotel-reviews-updated', { detail: {} }));
        }
      }

      // 2. Start Realtime WebSocket Channel
      HotelReviewService.startRealtimeSubscription();
    } catch (err) {
      console.warn('HotelReviewService Supabase sync notice:', err);
    }
  },

  startRealtimeSubscription: () => {
    if (!supabase || _realtimeChannel) return;
    try {
      _realtimeChannel = supabase
        .channel('hotel_reviews_realtime_channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'hotel_reviews' },
          (payload) => {
            HotelReviewService.handleRealtimeEvent(payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('⚡ [Realtime] Subscribed to hotel_reviews live updates');
          }
        });
    } catch (err) {
      console.warn('Realtime subscription error:', err);
    }
  },

  handleRealtimeEvent: (payload) => {
    const { eventType, new: newRow, old: oldRow } = payload;
    const targetHotelId = newRow?.hotel_id || oldRow?.hotel_id;
    if (!targetHotelId) return;

    const currentReviews = HotelReviewService.getHotelReviews(targetHotelId);

    if (eventType === 'INSERT') {
      const incoming = rowToReview(newRow);
      const exists = currentReviews.some((r) => r.id === incoming.id);
      let updated;
      if (exists) {
        updated = currentReviews.map((r) => (r.id === incoming.id ? incoming : r));
      } else {
        updated = [incoming, ...currentReviews];
      }
      try {
        localStorage.setItem(getStorageKey(targetHotelId), JSON.stringify(updated));
      } catch (e) {}
    } else if (eventType === 'UPDATE') {
      const incoming = rowToReview(newRow);
      const updated = currentReviews.map((r) => (r.id === incoming.id ? incoming : r));
      try {
        localStorage.setItem(getStorageKey(targetHotelId), JSON.stringify(updated));
      } catch (e) {}
    } else if (eventType === 'DELETE') {
      const deletedId = oldRow?.id;
      const updated = currentReviews.filter((r) => r.id !== deletedId);
      try {
        localStorage.setItem(getStorageKey(targetHotelId), JSON.stringify(updated));
      } catch (e) {}
    }

    // Trigger local update so UI immediately rerenders without page reload
    window.dispatchEvent(
      new CustomEvent('app:hotel-reviews-updated', { detail: { hotelId: targetHotelId } })
    );
  },

  // -------------------------------------------------------------
  // REVIEWS & RATINGS CRUD
  // -------------------------------------------------------------

  // Get all reviews for a hotel (cached locally, seamlessly synced)
  getHotelReviews: (hotelId) => {
    if (!hotelId) return [];
    try {
      const stored = localStorage.getItem(getStorageKey(hotelId));
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading hotel reviews:', e);
    }

    return [];
  },

  // Calculate dynamic average rating and review counts
  getHotelRatingMeta: (hotelId, fallbackRating = 4.8, fallbackCount = 0) => {
    const reviews = HotelReviewService.getHotelReviews(hotelId);
    if (!reviews || reviews.length === 0) {
      return {
        averageRating: Number(fallbackRating || 4.8),
        totalReviews: Number(fallbackCount || 0),
        totalScore: Number(fallbackRating || 4.8) * Math.max(1, Number(fallbackCount || 1))
      };
    }

    const totalScore = reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0);
    const avg = Number((totalScore / reviews.length).toFixed(1));
    return {
      averageRating: avg,
      totalReviews: reviews.length,
      totalScore
    };
  },

  // Get user's previously submitted rating (cannot be lowered, only increased)
  getUserPreviousRating: (hotelId, userKey) => {
    try {
      const stored = localStorage.getItem(getUserRatingKey(hotelId, userKey));
      if (stored) return Number(stored);
      // Also check if user already has a review in the list
      const reviews = HotelReviewService.getHotelReviews(hotelId);
      const found = reviews.find((r) => r.userId === userKey || r.userKey === userKey);
      if (found && found.rating) return Number(found.rating);
    } catch (e) {}
    return null;
  },

  // Direct quick rating from hotel card (without needing comment modal)
  submitQuickRating: (hotelId, starCount, userKey, userName = 'গেস্ট ট্রাভেলার') => {
    const prevRating = HotelReviewService.getUserPreviousRating(hotelId, userKey);
    let finalRating = Number(starCount || 5);
    if (prevRating && prevRating > 0) {
      if (finalRating < prevRating) {
        return {
          success: false,
          prevRating,
          finalRating: prevRating,
          message: `পূর্বের রেটিং ${prevRating}★ এর চেয়ে কমানো যাবে না, শুধুমাত্র বাড়ানো যাবে।`
        };
      }
      finalRating = Math.max(finalRating, prevRating);
    }

    try {
      localStorage.setItem(getUserRatingKey(hotelId, userKey), String(finalRating));
    } catch (e) {}

    const reviews = HotelReviewService.getHotelReviews(hotelId);
    const existingIndex = reviews.findIndex(
      (r) => r.userId === userKey || r.userKey === userKey
    );

    let updatedReviews;
    let targetItem;

    if (existingIndex >= 0) {
      targetItem = {
        ...reviews[existingIndex],
        rating: finalRating,
        updatedAt: new Date().toISOString()
      };
      updatedReviews = [...reviews];
      updatedReviews[existingIndex] = targetItem;
    } else {
      targetItem = {
        id: `hrev-${hotelId}-${Date.now()}`,
        hotelId,
        userId: userKey || `guest-${Date.now()}`,
        userKey: userKey || `guest-${Date.now()}`,
        userName: userName || 'গেস্ট ট্রাভেলার',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: finalRating,
        comment: `${finalRating}★ স্টার রেটিং প্রদান করেছেন।`,
        date: 'আজকে',
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: []
      };
      updatedReviews = [targetItem, ...reviews];
    }

    // Optimistic local update
    try {
      localStorage.setItem(getStorageKey(hotelId), JSON.stringify(updatedReviews));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('app:hotel-reviews-updated', { detail: { hotelId } }));

    // Async Supabase Sync
    if (supabase) {
      supabase
        .from('hotel_reviews')
        .upsert(reviewToRow(targetItem))
        .catch((err) => console.warn('Supabase quick rating sync warning:', err));
    }

    return {
      success: true,
      finalRating,
      message: `ধন্যবাদ! আপনার ${finalRating}★ রেটিং সংরক্ষিত হয়েছে।`
    };
  },

  // Save or update a review
  saveHotelReview: (hotelId, reviewData, userKey) => {
    const reviews = HotelReviewService.getHotelReviews(hotelId);
    const prevRating = HotelReviewService.getUserPreviousRating(hotelId, userKey);

    // Rule: keo ekbar rating dile seta komano jabe na, shudhu barano jabe!
    let finalRating = Number(reviewData.rating || 5);
    if (prevRating && prevRating > 0) {
      finalRating = Math.max(finalRating, prevRating);
    }

    try {
      localStorage.setItem(getUserRatingKey(hotelId, userKey), String(finalRating));
    } catch (e) {}

    const existingIndex = reviews.findIndex(
      (r) => r.id === reviewData.id || (userKey && (r.userId === userKey || r.userKey === userKey))
    );

    let updatedReviews;
    let targetItem;

    if (existingIndex >= 0) {
      const existing = reviews[existingIndex];
      targetItem = {
        ...existing,
        ...reviewData,
        rating: finalRating,
        comment: (reviewData.comment || '').trim(),
        updatedAt: new Date().toISOString()
      };
      updatedReviews = [...reviews];
      updatedReviews[existingIndex] = targetItem;
    } else {
      targetItem = {
        id: reviewData.id || `hrev-${hotelId}-${Date.now()}`,
        hotelId,
        userId: userKey || `guest-${Date.now()}`,
        userKey: userKey || `guest-${Date.now()}`,
        userName: reviewData.userName || 'গেস্ট ট্রাভেলার',
        userAvatar:
          reviewData.userAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        rating: finalRating,
        comment: (reviewData.comment || '').trim(),
        date: 'আজকে',
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: []
      };
      updatedReviews = [targetItem, ...reviews];
    }

    // Optimistic local update
    try {
      localStorage.setItem(getStorageKey(hotelId), JSON.stringify(updatedReviews));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('app:hotel-reviews-updated', { detail: { hotelId } }));

    // Async Supabase Sync
    if (supabase) {
      supabase
        .from('hotel_reviews')
        .upsert(reviewToRow(targetItem))
        .catch((err) => console.warn('Supabase save review sync warning:', err));
    }

    return updatedReviews;
  },

  // Delete a review
  deleteHotelReview: (hotelId, reviewId) => {
    const reviews = HotelReviewService.getHotelReviews(hotelId);
    const updatedReviews = reviews.filter((r) => r.id !== reviewId);
    try {
      localStorage.setItem(getStorageKey(hotelId), JSON.stringify(updatedReviews));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('app:hotel-reviews-updated', { detail: { hotelId } }));

    // Async Supabase Sync
    if (supabase) {
      supabase
        .from('hotel_reviews')
        .delete()
        .eq('id', reviewId)
        .catch((err) => console.warn('Supabase delete review sync warning:', err));
    }

    return updatedReviews;
  },

  // Toggle Like on a review (1 person 1 like only)
  toggleReviewLike: (hotelId, reviewId, userKey = 'device') => {
    let likedSet = new Set();
    try {
      const stored = localStorage.getItem(getLikesKey(hotelId));
      if (stored) {
        likedSet = new Set(JSON.parse(stored));
      }
    } catch (e) {}

    const reviews = HotelReviewService.getHotelReviews(hotelId);
    const targetReview = reviews.find((r) => r.id === reviewId);
    if (!targetReview) return { likes: 0, isLiked: false };

    const isCurrentlyLiked = likedSet.has(reviewId);
    let newLikes = Number(targetReview.likes || 0);

    const likedByArr = Array.isArray(targetReview.likedBy) ? [...targetReview.likedBy] : [];

    if (isCurrentlyLiked) {
      // Unlike
      likedSet.delete(reviewId);
      newLikes = Math.max(0, newLikes - 1);
      const idx = likedByArr.indexOf(userKey);
      if (idx >= 0) likedByArr.splice(idx, 1);
    } else {
      // Like (1 person can only give 1 like)
      likedSet.add(reviewId);
      newLikes = newLikes + 1;
      if (!likedByArr.includes(userKey)) likedByArr.push(userKey);
    }

    try {
      localStorage.setItem(getLikesKey(hotelId), JSON.stringify(Array.from(likedSet)));
    } catch (e) {}

    const updatedReviews = reviews.map((r) =>
      r.id === reviewId ? { ...r, likes: newLikes, likedBy: likedByArr } : r
    );

    try {
      localStorage.setItem(getStorageKey(hotelId), JSON.stringify(updatedReviews));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('app:hotel-reviews-updated', { detail: { hotelId } }));

    // Async Supabase Sync
    if (supabase) {
      supabase
        .from('hotel_reviews')
        .update({
          likes: newLikes,
          liked_by: likedByArr,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .catch((err) => console.warn('Supabase toggle like sync warning:', err));
    }

    return { likes: newLikes, isLiked: !isCurrentlyLiked };
  },

  // Check if a review is liked by this device/user
  isReviewLiked: (hotelId, reviewId, userKey = 'device') => {
    try {
      const stored = localStorage.getItem(getLikesKey(hotelId));
      if (stored) {
        const likedArr = JSON.parse(stored);
        if (Array.isArray(likedArr) && likedArr.includes(reviewId)) {
          return true;
        }
      }
      const reviews = HotelReviewService.getHotelReviews(hotelId);
      const target = reviews.find((r) => r.id === reviewId);
      if (target && Array.isArray(target.likedBy) && target.likedBy.includes(userKey)) {
        return true;
      }
    } catch (e) {}
    return false;
  }
};

// Auto-trigger background sync & realtime connection on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    HotelReviewService.initSupabaseSync();
  }, 400);
}
