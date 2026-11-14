import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Save,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Share2
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { OFFICE_CONTACT_INFO } from '../../data/travelData';

const cloneContact = (info) => ({
  whatsapp: info?.whatsapp || '',
  phone: {
    hotline: info?.phone?.hotline || '',
    tollFree: info?.phone?.tollFree || ''
  },
  email: {
    concierge: info?.email?.concierge || '',
    bookings: info?.email?.bookings || ''
  },
  address: {
    primary: info?.address?.primary || '',
    satellite: info?.address?.satellite || '',
    mapLink: info?.address?.mapLink || ''
  },
  hours: {
    weekdays: info?.hours?.weekdays || '',
    weekends: info?.hours?.weekends || '',
    emergency: info?.hours?.emergency || ''
  }
});

export const AdminContactControl = ({ language = 'bn', isLight = false, onShowToast }) => {
  const [form, setForm] = useState(() => cloneContact(StorageService.getContactInfo()));
  const [social, setSocial] = useState(() => StorageService.getSocialLinks());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const sync = () => {
      setForm(cloneContact(StorageService.getContactInfo()));
      setSocial(StorageService.getSocialLinks());
    };
    window.addEventListener('app:contact-info-updated', sync);
    return () => window.removeEventListener('app:contact-info-updated', sync);
  }, []);

  const persistContact = async (nextData, toastMsg, nextSocial = social) => {
    setIsSaving(true);
    try {
      await StorageService.saveContactInfo(nextData);
      await StorageService.saveSocialLinks(nextSocial);
      setForm(cloneContact(nextData));
      setSocial(nextSocial);
      onShowToast?.(toastMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    persistContact(
      form,
      language === 'en'
        ? 'All website contact settings saved & synced live!'
        : 'সম্পূর্ণ ওয়েবসাইটের কন্টাক্ট তথ্য সেভ ও রিয়েলটাইম সিঙ্ক হয়েছে!'
    );
  };

  const handleDeleteField = (section, field, label) => {
    const next = cloneContact(form);
    if (section === 'root') {
      next[field] = '';
    } else {
      next[section][field] = '';
    }
    setForm(next);
    persistContact(
      next,
      language === 'en'
        ? `${label} removed from website.`
        : `${label} ওয়েবসাইট থেকে ডিলিট করা হয়েছে।`
    );
  };

  const handleResetDefaults = () => {
    const defaults = cloneContact(OFFICE_CONTACT_INFO);
    setForm(defaults);
    persistContact(
      defaults,
      language === 'en'
        ? 'Contact settings restored to default.'
        : 'ডিফল্ট কন্টাক্ট তথ্য রিস্টোর করা হয়েছে।'
    );
  };

  const cardCls = isLight
    ? 'bg-white border border-slate-200/90 shadow-sm'
    : 'bg-slate-900/75 border border-slate-800 backdrop-blur-xl shadow-lg';

  const inputCls = isLight
    ? 'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#69EBDA]'
    : 'w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-[#69EBDA]';

  const labelCls = `block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
    isLight ? 'text-slate-600' : 'text-slate-300'
  }`;

  const cleanWa = form.whatsapp.replace(/[^0-9]/g, '');

  return (
    <form onSubmit={handleSaveAll} className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className={`rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${cardCls}`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#69EBDA]/15 border border-[#69EBDA]/35 text-[#69EBDA] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Phone className="w-3.5 h-3.5" />
            {language === 'en' ? 'Web Control • Contact System' : 'ওয়েব কন্ট্রোল • কন্টাক্ট সিস্টেম'}
          </div>
          <h2 className={`text-lg sm:text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {language === 'en'
              ? 'Website Contact, WhatsApp & Phone Control'
              : 'সম্পূর্ণ ওয়েবসাইটের কন্টাক্ট, হোয়াটসঅ্যাপ ও ফোন কন্ট্রোল'}
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {language === 'en'
              ? 'Edit, update, or delete WhatsApp, hotline phone numbers, emails, and office details across the entire website in real time.'
              : 'এখান থেকে পুরো ওয়েবসাইটের হোয়াটসঅ্যাপ, ফোন কল নম্বর, ইমেইল এবং অফিসের ঠিকানা পরিবর্তন, এডিট বা ডিলিট করতে পারবেন।'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSaving}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {language === 'en' ? 'Reset Default' : 'ডিফল্ট রিসেট'}
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#69EBDA]/25 hover:brightness-105 transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving
              ? (language === 'en' ? 'Saving...' : 'সেভ হচ্ছে...')
              : (language === 'en' ? 'Save All Changes' : 'সব পরিবর্তন সেভ করুন')}
          </button>
        </div>
      </div>

      {/* 1. WhatsApp & Phone Call Control (Primary Focus) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* WhatsApp System */}
        <div className={`rounded-2xl p-5 space-y-4 ${cardCls}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-500">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {language === 'en' ? 'WhatsApp Contact System' : 'হোয়াটসঅ্যাপ কন্টাক্ট সিস্টেম'}
                </h3>
                <span
                  key={cleanWa ? 'wa-active' : 'wa-inactive'}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                    cleanWa ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {cleanWa ? (
                    <span key="wa-on" className="inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{language === 'en' ? 'Active across website' : 'ওয়েবসাইটে সক্রিয়'}</span>
                    </span>
                  ) : (
                    <span key="wa-off" className="inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{language === 'en' ? 'Deleted / Hidden on website' : 'ডিলিট করা (ওয়েবসাইটে বন্ধ)'}</span>
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              {form.whatsapp ? (
                <button
                  key="wa-delete-btn"
                  type="button"
                  onClick={() => handleDeleteField('root', 'whatsapp', 'WhatsApp')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="Delete WhatsApp Contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Delete' : 'ডিলিট'}</span>
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <label className={labelCls}>
              {language === 'en' ? 'WhatsApp Number (with country code)' : 'হোয়াটসঅ্যাপ নম্বর (কান্ট্রি কোডসহ)'}
            </label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="+8801711234567"
              className={inputCls}
            />
            <div className="mt-2 min-h-[20px]">
              {cleanWa ? (
                <a
                  key="wa-preview-link"
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:underline"
                >
                  <span>{`wa.me/${cleanWa}`}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Phone Call System */}
        <div className={`rounded-2xl p-5 space-y-4 ${cardCls}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/35 flex items-center justify-center text-[#69EBDA]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {language === 'en' ? 'Phone Call Contact System' : 'ফোন কল কন্টাক্ট সিস্টেম'}
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {language === 'en' ? 'Hotline & Toll-Free call buttons' : 'হটলাইন এবং টোল-ফ্রি কল বাটনসমূহ'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`${labelCls} mb-0`}>
                  {language === 'en' ? 'Primary Hotline Number' : 'প্রাইমারি হটলাইন নম্বর'}
                </label>
                {form.phone.hotline && (
                  <button
                    type="button"
                    onClick={() => handleDeleteField('phone', 'hotline', 'Hotline Phone')}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    {language === 'en' ? 'Delete' : 'ডিলিট'}
                  </button>
                )}
              </div>
              <input
                type="text"
                value={form.phone.hotline}
                onChange={(e) => setForm({ ...form, phone: { ...form.phone, hotline: e.target.value } })}
                placeholder="+880 1711-234567"
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`${labelCls} mb-0`}>
                  {language === 'en' ? 'Secondary / Toll-Free Number' : 'দ্বিতীয় / টোল-ফ্রি নম্বর'}
                </label>
                {form.phone.tollFree && (
                  <button
                    type="button"
                    onClick={() => handleDeleteField('phone', 'tollFree', 'Toll-Free Phone')}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    {language === 'en' ? 'Delete' : 'ডিলিট'}
                  </button>
                )}
              </div>
              <input
                type="text"
                value={form.phone.tollFree}
                onChange={(e) => setForm({ ...form, phone: { ...form.phone, tollFree: e.target.value } })}
                placeholder="+1 (800) 555-0199"
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Email & Office Address */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Email Contacts */}
        <div className={`rounded-2xl p-5 space-y-4 ${cardCls}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/35 flex items-center justify-center text-sky-400">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {language === 'en' ? 'Email Addresses' : 'ইমেইল ঠিকানা'}
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`${labelCls} mb-0`}>
                  {language === 'en' ? 'Concierge Email' : 'কনসিয়ার্জ ইমেইল'}
                </label>
                {form.email.concierge && (
                  <button
                    type="button"
                    onClick={() => handleDeleteField('email', 'concierge', 'Concierge Email')}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    {language === 'en' ? 'Delete' : 'ডিলিট'}
                  </button>
                )}
              </div>
              <input
                type="email"
                value={form.email.concierge}
                onChange={(e) => setForm({ ...form, email: { ...form.email, concierge: e.target.value } })}
                placeholder="concierge@agency.com"
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`${labelCls} mb-0`}>
                  {language === 'en' ? 'Bookings Email' : 'বুকিং ইমেইল'}
                </label>
                {form.email.bookings && (
                  <button
                    type="button"
                    onClick={() => handleDeleteField('email', 'bookings', 'Bookings Email')}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    {language === 'en' ? 'Delete' : 'ডিলিট'}
                  </button>
                )}
              </div>
              <input
                type="email"
                value={form.email.bookings}
                onChange={(e) => setForm({ ...form, email: { ...form.email, bookings: e.target.value } })}
                placeholder="booking@agency.com"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Office Addresses */}
        <div className={`rounded-2xl p-5 space-y-4 ${cardCls}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {language === 'en' ? 'Office Addresses & Map' : 'অফিসের ঠিকানা ও ম্যাপ'}
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`${labelCls} mb-0`}>
                  {language === 'en' ? 'Primary Office Address' : 'প্রধান অফিসের ঠিকানা'}
                </label>
                {form.address.primary && (
                  <button
                    type="button"
                    onClick={() => handleDeleteField('address', 'primary', 'Primary Address')}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    {language === 'en' ? 'Delete' : 'ডিলিট'}
                  </button>
                )}
              </div>
              <input
                type="text"
                value={form.address.primary}
                onChange={(e) => setForm({ ...form, address: { ...form.address, primary: e.target.value } })}
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`${labelCls} mb-0`}>
                  {language === 'en' ? 'Satellite Office Address' : 'দ্বিতীয় অফিসের ঠিকানা'}
                </label>
                {form.address.satellite && (
                  <button
                    type="button"
                    onClick={() => handleDeleteField('address', 'satellite', 'Satellite Address')}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    {language === 'en' ? 'Delete' : 'ডিলিট'}
                  </button>
                )}
              </div>
              <input
                type="text"
                value={form.address.satellite}
                onChange={(e) => setForm({ ...form, address: { ...form.address, satellite: e.target.value } })}
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`${labelCls} mb-0`}>
                  {language === 'en' ? 'Google Maps URL' : 'গুগল ম্যাপ লিংক'}
                </label>
                {form.address.mapLink && (
                  <button
                    type="button"
                    onClick={() => handleDeleteField('address', 'mapLink', 'Map Link')}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    {language === 'en' ? 'Delete' : 'ডিলিট'}
                  </button>
                )}
              </div>
              <input
                type="url"
                value={form.address.mapLink}
                onChange={(e) => setForm({ ...form, address: { ...form.address, mapLink: e.target.value } })}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operating Hours */}
      <div className={`rounded-2xl p-5 space-y-4 ${cardCls}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/35 flex items-center justify-center text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {language === 'en' ? 'Support & Office Hours' : 'অফিস ও সাপোর্ট সময়সূচী'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`${labelCls} mb-0`}>
                {language === 'en' ? 'Weekdays' : 'সাপ্তাহিক দিন'}
              </label>
              {form.hours.weekdays && (
                <button
                  type="button"
                  onClick={() => handleDeleteField('hours', 'weekdays', 'Weekday Hours')}
                  className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={form.hours.weekdays}
              onChange={(e) => setForm({ ...form, hours: { ...form.hours, weekdays: e.target.value } })}
              className={inputCls}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`${labelCls} mb-0`}>
                {language === 'en' ? 'Weekends' : 'সাপ্তাহিক ছুটি'}
              </label>
              {form.hours.weekends && (
                <button
                  type="button"
                  onClick={() => handleDeleteField('hours', 'weekends', 'Weekend Hours')}
                  className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={form.hours.weekends}
              onChange={(e) => setForm({ ...form, hours: { ...form.hours, weekends: e.target.value } })}
              className={inputCls}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`${labelCls} mb-0`}>
                {language === 'en' ? 'Emergency / 24/7 Note' : 'জরুরি / ২৪/৭ নোট'}
              </label>
              {form.hours.emergency && (
                <button
                  type="button"
                  onClick={() => handleDeleteField('hours', 'emergency', 'Emergency Hours')}
                  className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={form.hours.emergency}
              onChange={(e) => setForm({ ...form, hours: { ...form.hours, emergency: e.target.value } })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* 4. Social Media Links (Shown in Invoice & Footer) */}
      <div className={`rounded-2xl p-5 space-y-4 ${cardCls}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/35 flex items-center justify-center text-pink-400">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {language === 'en' ? 'Social Media Links (Invoice & Website)' : 'সোশ্যাল মিডিয়া লিংক (ইনভয়েস ও ওয়েবসাইট)'}
            </h3>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {language === 'en' ? 'Facebook, YouTube, Instagram & Website links included in PDF Invoices' : 'Facebook, YouTube, Instagram লিংক থাকলে PDF ইনভয়েসে যুক্ত হবে'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
            { key: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@yourchannel' },
            { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/yourprofile' },
            { key: 'website', label: 'Official Website URL', placeholder: 'https://yourwebsite.com' }
          ].map((item) => (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1">
                <label className={`${labelCls} mb-0`}>{item.label}</label>
                {social?.[item.key] && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextSocial = { ...social, [item.key]: '' };
                      setSocial(nextSocial);
                      persistContact(form, `${item.label} removed.`, nextSocial);
                    }}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'en' ? 'Delete' : 'ডিলিট'}</span>
                  </button>
                )}
              </div>
              <input
                type="url"
                value={social?.[item.key] || ''}
                onChange={(e) => setSocial({ ...social, [item.key]: e.target.value })}
                placeholder={item.placeholder}
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
