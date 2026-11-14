import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  MessageSquare, 
  Star, 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { uploadMediaFile, removeStorageFiles } from '../../services/supabaseClient';

export const ReviewEditorModal = ({ 
  isOpen, 
  review, 
  onClose, 
  onSave 
}) => {
  const isEditing = Boolean(review?.id);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [trip, setTrip] = useState('');
  const [rating, setRating] = useState('5');
  const [avatar, setAvatar] = useState('');
  const [quote, setQuote] = useState('');
  const [verified, setVerified] = useState(true);
  const [avatarMode, setAvatarMode] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (review) {
      setName(review.name || '');
      setLocation(review.location || '');
      setTrip(review.trip || '');
      setRating(review.rating?.toString() || '5');
      setAvatar(review.avatar || '');
      setQuote(review.quote || '');
      setVerified(review.verified !== false);
    } else {
      setName('');
      setLocation('ঢাকা, বাংলাদেশ');
      setTrip('বালি আইল্যান্ড ও নুসা পেনিডা ট্যুর');
      setRating('5');
      setAvatar('');
      setQuote('');
      setVerified(true);
    }
  }, [review, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadMediaFile(file, 'reviews');
      if (res?.url) {
        if (avatar && avatar.includes('/agency-media/')) {
          await removeStorageFiles(avatar);
        }
        setAvatar(res.url);
      }
    } catch (err) {
      alert('ছবি আপলোড করতে সমস্যা হয়েছে: ' + (err.message || 'ত্রুটি'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (avatar && avatar.includes('/agency-media/')) {
      await removeStorageFiles(avatar);
    }
    setAvatar('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const reviewPayload = {
      ...(review || {}),
      id: review?.id || `rev-${Date.now()}`,
      name: name.trim() || 'সম্মানিত অতিথি',
      location: location.trim(),
      trip: trip.trim(),
      rating: parseInt(rating, 10) || 5,
      avatar,
      quote: quote.trim(),
      verified,
      date: review?.date || 'আজ যুক্ত হয়েছে'
    };

    onSave(reviewPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/25 shadow-2xl my-8 text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/15 flex items-center justify-between bg-slate-800/60 dark:bg-slate-900/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#69EBDA]/20 text-[#69EBDA] text-xs font-bold mb-1 border border-[#69EBDA]/40">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isEditing ? 'রিভিউ এডিটর' : 'নতুন ক্লায়েন্ট রিভিউ'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {isEditing ? `সম্পাদনা: ${review?.name}` : 'নতুন প্রশংসাপত্র যোগ করুন'}
            </h3>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                অতিথির নাম
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: আরিফ হাসান"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                ঠিকানা / শহর
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="যেমন: ঢাকা, বাংলাদেশ"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                ট্যুর প্যাকেজের নাম
              </label>
              <input
                type="text"
                value={trip}
                onChange={(e) => setTrip(e.target.value)}
                placeholder="যেমন: বালি আইল্যান্ড ও নুসা পেনিডা ট্যুর"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                স্টার রেটিং (১ - ৫)
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none [color-scheme:dark]"
              >
                <option value="5" className="bg-slate-900 text-white">⭐⭐⭐⭐⭐ (৫ স্টার)</option>
                <option value="4" className="bg-slate-900 text-white">⭐⭐⭐⭐ (৪ স্টার)</option>
                <option value="3" className="bg-slate-900 text-white">⭐⭐⭐ (৩ স্টার)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="verified-review"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="w-4 h-4 rounded text-[#69EBDA] focus:ring-[#69EBDA] cursor-pointer"
              />
              <label htmlFor="verified-review" className="text-xs font-bold text-slate-200 cursor-pointer flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>যাচাইকৃত ভ্রমণকারী (Verified)</span>
              </label>
            </div>
          </div>

          {/* Avatar Upload / Link */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block">
                অতিথির ছবি (Supabase Storage: agency-media)
              </label>
              <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setAvatarMode('upload')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${avatarMode === 'upload' ? 'bg-[#69EBDA] text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  আপলোড
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('url')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${avatarMode === 'url' ? 'bg-[#69EBDA] text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  লিংক
                </button>
              </div>
            </div>

            {avatarMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  id="review-avatar-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="review-avatar-upload"
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#69EBDA]/50 hover:border-[#69EBDA] bg-slate-900/60 hover:bg-slate-900 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all text-[#69EBDA]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>আপলোড হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>প্রোফাইল ছবি নির্বাচন করুন</span>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
                />
              </div>
            )}

            {avatar && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#69EBDA] shrink-0">
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  ছবি সরান
                </button>
              </div>
            )}
          </div>

          {/* Quote / Review Text */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              অতিথির মন্তব্য ও অনুভূতি (Review Quote)
            </label>
            <textarea
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="আমাদের সেবা এবং ভ্রমণের অভিজ্ঞতা সম্পর্কে মতামত..."
              className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/15 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-white border border-white/20 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#69EBDA] via-teal-300 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-[#69EBDA]/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
