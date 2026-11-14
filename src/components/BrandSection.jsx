import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StorageService } from '../services/storageService';

export const BrandSection = () => {
  const [brandLogos, setBrandLogos] = useState(() => StorageService.getBrandLogos());
  const [shouldMarquee, setShouldMarquee] = useState(false);
  const containerRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    const syncLogos = () => {
      setBrandLogos(StorageService.getBrandLogos());
    };

    window.addEventListener('app:brand-logos-updated', syncLogos);
    window.addEventListener('storage', syncLogos);
    return () => {
      window.removeEventListener('app:brand-logos-updated', syncLogos);
      window.removeEventListener('storage', syncLogos);
    };
  }, []);

  const checkOverflow = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    setShouldMarquee(measure.scrollWidth > container.clientWidth);
  }, []);

  useEffect(() => {
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    if (containerRef.current) observer.observe(containerRef.current);
    if (measureRef.current) observer.observe(measureRef.current);
    window.addEventListener('resize', checkOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [brandLogos, checkOverflow]);

  if (!Array.isArray(brandLogos) || brandLogos.length === 0) {
    return null;
  }

  const durationSeconds = Math.max(22, brandLogos.length * 4);

  const renderLogoItem = (brand, keyPrefix = '') => (
    <div
      key={`${keyPrefix}${brand.id}`}
      title={brand.name || 'Partner Brand'}
      className="relative shrink-0 flex items-center justify-center h-14 sm:h-16 px-4 sm:px-5 rounded-2xl overflow-hidden bg-gradient-to-br from-white/30 via-white/12 to-[#69EBDA]/15 dark:from-white/12 dark:via-slate-800/40 dark:to-[#69EBDA]/10 backdrop-blur-xl border border-white/45 dark:border-white/20 shadow-[0_8px_22px_rgba(15,23,42,0.12),inset_0_2px_4px_rgba(255,255,255,0.65),inset_0_-3px_6px_rgba(15,23,42,0.12)] dark:shadow-[0_8px_22px_rgba(0,0,0,0.42),inset_0_1.5px_3px_rgba(255,255,255,0.28),inset_0_-3px_8px_rgba(0,0,0,0.4)] hover:scale-[1.03] transition-transform duration-300"
    >
      {/* 3D Water Glass Top Specular Highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-1.5 top-0.5 h-1/2 rounded-t-xl bg-gradient-to-b from-white/40 to-transparent dark:from-white/15"
      />
      {brand.logoUrl ? (
        <img
          src={brand.logoUrl}
          alt={brand.name || 'Brand Logo'}
          loading="lazy"
          onLoad={checkOverflow}
          className="relative z-10 max-h-9 sm:max-h-10 w-auto max-w-[130px] object-contain drop-shadow-sm"
        />
      ) : (
        <span className="relative z-10 text-xs font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
          {brand.name || 'Brand'}
        </span>
      )}
    </div>
  );

  return (
    <section
      id="brand-section"
      className="relative z-0 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4 overflow-hidden"
    >
      <style>{`
        @keyframes brandMarqueeRtl {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brand-marquee-track {
          animation: brandMarqueeRtl var(--marquee-duration, 28s) linear infinite;
        }
        .brand-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Only "Our partner brands" text, no background */}
      <h2 className="text-center text-xs sm:text-sm font-extrabold tracking-widest uppercase text-slate-700 dark:text-slate-200 mb-3">
        Our partner brands
      </h2>

      {/* Hidden single-row measurement strip to detect when brands overflow container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden py-2"
      >
        <div
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute top-0 left-0 flex items-center gap-3 whitespace-nowrap"
        >
          {brandLogos.map((brand) => renderLogoItem(brand, 'measure-'))}
        </div>

        {shouldMarquee ? (
          /* Many brands: infinite slow right-to-left marquee */
          <div
            className="flex w-max brand-marquee-track"
            style={{ '--marquee-duration': `${durationSeconds}s` }}
          >
            <div className="flex items-center shrink-0 gap-3 pr-3">
              {brandLogos.map((brand) => renderLogoItem(brand, 'a-'))}
            </div>
            <div className="flex items-center shrink-0 gap-3 pr-3">
              {brandLogos.map((brand) => renderLogoItem(brand, 'b-'))}
            </div>
          </div>
        ) : (
          /* Few brands: aligned center */
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {brandLogos.map((brand) => renderLogoItem(brand, 'center-'))}
          </div>
        )}
      </div>
    </section>
  );
};
