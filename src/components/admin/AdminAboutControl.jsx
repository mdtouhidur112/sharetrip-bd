import React, { useState, useEffect } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Users,
  Compass,
  Award,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { uploadMediaFile } from '../../services/supabaseClient';
import { DEFAULT_ABOUT_PAGE_DATA } from '../../data/aboutDefaultData';

const ABOUT_TABS = [
  { id: 'general', labelBn: 'জেনারেল ও হিরো', labelEn: 'General & Hero', icon: FileText },
  { id: 'media', labelBn: 'ফটো গ্যালারি ও টিম', labelEn: 'Photos & Team', icon: ImageIcon },
  { id: 'overview', labelBn: 'ওভারভিউ ও মিশন', labelEn: 'Overview & Mission', icon: Users },
  { id: 'services', labelBn: 'সার্ভিস ও পার্টনারশিপ', labelEn: 'Services & Partnership', icon: Compass },
  { id: 'benefits', labelBn: 'সুবিধা ও CTA', labelEn: 'Benefits & CTA', icon: Award }
];

export const AdminAboutControl = ({ language = 'bn', isLight = false, onShowToast }) => {
  const [form, setForm] = useState(() => StorageService.getAboutPage());
  const [subTab, setSubTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [newActivity, setNewActivity] = useState('');

  useEffect(() => {
    const sync = () => setForm(StorageService.getAboutPage());
    window.addEventListener('app:about-page-updated', sync);
    return () => window.removeEventListener('app:about-page-updated', sync);
  }, []);

  const persist = async (nextData, msg) => {
    setIsSaving(true);
    try {
      const saved = await StorageService.saveAboutPage(nextData);
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
        ? 'About Page saved & synced in real time!'
        : 'About পেজের সব পরিবর্তন সেভ ও রিয়েলটাইম সিঙ্ক হয়েছে!'
    );
  };

  const handleReset = () => {
    persist(
      DEFAULT_ABOUT_PAGE_DATA,
      language === 'en'
        ? 'About Page restored to default.'
        : 'About পেজ ডিফল্ট তথ্যে রিস্টোর করা হয়েছে।'
    );
  };

  const handleUpload = async (file, key, onUrl) => {
    if (!file) return;
    setUploadingKey(key);
    try {
      const url = await uploadMediaFile(file, 'about');
      if (url) onUrl(url);
    } finally {
      setUploadingKey('');
    }
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

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-12">
      {/* Header */}
      <div className={`rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${cardCls}`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#69EBDA]/15 border border-[#69EBDA]/35 text-[#69EBDA] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Web Control • About Control' : 'ওয়েব কন্ট্রোল • অ্যাবাউট কন্ট্রোল'}</span>
          </div>
          <h2 className={`text-lg sm:text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {language === 'en'
              ? 'About Page Real-Time CMS Control'
              : 'About পেজের সব তথ্য, ছবি ও সেকশন কন্ট্রোল'}
          </h2>
          <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {language === 'en'
              ? 'Edit, add, or delete photos, team members, services, partnership steps, and texts with live Supabase sync.'
              : 'এখান থেকে About পেজের ছবি, টিম মেম্বার, সার্ভিস, পার্টনারশিপ ও সব লেখা এডিট, ডিলিট ও আপডেট করতে পারবেন।'}
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

      {/* Sub-navigation tabs */}
      <div className={`p-1.5 rounded-2xl flex flex-wrap gap-1.5 ${cardCls}`}>
        {ABOUT_TABS.map((t) => {
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

      {/* 1. GENERAL & HERO */}
      {subTab === 'general' && (
        <div key="tab-general" className={`rounded-2xl p-5 sm:p-6 space-y-5 ${cardCls}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Brand / Company Title</label>
              <input
                type="text"
                value={form.brandTitle || ''}
                onChange={(e) => setForm({ ...form, brandTitle: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Tagline</label>
              <input
                type="text"
                value={form.tagline || ''}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Top Badge Text</label>
              <input
                type="text"
                value={form.badgeText || ''}
                onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Business Model</label>
              <input
                type="text"
                value={form.businessModel || ''}
                onChange={(e) => setForm({ ...form, businessModel: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          {/* Hero Cover Photo */}
          <div className="space-y-2 pt-2 border-t border-slate-200/20">
            <label className={labelCls}>Hero Cover Photo (Optional)</label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="url"
                value={form.heroImageUrl || ''}
                onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
                placeholder="https://... or upload image"
                className={`${inputCls} flex-1 min-w-[220px]`}
              />
              <label className="px-3.5 py-2 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/40 text-[#69EBDA] text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingKey === 'hero' ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleUpload(e.target.files?.[0], 'hero', (url) =>
                      setForm((prev) => ({ ...prev, heroImageUrl: url }))
                    )
                  }
                />
              </label>
              {form.heroImageUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, heroImageUrl: '' })}
                  className="px-3 py-2 rounded-xl bg-rose-500/15 text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
            {form.heroImageUrl && (
              <img
                src={form.heroImageUrl}
                alt="Hero Preview"
                className="h-32 w-full max-w-md object-cover rounded-xl border border-white/15 mt-2"
              />
            )}
          </div>

          {/* Business Activities */}
          <div className="space-y-3 pt-2 border-t border-slate-200/20">
            <label className={labelCls}>Business Activities Badges</label>
            <div className="flex flex-wrap gap-2">
              {(form.activities || []).map((act, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/35 text-xs font-bold text-[#69EBDA]"
                >
                  <span>{act}</span>
                  <button
                    type="button"
                    onClick={() => removeListItem('activities', idx)}
                    className="text-rose-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="Add new activity..."
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => {
                  if (!newActivity.trim()) return;
                  addListItem('activities', newActivity.trim());
                  setNewActivity('');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PHOTOS & TEAM */}
      {subTab === 'media' && (
        <div key="tab-media" className="space-y-6">
          {/* Gallery */}
          <div className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                About Page Photo Gallery
              </h3>
              <button
                type="button"
                onClick={() =>
                  addListItem('galleryImages', {
                    id: `gal-${Date.now()}`,
                    url: '',
                    caption: ''
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photo</span>
              </button>
            </div>

            {(form.galleryImages || []).length === 0 ? (
              <p className="text-xs text-slate-400">No gallery photos added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(form.galleryImages || []).map((img, idx) => (
                  <div key={img.id || idx} className="p-4 rounded-xl border border-slate-700/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#69EBDA]">Photo #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeListItem('galleryImages', idx)}
                        className="text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={img.url || ''}
                        onChange={(e) => updateListItem('galleryImages', idx, { url: e.target.value })}
                        placeholder="Image URL"
                        className={inputCls}
                      />
                      <label className="px-3 py-2 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/40 text-[#69EBDA] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingKey === `gal-${idx}` ? '...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleUpload(e.target.files?.[0], `gal-${idx}`, (url) =>
                              updateListItem('galleryImages', idx, { url })
                            )
                          }
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={img.caption || ''}
                      onChange={(e) => updateListItem('galleryImages', idx, { caption: e.target.value })}
                      placeholder="Caption (optional)"
                      className={inputCls}
                    />
                    {img.url && (
                      <img src={img.url} alt="" className="h-28 w-full object-cover rounded-lg" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Leadership / Team Members
              </h3>
              <button
                type="button"
                onClick={() =>
                  addListItem('teamMembers', {
                    id: `team-${Date.now()}`,
                    name: '',
                    role: '',
                    bio: '',
                    photoUrl: ''
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            {(form.teamMembers || []).length === 0 ? (
              <p className="text-xs text-slate-400">No team members added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(form.teamMembers || []).map((m, idx) => (
                  <div key={m.id || idx} className="p-4 rounded-xl border border-slate-700/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#69EBDA]">Member #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeListItem('teamMembers', idx)}
                        className="text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={m.name || ''}
                      onChange={(e) => updateListItem('teamMembers', idx, { name: e.target.value })}
                      placeholder="Full Name"
                      className={inputCls}
                    />
                    <input
                      type="text"
                      value={m.role || ''}
                      onChange={(e) => updateListItem('teamMembers', idx, { role: e.target.value })}
                      placeholder="Role / Designation"
                      className={inputCls}
                    />
                    <textarea
                      rows={2}
                      value={m.bio || ''}
                      onChange={(e) => updateListItem('teamMembers', idx, { bio: e.target.value })}
                      placeholder="Short Bio"
                      className={inputCls}
                    />
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={m.photoUrl || ''}
                        onChange={(e) => updateListItem('teamMembers', idx, { photoUrl: e.target.value })}
                        placeholder="Photo URL"
                        className={inputCls}
                      />
                      <label className="px-3 py-2 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/40 text-[#69EBDA] text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingKey === `team-${idx}` ? '...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleUpload(e.target.files?.[0], `team-${idx}`, (url) =>
                              updateListItem('teamMembers', idx, { photoUrl: url })
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. OVERVIEW & MISSION */}
      {subTab === 'overview' && (
        <div key="tab-overview" className={`rounded-2xl p-5 sm:p-6 space-y-5 ${cardCls}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`${labelCls} mb-0`}>Company Overview Paragraphs</label>
              <button
                type="button"
                onClick={() => addListItem('overviewParagraphs', '')}
                className="px-2.5 py-1 rounded-lg bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Paragraph</span>
              </button>
            </div>
            {(form.overviewParagraphs || []).map((p, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <textarea
                  rows={2}
                  value={p}
                  onChange={(e) => updateListItem('overviewParagraphs', idx, e.target.value)}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeListItem('overviewParagraphs', idx)}
                  className="p-2 rounded-lg bg-rose-500/15 text-rose-500 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Our Vision</label>
              <textarea
                rows={3}
                value={form.vision || ''}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Our Business Approach</label>
              <textarea
                rows={3}
                value={form.businessApproach || ''}
                onChange={(e) => setForm({ ...form, businessApproach: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`${labelCls} mb-0`}>Our Mission Points</label>
              <button
                type="button"
                onClick={() => addListItem('missions', '')}
                className="px-2.5 py-1 rounded-lg bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Mission</span>
              </button>
            </div>
            {(form.missions || []).map((m, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={m}
                  onChange={(e) => updateListItem('missions', idx, e.target.value)}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeListItem('missions', idx)}
                  className="p-2 rounded-lg bg-rose-500/15 text-rose-500 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SERVICES & PARTNERSHIP */}
      {subTab === 'services' && (
        <div key="tab-services" className="space-y-6">
          <div className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Services Offered
              </h3>
              <button
                type="button"
                onClick={() =>
                  addListItem('services', {
                    code: String.fromCharCode(65 + (form.services || []).length),
                    title: 'New Service',
                    intro: '',
                    pointsTitle: 'Key Highlights:',
                    points: [],
                    note: ''
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(form.services || []).map((srv, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-700/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#69EBDA]">Service {srv.code || idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeListItem('services', idx)}
                      className="text-rose-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={srv.title || ''}
                    onChange={(e) => updateListItem('services', idx, { title: e.target.value })}
                    placeholder="Service Title"
                    className={inputCls}
                  />
                  <textarea
                    rows={2}
                    value={srv.intro || ''}
                    onChange={(e) => updateListItem('services', idx, { intro: e.target.value })}
                    placeholder="Service Description"
                    className={inputCls}
                  />
                  <textarea
                    rows={3}
                    value={(srv.points || []).join('\n')}
                    onChange={(e) =>
                      updateListItem('services', idx, {
                        points: e.target.value.split('\n')
                      })
                    }
                    placeholder="Bullet points (one per line)"
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Partnership Steps */}
          <div className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Partnership Steps
              </h3>
              <button
                type="button"
                onClick={() =>
                  addListItem('partnershipSteps', {
                    step: `Step ${(form.partnershipSteps || []).length + 1}`,
                    title: '',
                    desc: ''
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(form.partnershipSteps || []).map((st, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-700/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={st.step || ''}
                      onChange={(e) => updateListItem('partnershipSteps', idx, { step: e.target.value })}
                      className={`${inputCls} max-w-[120px]`}
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem('partnershipSteps', idx)}
                      className="text-rose-500 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={st.title || ''}
                    onChange={(e) => updateListItem('partnershipSteps', idx, { title: e.target.value })}
                    placeholder="Step Title"
                    className={inputCls}
                  />
                  <textarea
                    rows={2}
                    value={st.desc || ''}
                    onChange={(e) => updateListItem('partnershipSteps', idx, { desc: e.target.value })}
                    placeholder="Step Description"
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. BENEFITS & CTA */}
      {subTab === 'benefits' && (
        <div key="tab-benefits" className="space-y-6">
          <div className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Merchant Partner Benefits
              </h3>
              <button
                type="button"
                onClick={() =>
                  addListItem('benefits', {
                    num: String((form.benefits || []).length + 1).padStart(2, '0'),
                    title: '',
                    desc: ''
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Benefit</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(form.benefits || []).map((b, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-700/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[#69EBDA]">{b.num}</span>
                    <button
                      type="button"
                      onClick={() => removeListItem('benefits', idx)}
                      className="text-rose-500 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={b.title || ''}
                    onChange={(e) => updateListItem('benefits', idx, { title: e.target.value })}
                    placeholder="Benefit Title"
                    className={inputCls}
                  />
                  <textarea
                    rows={2}
                    value={b.desc || ''}
                    onChange={(e) => updateListItem('benefits', idx, { desc: e.target.value })}
                    placeholder="Benefit Description"
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-5 sm:p-6 space-y-4 ${cardCls}`}>
            <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Bottom CTA & Document Note
            </h3>
            <div>
              <label className={labelCls}>CTA Headline</label>
              <input
                type="text"
                value={form.ctaTitle || ''}
                onChange={(e) => setForm({ ...form, ctaTitle: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>CTA Description</label>
              <textarea
                rows={2}
                value={form.ctaDescription || ''}
                onChange={(e) => setForm({ ...form, ctaDescription: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Document Note</label>
              <textarea
                rows={2}
                value={form.documentNote || ''}
                onChange={(e) => setForm({ ...form, documentNote: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
