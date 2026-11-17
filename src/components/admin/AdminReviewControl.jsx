import React, { useState, useEffect, useMemo } from 'react';
import { Star, CheckCircle2, Search, Loader2, Check, MessageSquareQuote, Trash2 } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { HotelReviewService } from '../../services/hotelReviewService';
import { supabase } from '../../services/supabaseClient';

const collectLocalHotelReviews = () => {
  const list = [];
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith('aetheria_hotel_reviews_')) {
        const raw = localStorage.getItem(k);
        const parsed = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) {
          parsed.forEach((r) => {
            if (r && r.id && !String(r.userId || '').startsWith('demo-user-')) {
              list.push(r);
            }
          });
        }
      }
    }
  } catch (e) {
    console.warn('Error collecting local hotel reviews:', e);
  }
  return list;
};

export const AdminReviewControl = ({ isLight = false, isRoot = false, onShowToast }) => {
  const [allComments, setAllComments] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => StorageService.getReviewSettings().selectedReviewIds || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadAllComments = async () => {
    setIsLoading(true);
    try {
      const hotels = StorageService.getHotels() || [];
      const transports = StorageService.getTransports() || [];
      const restaurants = StorageService.getRestaurants() || [];
      const itemMap = new Map();
      [...hotels, ...transports, ...restaurants].forEach((item) => {
        if (item?.id) itemMap.set(item.id, item.name || item.title || item.id);
      });

      const mergedMap = new Map();

      // 1. Fetch from Supabase hotel_reviews table
      if (supabase) {
        const { data, error } = await supabase
          .from('hotel_reviews')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(300);

        if (!error && Array.isArray(data)) {
          data.forEach((row) => {
            if (!row?.id || String(row.user_id || '').startsWith('demo-user-')) return;
            const text = (row.comment || '').trim();
            if (!text) return;
            mergedMap.set(row.id, {
              id: row.id,
              hotelId: row.hotel_id || '',
              serviceName: itemMap.get(row.hotel_id) || row.hotel_id || 'Travel Service',
              name: row.user_name || 'Guest Traveler',
              avatar: row.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              rating: Number(row.rating || 5),
              quote: text,
              date: row.date_label || (row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent'),
              createdAt: row.created_at || new Date().toISOString(),
              verified: true
            });
          });
        }
      }

      // 2. Merge local cached hotel_reviews
      collectLocalHotelReviews().forEach((r) => {
        const text = (r.comment || '').trim();
        if (!text || mergedMap.has(r.id)) return;
        mergedMap.set(r.id, {
          id: r.id,
          hotelId: r.hotelId || '',
          serviceName: itemMap.get(r.hotelId) || r.hotelId || 'Travel Service',
          name: r.userName || 'Guest Traveler',
          avatar: r.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          rating: Number(r.rating || 5),
          quote: text,
          date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'),
          createdAt: r.createdAt || new Date().toISOString(),
          verified: true
        });
      });

      // 3. Merge general reviews from StorageService.getReviews()
      (StorageService.getReviews() || []).forEach((r) => {
        const text = (r.quote || r.comment || '').trim();
        if (!text || mergedMap.has(r.id)) return;
        mergedMap.set(r.id, {
          id: r.id,
          hotelId: r.hotelId || '',
          serviceName: r.trip || r.location || 'Travel Experience',
          name: r.name || 'Guest Traveler',
          avatar: r.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          rating: Number(r.rating || 5),
          quote: text,
          date: r.date || 'Verified',
          createdAt: r.createdAt || new Date().toISOString(),
          verified: r.verified !== false
        });
      });

      const sorted = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setAllComments(sorted);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllComments();
    const syncReviews = () => loadAllComments();
    const syncSettings = () => {
      setSelectedIds(StorageService.getReviewSettings().selectedReviewIds || []);
    };
    window.addEventListener('app:hotel-reviews-updated', syncReviews);
    window.addEventListener('app:reviews-updated', syncReviews);
    window.addEventListener('app:review-settings-updated', syncSettings);
    return () => {
      window.removeEventListener('app:hotel-reviews-updated', syncReviews);
      window.removeEventListener('app:reviews-updated', syncReviews);
      window.removeEventListener('app:review-settings-updated', syncSettings);
    };
  }, []);

  const filteredComments = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return allComments;
    return allComments.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.quote || '').toLowerCase().includes(q) ||
        (c.serviceName || '').toLowerCase().includes(q)
    );
  }, [allComments, searchTerm]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const mapForPublish = (items) =>
    items.map((c) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      rating: c.rating,
      quote: c.quote,
      location: c.serviceName,
      trip: c.serviceName,
      date: c.date,
      createdAt: c.createdAt,
      verified: true
    }));

  const handleDone = async () => {
    setIsSaving(true);
    try {
      const selectedSet = new Set(selectedIds);
      const selectedReviews = mapForPublish(allComments.filter((c) => selectedSet.has(c.id)));

      await StorageService.saveReviewSettings({
        id: 'primary',
        selectedReviewIds: selectedIds,
        selectedReviews
      });

      onShowToast?.(`${selectedReviews.length} review(s) published to Website Review Section!`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteComment = async (c) => {
    if (!window.confirm('Delete this review permanently from the entire website?')) return;

    // 1. Delete from hotel_reviews (local cache + Supabase)
    if (c.hotelId) {
      HotelReviewService.deleteHotelReview(c.hotelId, c.id);
    }
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k && k.startsWith('aetheria_hotel_reviews_')) {
          const raw = localStorage.getItem(k);
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed) && parsed.some((r) => r.id === c.id)) {
            localStorage.setItem(k, JSON.stringify(parsed.filter((r) => r.id !== c.id)));
          }
        }
      }
      window.dispatchEvent(new CustomEvent('app:hotel-reviews-updated', { detail: { hotelId: c.hotelId || '' } }));
    } catch (e) {
      console.warn('Local hotel review cleanup warning:', e);
    }

    if (supabase) {
      await supabase
        .from('hotel_reviews')
        .delete()
        .eq('id', c.id)
        .catch((err) => console.warn('Supabase hotel_reviews delete warning:', err));
    }

    // 2. Delete from general reviews table + localStorage
    await StorageService.deleteReview(c.id);

    // 3. Remove from Review Control published list (review_settings)
    const nextIds = selectedIds.filter((id) => id !== c.id);
    setSelectedIds(nextIds);
    const nextComments = allComments.filter((item) => item.id !== c.id);
    setAllComments(nextComments);
    await StorageService.saveReviewSettings({
      id: 'primary',
      selectedReviewIds: nextIds,
      selectedReviews: mapForPublish(nextComments.filter((item) => nextIds.includes(item.id)))
    });

    onShowToast?.('Review permanently deleted from the entire website!');
  };

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 rounded-3xl border animate-in fade-in duration-300 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <MessageSquareQuote className="w-6 h-6 text-[#69EBDA]" />
            <span>Review Control</span>
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Select user comments below and click Done to display them in the Website Review Section (max 4 shown on homepage, rest on See All Reviews page).
          </p>
        </div>

        <button
          type="button"
          onClick={handleDone}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-[#69EBDA]/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-60 shrink-0"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{isSaving ? 'Publishing...' : `Done (${selectedIds.length} Selected)`}</span>
        </button>
      </div>

      {/* Search & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, comment, or hotel..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium border outline-none ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-teal-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedIds(allComments.map((c) => c.id))}
            className="px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 cursor-pointer"
          >
            Select All ({allComments.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="px-3 py-2 rounded-xl bg-slate-500/15 text-slate-400 hover:bg-slate-500/25 cursor-pointer"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#69EBDA]" />
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-400">
          No user comments found yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComments.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-[#69EBDA] bg-[#69EBDA]/10 shadow-md shadow-[#69EBDA]/10'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0"
                    />
                    <div>
                      <p className="font-black text-sm text-slate-900 dark:text-white">{c.name}</p>
                      <p className="text-[11px] font-bold text-[#69EBDA] line-clamp-1">{c.serviceName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-[#69EBDA] border-[#69EBDA] text-slate-950'
                          : 'border-slate-400/50 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComment(c);
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 cursor-pointer"
                      title="Delete Review Permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed italic ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                  "{c.quote}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(Math.max(1, Math.min(5, c.rating || 5)))].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span>{c.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
