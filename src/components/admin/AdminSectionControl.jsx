import React, { useState, useEffect } from 'react';
import { LayoutTemplate, Save, RotateCcw, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { StorageService, DEFAULT_SECTION_SETTINGS } from '../../services/storageService';

const SECTION_META = [
  {
    key: 'destinations',
    label: 'Destination Bento Grid (Homepage)',
    fields: [
      { name: 'badge', label: 'Badge Text' },
      { name: 'title', label: 'Section Title' },
      { name: 'subtitle', label: 'Subtitle / Description', multiline: true },
      { name: 'buttonText', label: 'Button Label' }
    ]
  },
  {
    key: 'popularHotels',
    label: 'Popular Hotels & Resorts Grid (Homepage)',
    fields: [
      { name: 'badge', label: 'Badge Text' },
      { name: 'title', label: 'Section Title' },
      { name: 'subtitle', label: 'Subtitle / Description', multiline: true }
    ]
  },
  {
    key: 'transportShowcase',
    label: 'Transport, Hotel & Dining Showcase (Homepage)',
    fields: [
      { name: 'badge', label: 'Badge Text' },
      { name: 'title', label: 'Section Title' },
      { name: 'subtitle', label: 'Subtitle / Description', multiline: true },
      { name: 'trustBadge', label: 'Trust Pill Text' }
    ]
  },
  {
    key: 'howItWorks',
    label: 'How It Works Section (Homepage)',
    fields: [
      { name: 'badge', label: 'Badge Text' },
      { name: 'title', label: 'Section Title' },
      { name: 'subtitle', label: 'Subtitle / Description', multiline: true },
      { name: 'step1Title', label: 'Step 1 Title' },
      { name: 'step1Desc', label: 'Step 1 Description', multiline: true },
      { name: 'step2Title', label: 'Step 2 Title' },
      { name: 'step2Desc', label: 'Step 2 Description', multiline: true },
      { name: 'step3Title', label: 'Step 3 Title' },
      { name: 'step3Desc', label: 'Step 3 Description', multiline: true },
      { name: 'ctaText', label: 'CTA Button Label' }
    ]
  },
  {
    key: 'coreServices',
    label: 'Core Services Section (Homepage)',
    fields: [
      { name: 'badge', label: 'Badge Text' },
      { name: 'title', label: 'Section Title' },
      { name: 'subtitle', label: 'Subtitle / Description', multiline: true },
      { name: 'trustBadge', label: 'Trust Pill Text' }
    ]
  },
  {
    key: 'clientReviews',
    label: 'Client Reviews Section (Homepage)',
    fields: [
      { name: 'badge', label: 'Badge Text' },
      { name: 'title', label: 'Section Title' },
      { name: 'subtitle', label: 'Subtitle / Description', multiline: true }
    ]
  },
  {
    key: 'contactSection',
    label: 'Contact & Office Info Section (Homepage)',
    fields: [
      { name: 'badge', label: 'Badge Text' },
      { name: 'title', label: 'Section Title' },
      { name: 'subtitle', label: 'Subtitle / Description', multiline: true },
      { name: 'ctaText', label: 'Book a Call Button Text' }
    ]
  },
  {
    key: 'servicesPage',
    label: 'Dedicated Services Page',
    fields: [
      { name: 'badge', label: 'Badge Text' },
      { name: 'title', label: 'Page Title' },
      { name: 'subtitle', label: 'Page Subtitle', multiline: true }
    ]
  },
  {
    key: 'allDestinationsPage',
    label: 'All Destinations Page',
    fields: [
      { name: 'badge', label: 'Badge Text' },
      { name: 'title', label: 'Page Title' },
      { name: 'subtitle', label: 'Page Subtitle', multiline: true }
    ]
  },
  {
    key: 'transportCategoryPage',
    label: 'Transport Category Page',
    fields: [
      { name: 'badge', label: 'Badge Text' },
      { name: 'title', label: 'Default Hero Title' },
      { name: 'subtitle', label: 'Default Hero Subtitle' },
      { name: 'description', label: 'Default Hero Description', multiline: true }
    ]
  }
];

export const AdminSectionControl = ({ isLight = false, onShowToast }) => {
  const [sections, setSections] = useState(() => StorageService.getSectionSettings());
  const [selectedKey, setSelectedKey] = useState('destinations');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const sync = () => setSections(StorageService.getSectionSettings());
    window.addEventListener('app:section-settings-updated', sync);
    return () => window.removeEventListener('app:section-settings-updated', sync);
  }, []);

  const currentMeta = SECTION_META.find((s) => s.key === selectedKey) || SECTION_META[0];
  const currentValues = sections[selectedKey] || DEFAULT_SECTION_SETTINGS[selectedKey] || {};

  const handleFieldChange = (fieldName, value) => {
    setSections((prev) => ({
      ...prev,
      [selectedKey]: {
        ...(prev[selectedKey] || {}),
        [fieldName]: value
      }
    }));
  };

  const handleClearField = async (fieldName) => {
    const updated = {
      ...sections,
      [selectedKey]: {
        ...(sections[selectedKey] || {}),
        [fieldName]: ''
      }
    };
    setSections(updated);
    await StorageService.saveSectionSettings(updated);
    onShowToast?.('Field text deleted & synced in real time!');
  };

  const handleClearSection = async () => {
    if (!window.confirm(`Clear all text for "${currentMeta.label}"?`)) return;
    const cleared = {};
    currentMeta.fields.forEach((f) => {
      cleared[f.name] = '';
    });
    const updated = {
      ...sections,
      [selectedKey]: cleared
    };
    setSections(updated);
    await StorageService.saveSectionSettings(updated);
    onShowToast?.(`${currentMeta.label} text cleared!`);
  };

  const handleResetSection = async () => {
    const updated = {
      ...sections,
      [selectedKey]: { ...DEFAULT_SECTION_SETTINGS[selectedKey] }
    };
    setSections(updated);
    await StorageService.saveSectionSettings(updated);
    onShowToast?.(`${currentMeta.label} reset to default!`);
  };

  const handleSaveAll = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      await StorageService.saveSectionSettings(sections);
      onShowToast?.('Section texts saved & synced to Supabase Realtime!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 rounded-3xl border animate-in fade-in duration-300 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <LayoutTemplate className="w-6 h-6 text-[#69EBDA]" />
            <span>Section Control</span>
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Edit, update, or delete titles, badges, subtitles, and button labels across all website sections and pages in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-[#69EBDA]/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section Picker */}
        <div className="lg:col-span-4 space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            Website Sections &amp; Pages
          </p>
          {SECTION_META.map((sec) => {
            const active = sec.key === selectedKey;
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => setSelectedKey(sec.key)}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  active
                    ? 'bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 border-transparent shadow-md font-black'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-[#69EBDA]/50'
                }`}
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Selected Section Editor */}
        <form onSubmit={handleSaveAll} className="lg:col-span-8 space-y-4">
          <div
            className={`p-5 rounded-3xl border space-y-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#69EBDA]" />
                <span>{currentMeta.label}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSection}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearSection}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All Text</span>
                </button>
              </div>
            </div>

            {currentMeta.fields.map((field) => {
              const val = currentValues[field.name] ?? '';
              return (
                <div key={field.name} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleClearField(field.name)}
                      className="text-[11px] font-bold text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                  {field.multiline ? (
                    <textarea
                      rows={2}
                      value={val}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.label} (leave empty to hide)`}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                          : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                      }`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.label} (leave empty to hide)`}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border outline-none transition-all ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'
                          : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-[#69EBDA]'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </form>
      </div>
    </div>
  );
};
