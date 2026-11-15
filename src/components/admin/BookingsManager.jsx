import React, { useState } from 'react';
import { 
  MessageCircle, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Clock, 
  Check, 
  ArrowUpRight, 
  User, 
  Mail, 
  Phone, 
  FileText,
  CreditCard,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const BookingsManager = ({ 
  bookings, 
  onUpdateStatus, 
  onDeleteBooking 
}) => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);

  // Status Color Mapping
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20';
      case 'Contacted':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20';
      case 'Cancelled':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Pending':
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20 animate-pulse';
    }
  };

  // WhatsApp 1-Click Trigger
  const handleReplyWhatsApp = (booking) => {
    // Strip non-numeric characters for valid wa.me number
    const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '');
    const clientName = booking.fullName || 'সম্মানিত ভ্রমণকারী';
    const pkgName = booking.packageTitle || 'নির্বাচিত ট্যুর প্যাকেজ';
    const refCode = booking.id || 'AETH-000';

    const greeting = `হ্যালো ${clientName}! 🌟\n\nএথেরিয়া ট্রাভেলস কনসিয়ার্জের পক্ষ থেকে আপনার "${pkgName}" সংক্রান্ত ${booking.type === 'inquiry' ? 'অনুসন্ধান' : 'বুকিং'} (রেফারেন্স #${refCode}) সম্পর্কে যোগাযোগ করা হচ্ছে।\n\nআপনার কাস্টম ভ্রমণ পরিকল্পনা চূড়ান্ত করতে আমরা প্রস্তুত। কীভাবে আপনাকে সহায়তা করতে পারি?`;

    const whatsappUrl = `https://wa.me/${cleanPhone || '18005550199'}?text=${encodeURIComponent(greeting)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Filtering
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = 
      filterStatus === 'All' ? true :
      filterStatus === 'Inquiries' ? b.type === 'inquiry' :
      b.status === filterStatus;

    const matchesSearch = 
      !searchTerm ||
      (b.fullName && b.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.packageTitle && b.packageTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.id && b.id.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Controls: Search & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-800/50 dark:bg-white/[0.04] border border-white/20 dark:border-white/10 backdrop-blur-md">
          {[
            { id: 'All', label: 'সব' },
            { id: 'Pending', label: 'অপেক্ষমাণ' },
            { id: 'Confirmed', label: 'নিশ্চিত' },
            { id: 'Contacted', label: 'যোগাযোগ সম্পন্ন' },
            { id: 'Inquiries', label: 'অনুসন্ধান' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer
                ${filterStatus === tab.id
                  ? 'bg-[#69EBDA]/20 text-[#69EBDA] border border-[#69EBDA]/40 shadow-sm'
                  : 'text-slate-200 dark:text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-white/5'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="গ্রাহক, ইমেইল বা আইডি দিয়ে অনুসন্ধান..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 dark:border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#69EBDA]"
          />
        </div>

      </div>

      {/* Clean Liquid Glass Table */}
      <div className="rounded-3xl overflow-hidden liquid-glass border border-[#69EBDA]/35 dark:border-white/20 shadow-[0_16px_50px_rgba(15,23,42,0.25)]">
        
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-200 dark:text-slate-400 text-sm">
            বর্তমান ফিল্টারের সাথে কোনো বুকিং বা অনুসন্ধান মেলেনি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-100 dark:text-slate-300 border-collapse">
              
              {/* Table Header */}
              <thead>
                <tr className="border-b border-white/15 dark:border-white/10 bg-slate-800/60 dark:bg-white/[0.03] text-[11px] uppercase tracking-wider text-[#69EBDA] font-bold">
                  <th className="py-4 px-5">রেফারেন্স ও গ্রাহক তথ্য</th>
                  <th className="py-4 px-5">ধরণ</th>
                  <th className="py-4 px-5">প্যাকেজের নাম</th>
                  <th className="py-4 px-5">ভ্রমণের তারিখ</th>
                  <th className="py-4 px-5">মোট মূল্য</th>
                  <th className="py-4 px-5">স্ট্যাটাস</th>
                  <th className="py-4 px-5 text-right">অ্যাকশন</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-white/10 dark:divide-white/[0.07]">
                {filteredBookings.map((b) => (
                  <tr 
                    key={b.id}
                    className="hover:bg-white/5 dark:hover:bg-white/[0.04] transition-colors group cursor-pointer"
                    onClick={() => setSelectedBookingDetails(b)}
                  >
                    {/* Client Info */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[#69EBDA] font-bold flex items-center justify-center shrink-0">
                          {b.fullName ? b.fullName.charAt(0).toUpperCase() : 'V'}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm group-hover:text-[#69EBDA] transition-colors">
                            {b.fullName}
                          </div>
                          <div className="text-[11px] text-slate-300 dark:text-slate-400 font-mono">
                            {b.id}
                          </div>
                          <div className="text-[11px] text-[#69EBDA]">
                            {b.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        b.type === 'inquiry' 
                          ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40' 
                          : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                      }`}>
                        {b.type === 'inquiry' ? 'অনুসন্ধান' : 'বুকিং'}
                      </span>
                    </td>

                    {/* Package */}
                    <td className="py-4 px-5">
                      <span className="font-semibold text-white block truncate max-w-[200px]">
                        {b.packageTitle}
                      </span>
                      {b.inquiryTopic && (
                        <span className="text-[11px] text-slate-300 dark:text-slate-400 block truncate max-w-[200px]">
                          বিষয়: {b.inquiryTopic}
                        </span>
                      )}
                    </td>

                    {/* Travel Date */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-100 dark:text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-[#69EBDA]" />
                        <span>{b.travelDate}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 dark:text-slate-400">
                        {b.travelers} জন ভ্রমণকারী
                      </span>
                    </td>

                    {/* Total Price */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="text-sm font-black text-white font-['Outfit',sans-serif]">
                        {b.totalPrice}
                      </span>
                    </td>

                    {/* Status Select Badge */}
                    <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={b.status || 'Pending'}
                        onChange={(e) => onUpdateStatus(b.id, e.target.value)}
                        className={`
                          px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none [color-scheme:dark]
                          ${getStatusBadgeStyle(b.status || 'Pending')}
                        `}
                      >
                        <option value="Pending" className="bg-slate-900 text-amber-300">অপেক্ষমাণ</option>
                        <option value="Confirmed" className="bg-slate-900 text-emerald-300">নিশ্চিত</option>
                        <option value="Contacted" className="bg-slate-900 text-cyan-300">যোগাযোগ সম্পন্ন</option>
                        <option value="Cancelled" className="bg-slate-900 text-rose-300">বাতিলকৃত</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* 1-Click WhatsApp Reply */}
                        <button
                          onClick={() => handleReplyWhatsApp(b)}
                          className="
                            px-3 py-1.5 rounded-xl
                            bg-emerald-500/20 hover:bg-emerald-500/35
                            border border-emerald-400/40 hover:border-emerald-300
                            text-emerald-200 text-xs font-semibold
                            flex items-center gap-1.5
                            shadow-sm shadow-emerald-500/20
                            transition-all cursor-pointer
                          "
                          title="হোয়াটসঅ্যাপে গ্রাহককে উত্তর দিন"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
                          <span className="hidden sm:inline">হোয়াটসঅ্যাপ</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>

                        {/* Delete Entry */}
                        <button
                          onClick={() => {
                            if (window.confirm(`রেকর্ড #${b.id} মুছে ফেলতে চান?`)) {
                              onDeleteBooking(b.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-rose-500/30 text-slate-300 hover:text-rose-200 border border-white/20 transition-colors cursor-pointer"
                          title="রেকর্ড মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* Booking Details Drawer / Modal */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/25 shadow-2xl p-6 sm:p-8 space-y-5 my-8 text-white">
            
            <button
              onClick={() => setSelectedBookingDetails(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(selectedBookingDetails.status)}`}>
                {selectedBookingDetails.status}
              </span>
              <span className="text-xs font-mono text-slate-300 dark:text-slate-400">
                {selectedBookingDetails.id}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white font-['Outfit',sans-serif]">
              {selectedBookingDetails.fullName}
            </h3>

            <div className="p-4 rounded-2xl bg-slate-800/50 dark:bg-white/[0.04] border border-white/20 dark:border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300 dark:text-slate-400">প্যাকেজ:</span>
                <span className="font-bold text-white text-right">{selectedBookingDetails.packageTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 dark:text-slate-400">ইমেইল:</span>
                <span className="text-[#69EBDA] font-semibold">{selectedBookingDetails.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 dark:text-slate-400">ফোন:</span>
                <span className="text-white font-medium">{selectedBookingDetails.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 dark:text-slate-400">ভ্রমণের তারিখ:</span>
                <span className="text-white font-medium">{selectedBookingDetails.travelDate} ({selectedBookingDetails.travelers} জন)</span>
              </div>
              {selectedBookingDetails.tripType && (
                <div className="flex justify-between">
                  <span className="text-slate-300 dark:text-slate-400">ট্রিপের ধরন:</span>
                  <span className="font-bold text-[#69EBDA]">{selectedBookingDetails.tripType}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/15 dark:border-white/10">
                <span className="font-bold text-[#69EBDA]">মোট খরচ:</span>
                <span className="font-black text-white text-base">{selectedBookingDetails.totalPrice}</span>
              </div>
            </div>

            {selectedBookingDetails.specialNotes && (
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-300 dark:text-slate-400 tracking-wider block mb-1">
                  গ্রাহকের নোট ও বিশেষ অনুরোধ:
                </span>
                <div className="p-3.5 rounded-2xl bg-slate-800/50 dark:bg-white/[0.04] border border-white/20 dark:border-white/10 text-xs text-slate-100 dark:text-slate-200 leading-relaxed">
                  "{selectedBookingDetails.specialNotes}"
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => handleReplyWhatsApp(selectedBookingDetails)}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400/50 text-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপে উত্তর দিন</span>
              </button>
              
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="py-3 px-5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-white font-semibold text-xs border border-white/20 transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
