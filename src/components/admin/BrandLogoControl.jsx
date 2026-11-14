import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Upload,
  Link2,
  Save,
  Trash2,
  Edit3,
  X,
  Image as ImageIcon,
  Plus,
  Loader2
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { uploadMediaFile } from '../../services/supabaseClient';

export const BrandLogoControl = ({ language = 'bn', isLight = false, onShowToast }) => {
  const [brandLogos, setBrandLogos] = useState(() => StorageService.getBrandLogos());
  const [editingId, setEditingId] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const sync = () => setBrandLogos(StorageService.getBrandLogos());
    window.addEventListener('app:brand-logos-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('app:brand-logos-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setBrandName('');
    setLogoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadMediaFile(file, 'brands');
      if (result?.url) {
        setLogoUrl(result.url);
        onShowToast?.(
          language === 'en'
            ? 'Brand logo photo uploaded successfully!'
            : 'ব্র্যান্ড লোগো ফটো সফলভাবে আপলোড হয়েছে!'
        );
      }
    } catch (err) {
      console.error('Brand logo upload failed:', err);
      onShowToast?.(
        language === 'en'
          ? 'Failed to upload logo photo.'
          : 'লোগো ফটো আপলোড করতে সমস্যা হয়েছে।'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!logoUrl.trim() && !brandName.trim()) {
      onShowToast?.(
        language === 'en'
          ? 'Please provide a brand name or logo photo/link.'
          : 'অনুগ্রহ করে ব্র্যান্ডের নাম অথবা লোগো ফটো/লিংক দিন।'
      );
      return;
    }

    setIsSaving(true);
    try {
      await StorageService.saveBrandLogo({
        ...(editingId ? { id: editingId } : {}),
        name: brandName.trim() || 'Partner Brand',
        logoUrl: logoUrl.trim()
      });

      onShowToast?.(
        editingId
          ? language === 'en'
            ? 'Brand logo updated in real time!'
            : 'ব্র্যান্ড লোগো রিয়েলটাইম আপডেট হয়েছে!'
          : language === 'en'
            ? 'Brand logo added & published in real time!'
            : 'নতুন ব্র্যান্ড লোগো ওয়েবসাইটে রিয়েলটাইম যুক্ত হয়েছে!'
      );
      resetForm();
    } catch (err) {
      console.error('Save brand logo error:', err);
      onShowToast?.(
        language === 'en'
          ? 'Failed to save brand logo.'
          : 'ব্র্যান্ড লোগো সেভ করতে সমস্যা হয়েছে।'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingId(brand.id);
    setBrandName(brand.name || '');
    setLogoUrl(brand.logoUrl || '');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (brand) => {
    setDeletingId(brand.id);
    try {
      await StorageService.deleteBrandLogo(brand);
      if (editingId === brand.id) resetForm();
      onShowToast?.(
        language === 'en'
          ? 'Brand logo deleted!'
          : 'ব্র্যান্ড লোগো ডিলিট করা হয়েছে!'
      );
    } catch (err) {
      console.error('Delete brand logo error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const cardBg = isLight
    ? 'bg-white border-slate-200 shadow-xs'
    : 'bg-slate-900/80 border-slate-800';
  const inputCls = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#69EBDA]'
    : 'bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-[#69EBDA]';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-3xl border ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#69EBDA]/15 border border-[#69EBDA]/30 flex items-center justify-center text-[#69EBDA] shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {language === 'en' ? 'Add Brand Logo' : 'ব্র্যান্ড লোগো ম্যানেজমেন্ট'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {language === 'en'
                  ? 'Upload brand logos or paste image links to show in the footer partner section.'
                  : 'ফুটারের উপরের ব্র্যান্ড সেকশনে পার্টনার কোম্পানির লোগো আপলোড বা লিংক বসিয়ে রিয়েলটাইমে প্রকাশ করুন।'}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#69EBDA]/15 text-[#69EBDA] border border-[#69EBDA]/30 self-start sm:self-center">
            {brandLogos.length} {language === 'en' ? 'Brands' : 'টি ব্র্যান্ড'}
          </span>
        </div>
      </div>

      {/* Add / Edit Form */}
      <form ref={formRef} onSubmit={handleSave} className={`p-6 rounded-3xl border space-y-5 ${cardBg}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#69EBDA]" />
            <span key={editingId ? 'edit-heading' : 'add-heading'}>
              {editingId
                ? language === 'en'
                  ? 'Edit Brand Logo'
                  : 'ব্র্যান্ড লোগো এডিট করুন'
                : language === 'en'
                  ? 'Add New Brand Logo'
                  : 'নতুন ব্র্যান্ড লোগো যোগ করুন'}
            </span>
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              {language === 'en' ? 'Cancel Edit' : 'বাতিল'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">
              {language === 'en' ? 'Brand / Company Name' : 'ব্র্যান্ড / কোম্পানির নাম'}
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder={language === 'en' ? 'e.g. Biman Bangladesh' : 'যেমন: Biman Bangladesh / US-Bangla'}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-colors ${inputCls}`}
            />
          </div>

          {/* Photo Link URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400">
              {language === 'en' ? 'Logo Photo Link (URL)' : 'লোগো ফটো লিংক (URL)'}
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/brand-logo.png"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-colors ${inputCls}`}
              />
            </div>
          </div>
        </div>

        {/* Upload Button & Preview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#69EBDA]/15 text-[#69EBDA] border border-[#69EBDA]/35 hover:bg-[#69EBDA]/25 transition-all cursor-pointer disabled:opacity-60"
            >
              <span className="inline-flex items-center">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              </span>
              <span key={isUploading ? 'uploading-lbl' : 'upload-lbl'}>
                {isUploading
                  ? language === 'en'
                    ? 'Uploading...'
                    : 'আপলোড হচ্ছে...'
                  : language === 'en'
                    ? 'Upload Logo Photo'
                    : 'লোগো ফটো আপলোড করুন'}
              </span>
            </button>

            {logoUrl && (
              <div className="h-12 px-3 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                <img src={logoUrl} alt="Preview" className="max-h-10 max-w-[120px] object-contain" />
              </div>
            )}
            {!logoUrl && (
              <div className="h-12 px-3 rounded-xl border border-dashed border-slate-600/50 flex items-center gap-1.5 text-xs text-slate-400">
                <ImageIcon className="w-4 h-4" />
                <span>{language === 'en' ? 'No logo selected' : 'প্রিভিউ'}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 shadow-lg shadow-[#69EBDA]/25 hover:brightness-105 transition-all cursor-pointer disabled:opacity-60"
          >
            <span className="inline-flex items-center">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </span>
            <span key={editingId ? 'update-btn' : 'save-btn'}>
              {editingId
                ? language === 'en'
                  ? 'Update Brand Logo'
                  : 'ব্র্যান্ড লোগো আপডেট করুন'
                : language === 'en'
                  ? 'Save Brand Logo'
                  : 'ব্র্যান্ড লোগো সেভ করুন'}
            </span>
          </button>
        </div>
      </form>

      {/* Existing Brand Logos List */}
      <div className={`p-6 rounded-3xl border space-y-4 ${cardBg}`}>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          {language === 'en' ? 'Published Brand Logos' : 'ওয়েবসাইটে যুক্ত ব্র্যান্ড লোগো সমূহ'}
        </h3>

        {brandLogos.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400 border border-dashed border-slate-700/60 rounded-2xl">
            {language === 'en'
              ? 'No brand logos added yet. Add one above!'
              : 'এখনো কোনো ব্র্যান্ড লোগো যোগ করা হয়নি। উপর থেকে নতুন লোগো যোগ করুন।'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {brandLogos.map((brand) => (
              <div
                key={brand.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-950/60 border-slate-800 hover:border-[#69EBDA]/40'
                }`}
              >
                <div className="h-20 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center p-2 overflow-hidden">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-500">{brand.name}</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {brand.name || 'Partner Brand'}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(brand)}
                      className="p-1.5 rounded-lg bg-[#69EBDA]/15 text-[#69EBDA] hover:bg-[#69EBDA]/30 transition-colors cursor-pointer"
                      title={language === 'en' ? 'Edit' : 'এডিট'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === brand.id}
                      onClick={() => handleDelete(brand)}
                      className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 transition-colors cursor-pointer disabled:opacity-50"
                      title={language === 'en' ? 'Delete' : 'ডিলিট'}
                    >
                      {deletingId === brand.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
