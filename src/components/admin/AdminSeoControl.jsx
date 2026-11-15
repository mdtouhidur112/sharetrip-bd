import React, { useState, useEffect } from 'react';
import { HelpCircle, Save, RotateCcw, Upload, X, Search } from 'lucide-react';
import { StorageService, DEFAULT_SEO_SETTINGS } from '../../services/storageService';
import { uploadMediaFile } from '../../services/supabaseClient';

const FIELD_GUIDES = {
  siteTitle: {
    title: 'Site Title (ব্রাউজার ও গুগল টাইটেল)',
    rule: 'ওয়েবসাইটের প্রধান নাম ও মূল সেবা ৫০–৬০ অক্ষরের মধ্যে লিখুন। এটি Google সার্চ রেজাল্টের নীল শিরোনাম এবং ব্রাউজার ট্যাবে দেখা যায়।',
    example: 'ShareTrip BD — Luxury Tours, Hotels & Transport'
  },
  metaDescription: {
    title: 'Meta Description (সার্চ বিবরণ)',
    rule: '১৪০–১৬০ অক্ষরের মধ্যে আপনার ট্রাভেল এজেন্সির মূল সেবাগুলো সংক্ষেপে লিখুন। Google সার্চে টাইটেলের নিচে এই বিবরণটি দেখা যায়।',
    example: 'Book curated tour packages, luxury hotels, transport and dining across Bangladesh.'
  },
  metaKeywords: {
    title: 'Meta Keywords (কীওয়ার্ড)',
    rule: 'কমা (,) দিয়ে আলাদা করে ৫–১০টি গুরুত্বপূর্ণ কীওয়ার্ড লিখুন যেগুলো লিখে মানুষ Google-এ আপনার সাইট খুঁজবে।',
    example: 'travel agency bangladesh, cox bazar hotel, sajek tour package, sharetrip bd'
  },
  canonicalUrl: {
    title: 'Canonical URL (মূল ওয়েবসাইট লিংক)',
    rule: 'আপনার লাইভ ওয়েবসাইটের আসল https:// ডোমেইন লিংকটি দিন। এতে Google ডুপ্লিকেট লিংক এড়িয়ে মূল ডোমেইনকে র‍্যাংক করে। খালি রাখলে অটোমেটিক বর্তমান ডোমেইন নেবে।',
    example: 'https://yourdomain.com'
  },
  ogTitle: {
    title: 'OG Title (Facebook / WhatsApp শেয়ার টাইটেল)',
    rule: 'কেউ Facebook, WhatsApp বা Messenger-এ ওয়েবসাইটের লিংক শেয়ার করলে প্রিভিউ কার্ডে যে টাইটেল দেখাবে তা লিখুন। খালি রাখলে Site Title ব্যবহার হবে।',
    example: 'ShareTrip BD — সেরা ট্যুর ও হোটেল বুকিং'
  },
  ogDescription: {
    title: 'OG Description (সোশ্যাল শেয়ার বিবরণ)',
    rule: 'Facebook বা WhatsApp শেয়ার প্রিভিউ কার্ডের টাইটেলের নিচে যে ছোট বিবরণ দেখাবে তা লিখুন। খালি রাখলে Meta Description ব্যবহার হবে।',
    example: 'সাশ্রয়ী মূল্যে সেরা হোটেল, রিসোর্ট ও ট্রাভেল প্যাকেজ বুক করুন সহজেই।'
  },
  ogImage: {
    title: 'OG Image (সোশ্যাল শেয়ার ব্যানার ছবি)',
    rule: 'Facebook/WhatsApp-এ লিংক শেয়ার করলে যে ছবিটি প্রিভিউতে দেখাবে সেটি Upload করুন অথবা সরাসরি ইমেজ লিংক বসান। আদর্শ সাইজ: 1200×630 px।',
    example: 'https://yourdomain.com/og-banner.jpg'
  },
  twitterCard: {
    title: 'Twitter / X Card Type',
    rule: 'X (Twitter)-এ লিংক শেয়ার করলে বড় ছবিসহ কার্ড দেখাতে summary_large_image অথবা ছোট থাম্বনেইল দেখাতে summary সিলেক্ট করুন।',
    example: 'summary_large_image'
  },
  twitterSite: {
    title: 'Twitter / X Handle',
    rule: 'আপনার ব্র্যান্ডের X (Twitter) ইউজারনেম @ সহ দিন। না থাকলে খালি রাখতে পারেন।',
    example: '@sharetripbd'
  },
  robots: {
    title: 'Search Engine Robots (ইন্ডেক্সিং)',
    rule: 'Google-এ সাইট দেখাতে চাইলে "index, follow" রাখুন। আর সাইট সাময়িকভাবে সার্চ ইঞ্জিন থেকে লুকাতে চাইলে "noindex, nofollow" সিলেক্ট করুন।',
    example: 'index, follow'
  },
  googleVerification: {
    title: 'Google Site Verification Code',
    rule: 'Google Search Console থেকে পাওয়া <meta name="google-site-verification" content="..." /> এর শুধু content কোডটুকু এখানে বসান।',
    example: 'AbCdEf1234567890_verification_token'
  },
  schemaOrgName: {
    title: 'Schema Organization Name',
    rule: 'Google Rich Results (JSON-LD)-এর জন্য আপনার ট্রাভেল এজেন্সির অফিশিয়াল নাম দিন।',
    example: 'ShareTrip BD'
  },
  schemaPhone: {
    title: 'Schema Contact Phone',
    rule: 'Google Knowledge Graph-এ দেখানোর জন্য আন্তর্জাতিক ফরম্যাটে অফিসিয়াল ফোন নম্বর দিন।',
    example: '+8801700000000'
  },
  schemaAddress: {
    title: 'Schema Address',
    rule: 'আপনার অফিসের ঠিকানা (শহর ও দেশসহ) দিন, যাতে লোকাল SEO-তে সুবিধা হয়।',
    example: 'Dhaka, Bangladesh'
  }
};

