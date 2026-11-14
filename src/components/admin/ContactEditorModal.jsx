import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const ContactEditorModal = ({ 
  isOpen, 
  contactInfo, 
  onClose, 
  onSave 
}) => {
  const [weekdaysHours, setWeekdaysHours] = useState('');
  const [weekendsHours, setWeekendsHours] = useState('');
  const [emergencyHours, setEmergencyHours] = useState('');
  const [primaryAddress, setPrimaryAddress] = useState('');
  const [satelliteAddress, setSatelliteAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [hotlinePhone, setHotlinePhone] = useState('');
  const [tollFreePhone, setTollFreePhone] = useState('');
  const [conciergeEmail, setConciergeEmail] = useState('');
  const [bookingsEmail, setBookingsEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (contactInfo) {
      setWeekdaysHours(contactInfo.hours?.weekdays || '');
      setWeekendsHours(contactInfo.hours?.weekends || '');
      setEmergencyHours(contactInfo.hours?.emergency || '');
      setPrimaryAddress(contactInfo.address?.primary || '');
      setSatelliteAddress(contactInfo.address?.satellite || '');
      setMapLink(contactInfo.address?.mapLink || '');
      setHotlinePhone(contactInfo.phone?.hotline || '');
      setTollFreePhone(contactInfo.phone?.tollFree || '');
      setConciergeEmail(contactInfo.email?.concierge || '');
      setBookingsEmail(contactInfo.email?.bookings || '');
      setWhatsapp(contactInfo.whatsapp || '');
    }
  }, [contactInfo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      hours: {
        weekdays: weekdaysHours.trim(),
        weekends: weekendsHours.trim(),
        emergency: emergencyHours.trim()
      },
      address: {
        primary: primaryAddress.trim(),
        satellite: satelliteAddress.trim(),
        mapLink: mapLink.trim()
      },
      phone: {
        hotline: hotlinePhone.trim(),
        tollFree: tollFreePhone.trim()
      },
      email: {
        concierge: conciergeEmail.trim(),
        bookings: bookingsEmail.trim()
      },
      whatsapp: whatsapp.trim()
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/25 shadow-2xl my-8 text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/15 flex items-center justify-between bg-slate-800/60 dark:bg-slate-900/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#69EBDA]/20 text-[#69EBDA] text-xs font-bold mb-1 border border-[#69EBDA]/40">
              <Building2 className="w-3.5 h-3.5" />
              <span>যোগাযোগ ও অফিস তথ্য এডিটর</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              সাইট ও অফিস যোগাযোগ ব্যবস্থাপনা
            </h3>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Address Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#69EBDA] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> ঠিকানা ও লোকেশন
            </h4>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                প্রধান কার্যালয় (ঢাকা অফিস)
              </label>
              <input
                type="text"
                value={primaryAddress}
                onChange={(e) => setPrimaryAddress(e.target.value)}
                placeholder="লেভেল ১৪, ক্রিস্টাল ওশান টাওয়ার, গুলশান-২, ঢাকা ১২১২, বাংলাদেশ"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                স্যাটেলাইট বা আন্তর্জাতিক অফিস
              </label>
              <input
                type="text"
                value={satelliteAddress}
                onChange={(e) => setSatelliteAddress(e.target.value)}
                placeholder="৫৭৫ ৫ম অ্যাভিনিউ, ১৮তম তলা, নিউইয়র্ক, এনওয়াই ১০০১৭, যুক্তরাষ্ট্র"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                গুগল ম্যাপ লিংক
              </label>
              <input
                type="url"
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>
          </div>

          {/* Phone & Email Section */}
          <div className="space-y-3 pt-3 border-t border-white/15">
            <h4 className="text-xs font-bold text-[#69EBDA] uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> ফোন, ইমেইল ও হোয়াটসঅ্যাপ
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                  হটলাইন ফোন
                </label>
                <input
                  type="text"
                  value={hotlinePhone}
                  onChange={(e) => setHotlinePhone(e.target.value)}
                  placeholder="+৮৮০ ১৭১১-২৩৪৫৬৭"
                  className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                  টোল-ফ্রি নম্বর
                </label>
                <input
                  type="text"
                  value={tollFreePhone}
                  onChange={(e) => setTollFreePhone(e.target.value)}
                  placeholder="+১ (৮০০) ৫৫৫-০১৯৯"
                  className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                  কনসিয়ার্জ ইমেইল
                </label>
                <input
                  type="email"
                  value={conciergeEmail}
                  onChange={(e) => setConciergeEmail(e.target.value)}
                  placeholder="concierge@aetheriatravels.com"
                  className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                  বুকিং ইমেইল
                </label>
                <input
                  type="email"
                  value={bookingsEmail}
                  onChange={(e) => setBookingsEmail(e.target.value)}
                  placeholder="booking@aetheriatravels.com"
                  className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                  হোয়াটসঅ্যাপ নম্বর (কান্ট্রি কোড সহ)
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+18005550199"
                  className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-3 pt-3 border-t border-white/15">
            <h4 className="text-xs font-bold text-[#69EBDA] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> অফিস সময়সূচী
            </h4>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                কর্মদিবস (সোম - শুক্র)
              </label>
              <input
                type="text"
                value={weekdaysHours}
                onChange={(e) => setWeekdaysHours(e.target.value)}
                placeholder="সোম – শুক্র: সকাল ০৮:০০ – রাত ০৯:০০ (GMT+6)"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                সাপ্তাহিক ছুটি (শনিবার)
              </label>
              <input
                type="text"
                value={weekendsHours}
                onChange={(e) => setWeekendsHours(e.target.value)}
                placeholder="শনিবার: সকাল ০৯:০০ – সন্ধ্যা ০৬:০০ (GMT+6)"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
                জরুরি ২৪/৭ সহায়তা নোট
              </label>
              <input
                type="text"
                value={emergencyHours}
                onChange={(e) => setEmergencyHours(e.target.value)}
                placeholder="ভ্রমণকারীদের জন্য সার্বক্ষণিক ২৪/৭ হোয়াটসঅ্যাপ কনসিয়ার্জ সচল"
                className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
              />
            </div>
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
