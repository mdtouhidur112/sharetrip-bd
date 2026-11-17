import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Send, Shield, Globe, Award, Share2 } from 'lucide-react';
import { NAV_LINKS } from '../data/travelData';
import { StorageService } from '../services/storageService';
import { DynamicReactIcon } from '../utils/reactIconParser';
import { SharePopupModal, triggerSmartShare } from './SharePopupModal';

export const Footer = ({ onOpenBookCall, onOpenAdmin }) => {
  const [branding, setBranding] = useState(() => StorageService.getBranding());
  const [footerSettings, setFooterSettings] = useState(() => StorageService.getFooterSettings());
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    const handleBrandingSync = () => setBranding(StorageService.getBranding());
    const handleFooterSync = () => setFooterSettings(StorageService.getFooterSettings());
    window.addEventListener('app:branding-updated', handleBrandingSync);
    window.addEventListener('app:footer-settings-updated', handleFooterSync);
    return () => {
      window.removeEventListener('app:branding-updated', handleBrandingSync);
      window.removeEventListener('app:footer-settings-updated', handleFooterSync);
    };
  }, []);
  return (
    <footer id="contact" className="relative mt-[2px] border-t border-[#69EBDA]/35 dark:border-white/15 bg-[#5C6977]/85 dark:bg-slate-950/80 backdrop-blur-3xl overflow-hidden text-white">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#69EBDA]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top Newsletter & VIP Banner in Frosted Glass Container */}
        {footerSettings?.showNewsletter !== false && (
          <div className="mb-16 p-8 sm:p-12 rounded-3xl liquid-glass border border-[#69EBDA]/35 dark:border-white/20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#69EBDA]/20 text-[#69EBDA] text-xs font-bold mb-3 border border-[#69EBDA]/40">
                <Sparkles className="w-3.5 h-3.5" />
                {footerSettings?.newsletterBadge || 'Exclusive Newsletter'}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit',sans-serif]">
                {footerSettings?.newsletterTitle || 'Get Unpublished Itineraries & Secret Resort Offers'}
              </h3>
              <p className="mt-2 text-slate-100 dark:text-slate-300/80 text-sm font-medium">
                {footerSettings?.newsletterSubtitle || 'Join 45,000+ travelers and enjoy early access to seasonal charters and private island retreats.'}
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing to our private newsletter!');
              }}
              className="w-full lg:w-auto flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="px-5 py-3.5 rounded-2xl bg-slate-800/45 dark:bg-white/[0.08] backdrop-blur-xl border border-white/20 dark:border-white/20 text-white placeholder-slate-300 text-sm focus:outline-none focus:border-[#69EBDA] min-w-[280px]"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#69EBDA] to-cyan-400 hover:from-[#69EBDA]/90 hover:to-cyan-300 text-slate-950 font-bold text-sm shadow-lg shadow-[#69EBDA]/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <span>Subscribe</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/15 dark:border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center shrink-0 overflow-hidden rounded-xl"
                style={{
                  width: `${Math.min(56, branding?.logoWidth || 40)}px`,
                  height: `${Math.min(56, branding?.logoHeight || 40)}px`
                }}
              >
                <img 
                  src={branding?.logoUrl || '/stb-logo.png'} 
                  alt={branding?.brandName || 'STB Brand Logo'}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-extrabold tracking-wider font-['Outfit',sans-serif]" style={{ color: branding?.textColor || '#FFFFFF' }}>
                {branding?.brandName || 'AETHERIA'}
              </span>
            </div>
            <p className="text-slate-100 dark:text-slate-400 text-sm max-w-sm leading-relaxed font-medium">
              {footerSettings?.description || 'Unforgettable and eco-luxury journeys across seven continents. World-class hospitality and impeccable service.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {Array.isArray(footerSettings?.socialLinks) &&
                footerSettings.socialLinks.map((social, idx) => (
                  <a
                    key={social.id || idx}
                    href={social.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-slate-800/60 dark:bg-white/5 hover:bg-slate-800 dark:hover:bg-white/15 border border-white/20 text-white flex items-center justify-center transition-colors"
                    title={social.name || social.platform || 'Social Link'}
                  >
                    <DynamicReactIcon code={social.iconInput} className="w-4 h-4 text-[#69EBDA]" />
                  </a>
                ))}

              <button
                type="button"
                onClick={() =>
                  triggerSmartShare({
                    url: footerSettings?.shareUrl,
                    title: footerSettings?.shareTitle || branding?.brandName,
                    onOpenModal: () => setShareModalOpen(true)
                  })
                }
                className="w-9 h-9 rounded-xl bg-slate-800/60 dark:bg-white/5 hover:bg-slate-800 dark:hover:bg-white/15 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Share"
              >
                <Share2 className="w-4 h-4 text-[#69EBDA]" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold text-[#69EBDA] uppercase tracking-wider mb-4">
              {footerSettings?.navTitle || 'Navigation'}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-100 dark:text-slate-300 font-medium">
              {(Array.isArray(footerSettings?.navLinks) && footerSettings.navLinks.length > 0 ? footerSettings.navLinks : NAV_LINKS).map((link, idx) => (
                <li key={link.id || link.name || idx}>
                  <a href={link.href || '#'} className="hover:text-[#69EBDA] transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Curated Categories */}
          <div>
            <h4 className="text-xs font-extrabold text-[#69EBDA] uppercase tracking-wider mb-4">
              {footerSettings?.categoryTitle || 'Travel Categories'}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-100 dark:text-slate-300 font-medium">
              {(Array.isArray(footerSettings?.categoryLinks) ? footerSettings.categoryLinks : []).map((cat, idx) => (
                <li key={cat.id || idx}>
                  <a href={cat.href || '#destinations'} className="hover:text-[#69EBDA] transition-colors">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Accreditation */}
          <div>
            <h4 className="text-xs font-extrabold text-[#69EBDA] uppercase tracking-wider mb-4">
              {footerSettings?.commitmentTitle || 'Our Commitments'}
            </h4>
            <div className="space-y-3 text-xs text-slate-100 dark:text-slate-400 font-medium">
              {(Array.isArray(footerSettings?.commitments) ? footerSettings.commitments : []).map((text, idx) => {
                const IconComp = idx % 3 === 0 ? Shield : idx % 3 === 1 ? Award : Globe;
                const iconColor = idx % 3 === 0 ? 'text-[#69EBDA]' : idx % 3 === 1 ? 'text-cyan-300' : 'text-emerald-300';
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <IconComp className={`w-4 h-4 shrink-0 ${iconColor}`} />
                    <span>{text}</span>
                  </div>
                );
              })}
              <button
                onClick={onOpenBookCall}
                className="mt-2 text-[#69EBDA] hover:underline font-extrabold cursor-pointer"
              >
                Book a Private Consultation Call &rarr;
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Credits, Copyright & Payment System Logos */}
        <div className="mt-8 flex flex-col lg:flex-row items-center justify-between text-xs text-slate-300 dark:text-slate-400 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <p>{footerSettings?.copyrightText || '© 2026 Etheria Travel Group. All rights reserved.'}</p>
            <div className="flex items-center gap-5">
              <a href="#privacy" className="hover:text-white transition-colors">{footerSettings?.privacyLabel || 'Privacy Policy'}</a>
              <a href="#terms" className="hover:text-white transition-colors">{footerSettings?.termsLabel || 'Terms of Travel'}</a>
              {footerSettings?.developerPortfolioUrl ? (
                <a
                  href={footerSettings.developerPortfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#69EBDA] hover:underline transition-colors font-bold"
                >
                  Developer By MD.Touhid
                </a>
              ) : (
                <span className="text-[#69EBDA] font-bold">
                  Developer By MD.Touhid
                </span>
              )}
            </div>
          </div>

          {Array.isArray(footerSettings?.paymentLogos) &&
            footerSettings.paymentLogos.some((logo) => Boolean(logo?.logoUrl)) && (
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
                {footerSettings.paymentLogos
                  .filter((logo) => Boolean(logo?.logoUrl))
                  .map((logo, idx) => (
                    <div
                      key={logo.id || idx}
                      title={logo.name || undefined}
                      className="h-8 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-white/95 border border-white/30 shadow-sm flex items-center justify-center overflow-hidden"
                    >
                      <img
                        src={logo.logoUrl}
                        alt={logo.name || 'Payment Logo'}
                        className="h-full max-w-[72px] object-contain"
                      />
                    </div>
                  ))}
              </div>
            )}
        </div>

      </div>

      <SharePopupModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={footerSettings?.shareUrl}
        shareTitle={footerSettings?.shareTitle || branding?.brandName}
      />
    </footer>
  );
};