export const AdminSeoControl = ({ language = 'bn', isLight = false, onShowToast }) => {
  const [form, setForm] = useState(() => StorageService.getSeoSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingOg, setIsUploadingOg] = useState(false);
  const [activeGuideKey, setActiveGuideKey] = useState(null);

  useEffect(() => {
    const sync = () => setForm(StorageService.getSeoSettings());
    window.addEventListener('app:seo-settings-updated', sync);
    return () => window.removeEventListener('app:seo-settings-updated', sync);
  }, []);

  const persist = async (nextData, msg) => {
    setIsSaving(true);
    try {
      const saved = await StorageService.saveSeoSettings(nextData);
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
        ? 'SEO settings saved & synced in real time!'
        : 'SEO সেটিংস রিয়েলটাইমে সেভ হয়েছে!'
    );
  };

  const handleReset = () => {
    persist(
      DEFAULT_SEO_SETTINGS,
      language === 'en' ? 'SEO settings restored to default.' : 'SEO সেটিংস ডিফল্ট অবস্থায় রিসেট হয়েছে।'
    );
  };

  const handleOgUpload = async (file) => {
    if (!file) return;
    setIsUploadingOg(true);
    try {
      const res = await uploadMediaFile(file, 'seo');
      const url = typeof res === 'string' ? res : res?.url;
      if (url) {
        setForm((prev) => ({ ...prev, ogImage: url }));
        onShowToast?.(language === 'en' ? 'OG image uploaded!' : 'OG ছবি আপলোড হয়েছে!');
      }
    } catch (err) {
      onShowToast?.(`Upload failed: ${err?.message || 'Error'}`);
    } finally {
      setIsUploadingOg(false);
    }
  };

  const cardCls = isLight
    ? 'bg-white border border-slate-200 shadow-xs'
    : 'bg-slate-900/80 border border-slate-800';

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-hidden transition-all ${
    isLight
      ? 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#69EBDA]'
      : 'bg-slate-950/60 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
  }`;

  const FieldLabel = ({ label, guideKey }) => (
    <div className="flex items-center justify-between mb-1.5">
      <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setActiveGuideKey(guideKey)}
        title="নিয়ম দেখুন"
        className="w-5 h-5 rounded-full bg-[#69EBDA]/15 hover:bg-[#69EBDA]/30 border border-[#69EBDA]/40 text-[#69EBDA] inline-flex items-center justify-center cursor-pointer transition-all shrink-0"
      >
        <HelpCircle className="w-3 h-3" />
      </button>
    </div>
  );

  const activeGuide = activeGuideKey ? FIELD_GUIDES[activeGuideKey] : null;

  return (
    <form onSubmit={handleSave} className="space-y-5 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className={`rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 ${cardCls}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/35 flex items-center justify-center text-[#69EBDA]">
            <Search className="w-4 h-4" />
          </div>
          <h2 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            SEO Control
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-600/40 text-xs font-bold text-slate-400 hover:text-rose-400 hover:border-rose-400/50 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#69EBDA]/20 cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save SEO'}</span>
          </button>
        </div>
      </div>

      {/* Clean SEO Inputs Grid */}
      <div className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Site Title" guideKey="siteTitle" />
            <input
              type="text"
              value={form.siteTitle || ''}
              onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel label="Canonical URL" guideKey="canonicalUrl" />
            <input
              type="url"
              value={form.canonicalUrl || ''}
              onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <FieldLabel label="Meta Description" guideKey="metaDescription" />
          <textarea
            rows={2}
            value={form.metaDescription || ''}
            onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <FieldLabel label="Meta Keywords" guideKey="metaKeywords" />
          <input
            type="text"
            value={form.metaKeywords || ''}
            onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel label="OG Title" guideKey="ogTitle" />
            <input
              type="text"
              value={form.ogTitle || ''}
              onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel label="OG Image" guideKey="ogImage" />
            <div className="flex gap-2">
              <input
                type="url"
                value={form.ogImage || ''}
                onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                className={inputCls}
              />
              <label className="px-3 py-2 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/40 text-[#69EBDA] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingOg ? '...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleOgUpload(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        </div>

        <div>
          <FieldLabel label="OG Description" guideKey="ogDescription" />
          <textarea
            rows={2}
            value={form.ogDescription || ''}
            onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FieldLabel label="Robots" guideKey="robots" />
            <select
              value={form.robots || 'index, follow'}
              onChange={(e) => setForm({ ...form, robots: e.target.value })}
              className={inputCls}
            >
              <option value="index, follow">index, follow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
              <option value="index, nofollow">index, nofollow</option>
            </select>
          </div>

          <div>
            <FieldLabel label="Twitter Card" guideKey="twitterCard" />
            <select
              value={form.twitterCard || 'summary_large_image'}
              onChange={(e) => setForm({ ...form, twitterCard: e.target.value })}
              className={inputCls}
            >
              <option value="summary_large_image">summary_large_image</option>
              <option value="summary">summary</option>
            </select>
          </div>

          <div>
            <FieldLabel label="Twitter Handle" guideKey="twitterSite" />
            <input
              type="text"
              value={form.twitterSite || ''}
              onChange={(e) => setForm({ ...form, twitterSite: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Google Site Verification" guideKey="googleVerification" />
            <input
              type="text"
              value={form.googleVerification || ''}
              onChange={(e) => setForm({ ...form, googleVerification: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel label="Schema Organization Name" guideKey="schemaOrgName" />
            <input
              type="text"
              value={form.schemaOrgName || ''}
              onChange={(e) => setForm({ ...form, schemaOrgName: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FieldLabel label="Schema Phone" guideKey="schemaPhone" />
            <input
              type="text"
              value={form.schemaPhone || ''}
              onChange={(e) => setForm({ ...form, schemaPhone: e.target.value })}
              className={inputCls}
            />
          </div>

          <div>
            <FieldLabel label="Schema Address" guideKey="schemaAddress" />
            <input
              type="text"
              value={form.schemaAddress || ''}
              onChange={(e) => setForm({ ...form, schemaAddress: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {activeGuide && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          onClick={() => setActiveGuideKey(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-[#69EBDA]/35 shadow-2xl p-6 space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#69EBDA] shrink-0" />
                <h3 className="text-sm font-black">{activeGuide.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveGuideKey(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activeGuide.rule}</p>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#69EBDA] mb-1">
                উদাহরণ (Example)
              </p>
              <code className="text-xs text-slate-200 break-all">{activeGuide.example}</code>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
