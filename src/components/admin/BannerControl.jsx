import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  Bold, 
  Type, 
  Palette, 
  Compass, 
  Eye, 
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { DEFAULT_HERO_BANNER } from '../../data/travelData';
import { supabase, uploadMediaFile, rowToHeroBanner } from '../../services/supabaseClient';

// Quick aesthetic color presets
const COLOR_PRESETS = [
  { label: 'হোয়াইট', value: '#FFFFFF' },
  { label: 'সায়ান', value: '#69EBDA' },
  { label: 'স্কাই ব্লু', value: '#38BDF8' },
  { label: 'এমারেল্ড', value: '#34D399' },
  { label: 'অ্যাম্বার', value: '#FBBF24' },
  { label: 'রোজ', value: '#FB7185' },
  { label: 'সিলভার', value: '#94A3B8' }
];

// Font size options for main headline
const HEADLINE_SIZES = [
  { id: '2xl', label: '2XL' },
  { id: '3xl', label: '3XL' },
  { id: '4xl', label: '4XL' },
  { id: '5xl', label: '5XL' },
  { id: '6xl', label: '6XL' }
];

// Font size options for subtitle
const SUBTITLE_SIZES = [
  { id: 'sm', label: 'ছোট (SM)' },
  { id: 'base', label: 'স্বাভাবিক (Base)' },
  { id: 'lg', label: 'মাঝারি (LG)' },
  { id: 'xl', label: 'বড় (XL)' }
];

