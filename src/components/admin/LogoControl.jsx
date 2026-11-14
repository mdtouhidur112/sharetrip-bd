import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Compass, 
  Check, 
  Eye, 
  Sliders, 
  Type, 
  Sparkles,
  Maximize2,
  Lock,
  Unlock
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { DEFAULT_BRANDING } from '../../data/travelData';
import { 
  supabase, 
  uploadMediaFile, 
  removeStorageFiles, 
  rowToBranding, 
  brandingToRow 
} from '../../services/supabaseClient';

const COLOR_PRESETS = [
  { label: 'সাদা', value: '#FFFFFF' },
  { label: 'সায়ান', value: '#69EBDA' },
  { label: 'স্কাই ব্লু', value: '#38BDF8' },
  { label: 'এমারেল্ড', value: '#34D399' },
  { label: 'অ্যাম্বার', value: '#FBBF24' },
  { label: 'রোজ', value: '#FB7185' },
  { label: 'সিলভার', value: '#94A3B8' }
];

const HEIGHT_PRESETS = [
  { label: 'স্মল (32px)', height: 32, width: 32 },
  { label: 'স্ট্যান্ডার্ড (40px)', height: 40, width: 40 },
  { label: 'মাঝারি (52px)', height: 52, width: 52 },
  { label: 'বড় (64px)', height: 64, width: 64 }
];

