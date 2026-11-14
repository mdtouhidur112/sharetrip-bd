import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Hotel, 
  MapPin, 
  DollarSign, 
  Star, 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { uploadMediaFile, removeStorageFiles } from '../../services/supabaseClient';

export const HotelEditorModal = ({ 
  isOpen, 
  hotel, 
  onClose, 
  onSave 
}) => {
  const isEditing = Boolean(hotel?.id);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState('4.8');
  const [reviewsCount, setReviewsCount] = useState('320');
  const [pricePerNight, setPricePerNight] = useState('189.00');
  const [roomType, setRoomType] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [imageMode, setImageMode] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (hotel) {
      setName(hotel.name || '');
      setLocation(hotel.location || '');
      setRating(hotel.rating?.toString() || '4.8');
      setReviewsCount(hotel.reviewsCount?.toString() || '320');
      setPricePerNight(hotel.pricePerNight?.toString() || '189.00');
      setRoomType(hotel.roomType || '');
      setImage(hotel.image || '');
      setDescription(hotel.description || '');
      setAmenitiesText(Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : '');
    } else {
      setName('');
      setLocation('বালি, ইন্দোনেশিয়া');
      setRating('4.8');
      setReviewsCount('120');
      setPricePerNight('150.00');
      setRoomType('ডিলাক্স সি-ভিউ স্যুট');
      setImage('');
      setDescription('');
      setAmenitiesText('ফ্রি ওয়াইফাই, বুফে ব্রেকফাস্ট, ইনফিনিটি পুল, স্পা');
    }
  }, [hotel, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadMediaFile(file, 'hotels');
      if (res?.url) {
        if (image && image.includes('/agency-media/')) {
          await removeStorageFiles(image);
        }
        setImage(res.url);
      }
    } catch (err) {
      alert('ছবি আপলোড করতে সমস্যা হয়েছে: ' + (err.message || 'ত্রুটি'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (image && image.includes('/agency-media/')) {
      await removeStorageFiles(image);
    }
    setImage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amenities = amenitiesText
      ? amenitiesText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const hotelPayload = {
      ...(hotel || {}),
      id: hotel?.id || `hotel-${Date.now()}`,
      name: name.trim() || 'বিলাসবহুল রিসোর্ট',
      location: location.trim(),
      rating: parseFloat(rating) || 4.8,
      reviewsCount: parseInt(reviewsCount, 10) || 0,
      pricePerNight: parseFloat(pricePerNight) || 0,
      roomType: roomType.trim(),
      image,
      description: description.trim(),
      amenities
    };

    onSave(hotelPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/25 shadow-2xl my-8 text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/15 flex items-center justify-between bg-slate-800/60 dark:bg-slate-900/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#69EBDA]/20 text-[#69EBDA] text-xs font-bold mb-1 border border-[#69EBDA]/40">
              <Hotel className="w-3.5 h-3.5" />
              <span>{isEditing ? 'হোটেল এডিটর' : 'নতুন হোটেল ও রিসোর্ট'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {isEditing ? `সম্পাদনা: ${hotel?.name}` : 'নতুন বিলাসবহুল আবাসন যোগ করুন'}
            </h3>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                হোটেলের নাম
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: আলায়া রিসোর্ট উবুদ"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                স্থান ও লোকেশন
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="যেমন: উবুদ, বালি"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                রুম ক্যাটাগরি
              </label>
              <input
                type="text"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                placeholder="যেমন: ডিলাক্স ভ্যালি স্যুট"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                প্রতি রাতের ভাড়া ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                placeholder="189.00"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                স্টার রেটিং
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>
          </div>

          {/* Photo Upload / Link */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block">
                হোটেলের ছবি (Supabase Storage: agency-media)
              </label>
              <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${imageMode === 'upload' ? 'bg-[#69EBDA] text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  আপলোড
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${imageMode === 'url' ? 'bg-[#69EBDA] text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  লিংক
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  id="hotel-photo-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="hotel-photo-upload"
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-[#69EBDA]/50 hover:border-[#69EBDA] bg-slate-900/60 hover:bg-slate-900 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all text-[#69EBDA]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Supabase Storage-এ আপলোড হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>হোটেলের ছবি আপলোড করুন</span>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/70 border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
                />
              </div>
            )}

            {image && (
              <div className="relative h-28 rounded-xl overflow-hidden border border-white/20 group">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                  title="ছবি মুছুন"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>মুছুন</span>
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              হোটেলের আকর্ষণীয় বিবরণ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="হোটেলের পরিবেশ, অবস্থান ও সুযোগ-সুবিধা..."
              className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA] resize-none"
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              সুযোগ-সুবিধাসমূহ (কমা দিয়ে লিখুন)
            </label>
            <input
              type="text"
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              placeholder="যেমন: ফ্রি ওয়াইফাই, ইনফিনিটি পুল, স্পা, ব্রেকফাস্ট"
              className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
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
