import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  MapPin,
  Users,
  Trash2,
  XCircle,
  Download,
  Lock,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  MessageCircle,
  Phone
} from 'lucide-react';
import { StorageService } from '../services/storageService';

const SPRING = { type: 'spring', stiffness: 380, damping: 30 };

const parseNum = (val) => Number(String(val || 0).replace(/[^0-9.-]/g, '')) || 0;
const formatBDT = (amount) => `৳ ${Number(amount || 0).toLocaleString('en-IN')}`;

const escapeHtml = (val) =>
  String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const MyBookingsPage = ({ user, onBack, onShowToast }) => {
  const [allBookings, setAllBookings] = useState(() => StorageService.getBookings() || []);
  const [branding, setBranding] = useState(() => StorageService.getBranding());
  const [contactInfo, setContactInfo] = useState(() => StorageService.getContactInfo());
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const syncBookings = () => setAllBookings(StorageService.getBookings() || []);
    const syncBranding = () => setBranding(StorageService.getBranding());
    const syncContact = () => setContactInfo(StorageService.getContactInfo());

    window.addEventListener('app:bookings-updated', syncBookings);
    window.addEventListener('app:branding-updated', syncBranding);
    window.addEventListener('app:contact-info-updated', syncContact);
    return () => {
      window.removeEventListener('app:bookings-updated', syncBookings);
      window.removeEventListener('app:branding-updated', syncBranding);
      window.removeEventListener('app:contact-info-updated', syncContact);
    };
  }, []);

  const userBookings = useMemo(() => {
    if (!user) return [];
    return (Array.isArray(allBookings) ? allBookings : []).filter((b) => {
      const bEmail = (b.email || b.customerEmail || b.userEmail || '').toLowerCase();
      const uEmail = (user.email || '').toLowerCase();
      const bPhone = (b.phone || b.customerPhone || '').trim();
      const uPhone = (user.phone || '').trim();
      const firstName = (user.name || '').toLowerCase().split(' ')[0];
      return (
        (uEmail && bEmail === uEmail) ||
        (uPhone && bPhone === uPhone) ||
        user.role === 'admin' ||
        (firstName && (b.fullName || b.customerName || '').toLowerCase().includes(firstName))
      );
    });
  }, [allBookings, user]);

  const filteredBookings = useMemo(() => {
    return userBookings.filter((b) => {
      const status = (b.status || 'Pending').toLowerCase();
      if (statusFilter !== 'All' && status !== statusFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${b.id || ''} ${b.itemTitle || ''} ${b.hotelName || ''} ${b.packageTitle || ''} ${b.destination || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [userBookings, statusFilter, searchQuery]);

  const handleCancelOrder = async (bk) => {
    const statusLower = (bk.status || 'Pending').toLowerCase();
    if (['confirmed', 'ongoing', 'completed', 'cancelled'].includes(statusLower)) return;
    if (!window.confirm('আপনি কি নিশ্চিত যে এই অর্ডারটি ক্যানসেল করতে চান?')) return;
    setBusyId(bk.id);
    try {
      await StorageService.updateBookingStatus(bk.id, 'Cancelled');
      onShowToast?.('অর্ডার সফলভাবে ক্যানসেল করা হয়েছে।');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteHistory = async (bk) => {
    const statusLower = (bk.status || 'Pending').toLowerCase();
    if (['confirmed', 'ongoing'].includes(statusLower)) return;
    if (!window.confirm('আপনি কি এই অর্ডার হিস্ট্রি ডিলিট করতে চান?')) return;
    setBusyId(bk.id);
    try {
      await StorageService.deleteBooking(bk);
      onShowToast?.('অর্ডার হিস্ট্রি ডিলিট করা হয়েছে।');
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadInvoicePDF = async (bk) => {
    if (downloadingId) return;
    setDownloadingId(bk.id);
    let container = null;
    try {
      const tot = parseNum(bk.totalPrice);
      const adv = parseNum(bk.advancePaid);
      const due = Math.max(0, bk.dueAmount != null ? Number(bk.dueAmount) : tot - adv);
      const vatTaxAmount = Number(bk.taxAmount ?? bk.vatAmount ?? bk.priceBreakdown?.tax ?? bk.priceBreakdown?.vat ?? 0) || 0;
      const vatPct = Number(bk.vatTaxPercentage ?? bk.vatPercent ?? 0) || 0;
      const subtotalAmount = Math.max(0, tot - vatTaxAmount);
      const statusText = bk.status || 'Pending';
      const isConfirmedOrDone = ['confirmed', 'ongoing', 'completed'].includes(statusText.toLowerCase());
      const paymentStamp = due === 0 && tot > 0 ? 'PAID IN FULL' : adv > 0 ? 'PARTIAL PAID' : 'PAYMENT DUE';

      const svcHay = `${bk.serviceType || ''} ${bk.bookingType || ''} ${bk.itemTitle || ''} ${bk.packageTitle || ''}`.toLowerCase();
      const serviceCategory =
        svcHay.includes('transport') || svcHay.includes('car') || svcHay.includes('bus') || svcHay.includes('ship') || svcHay.includes('flight') || bk.seats
          ? 'Transport'
          : svcHay.includes('restaurant') || svcHay.includes('dining') || svcHay.includes('meal') || svcHay.includes('bbq')
            ? 'Restaurant'
            : svcHay.includes('package') || svcHay.includes('tour') || svcHay.includes('combo')
              ? 'Tour Package'
              : 'Hotel & Resort';

      const brandName = branding?.brandName || 'SHARE TRIP BD';
      const brandLogoUrl = branding?.logoUrl || '';
      const socialLinks = StorageService.getSocialLinks() || {};
      const footerSocials = StorageService.getFooterSettings()?.socialLinks || [];
      const activeSocials = footerSocials.length > 0
        ? footerSocials.filter(s => s?.url).map(s => `${s.name || s.platform || 'Social'}: ${s.url}`)
        : [
            socialLinks.facebook ? `Facebook: ${socialLinks.facebook}` : null,
            socialLinks.youtube ? `YouTube: ${socialLinks.youtube}` : null,
            socialLinks.instagram ? `Instagram: ${socialLinks.instagram}` : null,
            socialLinks.website ? `Website: ${socialLinks.website}` : null
          ].filter(Boolean);
      const adminName = bk.confirmedByName || (isConfirmedOrDone ? 'Authorized Admin' : 'Pending Review');
      const adminPhone = bk.confirmedByPhone || '';
      const adminWhatsapp = bk.confirmedByWhatsapp || '';
      const adminContactLine = [
        adminPhone ? `Phone: ${adminPhone}` : null,
        adminWhatsapp && adminWhatsapp !== adminPhone ? `WhatsApp: ${adminWhatsapp}` : adminWhatsapp ? `WhatsApp: ${adminWhatsapp}` : null
      ]
        .filter(Boolean)
        .join('  |  ');

      const serviceTitle = bk.itemTitle || bk.hotelName || bk.packageTitle || 'Travel Service';
      const dateStr = bk.checkOutDate
        ? `${bk.checkInDate || bk.travelDate || ''} to ${bk.checkOutDate}`
        : bk.checkInDate || bk.travelDate || 'As Scheduled';
      const guestStr =
        bk.adults != null || bk.children != null
          ? `${bk.adults ?? 0} Adults, ${bk.children ?? 0} Children`
          : `${bk.guests || bk.travelers || 1} Guest(s)`;

      const col2Header =
        serviceCategory === 'Transport'
          ? 'Route & Travel Schedule'
          : serviceCategory === 'Restaurant'
            ? 'Dining Date & Meal Plan'
            : serviceCategory === 'Tour Package'
              ? 'Destination & Duration'
              : 'Check-In / Check-Out';
      const col3Header =
        serviceCategory === 'Transport'
          ? 'Seats & Vehicle'
          : serviceCategory === 'Restaurant'
            ? 'Guests / Persons'
            : serviceCategory === 'Tour Package'
              ? 'Included Services & Travelers'
              : 'Rooms & Guests';

      const col2Body =
        serviceCategory === 'Transport'
          ? `${[bk.pickup || bk.routeFrom, bk.dropoff || bk.routeTo].filter(Boolean).join(' → ') || bk.destination || 'Scheduled Route'}<div style="font-size:11px;color:#64748b;margin-top:2px;">${escapeHtml(dateStr)}${bk.arrivalTime ? ` (${escapeHtml(bk.arrivalTime)})` : ''}</div>`
          : serviceCategory === 'Restaurant'
            ? `${escapeHtml(dateStr)}${bk.mealPlan ? `<div style="font-size:11px;color:#0d9488;font-weight:700;margin-top:2px;">${escapeHtml(bk.mealPlan)}</div>` : ''}`
            : serviceCategory === 'Tour Package'
              ? `${escapeHtml(bk.destination || 'Custom Tour')}<div style="font-size:11px;color:#64748b;margin-top:2px;">${escapeHtml(dateStr)} (${escapeHtml(bk.selectedDays || bk.days || 1)} Day/s)</div>`
              : `${escapeHtml(dateStr)}<div style="font-size:11px;color:#64748b;margin-top:2px;">${escapeHtml(bk.selectedDays || bk.days || 1)} Day(s)</div>`;

      const col3Body =
        serviceCategory === 'Transport'
          ? `${bk.seats ? `${escapeHtml(bk.seats)} Seat(s)` : escapeHtml(guestStr)}${bk.tripType ? `<div style="font-size:11px;color:#0d9488;font-weight:700;margin-top:2px;">Trip: ${escapeHtml(bk.tripType)}</div>` : ''}${bk.vehicleType ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${escapeHtml(bk.vehicleType)}</div>` : ''}`
          : serviceCategory === 'Restaurant'
            ? `${escapeHtml(guestStr)}`
            : serviceCategory === 'Tour Package'
              ? `${escapeHtml(guestStr)}${bk.selectedServices ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${['hotel', 'transport', 'dining'].filter((k) => bk.selectedServices?.[k]).map((k) => k.toUpperCase()).join(' + ') || 'Full Package'}</div>` : ''}`
              : `${bk.rooms ? `<div>${escapeHtml(bk.rooms)} Room(s)${bk.roomType ? ` (${escapeHtml(bk.roomType)})` : ''}</div>` : ''}${escapeHtml(guestStr)}`;

      container = document.createElement('div');
      container.style.cssText =
        'position:fixed; left:-9999px; top:0; width:820px; background:#ffffff; color:#0f172a; padding:36px 40px; font-family:"Plus Jakarta Sans","Hind Siliguri",sans-serif; z-index:-1;';

      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #0d9488; padding-bottom:18px; margin-bottom:22px;">
          <div style="display:flex; align-items:center; gap:14px;">
            ${
              brandLogoUrl
                ? `<img src="${escapeHtml(brandLogoUrl)}" crossorigin="anonymous" style="height:52px; width:auto; max-width:140px; object-fit:contain;" />`
                : ''
            }
            <div>
              <div style="font-size:22px; font-weight:900; color:#0f172a; letter-spacing:-0.3px;">${escapeHtml(brandName)}</div>
              <div style="font-size:11px; color:#0d9488; font-weight:700; text-transform:uppercase; letter-spacing:1.2px;">Official Booking Invoice & Proof of Reservation</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="display:inline-block; padding:5px 12px; border-radius:999px; background:${
              due === 0 && tot > 0 ? '#dcfce7' : '#e0f2fe'
            }; color:${due === 0 && tot > 0 ? '#166534' : '#0369a1'}; font-size:11px; font-weight:900; letter-spacing:0.8px;">
              ${escapeHtml(paymentStamp)}
            </div>
            <div style="font-size:12px; font-weight:800; color:#0f172a; margin-top:6px;">Invoice #INV-${escapeHtml(bk.id)}</div>
            <div style="font-size:11px; color:#64748b;">Issued: ${new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>

        <div style="display:flex; gap:16px; margin-bottom:20px;">
          <div style="flex:1; padding:14px 16px; border-radius:12px; background:#f8fafc; border:1px solid #e2e8f0;">
            <div style="font-size:10px; font-weight:800; color:#0d9488; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">Billed To (Customer)</div>
            <div style="font-size:14px; font-weight:800; color:#0f172a;">${escapeHtml(bk.customerName || bk.fullName || user?.name || 'Valued Guest')}</div>
            <div style="font-size:12px; color:#334155; margin-top:3px;">Phone: ${escapeHtml(bk.customerPhone || bk.phone || user?.phone || 'N/A')}</div>
            <div style="font-size:12px; color:#334155; margin-top:2px;">Email: ${escapeHtml(bk.customerEmail || bk.email || user?.email || 'N/A')}</div>
          </div>

          <div style="flex:1; padding:14px 16px; border-radius:12px; background:#f0fdfa; border:1px solid #99f6e4;">
            <div style="font-size:10px; font-weight:800; color:#0f766e; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">Reservation & Verification</div>
            <div style="font-size:12px; color:#0f172a;"><strong>Booking ID:</strong> ${escapeHtml(bk.id)}</div>
            <div style="font-size:12px; color:#0f172a; margin-top:3px;"><strong>Order Status:</strong> ${escapeHtml(statusText)}</div>
            <div style="font-size:12px; color:#0f172a; margin-top:3px;"><strong>Confirmed By Admin:</strong> ${escapeHtml(adminName)}</div>
            ${
              adminContactLine
                ? `<div style="font-size:11px; color:#0f766e; font-weight:700; margin-top:4px;">${escapeHtml(adminContactLine)}</div>`
                : ''
            }
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:12px;">
          <thead>
            <tr style="background:#0f172a; color:#ffffff; text-align:left;">
              <th style="padding:10px 12px;">${escapeHtml(serviceCategory)} Details</th>
              <th style="padding:10px 12px;">${escapeHtml(col2Header)}</th>
              <th style="padding:10px 12px;">${escapeHtml(col3Header)}</th>
              <th style="padding:10px 12px; text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:12px;">
                <div style="font-weight:800; color:#0f172a; font-size:13px;">${escapeHtml(serviceTitle)}</div>
                <div style="font-size:11px; color:#0d9488; font-weight:700; margin-top:2px;">Category: ${escapeHtml(serviceCategory)}</div>
              </td>
              <td style="padding:12px; color:#334155;">${col2Body}</td>
              <td style="padding:12px; color:#334155;">${col3Body}</td>
              <td style="padding:12px; text-align:right; font-weight:800; color:#0f172a;">৳ ${subtotalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div style="display:flex; justify-content:flex-end; margin-bottom:24px;">
          <div style="width:320px; padding:14px 16px; border-radius:12px; background:#f8fafc; border:1px solid #cbd5e1; font-size:12px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:#475569;">Subtotal</span>
              <span style="font-weight:700; color:#0f172a;">৳ ${subtotalAmount.toLocaleString('en-IN')}</span>
            </div>
            ${
              vatTaxAmount > 0
                ? `<div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                     <span style="color:#475569;">VAT & Tax ${vatPct > 0 ? `(${vatPct}%)` : ''}</span>
                     <span style="font-weight:700; color:#0f172a;">+ ৳ ${vatTaxAmount.toLocaleString('en-IN')}</span>
                   </div>`
                : ''
            }
            <div style="display:flex; justify-content:space-between; margin-bottom:6px; padding-top:4px; border-top:1px dashed #cbd5e1;">
              <span style="color:#0f172a; font-weight:800;">Total Amount</span>
              <span style="font-weight:900; color:#0f172a;">৳ ${tot.toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:#059669;">Advance Paid (${escapeHtml(bk.paymentMethod || 'Cash')})</span>
              <span style="font-weight:800; color:#059669;">৳ ${adv.toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:1px solid #cbd5e1; font-size:14px;">
              <span style="font-weight:900; color:#0f172a;">Due Balance</span>
              <span style="font-weight:900; color:${due > 0 ? '#e11d48' : '#059669'};">৳ ${due.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div style="border-top:1px dashed #cbd5e1; padding-top:14px; display:flex; justify-content:space-between; align-items:flex-start; font-size:11px; color:#64748b;">
          <div>
            <div><strong>${escapeHtml(brandName)}</strong> • Official Electronic Invoice</div>
            <div>${escapeHtml(contactInfo?.address?.primary || '')}</div>
            ${
              activeSocials.length > 0
                ? `<div style="margin-top:6px; color:#0f766e; font-weight:600; word-break:break-all;">${activeSocials.map((s) => escapeHtml(s)).join(' &nbsp;|&nbsp; ')}</div>`
                : ''
            }
          </div>
          <div style="text-align:right; flex-shrink:0;">
            <div>Support: ${escapeHtml(contactInfo?.phone?.hotline || contactInfo?.whatsapp || '')}</div>
            <div>${escapeHtml(contactInfo?.email?.bookings || contactInfo?.email?.concierge || '')}</div>
          </div>
        </div>
      `;

      document.body.appendChild(container);
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      pdf.save(`Invoice-${bk.id}.pdf`);
      onShowToast?.('ইনভয়েস PDF ডাউনলোড হয়েছে!');
    } catch (err) {
      console.error('Invoice PDF error:', err);
      onShowToast?.('ইনভয়েস PDF তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      if (container && container.parentNode) container.parentNode.removeChild(container);
      setDownloadingId(null);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.96 }}
          transition={SPRING}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/90 backdrop-blur-xl border border-[#69EBDA]/40 text-white text-xs sm:text-sm font-bold shadow-md hover:border-[#69EBDA] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#69EBDA]" />
          <span>হোমে ফিরে যান</span>
        </motion.button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#5C6977]/90 dark:bg-slate-900/80 border border-[#69EBDA]/30 text-white text-xs font-bold">
          <Briefcase className="w-4 h-4 text-[#69EBDA]" />
          <span>মোট অর্ডার: {userBookings.length}</span>
        </div>
      </div>

      {/* Page Header & Filters */}
      <div className="rounded-3xl bg-[#5C6977]/95 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#69EBDA]/30 p-6 sm:p-8 text-white shadow-xl mb-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif]">
              My Bookings & Order History
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1">
              আপনার সকল বুকিং হিস্ট্রি দেখুন, পেন্ডিং অর্ডার ক্যানসেল করুন এবং যেকোনো অর্ডারের প্রফেশনাল PDF ইনভয়েস ডাউনলোড করুন।
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#69EBDA] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অর্ডার আইডি বা সার্ভিস খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/45 border border-white/15 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#69EBDA]"
            />
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#69EBDA] text-slate-950 font-black shadow-sm'
                  : 'bg-slate-950/35 text-slate-200 hover:bg-slate-950/60 border border-white/10'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {!user ? (
        <div className="rounded-3xl bg-[#5C6977]/95 dark:bg-slate-900/85 border border-[#69EBDA]/30 p-10 text-center text-white">
          <p className="text-sm font-bold">আপনার বুকিং হিস্ট্রি দেখতে অনুগ্রহ করে সাইন ইন করুন।</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-3xl bg-[#5C6977]/95 dark:bg-slate-900/85 border border-[#69EBDA]/30 p-12 text-center text-white space-y-2">
          <Briefcase className="w-10 h-10 text-[#69EBDA] mx-auto opacity-80" />
          <h3 className="text-base font-extrabold">কোনো অর্ডার বা বুকিং পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-300">নতুন হোটেল, প্যাকেজ বা ট্রান্সপোর্ট বুক করলে এখানে দেখা যাবে।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((bk) => {
            const status = bk.status || 'Pending';
            const statusLower = status.toLowerCase();
            const isConfirmedLocked = ['confirmed', 'ongoing'].includes(statusLower);
            const canCancel = !['confirmed', 'ongoing', 'completed', 'cancelled'].includes(statusLower);
            const canDelete = !['confirmed', 'ongoing'].includes(statusLower);
            const tot = parseNum(bk.totalPrice);
            const adv = parseNum(bk.advancePaid);
            const due = Math.max(0, bk.dueAmount != null ? Number(bk.dueAmount) : tot - adv);

            const badgeClass =
              statusLower === 'confirmed' || statusLower === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : statusLower === 'cancelled'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/40';

            return (
              <motion.div
                key={bk.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-[#5C6977]/95 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#69EBDA]/30 p-5 sm:p-6 text-white shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-[#69EBDA]">#{bk.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badgeClass}`}>
                        {status}
                      </span>
                      {bk.confirmedByName && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-200 text-[11px] font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Confirmed by: {bk.confirmedByName}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold">
                      {bk.itemTitle || bk.hotelName || bk.packageTitle || 'Travel Reservation'}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-lg font-black text-[#69EBDA]">{formatBDT(tot)}</div>
                    <div className="text-[11px] text-slate-300">
                      Advance: {formatBDT(adv)} • Due: <span className={due > 0 ? 'text-rose-300 font-bold' : 'text-emerald-300 font-bold'}>{formatBDT(due)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#69EBDA] shrink-0" />
                    <span>
                      {bk.checkOutDate
                        ? `${bk.checkInDate || bk.travelDate || ''} → ${bk.checkOutDate}`
                        : bk.checkInDate || bk.travelDate || 'Scheduled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#69EBDA] shrink-0" />
                    <span>
                      {bk.adults != null || bk.children != null
                        ? `${bk.adults ?? 0} Adults, ${bk.children ?? 0} Children`
                        : `${bk.guests || bk.travelers || 1} Guests`}
                    </span>
                  </div>
                  {(bk.confirmedByPhone || bk.confirmedByWhatsapp) && (
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>Admin: {bk.confirmedByWhatsapp || bk.confirmedByPhone}</span>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <div>
                    {isConfirmedLocked ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-3 py-1.5 rounded-xl">
                        <Lock className="w-3.5 h-3.5" />
                        <span>অ্যাডমিন কনফার্ম করেছেন — ক্যানসেল ও ডিলিট লক করা আছে (Completed হলে ডিলিট করা যাবে)</span>
                      </span>
                    ) : statusLower === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>অর্ডার সম্পন্ন হয়েছে — চাইলে হিস্ট্রি ডিলিট করতে পারবেন</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-[#69EBDA]" />
                        <span>কনফার্ম হওয়ার আগে অর্ডার ক্যানসেল বা ডিলিট করা যাবে</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canCancel && (
                      <button
                        type="button"
                        disabled={busyId === bk.id}
                        onClick={() => handleCancelOrder(bk)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        disabled={busyId === bk.id}
                        onClick={() => handleDeleteHistory(bk)}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete History</span>
                      </button>
                    )}

                    {['confirmed', 'ongoing', 'completed'].includes(statusLower) ? (
                      <button
                        type="button"
                        disabled={downloadingId === bk.id}
                        onClick={() => handleDownloadInvoicePDF(bk)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 text-xs font-black inline-flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-60"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingId === bk.id ? 'Generating PDF...' : 'Download Invoice PDF'}</span>
                      </button>
                    ) : (
                      <span className="px-3.5 py-2 rounded-xl bg-slate-950/35 border border-white/10 text-slate-300 text-[11px] font-bold inline-flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-300" />
                        <span>{statusLower === 'cancelled' ? 'অর্ডার ক্যানসেল হয়েছে' : 'কনফার্ম হলে Invoice PDF পাবেন'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
