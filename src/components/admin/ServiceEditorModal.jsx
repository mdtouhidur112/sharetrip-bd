import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Sparkles, 
  Plane, 
  CalendarCheck, 
  Hotel, 
  Headphones, 
  Compass, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const ServiceEditorModal = ({ 
  isOpen, 
  service, 
  onClose, 
  onSave 
}) => {
  const isEditing = Boolean(service?.id);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Plane');
  const [perksText, setPerksText] = useState('');

  useEffect(() => {
    if (service) {
      setTitle(service.title || '');
      setSubtitle(service.subtitle || '');
      setDescription(service.description || '');
      setIcon(service.icon || 'Plane');
      setPerksText(Array.isArray(service.perks) ? service.perks.join('\n') : '');
    } else {
      setTitle('');
      setSubtitle('প্রিমিয়াম ভিআইপি ট্রাভেল সেবা');
      setDescription('');
      setIcon('Plane');
      setPerksText('ভিআইপি ফাস্ট-ট্র্যাক ক্লিয়ারেন্স\nঅন-ডিমান্ড প্রাইভেট সাপোর্ট\nকোনো বাড়তি হিডেন ফি নেই');
    }
  }, [service, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const perks = perksText
      ? perksText.split('\n').map(s => s.trim()).filter(Boolean)
      : [];

    const servicePayload = {
      ...(service || {}),
      id: service?.id || `srv-${Date.now()}`,
      title: title.trim() || 'বিশেষ সেবা',
      subtitle: subtitle.trim(),
      description: description.trim(),
      icon,
      perks
    };

    onSave(servicePayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl rounded-3xl overflow-hidden bg-[#5C6977]/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-[#69EBDA]/35 dark:border-white/25 shadow-2xl my-8 text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/15 flex items-center justify-between bg-slate-800/60 dark:bg-slate-900/40">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#69EBDA]/20 text-[#69EBDA] text-xs font-bold mb-1 border border-[#69EBDA]/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEditing ? 'সেবা এডিটর' : 'নতুন এজেন্সি সেবা'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {isEditing ? `সম্পাদনা: ${service?.title}` : 'নতুন বিশেষ সেবা যুক্ত করুন'}
            </h3>
          </div>

          <button onClick={onClose} className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 text-white/80 hover:text-white border border-white/20 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              সেবার শিরোনাম
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: ফ্লাইট টিকিট বুকিং"
              className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              সাবটাইটেল / ট্যাগলাইন
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="যেমন: ফার্স্ট ও বিজনেস ক্লাস এবং প্রাইভেট জেট চার্টার"
              className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              আইকন নির্বাচন করুন
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none [color-scheme:dark]"
            >
              <option value="Plane" className="bg-slate-900 text-white">✈️ Plane (বিমান ও ফ্লাইট সেবা)</option>
              <option value="CalendarCheck" className="bg-slate-900 text-white">📅 CalendarCheck (শিডিউল ও পরিকল্পনা)</option>
              <option value="Hotel" className="bg-slate-900 text-white">🏨 Hotel (হোটেল ও রিসোর্ট রিজার্ভেশন)</option>
              <option value="Headphones" className="bg-slate-900 text-white">🎧 Headphones (২৪/৭ কনসিয়ার্জ সাপোর্ট)</option>
              <option value="Compass" className="bg-slate-900 text-white">🧭 Compass (ট্যুর ও গাইড সেবা)</option>
              <option value="ShieldCheck" className="bg-slate-900 text-white">🛡️ ShieldCheck (ভ্রমণ বীমা ও নিরাপত্তা)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              বিস্তারিত বিবরণ
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="এই সেবার আওতাভুক্ত সুবিধা ও বিস্তারিত বিবরণ..."
              className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA] resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-200 block mb-1">
              প্রধান সুবিধাসমূহ / পার্কস (প্রতি লাইনে একটি করে)
            </label>
            <textarea
              rows={4}
              value={perksText}
              onChange={(e) => setPerksText(e.target.value)}
              placeholder="ভিআইপি ফাস্ট-ট্র্যাক ক্লিয়ারেন্স&#10;অন-ডিমান্ড প্রাইভেট সাপোর্ট&#10;কোনো বাড়তি হিডেন ফি নেই"
              className="w-full p-3 rounded-2xl bg-slate-800/45 dark:bg-white/[0.05] border border-white/20 text-xs text-white focus:outline-none focus:border-[#69EBDA] resize-none font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/15 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-white border border-white/20 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#69EBDA] via-teal-300 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-[#69EBDA]/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
