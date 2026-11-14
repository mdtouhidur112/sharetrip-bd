import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  TrendingUp,
  Wallet,
  ShoppingBag,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Hotel,
  Car,
  UtensilsCrossed,
  Compass,
  Phone,
  Calendar as CalendarIcon,
  Trash2,
  Receipt,
  FileText,
  Download,
  MessageCircle,
  Plus,
  Edit3,
  Crown,
  Printer,
  X,
  ArrowRightCircle,
  ChevronLeft,
  ChevronRight,
  PieChart,
  BarChart3,
  Eye,
  Mail
} from 'lucide-react';
import { StorageService } from '../../services/storageService';

const EXPENSE_CATEGORIES = [
  'Fuel & Driver',
  'Hotel Vendor',
  'Restaurant Food',
  'Office & Marketing',
  'Other'
];

const PAYMENT_METHODS = ['bKash', 'Nagad', 'Bank Transfer', 'Cash'];

export const AdminExecutiveDashboard = ({ mode = 'dashboard', language = 'bn', isLight = false, onShowToast }) => {
  const isOrderMode = mode === 'customer-order';
  const [execTab, setExecTab] = useState(isOrderMode ? 'bookings' : 'overview');
  const [bookings, setBookings] = useState(() => StorageService.getBookings() || []);
  const [expenses, setExpenses] = useState(() => StorageService.getExpenses() || []);
  const [hotels, setHotels] = useState(() => StorageService.getHotels() || []);
  const [transports, setTransports] = useState(() => StorageService.getTransports() || []);
  const [restaurants, setRestaurants] = useState(() => StorageService.getRestaurants() || []);
  const [packages, setPackages] = useState(() => StorageService.getPackages() || []);
  const [users, setUsers] = useState(() => StorageService.getRegisteredUsers?.() || []);
  const [branding, setBranding] = useState(() => StorageService.getBranding());

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Payment inline edit state
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [paymentDraft, setPaymentDraft] = useState({ advancePaid: 0, paymentMethod: 'bKash' });

  // Expense form state
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Fuel & Driver',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    note: ''
  });

  // Invoice & Order View Modal state
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [viewOrderBooking, setViewOrderBooking] = useState(null);

  // Master Calendar Month state
  const [calendarDate, setCalendarDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Keep active sub-tab aligned with sidebar mode
  useEffect(() => {
    setExecTab(isOrderMode ? 'bookings' : 'overview');
  }, [isOrderMode]);

  useEffect(() => {
    const syncBookings = () => setBookings(StorageService.getBookings() || []);
    const syncExpenses = () => setExpenses(StorageService.getExpenses() || []);
    const syncHotels = () => setHotels(StorageService.getHotels() || []);
    const syncTransports = () => setTransports(StorageService.getTransports() || []);
    const syncRestaurants = () => setRestaurants(StorageService.getRestaurants() || []);
    const syncPackages = () => setPackages(StorageService.getPackages() || []);
    const syncUsers = () => setUsers(StorageService.getRegisteredUsers?.() || []);
    const syncBranding = () => setBranding(StorageService.getBranding());

    window.addEventListener('app:bookings-updated', syncBookings);
    window.addEventListener('app:expenses-updated', syncExpenses);
    window.addEventListener('app:hotels-updated', syncHotels);
    window.addEventListener('app:transports-updated', syncTransports);
    window.addEventListener('app:restaurants-updated', syncRestaurants);
    window.addEventListener('app:packages-updated', syncPackages);
    window.addEventListener('app:users-updated', syncUsers);
    window.addEventListener('app:branding-updated', syncBranding);

    return () => {
      window.removeEventListener('app:bookings-updated', syncBookings);
      window.removeEventListener('app:expenses-updated', syncExpenses);
      window.removeEventListener('app:hotels-updated', syncHotels);
      window.removeEventListener('app:transports-updated', syncTransports);
      window.removeEventListener('app:restaurants-updated', syncRestaurants);
      window.removeEventListener('app:packages-updated', syncPackages);
      window.removeEventListener('app:users-updated', syncUsers);
      window.removeEventListener('app:branding-updated', syncBranding);
    };
  }, []);

  const parseNum = (val) => Number(String(val || 0).replace(/[^0-9.-]/g, '')) || 0;
  const formatBDT = (amount) => `৳ ${Number(amount || 0).toLocaleString('en-IN')}`;

  const categorizeBooking = (b) => {
    const t = `${b.serviceType || ''} ${b.bookingType || ''} ${b.itemTitle || ''} ${b.packageTitle || ''}`.toLowerCase();
    if (t.includes('transport') || t.includes('car') || t.includes('bus') || t.includes('boat') || t.includes('flight') || b.seats) return 'Transport';
    if (t.includes('restaurant') || t.includes('dining') || t.includes('meal') || t.includes('bbq')) return 'Restaurant';
    if (t.includes('package') || t.includes('tour') || t.includes('combo')) return 'Tour Packages';
    return 'Hotels';
  };

  // Core Financial & Analytics Metrics
  const analytics = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const safeExpenses = Array.isArray(expenses) ? expenses : [];

    const activeBookings = safeBookings.filter((b) => (b.status || '').toLowerCase() !== 'cancelled');
    const confirmedBookings = safeBookings.filter((b) =>
      ['confirmed', 'ongoing', 'completed'].includes((b.status || '').toLowerCase())
    );

    const totalConfirmedRevenue = confirmedBookings.reduce((sum, b) => sum + parseNum(b.totalPrice), 0);
    const totalAdvanceCollected = activeBookings.reduce((sum, b) => sum + parseNum(b.advancePaid), 0);
    const totalDueBalance = activeBookings.reduce((sum, b) => {
      const tot = parseNum(b.totalPrice);
      const adv = parseNum(b.advancePaid);
      return sum + Math.max(0, b.dueAmount != null ? Number(b.dueAmount) : tot - adv);
    }, 0);
    const totalExpenses = safeExpenses.reduce((sum, e) => sum + parseNum(e.amount), 0);
    const netProfit = totalConfirmedRevenue - totalExpenses;

    const upcomingTripsCount = safeBookings.filter((b) =>
      ['confirmed', 'ongoing', 'pending'].includes((b.status || '').toLowerCase())
    ).length;

    // Service distribution
    const dist = {
      'Tour Packages': { count: 0, revenue: 0, color: '#69EBDA' },
      Hotels: { count: 0, revenue: 0, color: '#2DD4BF' },
      Transport: { count: 0, revenue: 0, color: '#38BDF8' },
      Restaurant: { count: 0, revenue: 0, color: '#FBBF24' }
    };

    activeBookings.forEach((b) => {
      const cat = categorizeBooking(b);
      dist[cat].count += 1;
      dist[cat].revenue += parseNum(b.totalPrice);
    });

    // Monthly Revenue vs Expenses (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthly = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const rev = confirmedBookings
        .filter((b) => (b.checkInDate || b.timestamp || '').startsWith(key))
        .reduce((s, b) => s + parseNum(b.totalPrice), 0);
      const exp = safeExpenses
        .filter((e) => (e.expenseDate || e.createdAt || '').startsWith(key))
        .reduce((s, e) => s + parseNum(e.amount), 0);
      monthly.push({
        label: monthNames[d.getMonth()],
        revenue: rev,
        expenses: exp
      });
    }

    return {
      totalConfirmedRevenue,
      totalAdvanceCollected,
      totalDueBalance,
      totalExpenses,
      netProfit,
      upcomingTripsCount,
      distribution: dist,
      totalActiveCount: activeBookings.length,
      monthly
    };
  }, [bookings, expenses]);

  // Unified CRM Customers & Inquiries
  const crmData = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const safeUsers = Array.isArray(users) ? users : [];
    const customerMap = new Map();

    safeUsers.forEach((u) => {
      const key = (u.email || u.phone || u.id || '').toLowerCase().trim();
      if (!key) return;
      customerMap.set(key, {
        id: u.id || key,
        name: u.name || 'Customer',
        email: u.email || '',
        phone: u.phone || '',
        bookingsCount: 0,
        totalSpend: 0
      });
    });

    safeBookings.forEach((b) => {
      if ((b.type || 'booking') === 'inquiry') return;
      const key = (b.customerEmail || b.email || b.customerPhone || b.phone || b.customerName || b.fullName || b.id).toLowerCase().trim();
      const existing = customerMap.get(key) || {
        id: key,
        name: b.customerName || b.fullName || 'Guest Customer',
        email: b.customerEmail || b.email || '',
        phone: b.customerPhone || b.phone || '',
        bookingsCount: 0,
        totalSpend: 0
      };
      existing.bookingsCount += 1;
      if ((b.status || '').toLowerCase() !== 'cancelled') {
        existing.totalSpend += parseNum(b.totalPrice);
      }
      if (!existing.phone && (b.customerPhone || b.phone)) existing.phone = b.customerPhone || b.phone;
      customerMap.set(key, existing);
    });

    const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
    const inquiries = safeBookings.filter((b) => (b.type || '').toLowerCase() === 'inquiry');
    return { customers, inquiries };
  }, [bookings, users]);

  const filteredBookings = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    return safeBookings.filter((b) => {
      const st = (b.status || 'Confirmed').toLowerCase();
      const matchesStatus = statusFilter === 'All' || st === statusFilter.toLowerCase();
      const cat = categorizeBooking(b);
      const matchesService = serviceFilter === 'All' || cat === serviceFilter;
      const q = searchTerm.toLowerCase().trim();
      const matchesQuery =
        !q ||
        (b.id || '').toLowerCase().includes(q) ||
        (b.customerName || b.fullName || '').toLowerCase().includes(q) ||
        (b.customerPhone || b.phone || '').toLowerCase().includes(q) ||
        (b.itemTitle || b.hotelName || b.packageTitle || '').toLowerCase().includes(q);
      return matchesStatus && matchesService && matchesQuery;
    });
  }, [bookings, statusFilter, serviceFilter, searchTerm]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await StorageService.updateBookingStatus(bookingId, newStatus);
      onShowToast?.(
        `Booking #${bookingId} → ${newStatus} (Realtime synced)`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSavePayment = async (bookingId) => {
    setUpdatingId(bookingId);
    try {
      await StorageService.updateBookingPayment(bookingId, paymentDraft);
      setEditingPaymentId(null);
      onShowToast?.('Payment & due balance updated in Supabase!');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) return;
    await StorageService.saveExpense({
      ...(editingExpenseId ? { id: editingExpenseId } : {}),
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      expenseDate: expenseForm.expenseDate,
      note: expenseForm.note.trim()
    });
    onShowToast?.(editingExpenseId ? 'Expense updated!' : 'Expense logged in Supabase!');
    setEditingExpenseId(null);
    setExpenseForm({
      category: 'Fuel & Driver',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      note: ''
    });
  };

  const escapeHtml = (val) =>
    String(val ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const handleExportPDF = async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    let container = null;
    try {
      const totalSum = filteredBookings.reduce((s, b) => s + parseNum(b.totalPrice), 0);
      const advSum = filteredBookings.reduce((s, b) => s + parseNum(b.advancePaid), 0);
      const dueSum = filteredBookings.reduce((s, b) => {
        const tot = parseNum(b.totalPrice);
        const adv = parseNum(b.advancePaid);
        return s + Math.max(0, b.dueAmount != null ? Number(b.dueAmount) : tot - adv);
      }, 0);

      const rowsHtml = filteredBookings
        .map((b, idx) => {
          const tot = parseNum(b.totalPrice);
          const adv = parseNum(b.advancePaid);
          const due = Math.max(0, b.dueAmount != null ? Number(b.dueAmount) : tot - adv);
          const dates = b.checkOutDate
            ? `${b.checkInDate || b.travelDate || ''} → ${b.checkOutDate}`
            : b.checkInDate || b.travelDate || '—';
          return `
            <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 10px; font-weight:700; color:#0f172a;">${escapeHtml(b.id)}</td>
              <td style="padding:8px 10px;">
                <div style="font-weight:700; color:#0f172a;">${escapeHtml(b.customerName || b.fullName || 'Guest')}</div>
                <div style="font-size:10px; color:#475569;">${escapeHtml(b.customerPhone || b.phone || '')}</div>
              </td>
              <td style="padding:8px 10px;">
                <div style="font-weight:600; color:#0f172a;">${escapeHtml(b.itemTitle || b.hotelName || b.packageTitle || 'Service')}</div>
                <div style="font-size:10px; color:#0d9488; font-weight:700;">${escapeHtml(categorizeBooking(b))}</div>
              </td>
              <td style="padding:8px 10px; color:#334155;">${escapeHtml(dates)}</td>
              <td style="padding:8px 10px; text-align:right; font-weight:700;">৳ ${tot.toLocaleString('en-IN')}</td>
              <td style="padding:8px 10px; text-align:right; color:#059669; font-weight:700;">৳ ${adv.toLocaleString('en-IN')}</td>
              <td style="padding:8px 10px; text-align:right; color:#e11d48; font-weight:700;">৳ ${due.toLocaleString('en-IN')}</td>
              <td style="padding:8px 10px; color:#334155;">${escapeHtml(b.paymentMethod || 'Cash')}</td>
              <td style="padding:8px 10px; font-weight:800; color:#0f172a;">${escapeHtml(b.status || 'Confirmed')}</td>
            </tr>
          `;
        })
        .join('');

      container = document.createElement('div');
      container.style.cssText =
        'position:fixed; left:-9999px; top:0; width:1100px; background:#ffffff; color:#0f172a; padding:28px 32px; font-family:"Plus Jakarta Sans","Hind Siliguri",sans-serif; z-index:-1;';
      container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #0d9488; padding-bottom:14px; margin-bottom:18px;">
          <div>
            <div style="font-size:11px; font-weight:800; letter-spacing:1.5px; color:#0d9488; text-transform:uppercase;">${escapeHtml(branding?.brandName || 'SHARE TRIP BD')}</div>
            <h1 style="margin:4px 0 0; font-size:22px; font-weight:900; color:#0f172a;">Customer Orders & Bookings Report</h1>
          </div>
          <div style="text-align:right; font-size:11px; color:#475569;">
            <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>Total Records:</strong> ${filteredBookings.length}</div>
          </div>
        </div>

        <div style="display:flex; gap:12px; margin-bottom:18px;">
          <div style="flex:1; padding:10px 14px; border-radius:10px; background:#f1f5f9; border:1px solid #cbd5e1;">
            <div style="font-size:10px; font-weight:700; color:#475569; text-transform:uppercase;">Total Order Value</div>
            <div style="font-size:16px; font-weight:900; color:#0f172a; margin-top:2px;">৳ ${totalSum.toLocaleString('en-IN')}</div>
          </div>
          <div style="flex:1; padding:10px 14px; border-radius:10px; background:#ecfdf5; border:1px solid #a7f3d0;">
            <div style="font-size:10px; font-weight:700; color:#047857; text-transform:uppercase;">Advance Collected</div>
            <div style="font-size:16px; font-weight:900; color:#059669; margin-top:2px;">৳ ${advSum.toLocaleString('en-IN')}</div>
          </div>
          <div style="flex:1; padding:10px 14px; border-radius:10px; background:#fff1f2; border:1px solid #fecdd3;">
            <div style="font-size:10px; font-weight:700; color:#be123c; text-transform:uppercase;">Pending Due Balance</div>
            <div style="font-size:16px; font-weight:900; color:#e11d48; margin-top:2px;">৳ ${dueSum.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <thead>
            <tr style="background:#0f172a; color:#ffffff; text-align:left;">
              <th style="padding:9px 10px;">Booking ID</th>
              <th style="padding:9px 10px;">Customer</th>
              <th style="padding:9px 10px;">Service / Category</th>
              <th style="padding:9px 10px;">Dates</th>
              <th style="padding:9px 10px; text-align:right;">Total</th>
              <th style="padding:9px 10px; text-align:right;">Advance</th>
              <th style="padding:9px 10px; text-align:right;">Due</th>
              <th style="padding:9px 10px;">Method</th>
              <th style="padding:9px 10px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="9" style="padding:18px; text-align:center; color:#64748b;">No orders found for the selected filter.</td></tr>'}
          </tbody>
        </table>
      `;
      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`customer-orders-${new Date().toISOString().split('T')[0]}.pdf`);
      onShowToast?.(language === 'en' ? 'PDF Report downloaded!' : 'PDF রিপোর্ট ডাউনলোড হয়েছে!');
    } catch (err) {
      console.error('PDF export error:', err);
      onShowToast?.(language === 'en' ? 'Failed to export PDF.' : 'PDF এক্সপোর্ট করতে সমস্যা হয়েছে।');
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      setIsExportingPDF(false);
    }
  };

  // Calendar grid helper
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayBookings = bookings.filter((b) => {
        if ((b.status || '').toLowerCase() === 'cancelled') return false;
        const start = b.checkInDate || b.travelDate || '';
        const end = b.checkOutDate || start;
        return start && iso >= start && iso <= (end || start);
      });
      cells.push({ day: d, iso, bookings: dayBookings });
    }
    return cells;
  }, [calendarDate, bookings]);

  const cardBg = isLight
    ? 'bg-white border-slate-200 shadow-xs'
    : 'bg-slate-900/80 border-slate-800';
  const inputCls = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#69EBDA]'
    : 'bg-slate-950/70 border-slate-700 text-white focus:border-[#69EBDA]';

  const maxMonthlyVal = Math.max(
    1,
    ...analytics.monthly.flatMap((m) => [m.revenue, m.expenses])
  );

  // Donut segments
  const distEntries = Object.entries(analytics.distribution);
  const totalDistCount = distEntries.reduce((s, [, v]) => s + v.count, 0) || 1;
  let runningPct = 0;

  const visibleTabs = isOrderMode
    ? [
        { id: 'bookings', label: language === 'en' ? 'Customer Orders' : 'কাস্টমার অর্ডার', icon: ShoppingBag },
        { id: 'calendar', label: language === 'en' ? 'Master Calendar' : 'মাস্টার ক্যালেন্ডার', icon: CalendarIcon },
        { id: 'accounts', label: language === 'en' ? 'Payments & Invoices' : 'পেমেন্ট ও ইনভয়েস', icon: Wallet },
        { id: 'crm', label: language === 'en' ? 'Customers & Leads' : 'কাস্টমার ও ইনকোয়ারি', icon: Users }
      ]
    : [
        { id: 'overview', label: language === 'en' ? 'Overview & Analytics' : 'ওভারভিউ ও অ্যানালিটিক্স', icon: BarChart3 },
        { id: 'expenses', label: language === 'en' ? 'Expense Ledger' : 'দৈনিক খরচের হিসাব', icon: Receipt }
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sub-navigation Tabs with Framer Motion layoutId */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border ${cardBg}`}>
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const active = execTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setExecTab(tab.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-colors ${
                  active ? 'text-slate-950' : 'text-slate-500 dark:text-slate-300 hover:text-[#69EBDA]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={`adminExecTabPill-${mode}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 shadow-md shadow-[#69EBDA]/25"
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {isOrderMode && (
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#69EBDA]/15 hover:bg-[#69EBDA]/25 text-[#69EBDA] border border-[#69EBDA]/35 text-xs font-extrabold cursor-pointer transition-all disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPDF ? (language === 'en' ? 'Generating PDF...' : 'PDF তৈরি হচ্ছে...') : 'Export PDF'}</span>
          </button>
        )}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: OVERVIEW & ANALYTICS                                         */}
      {/* =================================================================== */}
      {execTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className={`p-5 rounded-3xl border ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Confirmed Revenue</span>
                <TrendingUp className="w-5 h-5 text-[#69EBDA]" />
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {formatBDT(analytics.totalConfirmedRevenue)}
              </p>
              <p className="mt-1 text-[11px] font-bold text-emerald-400">
                আসন্ন ও কনফার্মড বুকিং থেকে মোট আয়
              </p>
            </div>

            <div className={`p-5 rounded-3xl border ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Advance vs Due</span>
                <Wallet className="w-5 h-5 text-amber-400" />
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {formatBDT(analytics.totalAdvanceCollected)}
              </p>
              <p className="mt-1 text-[11px] font-bold text-amber-400">
                বকেয়া (Due): {formatBDT(analytics.totalDueBalance)}
              </p>
            </div>

            <div className={`p-5 rounded-3xl border ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Net Profit</span>
                <Receipt className="w-5 h-5 text-emerald-400" />
              </div>
              <p className={`mt-2.5 text-2xl sm:text-3xl font-black ${analytics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatBDT(analytics.netProfit)}
              </p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">
                মোট খরচ: {formatBDT(analytics.totalExpenses)}
              </p>
            </div>

            <div className={`p-5 rounded-3xl border ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Active &amp; Upcoming</span>
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {analytics.upcomingTripsCount}
              </p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">
                {crmData.customers.length} কাস্টমার • {hotels.length + transports.length + restaurants.length + packages.length} সার্ভিস
              </p>
            </div>
          </div>

          {/* Interactive Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Revenue vs Expenses Bar Chart */}
            <div className={`lg:col-span-2 p-5 sm:p-6 rounded-3xl border ${cardBg}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    মাসিক আয় বনাম খরচ (Revenue vs Expenses)
                  </h3>
                  <p className="text-xs text-slate-400">গত ৬ মাসের আর্থিক প্রবৃদ্ধি</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-[#69EBDA]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#69EBDA]" /> আয়
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> খরচ
                  </span>
                </div>
              </div>

              <div className="h-52 flex items-end justify-between gap-3 pt-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                {analytics.monthly.map((m) => {
                  const revH = Math.max(6, Math.round((m.revenue / maxMonthlyVal) * 100));
                  const expH = Math.max(4, Math.round((m.expenses / maxMonthlyVal) * 100));
                  return (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1.5 h-40">
                        <div
                          title={`Revenue: ${formatBDT(m.revenue)}`}
                          className="w-4 sm:w-6 rounded-t-lg bg-gradient-to-t from-teal-500 to-[#69EBDA] transition-all duration-500"
                          style={{ height: `${revH}%` }}
                        />
                        <div
                          title={`Expenses: ${formatBDT(m.expenses)}`}
                          className="w-4 sm:w-6 rounded-t-lg bg-gradient-to-t from-rose-500/80 to-rose-400 transition-all duration-500"
                          style={{ height: `${expH}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service-Wise Booking Distribution Donut Chart */}
            <div className={`p-5 sm:p-6 rounded-3xl border ${cardBg} flex flex-col justify-between`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#69EBDA]" />
                  <span>সার্ভিস বণ্টন</span>
                </h3>
                <span className="text-xs font-bold text-slate-400">{analytics.totalActiveCount} বুকিং</span>
              </div>

              <div className="flex items-center justify-center my-2">
                <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="4" />
                  {distEntries.map(([name, info]) => {
                    const pct = (info.count / totalDistCount) * 100;
                    const offset = 100 - runningPct;
                    runningPct += pct;
                    if (info.count === 0) return null;
                    return (
                      <circle
                        key={name}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke={info.color}
                        strokeWidth="4.2"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset={offset}
                      />
                    );
                  })}
                </svg>
              </div>

              <div className="space-y-2 mt-3">
                {distEntries.map(([name, info]) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }} />
                      {name}
                    </span>
                    <span className="font-extrabold text-slate-400">
                      {info.count} ({formatBDT(info.revenue)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2A: CUSTOMER ORDERS TABLE (ORDER MODE)                          */}
      {/* =================================================================== */}
      {isOrderMode && execTab === 'bookings' && (
        <div className="space-y-6">
          {/* Filterable Bookings Table */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${cardBg}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                      statusFilter === st
                        ? 'bg-[#69EBDA] text-slate-950'
                        : isLight
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputCls}`}
                >
                  <option value="All">All Services</option>
                  <option value="Hotels">Hotels</option>
                  <option value="Transport">Transport</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Tour Packages">Tour Packages</option>
                </select>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="নাম, ফোন বা আইডি..."
                    className={`pl-9 pr-3 py-2 rounded-xl border text-xs font-semibold outline-none w-48 ${inputCls}`}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[880px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                    <th className="py-3 px-2.5">ID &amp; Client</th>
                    <th className="py-3 px-2.5">Service</th>
                    <th className="py-3 px-2.5">Dates</th>
                    <th className="py-3 px-2.5">Total / Due</th>
                    <th className="py-3 px-2.5">Status (1-Click Sync)</th>
                    <th className="py-3 px-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs">
                  {filteredBookings.map((bk) => {
                    const tot = parseNum(bk.totalPrice);
                    const adv = parseNum(bk.advancePaid);
                    const due = Math.max(0, bk.dueAmount != null ? Number(bk.dueAmount) : tot - adv);
                    const phoneClean = (bk.customerPhone || bk.phone || '').replace(/[^0-9+]/g, '');
                    const waText = encodeURIComponent(
                      `আসসালামু আলাইকুম ${bk.customerName || bk.fullName || ''}, আপনার বুকিং #${bk.id} (${bk.itemTitle || bk.hotelName || bk.packageTitle || ''}) তারিখ: ${bk.checkInDate || bk.travelDate || 'N/A'}। মোট বিল: ৳${tot}, বকেয়া: ৳${due}।`
                    );

                    return (
                      <tr key={bk.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-2.5 align-top">
                          <span className="text-[10px] font-black text-[#69EBDA]">#{bk.id}</span>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {bk.customerName || bk.fullName || 'Guest'}
                          </p>
                          <p className="text-[11px] text-slate-400">{bk.customerPhone || bk.phone}</p>
                        </td>
                        <td className="py-3 px-2.5 align-top max-w-[200px]">
                          <p className="font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                            {bk.itemTitle || bk.hotelName || bk.packageTitle || 'Travel Booking'}
                          </p>
                          <span className="text-[10px] text-[#69EBDA] font-bold">{categorizeBooking(bk)}</span>
                        </td>
                        <td className="py-3 px-2.5 align-top">
                          <p className="font-semibold text-slate-700 dark:text-slate-200">
                            {bk.checkInDate || bk.travelDate || 'N/A'}
                          </p>
                          {bk.checkOutDate && (
                            <p className="text-[11px] text-slate-400">→ {bk.checkOutDate}</p>
                          )}
                        </td>
                        <td className="py-3 px-2.5 align-top">
                          <p className="font-black text-slate-900 dark:text-[#69EBDA]">{formatBDT(tot)}</p>
                          <p className="text-[10px] text-amber-400 font-bold">Due: {formatBDT(due)}</p>
                        </td>
                        <td className="py-3 px-2.5 align-top">
                          <select
                            disabled={updatingId === bk.id}
                            value={bk.status || 'Confirmed'}
                            onChange={(e) => handleStatusChange(bk.id, e.target.value)}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-extrabold outline-none cursor-pointer ${inputCls}`}
                          >
                            {['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-2.5 align-top text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {phoneClean && (
                              <>
                                <a
                                  href={`https://wa.me/${phoneClean.replace(/^\+/, '')}?text=${waText}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30"
                                  title="WhatsApp Confirmation"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={`tel:${phoneClean}`}
                                  className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/30"
                                  title="Call Client"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setViewOrderBooking(bk)}
                              className="px-2.5 py-1.5 rounded-lg bg-sky-500/15 text-sky-400 hover:bg-sky-500/30 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Order View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setInvoiceBooking(bk)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#69EBDA]/15 text-[#69EBDA] hover:bg-[#69EBDA]/30 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Invoice</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => StorageService.deleteBooking(bk)}
                              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2B: MASTER RESERVATION CALENDAR (ORDER MODE)                    */}
      {/* =================================================================== */}
      {isOrderMode && execTab === 'calendar' && (
        <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#69EBDA]" />
                <span>Master Reservation Calendar</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                  }
                  className="p-1.5 rounded-xl border border-slate-700/60 hover:border-[#69EBDA] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-extrabold px-2">
                  {calendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                  }
                  className="p-1.5 rounded-xl border border-slate-700/60 hover:border-[#69EBDA] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-extrabold text-slate-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((cell, idx) =>
                !cell ? (
                  <div key={`empty-${idx}`} className="h-16 rounded-xl" />
                ) : (
                  <div
                    key={cell.iso}
                    className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between text-left ${
                      cell.bookings.length > 0
                        ? 'bg-[#69EBDA]/15 border-[#69EBDA]/50'
                        : isLight
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <span className="text-[11px] font-black text-slate-800 dark:text-white">
                      {cell.day}
                    </span>
                    {cell.bookings.length > 0 && (
                      <span className="text-[10px] font-extrabold text-[#69EBDA] truncate">
                        {cell.bookings.length} booked
                      </span>
                    )}
                  </div>
                )
              )}
            </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: PAYMENTS & INVOICES (ORDER MODE)                             */}
      {/* =================================================================== */}
      {isOrderMode && execTab === 'accounts' && (
        <div className="space-y-6">
          {/* Payment & Due Tracker per Booking */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${cardBg}`}>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#69EBDA]" />
              <span>বুকিং পেমেন্ট ও বকেয়া (Advance &amp; Due Tracker)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                    <th className="py-2.5 px-2.5">Booking</th>
                    <th className="py-2.5 px-2.5">Total</th>
                    <th className="py-2.5 px-2.5">Advance Paid</th>
                    <th className="py-2.5 px-2.5">Due Balance</th>
                    <th className="py-2.5 px-2.5">Method</th>
                    <th className="py-2.5 px-2.5 text-right">Update / Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800 text-xs">
                  {bookings.map((bk) => {
                    const tot = parseNum(bk.totalPrice);
                    const adv = parseNum(bk.advancePaid);
                    const due = Math.max(0, bk.dueAmount != null ? Number(bk.dueAmount) : tot - adv);
                    const isEditing = editingPaymentId === bk.id;

                    return (
                      <tr key={bk.id}>
                        <td className="py-3 px-2.5">
                          <span className="text-[10px] font-black text-[#69EBDA]">#{bk.id}</span>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {bk.customerName || bk.fullName}
                          </p>
                        </td>
                        <td className="py-3 px-2.5 font-extrabold">{formatBDT(tot)}</td>
                        <td className="py-3 px-2.5">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={paymentDraft.advancePaid}
                              onChange={(e) =>
                                setPaymentDraft((p) => ({ ...p, advancePaid: e.target.value }))
                              }
                              className={`w-28 px-2.5 py-1 rounded-lg border text-xs font-bold ${inputCls}`}
                            />
                          ) : (
                            <span className="font-bold text-emerald-400">{formatBDT(adv)}</span>
                          )}
                        </td>
                        <td className="py-3 px-2.5 font-bold text-amber-400">{formatBDT(due)}</td>
                        <td className="py-3 px-2.5">
                          {isEditing ? (
                            <select
                              value={paymentDraft.paymentMethod}
                              onChange={(e) =>
                                setPaymentDraft((p) => ({ ...p, paymentMethod: e.target.value }))
                              }
                              className={`px-2 py-1 rounded-lg border text-xs font-bold ${inputCls}`}
                            >
                              {PAYMENT_METHODS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[11px] font-bold">
                              {bk.paymentMethod || 'Cash'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2.5 text-right space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSavePayment(bk.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#69EBDA] text-slate-950 font-black text-[11px] cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPaymentId(null)}
                                className="px-2 py-1 rounded-lg bg-slate-700 text-white font-bold text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPaymentId(bk.id);
                                  setPaymentDraft({
                                    advancePaid: adv,
                                    paymentMethod: bk.paymentMethod || 'bKash'
                                  });
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-bold text-[11px] cursor-pointer"
                              >
                                Edit Payment
                              </button>
                              <button
                                type="button"
                                onClick={() => setViewOrderBooking(bk)}
                                className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Order View</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setInvoiceBooking(bk)}
                                className="px-2.5 py-1 rounded-lg bg-[#69EBDA]/15 text-[#69EBDA] font-bold text-[11px] cursor-pointer"
                              >
                                Generate Invoice
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB: OPERATIONAL EXPENSE LEDGER (DASHBOARD MODE)                    */}
      {/* =================================================================== */}
      {!isOrderMode && execTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleSaveExpense} className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${cardBg}`}>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#69EBDA]" />
                <span>{editingExpenseId ? 'খরচ এডিট করুন' : 'দৈনিক খরচ যোগ করুন'}</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, category: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputCls}`}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Amount (৳)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="2500"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputCls}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm((p) => ({ ...p, expenseDate: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none ${inputCls}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">Note</label>
                <input
                  type="text"
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="যেমন: কক্সবাজার বাস ফুয়েল"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${inputCls}`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                {editingExpenseId ? 'Update Expense' : 'Save Expense'}
              </button>
            </form>

            <div className={`lg:col-span-2 p-5 sm:p-6 rounded-3xl border space-y-4 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  খরচের খাতা (Expense Ledger)
                </h3>
                <span className="text-xs font-black text-rose-400">
                  মোট খরচ: {formatBDT(analytics.totalExpenses)}
                </span>
              </div>

              {expenses.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">এখনো কোনো খরচ যোগ করা হয়নি।</p>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 text-[10px] font-black">
                            {exp.category}
                          </span>
                          <span className="text-[11px] text-slate-400">{exp.expenseDate}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">
                          {exp.note || exp.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-rose-400">{formatBDT(exp.amount)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExpenseId(exp.id);
                            setExpenseForm({
                              category: exp.category,
                              amount: String(exp.amount),
                              expenseDate: exp.expenseDate,
                              note: exp.note || ''
                            });
                          }}
                          className="p-1.5 rounded-lg bg-[#69EBDA]/15 text-[#69EBDA] cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => StorageService.deleteExpense(exp.id)}
                          className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: CUSTOMERS & LEADS (CRM - ORDER MODE)                         */}
      {/* =================================================================== */}
      {isOrderMode && execTab === 'crm' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unified Customer Directory */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#69EBDA]" />
                <span>Unified Customer Directory</span>
              </h3>
              <span className="text-xs font-bold text-[#69EBDA]">{crmData.customers.length} জন</span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {crmData.customers.map((c) => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {c.name}
                      </p>
                      {c.bookingsCount >= 2 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-black">
                          <Crown className="w-2.5 h-2.5" /> VIP Repeat
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {c.phone || c.email || 'No contact'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-[#69EBDA]">{formatBDT(c.totalSpend)}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{c.bookingsCount} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inquiries & Leads Follow-up */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Inquiries &amp; Leads Follow-Up
              </h3>
              <span className="text-xs font-bold text-amber-400">{crmData.inquiries.length} টি</span>
            </div>

            {crmData.inquiries.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">কোনো পেন্ডিং ইনকোয়ারি নেই।</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {crmData.inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {inq.customerName || inq.fullName} • {inq.customerPhone || inq.phone}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {inq.inquiryTopic || inq.packageTitle || inq.specialNotes}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => StorageService.convertInquiryToBooking(inq.id)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#69EBDA] text-slate-950 font-black text-[11px] cursor-pointer"
                    >
                      <ArrowRightCircle className="w-3.5 h-3.5" />
                      <span>Convert to Booking</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DIGITAL INVOICE & MONEY RECEIPT MODAL (PRINT / PDF READY)           */}
      {/* =================================================================== */}
      <AnimatePresence>
        {invoiceBooking && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative print:shadow-none print:rounded-none"
            >
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  {branding?.logoUrl && (
                    <img src={branding.logoUrl} alt="Agency Logo" className="h-10 w-auto object-contain" />
                  )}
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {branding?.brandName || 'Aetheria Travels'}
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold">Official Digital Invoice &amp; Money Receipt</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInvoiceBooking(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer print:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Billed To</p>
                  <p className="font-black text-sm text-slate-900 mt-0.5">
                    {invoiceBooking.customerName || invoiceBooking.fullName || 'Customer'}
                  </p>
                  <p className="text-slate-600">{invoiceBooking.customerPhone || invoiceBooking.phone}</p>
                  {invoiceBooking.email && <p className="text-slate-500">{invoiceBooking.email}</p>}
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Invoice Info</p>
                  <p className="font-black text-slate-900 mt-0.5">#{invoiceBooking.id}</p>
                  <p className="text-slate-600">
                    Date: {invoiceBooking.checkInDate || invoiceBooking.travelDate || new Date().toLocaleDateString()}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-black text-[10px] uppercase">
                    {invoiceBooking.paymentStatus || 'Pending'} ({invoiceBooking.paymentMethod || 'Cash'})
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <div className="bg-slate-100 px-4 py-2.5 font-extrabold text-slate-600 flex justify-between">
                  <span>Service Description</span>
                  <span>Amount</span>
                </div>
                <div className="px-4 py-3.5 flex justify-between items-start gap-4">
                  <div>
                    <p className="font-black text-slate-900">
                      {invoiceBooking.itemTitle || invoiceBooking.hotelName || invoiceBooking.packageTitle || 'Travel Service'}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      {invoiceBooking.days ? `${invoiceBooking.days} Days • ` : ''}
                      {invoiceBooking.adults != null
                        ? `${invoiceBooking.adults} Adults${invoiceBooking.children ? `, ${invoiceBooking.children} Children` : ''}`
                        : `${invoiceBooking.guests || invoiceBooking.travelers || 1} Guests`}
                    </p>
                  </div>
                  <span className="font-black text-slate-900">
                    {formatBDT(parseNum(invoiceBooking.totalPrice))}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs border-t border-slate-200 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Total Amount</span>
                  <span className="font-bold">{formatBDT(parseNum(invoiceBooking.totalPrice))}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Advance Paid</span>
                  <span className="font-bold">{formatBDT(parseNum(invoiceBooking.advancePaid))}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>Due Balance</span>
                  <span>
                    {formatBDT(
                      Math.max(
                        0,
                        invoiceBooking.dueAmount != null
                          ? Number(invoiceBooking.dueAmount)
                          : parseNum(invoiceBooking.totalPrice) - parseNum(invoiceBooking.advancePaid)
                      )
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs cursor-pointer hover:bg-slate-800"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* ORDER VIEW DETAILS MODAL                                            */}
      {/* =================================================================== */}
      <AnimatePresence>
        {viewOrderBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className={`w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between gap-3 ${
                isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#69EBDA]/20 text-[#69EBDA]">
                      {categorizeBooking(viewOrderBooking)}
                    </span>
                    <span className="text-xs font-extrabold text-slate-400">#{viewOrderBooking.id}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black mt-1">
                    {language === 'en' ? 'Customer Order Details' : 'কাস্টমার অর্ডারের সম্পূর্ণ তথ্য'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewOrderBooking(null)}
                  className="p-2 rounded-xl bg-slate-500/15 hover:bg-slate-500/25 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
                {/* Customer Info */}
                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/70'
                }`}>
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#69EBDA]">
                    {language === 'en' ? 'Customer Information' : 'কাস্টমারের তথ্য'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Full Name</span>
                      <span className="font-bold">{viewOrderBooking.customerName || viewOrderBooking.fullName || 'Guest Client'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Contact / Phone</span>
                      <span className="font-bold">{viewOrderBooking.customerPhone || viewOrderBooking.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Email / Gmail</span>
                      <span className="font-bold break-all">{viewOrderBooking.customerEmail || viewOrderBooking.email || viewOrderBooking.userEmail || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Order Status & Type</span>
                      <span className="font-bold">
                        {viewOrderBooking.status || 'Confirmed'} ({viewOrderBooking.type === 'inquiry' ? 'Inquiry' : 'Booking'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service & Schedule Details */}
                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/70'
                }`}>
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#69EBDA]">
                    {language === 'en' ? 'Booking & Service Details' : 'বুকিং ও সার্ভিসের বিবরণ'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block">Booked Item / Service</span>
                      <span className="font-extrabold text-sm">
                        {viewOrderBooking.itemTitle || viewOrderBooking.hotelName || viewOrderBooking.packageTitle || 'Travel Service'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Check-In / Travel Date</span>
                      <span className="font-bold">{viewOrderBooking.checkInDate || viewOrderBooking.travelDate || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Check-Out Date</span>
                      <span className="font-bold">{viewOrderBooking.checkOutDate || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Guests (Adults / Children)</span>
                      <span className="font-bold">
                        {viewOrderBooking.adults != null || viewOrderBooking.children != null
                          ? `${viewOrderBooking.adults ?? 0} Adults, ${viewOrderBooking.children ?? 0} Children`
                          : `${viewOrderBooking.guests || 1} Guests`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Rooms / Seats / Meal Plan</span>
                      <span className="font-bold">
                        {[
                          viewOrderBooking.rooms ? `${viewOrderBooking.rooms} Room(s)` : null,
                          viewOrderBooking.seats ? `${viewOrderBooking.seats} Seat(s)` : null,
                          viewOrderBooking.mealPlan || null,
                          viewOrderBooking.roomType || null
                        ]
                          .filter(Boolean)
                          .join(' • ') || 'Standard'}
                      </span>
                    </div>
                    {(viewOrderBooking.pickup || viewOrderBooking.dropoff || viewOrderBooking.destination) && (
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-slate-400 block">Route / Destination</span>
                        <span className="font-bold">
                          {[viewOrderBooking.pickup, viewOrderBooking.dropoff, viewOrderBooking.destination]
                            .filter(Boolean)
                            .join(' → ')}
                        </span>
                      </div>
                    )}
                    {(viewOrderBooking.notes || viewOrderBooking.specialRequests || viewOrderBooking.message || viewOrderBooking.remarks) && (
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-slate-400 block">Customer Notes / Special Requests</span>
                        <p className="font-medium mt-0.5 whitespace-pre-wrap">
                          {viewOrderBooking.notes || viewOrderBooking.specialRequests || viewOrderBooking.message || viewOrderBooking.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700/70'
                }`}>
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#69EBDA]">
                    {language === 'en' ? 'Payment & Billing Summary' : 'পেমেন্ট ও হিসাব'}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total Price</span>
                      <span className="font-black">{formatBDT(parseNum(viewOrderBooking.totalPrice))}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Advance Paid</span>
                      <span className="font-black text-emerald-400">{formatBDT(parseNum(viewOrderBooking.advancePaid))}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Due Balance</span>
                      <span className="font-black text-rose-400">
                        {formatBDT(
                          Math.max(
                            0,
                            viewOrderBooking.dueAmount != null
                              ? Number(viewOrderBooking.dueAmount)
                              : parseNum(viewOrderBooking.totalPrice) - parseNum(viewOrderBooking.advancePaid)
                          )
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Payment Method</span>
                      <span className="font-bold">{viewOrderBooking.paymentMethod || 'Cash'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className={`px-6 py-3.5 border-t flex flex-wrap items-center justify-end gap-2 ${
                isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'
              }`}>
                {(viewOrderBooking.customerEmail || viewOrderBooking.email) && (
                  <a
                    href={`mailto:${viewOrderBooking.customerEmail || viewOrderBooking.email}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-500/15 hover:bg-slate-500/25 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#69EBDA]" />
                    <span>Email</span>
                  </a>
                )}
                {(viewOrderBooking.customerPhone || viewOrderBooking.phone) && (
                  <a
                    href={`tel:${(viewOrderBooking.customerPhone || viewOrderBooking.phone).replace(/[^0-9+]/g, '')}`}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const target = viewOrderBooking;
                    setViewOrderBooking(null);
                    setInvoiceBooking(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
