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
  Mail,
  History,
  ShieldAlert,
  RotateCcw,
  UserCheck,
  Globe,
  Activity,
  Server,
  Database,
  Wifi,
  RefreshCw,
  Cpu,
  HardDrive
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { VisitorService } from '../../services/visitorService';
import { SystemHealthService } from '../../services/systemHealthService';

const EXPENSE_CATEGORIES = [
  'Fuel & Driver',
  'Hotel Vendor',
  'Restaurant Food',
  'Office & Marketing',
  'Other'
];

const PAYMENT_METHODS = ['bKash', 'Nagad', 'Bank Transfer', 'Cash'];

export const AdminExecutiveDashboard = ({ mode = 'dashboard', language = 'bn', isLight = false, isRoot = false, currentAdmin = null, onShowToast }) => {
  const isOrderMode = mode === 'customer-order';
  const [execTab, setExecTab] = useState(isOrderMode ? 'bookings' : 'overview');
  const [bookings, setBookings] = useState(() => StorageService.getBookings() || []);
  const [auditLogs, setAuditLogs] = useState(() => StorageService.getBookingAuditLogs() || []);
  const [activeAuditModal, setActiveAuditModal] = useState(null);
  const [expenses, setExpenses] = useState(() => StorageService.getExpenses() || []);
  const [hotels, setHotels] = useState(() => StorageService.getHotels() || []);
  const [transports, setTransports] = useState(() => StorageService.getTransports() || []);
  const [restaurants, setRestaurants] = useState(() => StorageService.getRestaurants() || []);
  const [packages, setPackages] = useState(() => StorageService.getPackages() || []);
  const [users, setUsers] = useState(() => StorageService.getRegisteredUsers?.() || []);
  const [branding, setBranding] = useState(() => StorageService.getBranding());
  const [liveVisitors, setLiveVisitors] = useState({
    totalLive: 0,
    usersCount: 0,
    guestsCount: 0,
    visitors: []
  });
  const [systemHealth, setSystemHealth] = useState(null);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);

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

  // Live Website Visitors Subscription (Users vs Non-Users / Guests)
  useEffect(() => {
    const unsubscribe = VisitorService.subscribeLiveVisitors((summary) => {
      setLiveVisitors(summary);
    });
    return () => unsubscribe();
  }, []);

  const refreshSystemHealth = async () => {
    setIsRefreshingHealth(true);
    try {
      const snap = await SystemHealthService.collectSnapshot();
      setSystemHealth(snap);
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  // Realtime System Ping & Database Memory Telemetry (10s interval)
  useEffect(() => {
    refreshSystemHealth();
    const timer = setInterval(() => {
      refreshSystemHealth();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncBookings = () => setBookings(StorageService.getBookings() || []);
    const syncExpenses = () => setExpenses(StorageService.getExpenses() || []);
    const syncHotels = () => setHotels(StorageService.getHotels() || []);
    const syncTransports = () => setTransports(StorageService.getTransports() || []);
    const syncRestaurants = () => setRestaurants(StorageService.getRestaurants() || []);
    const syncPackages = () => setPackages(StorageService.getPackages() || []);
    const syncUsers = () => setUsers(StorageService.getRegisteredUsers?.() || []);
    const syncBranding = () => setBranding(StorageService.getBranding());
    const syncAuditLogs = () => setAuditLogs(StorageService.getBookingAuditLogs() || []);

    window.addEventListener('app:bookings-updated', syncBookings);
    window.addEventListener('app:expenses-updated', syncExpenses);
    window.addEventListener('app:hotels-updated', syncHotels);
    window.addEventListener('app:transports-updated', syncTransports);
    window.addEventListener('app:restaurants-updated', syncRestaurants);
    window.addEventListener('app:packages-updated', syncPackages);
    window.addEventListener('app:users-updated', syncUsers);
    window.addEventListener('app:branding-updated', syncBranding);
    window.addEventListener('app:booking-audit-logs-updated', syncAuditLogs);

    return () => {
      window.removeEventListener('app:bookings-updated', syncBookings);
      window.removeEventListener('app:expenses-updated', syncExpenses);
      window.removeEventListener('app:hotels-updated', syncHotels);
      window.removeEventListener('app:transports-updated', syncTransports);
      window.removeEventListener('app:restaurants-updated', syncRestaurants);
      window.removeEventListener('app:packages-updated', syncPackages);
      window.removeEventListener('app:users-updated', syncUsers);
      window.removeEventListener('app:branding-updated', syncBranding);
      window.removeEventListener('app:booking-audit-logs-updated', syncAuditLogs);
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
    const totalAdvanceCollected = confirmedBookings.reduce((sum, b) => sum + parseNum(b.advancePaid), 0);
    const totalDueBalance = confirmedBookings.reduce((sum, b) => {
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

    confirmedBookings.forEach((b) => {
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
        whatsapp: u.whatsapp || u.phone || '',
        bookingsCount: 0,
        totalSpend: 0,
        lastBookingDate: '',
        recentServices: []
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
        whatsapp: b.customerWhatsapp || b.whatsapp || b.customerPhone || b.phone || '',
        bookingsCount: 0,
        totalSpend: 0,
        lastBookingDate: '',
        recentServices: []
      };
      existing.bookingsCount += 1;
      if (['confirmed', 'ongoing', 'completed'].includes((b.status || '').toLowerCase())) {
        existing.totalSpend += parseNum(b.totalPrice);
      }
      if (!existing.phone && (b.customerPhone || b.phone)) existing.phone = b.customerPhone || b.phone;
      if (!existing.whatsapp && (b.customerWhatsapp || b.whatsapp || b.customerPhone || b.phone)) {
        existing.whatsapp = b.customerWhatsapp || b.whatsapp || b.customerPhone || b.phone;
      }
      if (!existing.email && (b.customerEmail || b.email)) existing.email = b.customerEmail || b.email;
      const bDate = b.checkInDate || b.travelDate || b.timestamp || '';
      if (bDate && (!existing.lastBookingDate || bDate > existing.lastBookingDate)) {
        existing.lastBookingDate = bDate;
      }
      const svcTitle = b.itemTitle || b.hotelName || b.packageTitle || '';
      if (svcTitle && !existing.recentServices.includes(svcTitle)) {
        existing.recentServices.push(svcTitle);
      }
      customerMap.set(key, existing);
    });

    const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpend - a.totalSpend);
    const repeatCustomers = customers
      .filter((c) => c.bookingsCount >= 2)
      .sort((a, b) => b.bookingsCount - a.bookingsCount || b.totalSpend - a.totalSpend);
    const inquiries = safeBookings.filter((b) => (b.type || '').toLowerCase() === 'inquiry');
    return { customers, repeatCustomers, inquiries };
  }, [bookings, users]);

  // Realtime Booking Audit Metrics (Customer Cancels, Order Confirm/Pending/Re-Pending/Cancel/Delete, Admin Actions)
  const auditStats = useMemo(() => {
    const safeLogs = Array.isArray(auditLogs) ? auditLogs : [];
    const customerCancelledLogs = safeLogs.filter((l) => l.actionType === 'customer_cancelled');
    const adminLogs = safeLogs.filter((l) => l.actorRole === 'root_admin' || l.actorRole === 'normal_admin');

    const confirmedCount = adminLogs.filter((l) => l.actionType === 'confirmed').length;
    const pendingCount = adminLogs.filter((l) => l.actionType === 'pending').length;
    const rePendingCount = adminLogs.filter((l) => l.actionType === 're_pending').length;
    const adminCancelledCount = adminLogs.filter((l) => l.actionType === 'cancelled').length;
    const deletedCount = adminLogs.filter((l) => l.actionType === 'deleted').length;

    const orderMap = new Map();
    adminLogs.forEach((l) => {
      const key = l.bookingId || l.id;
      const existing = orderMap.get(key) || {
        bookingId: l.bookingId || key,
        customerName: l.customerName || 'Guest Customer',
        customerEmail: l.customerEmail || '',
        customerPhone: l.customerPhone || '',
        customerWhatsapp: l.customerWhatsapp || l.customerPhone || '',
        itemTitle: l.itemTitle || 'Travel Booking',
        totalPrice: Number(l.totalPrice || 0),
        confirmedTimes: 0,
        pendingTimes: 0,
        rePendingTimes: 0,
        cancelledTimes: 0,
        deletedTimes: 0,
        logs: []
      };
      if (l.actionType === 'confirmed') existing.confirmedTimes += 1;
      else if (l.actionType === 'pending') existing.pendingTimes += 1;
      else if (l.actionType === 're_pending') existing.rePendingTimes += 1;
      else if (l.actionType === 'cancelled') existing.cancelledTimes += 1;
      else if (l.actionType === 'deleted') existing.deletedTimes += 1;
      existing.logs.push(l);
      orderMap.set(key, existing);
    });

    return {
      customerCancelledLogs,
      adminLogs,
      confirmedCount,
      pendingCount,
      rePendingCount,
      adminCancelledCount,
      deletedCount,
      orderGroups: Array.from(orderMap.values())
    };
  }, [auditLogs]);

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
      const targetBk = bookings.find((b) => b.id === bookingId);
      const prevStatus = targetBk?.status || 'Pending';
      await StorageService.updateBookingStatus(bookingId, newStatus);

      let actionType = 'confirmed';
      if (newStatus === 'Confirmed') actionType = 'confirmed';
      else if (newStatus === 'Pending') {
        actionType = ['confirmed', 'ongoing', 'completed'].includes(prevStatus.toLowerCase())
          ? 're_pending'
          : 'pending';
      } else if (newStatus === 'Cancelled') actionType = 'cancelled';
      else actionType = newStatus.toLowerCase();

      await StorageService.logBookingAudit({
        bookingId,
        actionType,
        previousStatus: prevStatus,
        newStatus,
        actorRole: isRoot ? 'root_admin' : 'normal_admin',
        actorName: currentAdmin?.name || (isRoot ? 'Root Admin' : 'Normal Admin'),
        actorEmail: currentAdmin?.email || '',
        actorPhone: currentAdmin?.phone || '',
        customerName: targetBk?.customerName || targetBk?.fullName || 'Guest Customer',
        customerEmail: targetBk?.customerEmail || targetBk?.email || '',
        customerPhone: targetBk?.customerPhone || targetBk?.phone || '',
        customerWhatsapp: targetBk?.customerWhatsapp || targetBk?.whatsapp || targetBk?.customerPhone || targetBk?.phone || '',
        itemTitle: targetBk?.itemTitle || targetBk?.hotelName || targetBk?.packageTitle || 'Travel Booking',
        totalPrice: Number(targetBk?.totalPrice || 0),
        details: {
          checkInDate: targetBk?.checkInDate || targetBk?.travelDate || '',
          checkOutDate: targetBk?.checkOutDate || ''
        }
      });

      onShowToast?.(
        `Booking #${bookingId} → ${newStatus} (Realtime synced)`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteBooking = async (bk) => {
    if (!isRoot) {
      onShowToast?.('শুধুমাত্র রুট অ্যাডমিন বুকিং ডিলিট করতে পারবেন।');
      return;
    }
    if (!window.confirm(`Booking #${bk.id} ডিলিট করতে চান?`)) return;
    await StorageService.logBookingAudit({
      bookingId: bk.id,
      actionType: 'deleted',
      previousStatus: bk.status || 'Pending',
      newStatus: 'Deleted',
      actorRole: 'root_admin',
      actorName: currentAdmin?.name || 'Root Admin',
      actorEmail: currentAdmin?.email || '',
      actorPhone: currentAdmin?.phone || '',
      customerName: bk.customerName || bk.fullName || 'Guest Customer',
      customerEmail: bk.customerEmail || bk.email || '',
      customerPhone: bk.customerPhone || bk.phone || '',
      customerWhatsapp: bk.customerWhatsapp || bk.whatsapp || bk.customerPhone || bk.phone || '',
      itemTitle: bk.itemTitle || bk.hotelName || bk.packageTitle || 'Travel Booking',
      totalPrice: Number(bk.totalPrice || 0),
      details: {
        checkInDate: bk.checkInDate || bk.travelDate || '',
        checkOutDate: bk.checkOutDate || ''
      }
    });
    await StorageService.deleteBooking(bk);
    onShowToast?.(`Booking #${bk.id} ডিলিট করা হয়েছে।`);
  };

  const handleDeleteAuditLog = async (logId) => {
    if (!isRoot) return;
    await StorageService.deleteBookingAuditLog(logId);
    onShowToast?.('লগ এন্ট্রি ডিলিট করা হয়েছে।');
  };

  const handleClearAuditLogs = async () => {
    if (!isRoot) return;
    if (!window.confirm('আপনি কি নিশ্চিত যে সব অডিট লগ ক্যাশ ক্লিয়ার করতে চান?')) return;
    await StorageService.clearBookingAuditLogs();
    onShowToast?.('সব অডিট লগ ক্যাশ ক্লিয়ার করা হয়েছে।');
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

          {/* 4 Interactive Realtime Audit & Activity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Customer Cancelled Orders */}
            <button
              type="button"
              onClick={() => setActiveAuditModal('customer-cancelled')}
              className={`text-left p-5 rounded-3xl border transition-all cursor-pointer hover:border-rose-400/60 hover:-translate-y-0.5 ${cardBg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase">Customer Cancelled Orders</span>
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {auditStats.customerCancelledLogs.length}
              </p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">
                কাস্টমার নিজে ক্যানসেল করেছে • ক্লিক করে বিস্তারিত দেখুন
              </p>
            </button>

            {/* Card 2: Order Confirm / Pending / Cancel / Delete History */}
            <button
              type="button"
              onClick={() => setActiveAuditModal('order-history')}
              className={`text-left p-5 rounded-3xl border transition-all cursor-pointer hover:border-[#69EBDA]/60 hover:-translate-y-0.5 ${cardBg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#69EBDA] uppercase">Order Action History</span>
                <History className="w-5 h-5 text-[#69EBDA]" />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-black">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400">
                  Confirm: {auditStats.confirmedCount}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-400">
                  Pending: {auditStats.pendingCount}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-orange-500/15 text-orange-400">
                  Re-Pending: {auditStats.rePendingCount}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-400">
                  Cancel/Del: {auditStats.adminCancelledCount + auditStats.deletedCount}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-bold text-slate-400">
                প্রতিটি অর্ডারের কনফার্ম, পেন্ডিং, ক্যানসেল ও ডিলিট হিস্ট্রি দেখুন
              </p>
            </button>

            {/* Card 3: Admin Actions Breakdown */}
            <button
              type="button"
              onClick={() => setActiveAuditModal('admin-actions')}
              className={`text-left p-5 rounded-3xl border transition-all cursor-pointer hover:border-cyan-400/60 hover:-translate-y-0.5 ${cardBg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase">Admin Actions Report</span>
                <UserCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {auditStats.confirmedCount + auditStats.adminCancelledCount + auditStats.deletedCount}
              </p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">
                কনফার্ম: {auditStats.confirmedCount} • ক্যানসেল: {auditStats.adminCancelledCount} • ডিলিট: {auditStats.deletedCount} (ক্লিক করুন)
              </p>
            </button>

            {/* Card 4: Repeat Customers */}
            <button
              type="button"
              onClick={() => setActiveAuditModal('repeat-customers')}
              className={`text-left p-5 rounded-3xl border transition-all cursor-pointer hover:border-amber-400/60 hover:-translate-y-0.5 ${cardBg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">Repeat Customers</span>
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <p className="mt-2.5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {crmData.repeatCustomers.length}
              </p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">
                একাধিকবার বুকিং করা কাস্টমার • ক্লিক করে তালিকা দেখুন
              </p>
            </button>
          </div>

          {/* Live Website Visitors Card (Users vs Non-Users) */}
          <button
            type="button"
            onClick={() => setActiveAuditModal('live-visitors')}
            className={`w-full text-left p-5 rounded-3xl border transition-all cursor-pointer hover:border-emerald-400/60 hover:-translate-y-0.5 ${cardBg}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                      Live Website Visitors
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LIVE
                    </span>
                  </div>
                  <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {liveVisitors.totalLive} জন লাইভ ভিজিটর
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                    এই মুহূর্তে ওয়েবসাইটে সক্রিয় আছেন • ক্লিক করে বিস্তারিত তালিকা দেখুন
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 min-w-[135px]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 block">
                    Logged-in Users
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {liveVisitors.usersCount}
                  </span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 min-w-[135px]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                    Non-Users (Guests)
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {liveVisitors.guestsCount}
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Realtime System Ping, Database Memory & Performance Card */}
          <div className={`p-5 rounded-3xl border transition-all ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                      Website Ping &amp; Database Memory
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      10s REALTIME
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                    {systemHealth?.checkedAt
                      ? `Last Sync: ${new Date(systemHealth.checkedAt).toLocaleTimeString()}`
                      : 'Measuring live telemetry...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshSystemHealth}
                  disabled={isRefreshingHealth}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingHealth ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAuditModal('system-health')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Table Details</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
              {/* 1. Website Ping */}
              <div className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Website Ping
                  </span>
                  <Wifi className={`w-4 h-4 ${
                    systemHealth?.web?.status === 'optimal'
                      ? 'text-emerald-400'
                      : systemHealth?.web?.status === 'moderate'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`} />
                </div>
                <p className="mt-1.5 text-xl font-black text-slate-900 dark:text-white">
                  {systemHealth?.web?.pingMs !== null && systemHealth?.web?.pingMs !== undefined
                    ? `${systemHealth.web.pingMs} ms`
                    : 'Offline'}
                </p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5 capitalize">
                  Status: {systemHealth?.web?.status || 'checking'} • {systemHealth?.browser?.networkType || 'WIFI'}
                </p>
              </div>

              {/* 2. Database Ping & Connections */}
              <div className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Database Ping
                  </span>
                  <Activity className={`w-4 h-4 ${systemHealth?.db?.connected ? 'text-emerald-400' : 'text-rose-400'}`} />
                </div>
                <p className="mt-1.5 text-xl font-black text-slate-900 dark:text-white">
                  {systemHealth?.db?.dbPingMs !== null && systemHealth?.db?.dbPingMs !== undefined
                    ? `${systemHealth.db.dbPingMs} ms`
                    : 'Disconnected'}
                </p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                  Active Conn: {systemHealth?.db?.activeConnections ?? 0}
                  {systemHealth?.db?.cacheHitRatio !== null && systemHealth?.db?.cacheHitRatio !== undefined
                    ? ` • Cache Hit: ${systemHealth.db.cacheHitRatio}%`
                    : ''}
                </p>
              </div>

              {/* 3. Database Memory / Storage */}
              <div className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Database Memory
                  </span>
                  <HardDrive className="w-4 h-4 text-purple-400" />
                </div>
                <p className="mt-1.5 text-xl font-black text-slate-900 dark:text-white">
                  {systemHealth?.db?.dbSizePretty || 'Checking...'}
                </p>
                <div className="mt-1.5 w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.max(2, systemHealth?.db?.usagePercent || 0)}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  {systemHealth?.db?.usagePercent ?? 0}% of 500 MB • {systemHealth?.db?.totalRows ?? 0} Total Rows
                </p>
              </div>

              {/* 4. Client Runtime Memory & Cache */}
              <div className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Client Memory &amp; Cache
                  </span>
                  <Cpu className="w-4 h-4 text-amber-400" />
                </div>
                <p className="mt-1.5 text-xl font-black text-slate-900 dark:text-white">
                  {systemHealth?.browser?.heapUsedMB !== null && systemHealth?.browser?.heapUsedMB !== undefined
                    ? `${systemHealth.browser.heapUsedMB} MB`
                    : `${systemHealth?.browser?.localStorageKB ?? 0} KB`}
                </p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                  {systemHealth?.browser?.heapLimitMB
                    ? `JS Heap / ${systemHealth.browser.heapLimitMB} MB • `
                    : ''}
                  Local Cache: {systemHealth?.browser?.localStorageKB ?? 0} KB
                </p>
              </div>
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
                            {isRoot && (
                              <button
                                type="button"
                                onClick={() => handleDeleteBooking(bk)}
                                className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 cursor-pointer"
                                title="Delete (Root Admin Only)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
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
                  <img src={branding?.logoUrl || '/stb-logo.png'} alt="STB Agency Logo" className="h-10 w-auto object-contain" />
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
                          viewOrderBooking.tripType || null,
                          viewOrderBooking.rooms ? `${viewOrderBooking.rooms} Room(s)` : null,
                          viewOrderBooking.seats ? `${viewOrderBooking.seats} Seat(s)` : null,
                          viewOrderBooking.mealPlan || null,
                          viewOrderBooking.roomType || null
                        ]
                          .filter(Boolean)
                          .join(' • ') || 'Standard'}
                      </span>
                    </div>
                    {viewOrderBooking.tripType && (
                      <div>
                        <span className="text-[11px] text-slate-400 block">Trip Type</span>
                        <span className="font-bold text-[#69EBDA]">{viewOrderBooking.tripType}</span>
                      </div>
                    )}
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

        {/* AUDIT MODAL 1: CUSTOMER CANCELLED ORDERS */}
        {activeAuditModal === 'customer-cancelled' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-4xl max-h-[88vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Customer Cancelled Orders ({auditStats.customerCancelledLogs.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    যেসব কাস্টমার নিজেরা অর্ডার ক্যানসেল করেছেন তাদের সম্পূর্ণ তথ্য
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isRoot && auditLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAuditLogs}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Cache</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveAuditModal(null)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 overflow-y-auto space-y-3">
                {auditStats.customerCancelledLogs.length === 0 ? (
                  <p className="py-12 text-center text-sm font-bold text-slate-400">
                    এখনো কোনো কাস্টমার অর্ডার ক্যানসেল করেননি।
                  </p>
                ) : (
                  auditStats.customerCancelledLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-black text-[#69EBDA]">#{log.bookingId}</span>
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {log.customerName || 'Guest Customer'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400">
                            Cancelled by Customer
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {log.itemTitle} • {formatBDT(log.totalPrice)}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                          {log.customerEmail && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3 h-3 text-cyan-400" /> {log.customerEmail}
                            </span>
                          )}
                          {log.customerPhone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400" /> Phone: {log.customerPhone}
                            </span>
                          )}
                          {log.customerWhatsapp && (
                            <span className="inline-flex items-center gap-1">
                              <MessageCircle className="w-3 h-3 text-emerald-400" /> WhatsApp: {log.customerWhatsapp}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Check-in: {log.details?.checkInDate || 'N/A'} • Cancelled At: {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {log.customerWhatsapp && (
                          <a
                            href={`https://wa.me/${String(log.customerWhatsapp).replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        {isRoot && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAuditLog(log.id)}
                            className="p-2 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 cursor-pointer"
                            title="Delete Log (Root Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* AUDIT MODAL 2: ORDER CONFIRM / PENDING / RE-PENDING / CANCEL / DELETE HISTORY */}
        {activeAuditModal === 'order-history' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-4xl max-h-[88vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-[#69EBDA]" />
                    <span>Order Status &amp; Action History ({auditStats.orderGroups.length} Orders)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    একটি অর্ডার কতবার কনফার্ম, পেন্ডিং, রি-পেন্ডিং, ক্যানসেল ও ডিলিট হয়েছে তার সম্পূর্ণ বিবরণ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isRoot && auditLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAuditLogs}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Cache</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveAuditModal(null)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                {auditStats.orderGroups.length === 0 ? (
                  <p className="py-12 text-center text-sm font-bold text-slate-400">
                    এখনো কোনো অ্যাডমিন অ্যাকশন রেকর্ড হয়নি।
                  </p>
                ) : (
                  auditStats.orderGroups.map((grp) => (
                    <div
                      key={grp.bookingId}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-[#69EBDA]">#{grp.bookingId}</span>
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              {grp.customerName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {grp.itemTitle} • {formatBDT(grp.totalPrice)} • {grp.customerPhone || grp.customerEmail || ''}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[11px] font-black">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                            Confirm: {grp.confirmedTimes}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400">
                            Pending: {grp.pendingTimes}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-orange-500/15 text-orange-400">
                            Re-Pending: {grp.rePendingTimes}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-400">
                            Cancel: {grp.cancelledTimes} • Del: {grp.deletedTimes}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                        {grp.logs.map((l) => (
                          <div key={l.id} className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {l.previousStatus || 'Pending'} → {l.newStatus}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                ({l.actorName || 'Admin'} • {l.actorRole === 'root_admin' ? 'Root Admin' : 'Normal Admin'})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">
                                {new Date(l.createdAt).toLocaleString()}
                              </span>
                              {isRoot && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAuditLog(l.id)}
                                  className="p-1 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 cursor-pointer"
                                  title="Delete Log (Root Admin Only)"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* AUDIT MODAL 3: ADMIN ACTIONS REPORT */}
        {activeAuditModal === 'admin-actions' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-4xl max-h-[88vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-cyan-400" />
                    <span>Admin Actions Report ({auditStats.adminLogs.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    কোন অ্যাডমিন কার বুকিং কনফার্ম, পেন্ডিং, ক্যানসেল বা ডিলিট করেছেন তার বিস্তারিত লগ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isRoot && auditLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAuditLogs}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Cache</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveAuditModal(null)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 overflow-y-auto space-y-3">
                {auditStats.adminLogs.length === 0 ? (
                  <p className="py-12 text-center text-sm font-bold text-slate-400">
                    এখনো কোনো অ্যাডমিন অ্যাকশন রেকর্ড হয়নি।
                  </p>
                ) : (
                  auditStats.adminLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            log.actorRole === 'root_admin'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-cyan-500/20 text-cyan-400'
                          }`}>
                            {log.actorRole === 'root_admin' ? 'Root Admin' : 'Normal Admin'}: {log.actorName || 'Admin'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            log.actionType === 'confirmed'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : log.actionType === 'deleted' || log.actionType === 'cancelled'
                              ? 'bg-rose-500/15 text-rose-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}>
                            {log.actionType === 're_pending' ? 'Confirmed → Pending' : log.newStatus}
                          </span>
                          <span className="text-[11px] font-black text-[#69EBDA]">#{log.bookingId}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Customer: {log.customerName || 'Guest'} • {log.itemTitle} ({formatBDT(log.totalPrice)})
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {log.customerEmail ? `${log.customerEmail} • ` : ''}{log.customerPhone || ''} • {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {isRoot && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAuditLog(log.id)}
                          className="p-2 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 cursor-pointer self-end sm:self-center shrink-0"
                          title="Delete Log (Root Admin Only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* AUDIT MODAL 4: REPEAT CUSTOMERS */}
        {activeAuditModal === 'repeat-customers' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-4xl max-h-[88vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <span>Repeat Customers ({crmData.repeatCustomers.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    যেসব কাস্টমার ২ বার বা তার বেশি বুকিং করেছেন তাদের নাম, Gmail, ফোন ও অন্যান্য তথ্য
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAuditModal(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-3">
                {crmData.repeatCustomers.length === 0 ? (
                  <p className="py-12 text-center text-sm font-bold text-slate-400">
                    এখনো কোনো রিপিট কাস্টমার পাওয়া যায়নি।
                  </p>
                ) : (
                  crmData.repeatCustomers.map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {c.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400">
                            {c.bookingsCount} Bookings
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400">
                            Confirmed Spend: {formatBDT(c.totalSpend)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                          {c.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-3 h-3 text-cyan-400" /> {c.email}
                            </span>
                          )}
                          {c.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400" /> Phone: {c.phone}
                            </span>
                          )}
                          {c.whatsapp && (
                            <span className="inline-flex items-center gap-1">
                              <MessageCircle className="w-3 h-3 text-emerald-400" /> WhatsApp: {c.whatsapp}
                            </span>
                          )}
                        </div>

                        {c.recentServices?.length > 0 && (
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            Services: {c.recentServices.join(' • ')}
                            {c.lastBookingDate ? ` • Latest: ${c.lastBookingDate}` : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {c.whatsapp && (
                          <a
                            href={`https://wa.me/${String(c.whatsapp).replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                        {c.phone && (
                          <a
                            href={`tel:${String(c.phone).replace(/[^0-9+]/g, '')}`}
                            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 text-xs font-bold inline-flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* 5. Live Website Visitors Modal */}
        {activeAuditModal === 'live-visitors' && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Live Website Visitors ({liveVisitors.totalLive})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Users: {liveVisitors.usersCount} • Non-Users (Guests): {liveVisitors.guestsCount}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAuditModal(null)}
                  className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 max-h-[65vh] overflow-y-auto space-y-3">
                {liveVisitors.visitors.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400 font-semibold">
                    এই মুহূর্তে কোনো লাইভ ভিজিটর পাওয়া যায়নি।
                  </div>
                ) : (
                  liveVisitors.visitors.map((v) => {
                    const isUser = v.visitor_type === 'user';
                    return (
                      <div
                        key={v.session_id}
                        className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                                isUser
                                  ? 'bg-cyan-500/15 text-cyan-400'
                                  : 'bg-amber-500/15 text-amber-400'
                              }`}
                            >
                              {isUser ? 'User' : 'Non-User (Guest)'}
                            </span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {isUser ? (v.user_name || v.user_email) : 'Guest Visitor'}
                            </span>
                          </div>
                          {isUser && v.user_email && (
                            <p className="text-xs text-slate-400">{v.user_email}</p>
                          )}
                          <p className="text-[11px] text-slate-400">
                            Page: <span className="font-bold text-slate-300">{v.current_path || '/'}</span>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active Now
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {v.last_seen ? new Date(v.last_seen).toLocaleTimeString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* 6. Realtime System Ping & Database Memory Details Modal */}
        {activeAuditModal === 'system-health' && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Database Memory &amp; System Telemetry
                    </h3>
                    <p className="text-xs text-slate-400">
                      DB Size: {systemHealth?.db?.dbSizePretty || 'N/A'} • Total Rows: {systemHealth?.db?.totalRows ?? 0} • Ping: {systemHealth?.web?.pingMs ?? '-'} ms
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAuditModal(null)}
                  className="p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 max-h-[65vh] overflow-y-auto space-y-3">
                {!systemHealth?.db?.rpcAvailable && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-semibold">
                    সম্পূর্ণ PostgreSQL মেমরি ও টেবিল সাইজ দেখতে Supabase SQL Editor-এ <code className="font-mono font-bold">get_database_health_stats()</code> SQL ফাংশনটি রান করুন।
                  </div>
                )}

                {(!systemHealth?.db?.tables || systemHealth.db.tables.length === 0) ? (
                  <div className="py-10 text-center text-sm text-slate-400 font-semibold">
                    কোনো টেবিল ডেটা পাওয়া যায়নি।
                  </div>
                ) : (
                  systemHealth.db.tables.map((tbl) => (
                    <div
                      key={tbl.table_name}
                      className="p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          {tbl.table_name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Rows: <span className="font-bold text-cyan-400">{tbl.row_count}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-300 text-xs font-black">
                          {tbl.total_pretty || SystemHealthService.formatBytes(tbl.total_bytes)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