export const BannerControl = ({ language = 'bn', isLight = false, onShowToast }) => {
  const [bannerData, setBannerData] = useState(() => StorageService.getHeroBanner());
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSlideId, setUploadingSlideId] = useState(null);
  const fileInputRef = useRef(null);
  const currentUploadTargetRef = useRef(null);

  // Sync with Supabase on mount and listen to realtime updates
  useEffect(() => {
    // Initial fetch from Supabase
    if (supabase) {
      supabase
        .from('hero_banner')
        .select('*')
        .eq('id', 'primary')
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data) {
            const mapped = rowToHeroBanner(data);
            setBannerData(mapped);
            localStorage.setItem('aetheria_hero_banner_db', JSON.stringify(mapped));
          }
        });

      // Realtime subscription
      const channel = supabase
        .channel('banner-control-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'hero_banner' },
          (payload) => {
            if (payload.new) {
              const mapped = rowToHeroBanner(payload.new);
              setBannerData(mapped);
              localStorage.setItem('aetheria_hero_banner_db', JSON.stringify(mapped));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Update banner data field helper
  const updateField = (field, value) => {
    setBannerData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Update slide item helper
  const updateSlide = (slideId, field, value) => {
    setBannerData((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === slideId ? { ...s, [field]: value } : s))
    }));
  };

  // Add new slide
  const handleAddSlide = () => {
    const newSlide = {
      id: `banner-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85',
      title: 'নতুন গন্তব্য শিরোনাম',
      location: 'স্থানের নাম ও বিবরণ'
    };
    setBannerData((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setActiveSlideIndex(bannerData.slides.length);
  };

  // Delete slide
  const handleDeleteSlide = (slideId) => {
    if (bannerData.slides.length <= 1) {
      alert(language === 'en' ? 'At least one banner slide is required!' : 'কমপক্ষে একটি ব্যানার স্লাইড থাকা আবশ্যক!');
      return;
    }
    setBannerData((prev) => ({
      ...prev,
      slides: prev.slides.filter((s) => s.id !== slideId)
    }));
    if (activeSlideIndex >= bannerData.slides.length - 1) {
      setActiveSlideIndex(Math.max(0, bannerData.slides.length - 2));
    }
  };

  // File upload trigger
  const handleTriggerUpload = (slideId) => {
    currentUploadTargetRef.current = slideId;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // File upload handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    const targetSlideId = currentUploadTargetRef.current;
    if (!file || !targetSlideId) return;

    try {
      setUploadingSlideId(targetSlideId);
      const res = await uploadMediaFile(file, 'banners');
      const publicUrl = res?.url || res;
      updateSlide(targetSlideId, 'url', publicUrl);
      if (onShowToast) {
        onShowToast(language === 'en' ? 'Banner image uploaded successfully!' : 'ব্যানার ছবি সফলভাবে আপলোড হয়েছে!');
      }
    } catch (err) {
      console.error('Banner upload error:', err);
      alert(language === 'en' ? 'Image upload failed. Please try again.' : 'ছবি আপলোড ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setUploadingSlideId(null);
    }
  };

  // Save changes to localStorage & Supabase
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await StorageService.saveHeroBanner(bannerData);
      if (onShowToast) {
        onShowToast(language === 'en' ? 'Hero Banner updated successfully!' : 'হিরো ব্যানার সফলভাবে সংরক্ষিত হয়েছে!');
      }
    } catch (err) {
      console.error('Save error:', err);
      if (onShowToast) {
        onShowToast(language === 'en' ? 'Saved locally. Supabase error: ' + err.message : 'ডাটাবেজে সেভ হতে সমস্যা হয়েছে।');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleReset = () => {
    if (confirm(language === 'en' ? 'Reset all banner texts and slides to defaults?' : 'আপনি কি সমস্ত ব্যানার টেক্সট ও স্লাইড ডিফল্টে রিসেট করতে চান?')) {
      setBannerData(DEFAULT_HERO_BANNER);
      setActiveSlideIndex(0);
    }
  };

  const slides = bannerData.slides || [];
  const currentSlide = slides[activeSlideIndex] || slides[0] || {};

  // Headline font size class mapper for preview
  const getHeadlineSizeClass = (size) => {
    switch (size) {
      case '2xl': return 'text-xl sm:text-2xl md:text-3xl';
      case '3xl': return 'text-2xl sm:text-3xl md:text-4xl';
      case '4xl': return 'text-2xl sm:text-4xl md:text-5xl';
      case '5xl': return 'text-3xl sm:text-5xl md:text-6xl';
      case '6xl': return 'text-4xl sm:text-6xl md:text-7xl';
      default: return 'text-2xl sm:text-4xl md:text-5xl';
    }
  };

  // Subtitle font size class mapper for preview
  const getSubtitleSizeClass = (size) => {
    switch (size) {
      case 'sm': return 'text-xs sm:text-sm';
      case 'base': return 'text-sm sm:text-base';
      case 'lg': return 'text-base sm:text-lg';
      case 'xl': return 'text-lg sm:text-xl';
      default: return 'text-sm sm:text-base';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden file input for slide image uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* ========================================================================= */}
      {/* HEADER & MAIN ACTIONS                                                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#69EBDA]/20 to-teal-400/20 flex items-center justify-center text-[#69EBDA]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {language === 'en' ? 'Hero Banner Controller' : 'হিরো ব্যানার কন্ট্রোল'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'en' 
              ? 'Customize hero titles, colors, font sizes, weights, and curated banner photo slides.' 
              : 'ওয়েবসাইটের হিরো ব্যানারের শিরোনাম, টেক্সট সাইজ, কালার, বোল্ড ও ফটো স্লাইড পরিবর্তন করুন।'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="ডিফল্ট মান ফিরিয়ে আনুন"
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
      {/* 1. INTERACTIVE LIVE BANNER PREVIEW                                        */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-lg bg-slate-950 text-white">
        {/* Live Badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-[#69EBDA]/40 text-[10px] font-bold text-[#69EBDA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#69EBDA] animate-pulse" />
          <span>{language === 'en' ? 'Live Storefront Preview' : 'লাইভ প্রিভিউ'}</span>
        </div>

        {/* Slide Selector Pills at Top Right */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs">
          <span className="text-[10px] text-slate-400 font-bold px-1">
            {activeSlideIndex + 1} / {slides.length}
          </span>
          <button 
            type="button" 
            onClick={() => setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
            className="p-1 hover:text-[#69EBDA] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button" 
            onClick={() => setActiveSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0))}
            className="p-1 hover:text-[#69EBDA] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Background Image Container */}
        <div 
          className="relative min-h-[340px] sm:min-h-[380px] flex flex-col justify-center items-center text-center p-6 sm:p-10 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('${currentSlide.url}')` }}
        >
          {/* Deep Dark Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/75 backdrop-blur-[1px]" />

          {/* Foreground Live Content */}
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            {/* Headline */}
            <h2 
              className={`font-['Outfit',sans-serif] leading-tight transition-all drop-shadow-md ${getHeadlineSizeClass(bannerData.headlineSize)}`}
              style={{
                color: bannerData.headlineColor,
                fontWeight: bannerData.headlineBold ? '800' : '400'
              }}
            >
              {bannerData.headline || 'সবার মুখে মুখে ফেরা'}
              <br />
              <span 
                className="drop-shadow-sm transition-all"
                style={{
                  color: bannerData.highlightColor,
                  fontWeight: bannerData.headlineBold ? '800' : '400'
                }}
              >
                {bannerData.headlineHighlight || 'স্বপ্নের ভ্রমণ অভিজ্ঞতা'}
              </span>
            </h2>

            {/* Subtitle */}
            <p 
              className={`max-w-xl mx-auto leading-relaxed transition-all drop-shadow-sm ${getSubtitleSizeClass(bannerData.subtitleSize)}`}
              style={{
                color: bannerData.subtitleColor,
                fontWeight: bannerData.subtitleBold ? '700' : '400'
              }}
            >
              {bannerData.subtitle || 'শীর্ষস্থানীয় ট্রাভেল স্থপতিদের নিখুঁত পরিকল্পনায় অংশ নিন...'}
            </p>

            {/* Current Slide Location Indicator */}
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#69EBDA]" />
                <span>{currentSlide.location || 'বোরা বোরা ও মালদ্বীপ'}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] text-[#69EBDA] font-semibold">{currentSlide.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TEXT CONTENT & STYLING EDITORS (MINIMAL, CLEAN UI)                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* CARD A: মূল শিরোনাম (Headline) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Type className="w-4 h-4 text-[#69EBDA]" />
              <span>{language === 'en' ? 'Primary Headline Text' : 'মূল শিরোনাম টেক্সট'}</span>
            </label>
            
            {/* Bold Toggle */}
            <button
              type="button"
              onClick={() => updateField('headlineBold', !bannerData.headlineBold)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                bannerData.headlineBold
                  ? 'bg-[#69EBDA]/20 text-[#69EBDA] border-[#69EBDA]/50'
                  : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-200'
              }`}
              title="বোল্ড অন/অফ"
            >
              <Bold className="w-3 h-3" />
              <span>{language === 'en' ? 'Bold' : 'বোল্ড'}</span>
            </button>
          </div>

          <input
            type="text"
            value={bannerData.headline}
            onChange={(e) => updateField('headline', e.target.value)}
            placeholder="সবার মুখে মুখে ফেরা"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#69EBDA]"
          />

          {/* Headline Font Size Selector */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {language === 'en' ? 'Font Size:' : 'ফন্ট সাইজ:'}
            </div>
            <div className="flex items-center gap-1.5">
              {HEADLINE_SIZES.map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => updateField('headlineSize', sz.id)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    bannerData.headlineSize === sz.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          {/* Headline Color Picker & Presets */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>{language === 'en' ? 'Text Color:' : 'টেক্সট কালার:'}</span>
              <span className="font-mono text-[10px] text-slate-400">{bannerData.headlineColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bannerData.headlineColor}
                onChange={(e) => updateField('headlineColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent p-0 shrink-0"
              />
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => updateField('headlineColor', p.value)}
                    className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                      bannerData.headlineColor === p.value ? 'scale-110 ring-2 ring-[#69EBDA]' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: p.value }}
                    title={p.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CARD B: হাইলাইট টেক্সট (Highlight Phrase) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#69EBDA]" />
              <span>{language === 'en' ? 'Highlight Accent Phrase' : 'হাইলাইট অ্যাকসেন্ট টেক্সট'}</span>
            </label>
          </div>

          <input
            type="text"
            value={bannerData.headlineHighlight}
            onChange={(e) => updateField('headlineHighlight', e.target.value)}
            placeholder="স্বপ্নের ভ্রমণ অভিজ্ঞতা"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#69EBDA]"
          />

          {/* Highlight Color Picker & Presets */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>{language === 'en' ? 'Highlight Color:' : 'হাইলাইট কালার:'}</span>
              <span className="font-mono text-[10px] text-slate-400">{bannerData.highlightColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bannerData.highlightColor}
                onChange={(e) => updateField('highlightColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent p-0 shrink-0"
              />
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => updateField('highlightColor', p.value)}
                    className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                      bannerData.highlightColor === p.value ? 'scale-110 ring-2 ring-[#69EBDA]' : 'border-slate-300 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: p.value }}
                    title={p.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Subtitle / Description Section */}
          <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                {language === 'en' ? 'Subtitle Description' : 'সাবটাইটেল / সংক্ষিপ্ত বিবরণ'}
              </label>
              
              <button
                type="button"
                onClick={() => updateField('subtitleBold', !bannerData.subtitleBold)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  bannerData.subtitleBold
                    ? 'bg-[#69EBDA]/20 text-[#69EBDA] border-[#69EBDA]/50'
                    : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-200'
                }`}
                title="সাবটাইটেল বোল্ড"
              >
                <Bold className="w-3 h-3" />
                <span>{language === 'en' ? 'Bold' : 'বোল্ড'}</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={bannerData.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="শীর্ষস্থানীয় ট্রাভেল স্থপতিদের নিখুঁত পরিকল্পনায় অংশ নিন..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#69EBDA]"
            />

            {/* Subtitle Font Size */}
            <div className="flex items-center gap-1.5">
              {SUBTITLE_SIZES.map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => updateField('subtitleSize', sz.id)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    bannerData.subtitleSize === sz.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BANNER SLIDES MANAGER (PHOTO, TITLE, LOCATION & DIRECT UPLOAD)         */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#69EBDA]" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {language === 'en' ? 'Rotating Banner Photo Slides' : 'ঘূর্ণায়মান ফটো স্লাইডসমূহ'}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
              {slides.length} {language === 'en' ? 'slides' : 'টি স্লাইড'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddSlide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-[#69EBDA] hover:bg-teal-300 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Add Slide' : 'নতুন স্লাইড'}</span>
          </button>
        </div>

        {/* Slide Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide, idx) => {
            const isSelected = activeSlideIndex === idx;
            const isUploading = uploadingSlideId === slide.id;

            return (
              <div
                key={slide.id}
                className={`relative rounded-xl p-3 border transition-all ${
                  isSelected
                    ? 'border-[#69EBDA] bg-[#69EBDA]/5 dark:bg-[#69EBDA]/10 ring-1 ring-[#69EBDA]/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'
                }`}
              >
                {/* Top Image Preview & Upload Button */}
                <div className="relative h-32 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 mb-3 group">
                  <img
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />

                  {/* Scrim Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTriggerUpload(slide.id)}
                      disabled={isUploading}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 text-white text-[11px] font-bold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer shadow-md"
                    >
                      <Upload className="w-3 h-3 text-[#69EBDA]" />
                      <span>{isUploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}</span>
                    </button>
                  </div>

                  {/* Slide number badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white">
                    #{idx + 1}
                  </span>

                  {/* Preview selection button */}
                  <button
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-[#69EBDA] text-slate-950 font-black' 
                        : 'bg-slate-900/80 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'প্রিভিউতে আছে' : 'প্রিভিউ দেখুন'}
                  </button>
                </div>

                {/* Title & Location Inputs */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                      {language === 'en' ? 'Slide Title:' : 'স্লাইড শিরোনাম:'}
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                      placeholder="ট্রপিক্যাল নীল উপহ্রদ"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#69EBDA]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                      {language === 'en' ? 'Location Info:' : 'স্থান / লোকেশন:'}
                    </label>
                    <input
                      type="text"
                      value={slide.location}
                      onChange={(e) => updateSlide(slide.id, 'location', e.target.value)}
                      placeholder="বোরা বোরা ও মালদ্বীপ"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#69EBDA]"
                    />
                  </div>

                  {/* Direct Image URL Input */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                      {language === 'en' ? 'Image URL:' : 'ছবির লিংক (URL):'}
                    </label>
                    <input
                      type="text"
                      value={slide.url}
                      onChange={(e) => updateSlide(slide.id, 'url', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#69EBDA]"
                    />
                  </div>

                  {/* Card Bottom: Delete Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 mt-2">
                    <button
                      type="button"
                      onClick={() => handleTriggerUpload(slide.id)}
                      className="text-[11px] font-bold text-[#69EBDA] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{language === 'en' ? 'Upload Photo' : 'ছবি আপলোড'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                      title="স্লাইড মুছে ফেলুন"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{language === 'en' ? 'Delete' : 'ডিলিট'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
