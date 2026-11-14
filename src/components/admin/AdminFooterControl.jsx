import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Share2,
  CreditCard,
  Link2,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';
import { StorageService, DEFAULT_FOOTER_SETTINGS } from '../../services/storageService';
import { uploadMediaFile } from '../../services/supabaseClient';
import { DynamicReactIcon } from '../../utils/reactIconParser';

const FOOTER_TABS = [
  { id: 'general', labelBn: 'জেনারেল ও নিউজলেটার', labelEn: 'General & Newsletter', icon: LayoutGrid },
  { id: 'links', labelBn: 'লিঙ্ক ও ক্যাটাগরি', labelEn: 'Links & Categories', icon: Link2 },
  { id: 'social', labelBn: 'সোশ্যাল মিডিয়া (আনলিমিটেড)', labelEn: 'Social Media', icon: Share2 },
  { id: 'payments', labelBn: 'পেমেন্ট সিস্টেম লোগো', labelEn: 'Payment Logos', icon: CreditCard }
];

export const AdminFooterControl = ({ language = 'bn', isLight = false, onShowToast }) => {
  const [form, setForm] = useState(() => StorageService.getFooterSettings());
  const [subTab, setSubTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');

  useEffect(() => {
    const sync = () => setForm(StorageService.getFooterSettings());
    window.addEventListener('app:footer-settings-updated', sync);
    return () => window.removeEventListener('app:footer-settings-updated', sync);
  }, []);

  const persist = async (nextData, msg) => {
    setIsSaving(true);
    try {
      const saved = await StorageService.saveFooterSettings(nextData);
      setForm(saved);
      onShowToast?.(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    persist(
      form,
      language === 'en'
        ? 'Footer settings saved & synced in real time!'
        : 'ফুটারের সব তথ্য, সোশ্যাল লিংক ও পেমেন্ট লোগো রিয়েলটাইমে সেভ হয়েছে!'
    );
  };

  const handleReset = () => {
    persist(
      DEFAULT_FOOTER_SETTINGS,
      language === 'en' ? 'Footer restored to default.' : 'ফুটার ডিফল্ট অবস্থায় রিসেট হয়েছে।'
    );
  };

  const handleUpload = async (file, key, onUrl) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const res = await uploadMediaFile(file, 'payment-logos');
      const uploadedUrl = typeof res === 'string' ? res : res?.url;
      if (uploadedUrl) {
        onUrl(uploadedUrl);
        onShowToast?.(
          language === 'en' ? 'Logo uploaded! Click Save to publish.' : 'লোগো আপলোড হয়েছে! সেভ বাটনে ক্লিক করুন।'
        );
      }
    } catch (err) {
      onShowToast?.(
        language === 'en'
          ? `Upload failed: ${err?.message || 'Error'}`
          : `আপলোড ব্যর্থ হয়েছে: ${err?.message || 'ত্রুটি'}`
      );
    } finally {
      setUploadingKey('');
    }
  };

  const updateListItem = (key, idx, patch) => {
    const arr = Array.isArray(form[key]) ? [...form[key]] : [];
    arr[idx] = typeof patch === 'object' && patch !== null && typeof arr[idx] === 'object'
      ? { ...arr[idx], ...patch }
      : patch;
    setForm({ ...form, [key]: arr });
  };

  const removeListItem = (key, idx) => {
    const arr = (Array.isArray(form[key]) ? form[key] : []).filter((_, i) => i !== idx);
    setForm({ ...form, [key]: arr });
  };

  const addListItem = (key, item) => {
    const arr = Array.isArray(form[key]) ? [...form[key]] : [];
    arr.push(item);
    setForm({ ...form, [key]: arr });
  };

  const cardCls = isLight
    ? 'bg-white border border-slate-200/90 shadow-sm'
    : 'bg-slate-900/75 border border-slate-800 backdrop-blur-xl shadow-lg';

  const inputCls = isLight
    ? 'w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#69EBDA]'
    : 'w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-[#69EBDA]';

  const labelCls = `block text-[11px] font-bold uppercase tracking-wider mb-1 ${
    isLight ? 'text-slate-600' : 'text-slate-300'
  }`;

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-12">
      {/* Header */}
      <div className={`rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${cardCls}`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#69EBDA]/15 border border-[#69EBDA]/35 text-[#69EBDA] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Web Control • Footer Control' : 'ওয়েব কন্ট্রোল • ফুটার কন্ট্রোল'}</span>
          </div>
          <h2 className={`text-lg sm:text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {language === 'en'
              ? 'Footer, Social Media & Payment Logos Control'
              : 'ফুটার, সোশ্যাল মিডিয়া ও পেমেন্ট লোগো কন্ট্রোল'}
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {language === 'en'
              ? 'Customize footer texts, links, unlimited React-icon social media links, and bottom-right payment logos.'
              : 'ফুটারের সব লেখা, লিংক, আনলিমিটেড সোশ্যাল মিডিয়া (React Icon সহ) এবং পেমেন্ট সিস্টেমের লোগো এখান থেকে এডিট ও ডিলিট করুন।'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Reset Default' : 'ডিফল্ট রিসেট'}</span>
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#69EBDA]/25 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>
              {isSaving
                ? (language === 'en' ? 'Saving...' : 'সেভ হচ্ছে...')
                : (language === 'en' ? 'Save & Sync Live' : 'সেভ ও লাইভ সিঙ্ক করুন')}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className={`p-1.5 rounded-2xl flex flex-wrap gap-1.5 ${cardCls}`}>
        {FOOTER_TABS.map((t) => {
          const Icon = t.icon;
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-sm font-black'
                  : isLight
                    ? 'text-slate-600 hover:bg-slate-100'
                    : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{language === 'en' ? t.labelEn : t.labelBn}</span>
            </button>
          );
        })}
      </div>

      {/* 1. GENERAL & NEWSLETTER */}
      {subTab === 'general' && (
        <div key="ft-general" className={`rounded-2xl p-5 sm:p-6 space-y-5 ${cardCls}`}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-[#69EBDA]">Show Newsletter Banner</label>
            <input
              type="checkbox"
              checked={form.showNewsletter !== false}
              onChange={(e) => setForm({ ...form, showNewsletter: e.target.checked })}
              className="w-4 h-4 accent-[#69EBDA] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Newsletter Badge</label>
              <input
                type="text"
                value={form.newsletterBadge || ''}
                onChange={(e) => setForm({ ...form, newsletterBadge: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Newsletter Headline</label>
              <input
                type="text"
                value={form.newsletterTitle || ''}
                onChange={(e) => setForm({ ...form, newsletterTitle: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Newsletter Subtitle</label>
            <textarea
              rows={2}
              value={form.newsletterSubtitle || ''}
              onChange={(e) => setForm({ ...form, newsletterSubtitle: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Footer Brand Description</label>
            <textarea
              rows={2}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Copyright Text</label>
              <input
                type="text"
                value={form.copyrightText || ''}
                onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Privacy Policy Label</label>
              <input
                type="text"
                value={form.privacyLabel || ''}
                onChange={(e) => setForm({ ...form, privacyLabel: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Terms Label</label>
              <input
                type="text"
                value={form.termsLabel || ''}
                onChange={(e) => setForm({ ...form, termsLabel: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. NAVIGATION, CATEGORIES & COMMITMENTS */}
      {subTab === 'links' && (
        <div key="ft-links" className="space-y-6">
          <div className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Navigation Links
              </h3>
              <button
                type="button"
                onClick={() => addListItem('navLinks', { name: 'New Link', href: '#home' })}
                className="px-3 py-1.5 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {(form.navLinks || []).map((l, idx) => (
                <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                  <input
                    type="text"
                    value={l.name || ''}
                    onChange={(e) => updateListItem('navLinks', idx, { name: e.target.value })}
                    placeholder="Label"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={l.href || ''}
                    onChange={(e) => updateListItem('navLinks', idx, { href: e.target.value })}
                    placeholder="#section or https://..."
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem('navLinks', idx)}
                    className="p-2 rounded-lg bg-rose-500/15 text-rose-500 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Travel Category Links
              </h3>
              <button
                type="button"
                onClick={() => addListItem('categoryLinks', { name: 'New Category', href: '#destinations' })}
                className="px-3 py-1.5 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {(form.categoryLinks || []).map((l, idx) => (
                <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                  <input
                    type="text"
                    value={l.name || ''}
                    onChange={(e) => updateListItem('categoryLinks', idx, { name: e.target.value })}
                    placeholder="Category Name"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={l.href || ''}
                    onChange={(e) => updateListItem('categoryLinks', idx, { href: e.target.value })}
                    placeholder="#destinations"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem('categoryLinks', idx)}
                    className="p-2 rounded-lg bg-rose-500/15 text-rose-500 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Commitments / Trust Badges
              </h3>
              <button
                type="button"
                onClick={() => addListItem('commitments', '')}
                className="px-3 py-1.5 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {(form.commitments || []).map((c, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => updateListItem('commitments', idx, e.target.value)}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem('commitments', idx)}
                    className="p-2 rounded-lg bg-rose-500/15 text-rose-500 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. UNLIMITED SOCIAL MEDIA LINKS (REACT ICON + LINK) */}
      {subTab === 'social' && (
        <div key="ft-social" className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
          {/* Default Share Button Link Control */}
          <div className="p-4 rounded-xl border border-[#69EBDA]/30 bg-[#69EBDA]/5 space-y-3">
            <div>
              <h4 className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-[#69EBDA]'}`}>
                {language === 'en'
                  ? 'Default Share Button Link (Always Visible on Website)'
                  : 'ডিফল্ট শেয়ার বাটন লিংক (ওয়েবসাইটে সবসময় থাকবে)'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'en'
                  ? 'Leave blank to automatically share the current website URL. Enter a custom URL if you want to share a specific link.'
                  : 'খালি রাখলে অটোমেটিক বর্তমান ওয়েবসাইটের লিংক শেয়ার হবে। নির্দিষ্ট কোনো লিংক শেয়ার করতে চাইলে এখানে বসান।'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Share Link URL</label>
                <input
                  type="url"
                  value={form.shareUrl || ''}
                  onChange={(e) => setForm({ ...form, shareUrl: e.target.value })}
                  placeholder="https://yourwebsite.com (blank = current site link)"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Share Title / Text (Optional)</label>
                <input
                  type="text"
                  value={form.shareTitle || ''}
                  onChange={(e) => setForm({ ...form, shareTitle: e.target.value })}
                  placeholder="e.g. আমাদের ট্রাভেল এজেন্সি দেখুন"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {language === 'en'
                  ? 'Unlimited Social Media Links (Shown in Footer & Contact Section)'
                  : 'আনলিমিটেড সোশ্যাল মিডিয়া লিংক (ফুটার ও কন্টাক্ট সেকশনে দেখাবে)'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                যেকোনো React Icon কোড বসান: <code>&lt;FaFacebook /&gt;</code>, <code>&lt;FaYoutube /&gt;</code>, <code>&lt;FaInstagram /&gt;</code>, <code>&lt;FaWhatsapp /&gt;</code>, <code>&lt;SiTiktok /&gt;</code>
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                addListItem('socialLinks', {
                  id: `soc-${Date.now()}`,
                  name: '',
                  iconInput: '<FaFacebook />',
                  url: 'https://facebook.com/'
                })
              }
              className="px-3.5 py-2 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Social Link</span>
            </button>
          </div>

          {(form.socialLinks || []).length === 0 ? (
            <p className="text-xs text-slate-400">No social media links added yet. Click &quot;Add Social Link&quot; to add unlimited links.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(form.socialLinks || []).map((s, idx) => (
                <div key={s.id || idx} className="p-4 rounded-xl border border-slate-700/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-[#69EBDA]/15 border border-[#69EBDA]/35 flex items-center justify-center text-[#69EBDA]">
                        <DynamicReactIcon iconInput={s.iconInput} className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-extrabold text-[#69EBDA]">{s.name || `Social #${idx + 1}`}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeListItem('socialLinks', idx)}
                      className="text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div>
                    <label className={labelCls}>Platform Name</label>
                    <input
                      type="text"
                      value={s.name || ''}
                      onChange={(e) => updateListItem('socialLinks', idx, { name: e.target.value })}
                      placeholder="Facebook / YouTube / Instagram"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>React Icon (e.g. &lt;FaFacebook /&gt;)</label>
                    <input
                      type="text"
                      value={s.iconInput || ''}
                      onChange={(e) => updateListItem('socialLinks', idx, { iconInput: e.target.value })}
                      placeholder="<FaFacebook /> or Globe"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Profile / Page URL</label>
                    <input
                      type="url"
                      value={s.url || ''}
                      onChange={(e) => updateListItem('socialLinks', idx, { url: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                      className={inputCls}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. PAYMENT SYSTEM LOGOS (BOTTOM-RIGHT OF FOOTER) */}
      {subTab === 'payments' && (
        <div key="ft-payments" className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {language === 'en'
                  ? 'Payment System Logos (Shown at Bottom-Right of Footer)'
                  : 'পেমেন্ট সিস্টেম লোগো (ফুটারের নিচে ডান পাশে দেখাবে)'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'en'
                  ? 'Upload logo photos or paste photo links for bKash, Nagad, Visa, Mastercard, etc.'
                  : 'bKash, Nagad, Visa, Mastercard ইত্যাদির লোগো ফটো আপলোড বা ফটো লিংক শেয়ার করে যোগ করুন।'}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                addListItem('paymentLogos', {
                  id: `pay-${Date.now()}`,
                  name: '',
                  logoUrl: ''
                })
              }
              className="px-3.5 py-2 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Payment Logo</span>
            </button>
          </div>

          {(form.paymentLogos || []).length === 0 ? (
            <p className="text-xs text-slate-400">No payment logos added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(form.paymentLogos || []).map((p, idx) => (
                <div key={p.id || idx} className="p-4 rounded-xl border border-slate-700/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#69EBDA]">Logo #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeListItem('paymentLogos', idx)}
                      className="text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div>
                    <label className={labelCls}>Logo Label / Alt Text (Optional)</label>
                    <input
                      type="text"
                      value={p.name || ''}
                      onChange={(e) => updateListItem('paymentLogos', idx, { name: e.target.value })}
                      placeholder="ঐচ্ছিক (খালি রাখলেও সমস্যা নেই)"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Photo Link / Upload Photo</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={p.logoUrl || ''}
                        onChange={(e) => updateListItem('paymentLogos', idx, { logoUrl: e.target.value })}
                        placeholder="https://... or upload photo"
                        className={inputCls}
                      />
                      <label className="px-3 py-2 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/40 text-[#69EBDA] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingKey === `pay-${idx}` ? '...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleUpload(e.target.files?.[0], `pay-${idx}`, (url) =>
                              updateListItem('paymentLogos', idx, { logoUrl: url })
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {p.logoUrl && (
                    <div className="p-2 rounded-lg bg-white/95 inline-flex items-center justify-center">
                      <img src={p.logoUrl} alt={p.name} className="h-7 w-auto max-w-[110px] object-contain" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
};