export const LogoControl = ({ language = 'bn', isLight = false, onShowToast }) => {
  const [branding, setBranding] = useState(() => StorageService.getBranding());
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [previewBg, setPreviewBg] = useState('dark'); // 'dark' | 'light' | 'image'
  const fileInputRef = useRef(null);

  // Sync with Supabase on mount and subscribe to Realtime changes
  useEffect(() => {
    if (supabase) {
      supabase
        .from('branding_settings')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data) {
            const mapped = rowToBranding(data);
            setBranding(mapped);
            localStorage.setItem('aetheria_branding_db', JSON.stringify(mapped));
          }
        });

      const channel = supabase
        .channel('logo-control-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'branding_settings' },
          (payload) => {
            if (payload.new) {
              const mapped = rowToBranding(payload.new);
              setBranding(mapped);
              localStorage.setItem('aetheria_branding_db', JSON.stringify(mapped));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const updateField = (field, value) => {
    setBranding((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHeightChange = (newHeight) => {
    const h = Math.max(16, Math.min(120, parseInt(newHeight, 10) || 16));
    if (lockAspectRatio) {
      const ratio = branding.logoHeight > 0 ? branding.logoWidth / branding.logoHeight : 1;
      setBranding((prev) => ({
        ...prev,
        logoHeight: h,
        logoWidth: Math.round(h * ratio)
      }));
    } else {
      updateField('logoHeight', h);
    }
  };

  const handleWidthChange = (newWidth) => {
    const w = Math.max(16, Math.min(300, parseInt(newWidth, 10) || 16));
    if (lockAspectRatio) {
      const ratio = branding.logoWidth > 0 ? branding.logoHeight / branding.logoWidth : 1;
      setBranding((prev) => ({
        ...prev,
        logoWidth: w,
        logoHeight: Math.round(w * ratio)
      }));
    } else {
      updateField('logoWidth', w);
    }
  };

  const handlePresetSelect = (preset) => {
    setBranding((prev) => ({
      ...prev,
      logoHeight: preset.height,
      logoWidth: preset.width
    }));
  };

  // Upload handler for custom logo image (Add / Update)
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousLogoUrl = branding.logoUrl;

    try {
      setIsUploading(true);
      const res = await uploadMediaFile(file, 'branding');
      const publicUrl = res?.url || res;

      // Auto-cleanup: If an old custom logo was stored in Supabase storage, remove it
      if (previousLogoUrl && typeof previousLogoUrl === 'string' && previousLogoUrl.startsWith('http') && previousLogoUrl.includes('/agency-media/')) {
        removeStorageFiles(previousLogoUrl).catch((err) => console.warn('Old logo cleanup notice:', err));
      }

      const updatedBranding = {
        ...branding,
        logoUrl: publicUrl
      };

      setBranding(updatedBranding);
      
      // Auto-persist immediately so user sees instant update across website
      await StorageService.saveBranding(updatedBranding);

      if (onShowToast) {
        onShowToast(language === 'en' ? 'New logo uploaded and synced to database!' : 'নতুন লোগো আপলোড ও ডাটাবেজে সংরক্ষিত হয়েছে!');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      alert(language === 'en' ? 'Failed to upload logo image' : 'লোগো ছবি আপলোড ব্যর্থ হয়েছে।');
    } finally {
      setIsUploading(false);
    }
  };

  // Permanent Delete: Deletes from BOTH website storage and database
  const handleDeleteLogoPermanently = async () => {
    if (!branding.logoUrl) return;

    if (!confirm(language === 'en'
      ? 'Are you sure you want to permanently delete this logo from BOTH website and database?'
      : 'আপনি কি ওয়েবসাইট ও ডাটাবেজ উভয় স্থান থেকেই এই লোগোটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await StorageService.deleteBrandingLogo();
      setBranding((prev) => ({
        ...prev,
        logoUrl: ''
      }));

      if (onShowToast) {
        onShowToast(language === 'en'
          ? 'Logo permanently deleted from website and database!'
          : 'লোগোটি ওয়েবসাইট ও ডাটাবেজ উভয় স্থান থেকেই সম্পূর্ণ মুছে ফেলা হয়েছে!');
      }
    } catch (err) {
      console.error('Delete logo error:', err);
      alert(language === 'en' ? 'Failed to delete logo.' : 'লোগো ডিলিট করতে সমস্যা হয়েছে।');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await StorageService.saveBranding(branding);
      if (onShowToast) {
        onShowToast(language === 'en' ? 'Branding settings updated!' : 'লোগো ও ব্র্যান্ড সফলভাবে সংরক্ষিত হয়েছে!');
      }
    } catch (err) {
      console.error('Save branding error:', err);
      if (onShowToast) {
        onShowToast(language === 'en' ? 'Saved locally. Supabase error: ' + err.message : 'ডাটাবেজে সেভ হতে সমস্যা হয়েছে।');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default (Clean reset from database & local)
  const handleReset = async () => {
    if (confirm(language === 'en' 
      ? 'Reset branding and logo to default on both website and database?' 
      : 'ওয়েবসাইট ও ডাটাবেজ উভয় স্থান থেকেই কি লোগো ও ব্র্যান্ড ডিফল্ট মানে রিসেট করতে চান?')) {
      try {
        if (branding.logoUrl && branding.logoUrl.includes('/agency-media/')) {
          await removeStorageFiles(branding.logoUrl);
        }
        await StorageService.saveBranding(DEFAULT_BRANDING);
        setBranding(DEFAULT_BRANDING);
        if (onShowToast) {
          onShowToast(language === 'en' ? 'Reset to default branding!' : 'ডিফল্ট ব্র্যান্ডিং ফিরিয়ে আনা হয়েছে!');
        }
      } catch (err) {
        console.error('Reset error:', err);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png,image/svg+xml,image/jpeg,image/webp" 
        className="hidden" 
      />

      {/* ========================================================================= */}
      {/* HEADER & TOP ACTIONS                                                     */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#69EBDA]/20 to-teal-400/20 flex items-center justify-center text-[#69EBDA]">
              <Palette className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {language === 'en' ? 'Customize Logo & Branding' : 'কাস্টমাইজ লোগো ও ব্র্যান্ড'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'en'
              ? 'Upload your logo image, adjust dimensions (height & width), and configure brand text.'
              : 'লোগো ছবি আপলোড করুন, উচ্চতা ও প্রস্থ নির্ধারণ করুন এবং ব্র্যান্ড নাম ও ট্যাগলাইন সাজান।'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="ডিফল্ট ফিরিয়ে আনুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Reset' : 'রিসেট'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#69EBDA] to-teal-400 hover:from-[#69EBDA] hover:to-teal-300 shadow-md shadow-[#69EBDA]/25 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>{language === 'en' ? 'Saving...' : 'সেভ হচ্ছে...'}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Save Changes' : 'পরিবর্তন সেভ করুন'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. INTERACTIVE LIVE NAVBAR PREVIEW                                        */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#69EBDA]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              {language === 'en' ? 'Live Navbar Preview' : 'লাইভ ন্যাভবার প্রিভিউ'}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[#69EBDA]/15 text-[#69EBDA] text-[10px] font-bold">
              {branding.logoWidth}px × {branding.logoHeight}px
            </span>
          </div>

          {/* Background Toggle for Preview */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setPreviewBg('dark')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                previewBg === 'dark' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ডার্ক ন্যাভবার
            </button>
            <button
              type="button"
              onClick={() => setPreviewBg('light')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                previewBg === 'light' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              লিকুইড গ্লাস
            </button>
          </div>
        </div>

        {/* Mock Navbar Container */}
        <div className={`p-4 sm:p-6 rounded-2xl border transition-all ${
          previewBg === 'dark'
            ? 'bg-[#0B132B] border-slate-800'
            : 'bg-[#5C6977] border-[#69EBDA]/40'
        }`}>
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-white/20 shadow-xl max-w-2xl mx-auto">
            
            {/* Live Brand Unit */}
            <div className="flex items-center gap-3">
              {branding.logoUrl ? (
                <div 
                  className="flex items-center justify-center shrink-0 overflow-hidden rounded-xl"
                  style={{
                    width: `${branding.logoWidth}px`,
                    height: `${branding.logoHeight}px`
                  }}
                >
                  <img
                    src={branding.logoUrl}
                    alt={branding.brandName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div 
                  className="relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#69EBDA] to-cyan-400 p-[1px] shadow-lg shadow-[#69EBDA]/30 shrink-0"
                  style={{
                    width: `${branding.logoWidth}px`,
                    height: `${branding.logoHeight}px`
                  }}
                >
                  <div className="w-full h-full bg-slate-950/80 rounded-[15px] flex items-center justify-center backdrop-blur-sm">
                    <Compass className="text-[#69EBDA]" style={{ width: `${Math.max(14, Math.round(branding.logoWidth * 0.45))}px`, height: `${Math.max(14, Math.round(branding.logoHeight * 0.45))}px` }} />
                  </div>
                </div>
              )}

              {/* Brand Text Info */}
              <div className="flex flex-col">
                <span 
                  className="text-base sm:text-lg font-extrabold tracking-wider flex items-center gap-1 font-['Outfit',sans-serif] leading-tight"
                  style={{ color: branding.textColor }}
                >
                  {branding.brandName || 'AETHERIA'}
                  <span 
                    className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                    style={{ backgroundColor: branding.accentColor }}
                  />
                </span>
                <span 
                  className="text-[9px] sm:text-[10px] tracking-[0.25em] font-bold uppercase"
                  style={{ color: branding.accentColor }}
                >
                  {branding.tagline || 'অভিজাত বিশ্বভ্রমণ'}
                </span>
              </div>
            </div>

            {/* Mock Nav Links Placeholder */}
            <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-slate-300">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-white">হোম</span>
              <span className="text-slate-400">প্যাকেজ</span>
              <span className="text-slate-400">যোগাযোগ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LOGO IMAGE & SIZING CONTROLS (CLEAN 2-COLUMN LAYOUT)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* COLUMN 1: লোগো ছবি পরিবর্তন (Upload / Image Source) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#69EBDA]" />
              <span>{language === 'en' ? 'Logo Image Source' : 'লোগো ছবি বা আইকন'}</span>
            </label>
            {branding.logoUrl && (
              <button
                type="button"
                onClick={handleDeleteLogoPermanently}
                disabled={isDeleting || isUploading}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="ওয়েবসাইট ও ডাটাবেজ উভয় স্থান থেকেই লোগো মুছে ফেলুন"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isDeleting ? 'ডিলিট হচ্ছে...' : (language === 'en' ? 'Delete Logo' : 'লোগো মুছে ফেলুন')}</span>
              </button>
            )}
          </div>

          {/* Current Logo Preview Box & Upload Button */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center p-2 overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#69EBDA] to-cyan-400 p-[1px] flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                    <Compass className="w-6 h-6 text-[#69EBDA]" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {branding.logoUrl ? 'কাস্টম লোগো ছবি সক্রিয়' : 'ডিফল্ট কম্পাস ব্যাজ সক্রিয়'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                স্বচ্ছ ব্যাকগ্রাউন্ডের PNG, SVG বা WebP ছবি সবচেয়ে সুন্দর দেখাবে।
              </p>

              <div className="flex items-center gap-2 justify-center sm:justify-start pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isDeleting}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 cursor-pointer shadow-sm disabled:opacity-60 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-[#69EBDA]" />
                  <span>
                    {isUploading 
                      ? (language === 'en' ? 'Uploading...' : 'আপলোড হচ্ছে...') 
                      : (branding.logoUrl 
                          ? (language === 'en' ? 'Change Photo' : 'ছবি পরিবর্তন করুন') 
                          : (language === 'en' ? 'Upload Photo' : 'ছবি আপলোড করুন'))}
                  </span>
                </button>

                {branding.logoUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteLogoPermanently}
                    disabled={isDeleting || isUploading}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition-colors"
                    title={language === 'en' ? 'Permanently delete logo from website and database' : 'ওয়েবসাইট ও ডাটাবেজ উভয় স্থান থেকেই লোগো স্থায়ীভাবে মুছে ফেলুন'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {isDeleting 
                        ? (language === 'en' ? 'Deleting...' : 'ডিলিট হচ্ছে...') 
                        : (language === 'en' ? 'Delete Logo' : 'লোগো ডিলিট করুন')}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Direct URL Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              {language === 'en' ? 'Or Paste Logo Image URL:' : 'অথবা ছবির ডিরেক্ট লিংক (URL):'}
            </label>
            <input
              type="text"
              value={branding.logoUrl}
              onChange={(e) => updateField('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#69EBDA]"
            />
          </div>
        </div>

        {/* COLUMN 2: সাইজ ও ডাইমেনশন (Height & Width) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#69EBDA]" />
              <span>{language === 'en' ? 'Dimensions (Height & Width)' : 'লোগো সাইজ (উচ্চতা ও প্রস্থ)'}</span>
            </label>

            {/* Lock Aspect Ratio Toggle */}
            <button
              type="button"
              onClick={() => setLockAspectRatio(!lockAspectRatio)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                lockAspectRatio
                  ? 'bg-[#69EBDA]/15 text-[#69EBDA] border-[#69EBDA]/40'
                  : 'text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
              title="উচ্চতা ও প্রস্থ সমানুপাতে লক/আনলক"
            >
              {lockAspectRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              <span>{lockAspectRatio ? 'সমানুপাতিক লক' : 'ফ্রি সাইজ'}</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {language === 'en' ? 'Quick Size Presets:' : 'রেডিমেড সাইজ চয়েস:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {HEIGHT_PRESETS.map((p) => {
                const isSelected = branding.logoHeight === p.height && branding.logoWidth === p.width;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Height Slider & Number Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>{language === 'en' ? 'Height (উচ্চতা):' : 'লোগো উচ্চতা (Height):'}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="16"
                  max="120"
                  value={branding.logoHeight}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-14 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center text-xs font-bold text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-400">px</span>
              </div>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              value={branding.logoHeight}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="w-full accent-[#69EBDA] cursor-pointer"
            />
          </div>

          {/* Width Slider & Number Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>{language === 'en' ? 'Width (প্রস্থ):' : 'লোগো প্রস্থ (Width):'}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="16"
                  max="260"
                  value={branding.logoWidth}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-14 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center text-xs font-bold text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-400">px</span>
              </div>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              value={branding.logoWidth}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="w-full accent-[#69EBDA] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BRAND NAME & TAGLINE TEXT SETTINGS (লোগোর নাম টেক্সট)                 */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Type className="w-4 h-4 text-[#69EBDA]" />
            <span>{language === 'en' ? 'Brand Name & Tagline Text' : 'ব্র্যান্ড নেম ও ট্যাগলাইন টেক্সট'}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand Name Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              {language === 'en' ? 'Brand Name (লোগোর মূল নাম):' : 'লোগোর নাম (Brand Name):'}
            </label>
            <input
              type="text"
              value={branding.brandName}
              onChange={(e) => updateField('brandName', e.target.value)}
              placeholder="AETHERIA"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-[#69EBDA]"
            />
          </div>

          {/* Tagline Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              {language === 'en' ? 'Sub Tagline (স্লোগান / ট্যাগলাইন):' : 'স্লোগান / ট্যাগলাইন:'}
            </label>
            <input
              type="text"
              value={branding.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              placeholder="অভিজাত বিশ্বভ্রমণ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#69EBDA]"
            />
          </div>
        </div>

        {/* Colors Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/70 dark:border-slate-800">
          {/* Brand Name Color */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>{language === 'en' ? 'Brand Name Color:' : 'ব্র্যান্ড নামের রঙ:'}</span>
              <span className="font-mono text-[10px] text-slate-400">{branding.textColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.textColor}
                onChange={(e) => updateField('textColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent p-0 shrink-0"
              />
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => updateField('textColor', p.value)}
                    className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                      branding.textColor === p.value ? 'scale-110 ring-2 ring-[#69EBDA]' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: p.value }}
                    title={p.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Accent / Tagline Color */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>{language === 'en' ? 'Accent / Tagline Color:' : 'ট্যাগলাইন ও ডট অ্যাকসেন্ট রঙ:'}</span>
              <span className="font-mono text-[10px] text-slate-400">{branding.accentColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => updateField('accentColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent p-0 shrink-0"
              />
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => updateField('accentColor', p.value)}
                    className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                      branding.accentColor === p.value ? 'scale-110 ring-2 ring-[#69EBDA]' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: p.value }}
                    title={p.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
