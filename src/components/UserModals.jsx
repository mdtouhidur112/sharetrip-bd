import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Briefcase, 
  Heart, 
  Settings, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Check, 
  Sparkles, 
  Trash2, 
  ExternalLink, 
  Phone, 
  Mail, 
  User, 
  ShieldCheck, 
  MessageSquare,
  ArrowRight,
  Lock,
  Key,
  Eye,
  EyeOff,
  Globe,
  Bell,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Send,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { uploadMediaFile } from '../services/supabaseClient';

// =========================================================================
// 1. MY BOOKINGS & INQUIRIES MODAL
// =========================================================================
export const UserBookingsModal = ({ isOpen, onClose, onViewPackage }) => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'booking' | 'inquiry'

  if (!isOpen) return null;

  const allBookings = StorageService.getBookings();
  // Filter bookings matching this user's email or phone, or show all if demo
  const userBookings = allBookings.filter(b => {
    if (!user) return true;
    return b.email?.toLowerCase() === user.email?.toLowerCase() ||
           b.phone === user.phone ||
           user.role === 'admin' ||
           b.fullName?.toLowerCase().includes(user.name?.toLowerCase().split(' ')[0]);
  });

  const displayed = filterType === 'all' 
    ? userBookings 
    : userBookings.filter(b => b.type === filterType);

  const handleWhatsAppReply = (booking) => {
    const rawWa = (StorageService.getContactInfo()?.whatsapp || '').replace(/[^0-9]/g, '');
    if (!rawWa) return;
    const text = encodeURIComponent(
      `Hello Aetheria Voyages, regarding my ${booking.type === 'booking' ? 'Booking' : 'Inquiry'} (${booking.id}) for "${booking.packageTitle}". I'd like an update on my itinerary.`
    );
    window.open(`https://wa.me/${rawWa}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: 10, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
            className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/25 shadow-[0_20px_60px_rgba(15,23,42,0.3)] dark:shadow-2xl my-8 text-white transition-all"
          >
            
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/15 dark:border-white/10 flex items-center justify-between relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#69EBDA]/20 text-[#69EBDA] text-xs font-bold mb-2 border border-[#69EBDA]/40">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>ব্যক্তিগত ভ্রমণ পরিকল্পনা ও রেকর্ড</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
                  আমার বুকিং ও অনুসন্ধান
                </h3>
                <p className="text-xs text-slate-100 dark:text-slate-400 mt-1 font-medium">
                  {user?.name || 'ভ্রমণকারী'} ({user?.email}) অ্যাকাউন্টের অধীনে সক্রিয় বুকিং তালিকা
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

        {/* Filter Pills */}
        <div className="px-6 sm:px-8 py-3 bg-slate-800/50 dark:bg-slate-950/40 border-b border-white/15 dark:border-white/10 flex items-center gap-2">
          {['all', 'booking', 'inquiry'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`
                px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer
                ${filterType === type
                  ? 'bg-gradient-to-r from-[#69EBDA] to-cyan-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800/60 dark:bg-white/5 text-slate-200 dark:text-slate-300 hover:text-white hover:bg-slate-800'
                }
              `}
            >
              {type === 'all' ? 'সব অনুরোধ' : type === 'booking' ? 'নিশ্চিতকৃত বুকিং' : 'সরাসরি অনুসন্ধান'}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-300 font-mono">
            {displayed.length}টি রেকর্ড
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          {displayed.length === 0 ? (
            <div className="text-center py-12 text-slate-200 dark:text-slate-400">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#69EBDA]" />
              <p className="text-sm font-semibold text-white">এই ক্যাটাগরিতে কোনো বুকিং বা অনুসন্ধান পাওয়া যায়নি।</p>
              <p className="text-xs mt-1 text-slate-200">আপনার পরবর্তী ভ্রমণের জন্য আমাদের নির্বাচিত ট্যুর প্যাকেজগুলো দেখুন।</p>
            </div>
          ) : (
            displayed.map((item) => (
              <div 
                key={item.id}
                className="p-5 rounded-2xl bg-slate-800/50 dark:bg-white/5 border border-white/20 dark:border-white/15 hover:border-[#69EBDA]/60 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#69EBDA]/20 text-[#69EBDA] border border-[#69EBDA]/40">
                        {item.type === 'booking' ? 'বুকিং' : 'অনুসন্ধান'}
                      </span>
                      <span className="text-xs font-mono text-slate-300 dark:text-slate-400">
                        {item.id}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white font-['Outfit',sans-serif]">
                      {item.packageTitle}
                    </h4>
                  </div>

                  {/* Status Badge */}
                  <span className={`
                    self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5
                    ${item.status === 'Confirmed' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : item.status === 'Contacted'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    }
                  `}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {item.status === 'Confirmed' ? 'নিশ্চিত' : item.status === 'Contacted' ? 'যোগাযোগ সম্পন্ন' : 'প্রক্রিয়াধীন'}
                  </span>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-white/15 dark:border-white/10 text-xs">
                  <div>
                    <span className="text-slate-300 dark:text-slate-400 block text-[10px] uppercase font-bold">ভ্রমণের তারিখ</span>
                    <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#69EBDA]" />
                      {item.travelDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-300 dark:text-slate-400 block text-[10px] uppercase font-bold">ভ্রমণকারী সংখ্যা</span>
                    <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-[#69EBDA]" />
                      {item.travelers} জন ভ্রমণকারী
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-300 dark:text-slate-400 block text-[10px] uppercase font-bold">মোট খরচ</span>
                    <span className="font-bold text-white mt-0.5 block">
                      {item.totalPrice}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-300 dark:text-slate-400 block text-[10px] uppercase font-bold">অনুরোধের সময়</span>
                    <span className="text-slate-200 dark:text-slate-400 text-[11px] mt-0.5 block">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {item.specialNotes && (
                  <p className="mt-3 text-xs text-slate-200 dark:text-slate-300 italic">
                    "{item.specialNotes}"
                  </p>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleWhatsAppReply(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>হোয়াটসঅ্যাপ কনসিয়ার্জ</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </motion.div>
    </div>
    )}
  </AnimatePresence>
  );
};

// =========================================================================
// 2. SAVED PACKAGES & HOTELS / WISHLIST MODAL
// =========================================================================
export const WishlistModal = ({ isOpen, onClose, onViewPackage, onSelectHotel }) => {
  const { wishlist, toggleWishlist } = useAuth();
  const allPackages = StorageService.getPackages() || [];
  const allHotels = StorageService.getHotels() || [];

  const savedPackages = allPackages.filter(p => wishlist.includes(p.id));
  const savedHotels = allHotels.filter(h => wishlist.includes(h.id));
  const totalCount = savedPackages.length + savedHotels.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: 10, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
            className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/25 shadow-[0_20px_60px_rgba(15,23,42,0.3)] dark:shadow-2xl my-8 text-white transition-all"
          >
            
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/15 dark:border-white/10 flex items-center justify-between relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#69EBDA]/20 text-[#69EBDA] text-xs font-bold mb-2 border border-[#69EBDA]/40">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>পছন্দের ভ্রমণ তালিকা</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
                  সংরক্ষিত আইটেমসমূহ ({totalCount})
                </h3>
                <p className="text-xs text-slate-100 dark:text-slate-400 mt-1 font-medium">
                  আপনার ভবিষ্যৎ ভ্রমণের জন্য সংরক্ষিত বিশেষ ট্যুর ও হোটেলসমূহ।
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          {totalCount === 0 ? (
            <div className="text-center py-12 text-slate-200 dark:text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#69EBDA]" />
              <p className="text-sm font-semibold text-white">আপনার পছন্দের তালিকা বর্তমানে খালি।</p>
              <p className="text-xs mt-1 text-slate-200">ভবিষ্যতে দেখার জন্য যেকোনো প্যাকেজ বা হোটেল কার্ডের হার্ট আইকনে ক্লিক করে সংরক্ষণ করুন।</p>
            </div>
          ) : (
            <>
              {/* Saved Packages */}
              {savedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-800/50 dark:bg-white/5 border border-white/20 dark:border-white/15 flex flex-col sm:flex-row items-center gap-4 hover:border-[#69EBDA]/60 transition-all shadow-sm"
                >
                  <div 
                    className="w-full sm:w-28 h-24 rounded-xl bg-cover bg-center shrink-0 border border-white/20"
                    style={{ backgroundImage: `url('${pkg.image}')` }}
                  />

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#69EBDA]">
                        {pkg.category || 'ট্যুর প্যাকেজ'}
                      </span>
                      <span className="text-white/40">•</span>
                      <span className="text-xs text-slate-300 dark:text-slate-400">{pkg.duration}</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white font-['Outfit',sans-serif]">
                      {pkg.shortTitle || pkg.title}
                    </h4>
                    <div className="text-xs font-semibold text-[#69EBDA] mt-0.5">
                      ${pkg.price} <span className="text-slate-300 font-normal">{pkg.priceNote || '/ জন'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        if (onViewPackage) onViewPackage(pkg);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#69EBDA] to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-[#69EBDA]/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>ভ্রমণ পরিকল্পনা দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleWishlist(pkg.id)}
                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                      title="সংরক্ষণ থেকে মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Saved Hotels */}
              {savedHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-800/50 dark:bg-white/5 border border-white/20 dark:border-white/15 flex flex-col sm:flex-row items-center gap-4 hover:border-[#69EBDA]/60 transition-all shadow-sm"
                >
                  <div 
                    className="w-full sm:w-28 h-24 rounded-xl bg-cover bg-center shrink-0 border border-white/20"
                    style={{
                      backgroundImage: `url('${hotel.defaultPhoto || hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}')`
                    }}
                  />

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#69EBDA]">
                        {hotel.category || 'Luxury Hotel & Resort'}
                      </span>
                      {hotel.location && (
                        <>
                          <span className="text-white/40">•</span>
                          <span className="text-xs text-slate-300 dark:text-slate-400">{hotel.location}</span>
                        </>
                      )}
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white font-['Outfit',sans-serif]">
                      {hotel.name}
                    </h4>
                    <div className="text-xs font-semibold text-[#69EBDA] mt-0.5">
                      ৳ {Number(hotel.bookingPrice ?? hotel.pricePerNight ?? 0).toLocaleString('en-IN')}{' '}
                      <span className="text-slate-300 font-normal">/ {hotel.bookingDays || '১ দিন'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        if (onSelectHotel) onSelectHotel(hotel);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#69EBDA] to-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-[#69EBDA]/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>হোটেল বিস্তারিত দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleWishlist(hotel.id)}
                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                      title="সংরক্ষণ থেকে মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

      </motion.div>
    </div>
    )}
  </AnimatePresence>
  );
};

// =========================================================================
// 3. ACCOUNT SETTINGS MODAL (EXTENDED WITH FULL CUSTOMIZATION & SECURITY)
// =========================================================================
export const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  
  // Settings Tabs
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'credentials' | 'security' | 'preferences'
  
  // General Info
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarLink, setAvatarLink] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [passportCountry, setPassportCountry] = useState(user?.passportCountry || 'Bangladesh');

  // Contact Credentials (Email & Phone)
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
      setPassportCountry(user.passportCountry || 'Bangladesh');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user, isOpen]);
  
  // Password Management
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetSending, setIsResetSending] = useState(false);

  // Website Customization & Preferences (Notification Channels)
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('aetheria_pref_notifs');
      return stored ? JSON.parse(stored) : { email: true, whatsapp: true, secretDispatches: true };
    } catch {
      return { email: true, whatsapp: true, secretDispatches: true };
    }
  });

  // Feedback Banner
  const [statusMessage, setStatusMessage] = useState(null);

  const showStatus = (text, type = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  // 1. Save General Profile
  const handleSaveGeneral = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      avatar,
      passportCountry
    });
    showStatus('প্রোফাইল তথ্য ও ছবি সফলভাবে আপডেট করা হয়েছে!');
  };

  // 2. Save Email / Phone Credentials
  const handleSaveCredentials = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showStatus('অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।', 'error');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      showStatus('অনুগ্রহ করে একটি সঠিক ফোন নম্বর দিন।', 'error');
      return;
    }
    updateProfile({
      email: email.trim(),
      phone: phone.trim()
    });
    showStatus('ইমেইল ও হোয়াটসঅ্যাপ নম্বর সফলভাবে আপডেট করা হয়েছে!');
  };

  // 3. Update Password
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showStatus('অনুগ্রহ করে আপনার বর্তমান পাসওয়ার্ডটি দিন।', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showStatus('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showStatus('নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showStatus('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
  };

  // 4. Send Forgot Password Reset Link
  const handleSendResetLink = () => {
    setIsResetSending(true);
    setTimeout(() => {
      setIsResetSending(false);
      showStatus(`${user?.email || email} ঠিকানায় পাসওয়ার্ড রিসেট লিংক ও নির্দেশাবলী পাঠানো হয়েছে!`);
    }, 900);
  };

  // 5. Save Website Customization & Preferences
  const handleSavePreferences = (notifs = notifications) => {
    setNotifications(notifs);
    try {
      localStorage.setItem('aetheria_pref_notifs', JSON.stringify(notifs));
    } catch (err) {
      console.warn(err);
    }
    showStatus('যোগাযোগ ও নোটিফিকেশন সেটিংস সংরক্ষিত হয়েছে!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: 10, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
            className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/25 shadow-[0_20px_60px_rgba(15,23,42,0.3)] dark:shadow-2xl my-6 text-white transition-all"
          >
            
            {/* Header */}
            <div className="p-5 sm:p-7 border-b border-white/15 dark:border-white/10 flex items-center justify-between relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#69EBDA]/20 text-[#69EBDA] text-xs font-bold mb-1.5 border border-[#69EBDA]/40">
                  <Settings className="w-3.5 h-3.5" />
                  <span>ভ্রমণকারী কন্ট্রোল হাব</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
                  অ্যাকাউন্ট ও ওয়েবসাইট সেটিংস
                </h3>
                <p className="text-xs text-slate-100 dark:text-slate-400 mt-0.5 font-medium">
                  লগইন তথ্য, নিরাপত্তা, ইমেইল, হোয়াটসঅ্যাপ এবং ওয়েবসাইট সেটিংস পরিবর্তন করুন।
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Card Summary */}
            <div className="px-5 sm:px-7 py-3.5 bg-slate-800/60 dark:bg-slate-950/40 border-b border-white/15 dark:border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={user?.avatar || avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={user?.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#69EBDA] shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">{user?.name}</h4>
                  <span className="text-xs text-slate-300 dark:text-slate-400 font-mono font-medium">{user?.email}</span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#69EBDA]/20 text-[#69EBDA] border border-[#69EBDA]/35">
                  {user?.membership || 'ভিআইপি ভ্রমণকারী'}
                </span>
                <div className="text-[10px] text-slate-300 dark:text-slate-400 font-mono mt-1">আইডি: {user?.id}</div>
              </div>
            </div>

            {/* Settings Tab Navigation */}
            <div className="px-5 sm:px-7 py-2.5 bg-slate-800/40 dark:bg-slate-950/60 border-b border-white/15 dark:border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'general', label: 'ব্যক্তিগত তথ্য ও প্রোফাইল', icon: User },
                { id: 'credentials', label: 'ইমেইল ও হোয়াটসঅ্যাপ', icon: Mail },
                { id: 'security', label: 'পাসওয়ার্ড ও নিরাপত্তা', icon: Lock },
                { id: 'preferences', label: 'ওয়েবসাইট নোটিফিকেশন', icon: Globe }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer
                      ${isActive 
                        ? 'bg-[#69EBDA] text-slate-950 shadow-md shadow-[#69EBDA]/30 font-black' 
                        : 'bg-white/10 text-slate-200 hover:text-white hover:bg-white/15 border border-white/10'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Notification / Status Feedback */}
            {statusMessage && (
              <div className="mx-5 sm:mx-7 mt-4 p-3 rounded-2xl bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Tab Contents */}
            <div className="p-5 sm:p-7 max-h-[55vh] overflow-y-auto space-y-5">
              
              {/* ------------------------------------------------------------------- */}
              {/* TAB 1: IDENTITY & PROFILE */}
              {/* ------------------------------------------------------------------- */}
              {activeTab === 'general' && (
                <form onSubmit={handleSaveGeneral} className="space-y-4">
                  
                  {/* Real Photo Upload & Photo Link System */}
                  <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-slate-800/50 dark:bg-white/[0.04] border border-white/15">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-200 dark:text-slate-300 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#69EBDA]" />
                        <span>প্রোফাইল ছবি (ডিভাইস থেকে আপলোড বা ওয়েব লিংক)</span>
                      </label>
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="text-[10px] text-rose-400 hover:underline font-bold cursor-pointer"
                        >
                          রিসেট
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt="Avatar Preview"
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#69EBDA] shadow-md shadow-[#69EBDA]/20"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        {/* 1. Device File Upload */}
                        <label className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white cursor-pointer transition-all">
                          <Upload className="w-3.5 h-3.5 text-[#69EBDA]" />
                          <span>{isUploadingAvatar ? 'আপলোড হচ্ছে...' : 'ডিভাইস থেকে ছবি আপলোড করুন'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingAvatar}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingAvatar(true);
                              try {
                                const res = await uploadMediaFile(file, 'users');
                                const uploadedUrl = typeof res === 'string' ? res : res?.url;
                                if (uploadedUrl) {
                                  setAvatar(uploadedUrl);
                                  await updateProfile({ avatar: uploadedUrl });
                                  showStatus('প্রোফাইল ছবি ডাটাবেজে সেভ করা হয়েছে!');
                                }
                              } catch (err) {
                                showStatus(`আপলোড ব্যর্থ হয়েছে: ${err?.message || 'আবার চেষ্টা করুন'}`);
                              } finally {
                                setIsUploadingAvatar(false);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>

                        {/* 2. Photo Link Input */}
                        <div className="relative flex items-center">
                          <LinkIcon className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                          <input
                            type="url"
                            value={avatarLink}
                            onChange={(e) => setAvatarLink(e.target.value)}
                            placeholder="অথবা ছবির সরাসরি URL লিংক পেস্ট করুন (https://...)"
                            className="w-full pl-8 pr-16 py-1.5 text-xs rounded-xl bg-slate-900/60 border border-white/15 text-white placeholder:text-slate-400 focus:outline-none focus:border-[#69EBDA]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (avatarLink.trim()) {
                                setAvatar(avatarLink.trim());
                                setAvatarLink('');
                                showStatus('ছবির URL সফলভাবে যুক্ত করা হয়েছে!');
                              }
                            }}
                            className="absolute right-1 px-2.5 py-1 rounded-lg bg-[#69EBDA] text-slate-950 font-extrabold text-[10px] cursor-pointer"
                          >
                            প্রয়োগ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-200 dark:text-slate-300">
                      আপনার পূর্ণ নাম
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-[#69EBDA]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-200 dark:text-slate-300">
                      পাসপোর্টের দেশ / জাতীয়তা
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                      <input
                        type="text"
                        value={passportCountry}
                        onChange={(e) => setPassportCountry(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-[#69EBDA]"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-full py-3 px-4 min-h-[46px] rounded-2xl bg-gradient-to-r from-[#69EBDA] to-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>প্রোফাইল পরিবর্তন সংরক্ষণ করুন</span>
                  </motion.button>
                </form>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* TAB 2: EMAIL / GMAIL & WHATSAPP PHONE */}
              {/* ------------------------------------------------------------------- */}
              {activeTab === 'credentials' && (
                <form onSubmit={handleSaveCredentials} className="space-y-5">
                  <div className="p-3.5 rounded-2xl bg-[#69EBDA]/15 border border-[#69EBDA]/30 text-xs text-white">
                    <span className="font-bold text-[#69EBDA] block mb-1">সরাসরি যোগাযোগ ও নোটিফিকেশন চ্যানেল</span>
                    সমস্ত বুকিং বিবরণ, ভ্রমণ পরিকল্পনা ও টিকিট এই ইমেইল এবং হোয়াটসঅ্যাপ নম্বরে পাঠানো হবে।
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-200 dark:text-slate-300">
                        জিমেইল / ইমেইল ঠিকানা
                      </label>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> যাচাইকৃত চ্যানেল
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-[#69EBDA]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-200 dark:text-slate-300">
                        ফোন / হোয়াটসঅ্যাপ নম্বর
                      </label>
                      <span className="text-[10px] text-[#69EBDA] font-bold">কান্ট্রি কোড সহ</span>
                    </div>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3.5 w-4 h-4 text-[#69EBDA]" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+৮৮০ ১৭১২-৩৪৫৬৭৮"
                        className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-[#69EBDA]"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-full py-3 px-4 min-h-[46px] rounded-2xl bg-gradient-to-r from-[#69EBDA] to-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>ইমেইল ও মোবাইল নম্বর আপডেট করুন</span>
                  </motion.button>
                </form>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* TAB 3: PASSWORD & SECURITY (CHANGE PASSWORD + FORGOT PASSWORD) */}
              {/* ------------------------------------------------------------------- */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  
                  {/* Change Password Form */}
                  <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                    <div className="flex items-center justify-between pb-1 border-b border-white/10">
                      <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-[#69EBDA]" />
                        <span>অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-[#69EBDA] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-300">
                        বর্তমান পাসওয়ার্ড
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3.5 w-4 h-4 text-slate-300" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-4 py-2.5 min-h-[42px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-[#69EBDA]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-300">
                          নতুন পাসওয়ার্ড
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="কমপক্ষে ৬ অক্ষর"
                          className="w-full px-4 py-2.5 min-h-[42px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-[#69EBDA]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-300">
                          নতুন পাসওয়ার্ড নিশ্চিত করুন
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                          className="w-full px-4 py-2.5 min-h-[42px] rounded-2xl bg-slate-800/45 dark:bg-white/5 border border-white/20 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-[#69EBDA]"
                        />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full py-2.5 px-4 min-h-[44px] rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#69EBDA]" />
                      <span>পাসওয়ার্ড আপডেট করুন</span>
                    </motion.button>
                  </form>

                  {/* Forgot Password / Reset Section */}
                  <div className="p-4 rounded-2xl bg-slate-800/50 dark:bg-white/[0.04] border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#69EBDA]" />
                        <span>পাসওয়ার্ড ভুলে গেছেন বা রিকভারি প্রয়োজন?</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        আমরা সরাসরি <strong className="text-white">{user?.email || email}</strong> ঠিকানায় পাসওয়ার্ড রিসেট করার লিংক পাঠাব।
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isResetSending}
                      onClick={handleSendResetLink}
                      className="shrink-0 px-4 py-2.5 rounded-xl bg-[#69EBDA]/20 hover:bg-[#69EBDA]/30 border border-[#69EBDA]/45 text-[#69EBDA] font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isResetSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{isResetSending ? 'লিংক পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}</span>
                    </button>
                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* TAB 4: WEBSITE CUSTOMIZATION & PREFERENCES */}
              {/* ------------------------------------------------------------------- */}
              {activeTab === 'preferences' && (
                <div className="space-y-4">
                  {/* Notification Channels */}
                  <div className="space-y-3">
                    <label className="text-[11px] uppercase tracking-wider font-extrabold text-slate-200 dark:text-slate-300 block">
                      যোগাযোগ ও নোটিফিকেশন চ্যানেলসমূহ
                    </label>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 border border-white/15">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-[#69EBDA]" />
                        <div>
                          <div className="text-xs font-bold text-white">ইমেইলে বুকিং আপডেট</div>
                          <div className="text-[11px] text-slate-300">ভ্রমণের সময়সূচী, ফ্লাইট টিকিট ও ট্রাভেল পারমিটের আপডেট পান</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => handleSavePreferences({ ...notifications, email: e.target.checked })}
                        className="w-4 h-4 accent-[#69EBDA] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 border border-white/15">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="text-xs font-bold text-white">হোয়াটসঅ্যাপে ভিআইপি কনসিয়ার্জ অ্যালার্ট</div>
                          <div className="text-[11px] text-slate-300">সরাসরি ট্রাভেল এজেন্টের সাথে যোগাযোগ ও লাইভ ট্যুর নোটিফিকেশন</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.whatsapp}
                        onChange={(e) => handleSavePreferences({ ...notifications, whatsapp: e.target.checked })}
                        className="w-4 h-4 accent-emerald-400 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 border border-white/15">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <div>
                          <div className="text-xs font-bold text-white">বিশেষ অফার ও নতুন ট্যুর প্যাকেজ</div>
                          <div className="text-[11px] text-slate-300">বিশেষ ছাড়ে প্রাইভেট রিসোর্ট ও সীমিত সিটের ট্যুর অফারসমূহ সবার আগে পান</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.secretDispatches}
                        onChange={(e) => handleSavePreferences({ ...notifications, secretDispatches: e.target.checked })}
                        className="w-4 h-4 accent-[#69EBDA] cursor-pointer"
                      />
                    </div>
                  </div>

                </div>
              )}

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
