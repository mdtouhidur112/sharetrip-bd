import React, { createContext, useContext, useEffect } from 'react';

const HelmetContext = createContext(null);

export const HelmetProvider = ({ children }) => {
  return (
    <HelmetContext.Provider value={true}>
      {children}
    </HelmetContext.Provider>
  );
};

/**
 * Lightweight React 19-compatible Helmet component for managing document <head> SEO & social meta tags.
 */
export const Helmet = ({
  title,
  description,
  keywords,
  canonical,
  robots,
  ogTitle,
  ogDescription,
  ogImage,
  ogImageAlt,
  ogSiteName,
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterSite,
  googleVerification,
  faviconUrl,
  jsonLd
}) => {
  useContext(HelmetContext);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (title) {
      document.title = title;
    }

    const upsertMeta = (attrName, attrValue, content) => {
      if (!content) {
        const existing = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
        if (existing && existing.dataset.helmetManaged === 'true') {
          existing.remove();
        }
        return;
      }
      let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        el.dataset.helmetManaged = 'true';
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', robots || 'index, follow');
    upsertMeta('name', 'google-site-verification', googleVerification);

    // Open Graph (Facebook, WhatsApp, LinkedIn)
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:site_name', ogSiteName || 'ShareTrip BD');
    upsertMeta('property', 'og:title', ogTitle || title);
    upsertMeta('property', 'og:description', ogDescription || description);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:alt', ogImageAlt || ogTitle || title);
    upsertMeta('property', 'og:url', ogUrl || canonical || (typeof window !== 'undefined' ? window.location.href : ''));

    // Twitter / X Card
    upsertMeta('name', 'twitter:card', twitterCard);
    upsertMeta('name', 'twitter:title', ogTitle || title);
    upsertMeta('name', 'twitter:description', ogDescription || description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertMeta('name', 'twitter:image:alt', ogImageAlt || ogTitle || title);
    upsertMeta('name', 'twitter:site', twitterSite);

    // Dynamic Favicon (browser title bar icon)
    if (faviconUrl) {
      const iconSelectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]'];
      iconSelectors.forEach((selector) => {
        const iconEl = document.head.querySelector(selector);
        if (iconEl) {
          iconEl.setAttribute('href', faviconUrl);
        }
      });
    }

    // Canonical URL
    let canonicalEl = document.head.querySelector('link[rel="canonical"]');
    const targetCanonical = canonical || (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '');
    if (targetCanonical) {
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        canonicalEl.dataset.helmetManaged = 'true';
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', targetCanonical);
    }

    // Structured Data (JSON-LD)
    const ldId = 'helmet-jsonld-seo';
    let ldEl = document.getElementById(ldId);
    if (jsonLd) {
      if (!ldEl) {
        ldEl = document.createElement('script');
        ldEl.id = ldId;
        ldEl.type = 'application/ld+json';
        document.head.appendChild(ldEl);
      }
      ldEl.textContent = typeof jsonLd === 'string' ? jsonLd : JSON.stringify(jsonLd);
    } else if (ldEl) {
      ldEl.remove();
    }
  }, [
    title,
    description,
    keywords,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    ogImageAlt,
    ogSiteName,
    ogUrl,
    ogType,
    twitterCard,
    twitterSite,
    googleVerification,
    faviconUrl,
    jsonLd
  ]);

  return null;
};
