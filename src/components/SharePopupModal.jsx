import React, { useState } from 'react';
import { X, Copy, Check, Share2, Mail, MessageCircle, Send, Globe } from 'lucide-react';

export const triggerSmartShare = async ({ url, title, onOpenModal }) => {
  const targetUrl = (url || '').trim() || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = (title || '').trim() || (typeof document !== 'undefined' ? document.title : 'Share');
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

  if (isMobile && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareTitle,
        url: targetUrl
      });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
    }
  }

  onOpenModal?.();
};

export const SharePopupModal = ({ isOpen, onClose, shareUrl, shareTitle }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetUrl =
    (shareUrl || '').trim() || (typeof window !== 'undefined' ? window.location.href : '');
  const titleText =
    (shareTitle || '').trim() || (typeof document !== 'undefined' ? document.title : 'Website Link');

  const encodedUrl = encodeURIComponent(targetUrl);
  const encodedText = encodeURIComponent(`${titleText} - ${targetUrl}`);
  const encodedTitle = encodeURIComponent(titleText);

  const shareApps = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}`,
      bg: 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/35 text-emerald-300',
      icon: MessageCircle
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/35 text-blue-300',
      icon: Globe
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/35 text-sky-300',
      icon: Send
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'bg-slate-500/20 hover:bg-slate-500/30 border-slate-400/35 text-slate-200',
      icon: Share2
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: 'bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/35 text-indigo-300',
      icon: Globe
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedText}`,
      bg: 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/35 text-amber-300',
      icon: Mail
    }
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: titleText,
          text: titleText,
          url: targetUrl
        });
      } catch {
        // user cancelled
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-slate-900/95 border border-white/15 shadow-2xl p-6 space-y-5 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#69EBDA]/15 border border-[#69EBDA]/35 flex items-center justify-center text-[#69EBDA]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">ওয়েবসাইট শেয়ার করুন</h3>
              <p className="text-[11px] text-slate-400">যেকোনো অ্যাপ বা লিংকের মাধ্যমে শেয়ার করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {shareApps.map((app) => {
            const Icon = app.icon;
            return (
              <a
                key={app.name}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all ${app.bg}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{app.name}</span>
              </a>
            );
          })}
        </div>

        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-2xl bg-[#69EBDA]/15 hover:bg-[#69EBDA]/25 border border-[#69EBDA]/40 text-[#69EBDA] text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>ডিভাইসের অন্যান্য অ্যাপ দিয়ে শেয়ার করুন</span>
          </button>
        )}

        <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/5 border border-white/10">
          <input
            type="text"
            readOnly
            value={targetUrl}
            className="flex-1 bg-transparent text-xs text-slate-300 px-2 outline-none truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-[#69EBDA] text-slate-950 text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'কপি লিংক'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
