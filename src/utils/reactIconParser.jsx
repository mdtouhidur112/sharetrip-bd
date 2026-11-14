import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Parses a react-icons import statement, JSX tag, or icon name.
 * Examples supported:
 *   import { MdSignalWifiStatusbarConnectedNoInternet } from "react-icons/md";
 *   <MdSignalWifiStatusbarConnectedNoInternet />
 *   MdSignalWifiStatusbarConnectedNoInternet
 */
export const parseReactIconInput = (input = '') => {
  const raw = String(input || '').trim();
  if (!raw) return null;

  // Match: import { IconName } from "react-icons/pack";
  const importMatch = raw.match(/import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+['"]react-icons\/([a-z0-9]+)['"]/i);
  if (importMatch) {
    return {
      iconName: importMatch[1],
      pack: importMatch[2].toLowerCase(),
      raw
    };
  }

  // Match: <IconName ... /> or IconName (even if preceded by import or followed by props)
  const jsxTagMatch = raw.match(/<\s*([A-Z][A-Za-z0-9_]*)\b/);
  const plainMatch = raw.match(/\b([A-Z][A-Za-z0-9_]+)\b/);
  const iconName = jsxTagMatch?.[1] || plainMatch?.[1];
  if (iconName) {
    const prefixMatch = iconName.match(/^(Md|Fa6|Fa|Io5|Io|Bi|Bs|Hi2|Hi|Ri|Tb|Lu|Fi|Gi|Ai|Pi|Si|Wi|Vsc|Cg|Ci|Tfi|Sl|Rx|Go|Im|Gr|Lia)/);
    const pack = prefixMatch ? prefixMatch[1].toLowerCase() : '';
    return {
      iconName,
      pack,
      raw
    };
  }

  return null;
};

const PACK_TO_ICONIFY_PREFIX = {
  md: 'ic',
  fa: 'fa-solid',
  fa6: 'fa6-solid',
  io: 'ion',
  io5: 'ion',
  bi: 'bx',
  bs: 'bi',
  hi: 'heroicons',
  hi2: 'heroicons',
  ri: 'ri',
  tb: 'tabler',
  lu: 'lucide',
  fi: 'feather',
  gi: 'game-icons',
  ai: 'ant-design',
  pi: 'ph',
  si: 'simple-icons',
  wi: 'wi',
  vsc: 'codicon',
  cg: 'gg',
  ci: 'circum',
  tfi: 'twemoji',
  sl: 'simple-line-icons',
  rx: 'radix-icons',
  go: 'octicon',
  im: 'icomoon-free',
  gr: 'grommet-icons',
  lia: 'la'
};

const stripPackPrefix = (iconName, pack) => {
  const prefixes = ['Md', 'Fa6', 'Fa', 'Io5', 'Io', 'Bi', 'Bs', 'Hi2', 'Hi', 'Ri', 'Tb', 'Lu', 'Fi', 'Gi', 'Ai', 'Pi', 'Si', 'Wi', 'Vsc', 'Cg', 'Ci', 'Tfi', 'Sl', 'Rx', 'Go', 'Im', 'Gr', 'Lia'];
  for (const p of prefixes) {
    if (iconName.startsWith(p) && iconName.length > p.length) {
      return iconName.slice(p.length);
    }
  }
  if (pack && iconName.toLowerCase().startsWith(pack.toLowerCase())) {
    return iconName.slice(pack.length);
  }
  return iconName;
};

const camelToKebab = (str) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

const getFallbackLucideComponent = (iconName = '') => {
  if (!iconName) return LucideIcons.Sparkles;
  if (LucideIcons[iconName]) return LucideIcons[iconName];

  const stripped = stripPackPrefix(iconName, '');
  if (LucideIcons[stripped]) return LucideIcons[stripped];

  const lower = iconName.toLowerCase();
  if (lower.includes('nowifi') || lower.includes('nointernet') || lower.includes('wifi')) return LucideIcons.Wifi;
  if (lower.includes('bed') || lower.includes('hotel')) return LucideIcons.Bed;
  if (lower.includes('pool') || lower.includes('swim') || lower.includes('wave') || lower.includes('water')) return LucideIcons.Waves;
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('utensil') || lower.includes('dining')) return LucideIcons.Utensils;
  if (lower.includes('coffee') || lower.includes('breakfast') || lower.includes('tea') || lower.includes('cup')) return LucideIcons.Coffee;
  if (lower.includes('car') || lower.includes('taxi') || lower.includes('bus') || lower.includes('parking')) return LucideIcons.Car;
  if (lower.includes('ac') || lower.includes('air') || lower.includes('wind') || lower.includes('fan')) return LucideIcons.Wind;
  if (lower.includes('bath') || lower.includes('shower')) return LucideIcons.Bath;
  if (lower.includes('shield') || lower.includes('security') || lower.includes('lock')) return LucideIcons.Shield;
  if (lower.includes('tv') || lower.includes('monitor')) return LucideIcons.Tv;
  if (lower.includes('map') || lower.includes('location') || lower.includes('pin')) return LucideIcons.MapPin;
  if (lower.includes('phone') || lower.includes('call')) return LucideIcons.Phone;
  if (lower.includes('star')) return LucideIcons.Star;
  if (lower.includes('check')) return LucideIcons.CheckCircle2;
  return LucideIcons.Sparkles;
};

const svgCache = new Map();

export const DynamicReactIcon = ({ code, iconCode, iconInput, className = 'w-4 h-4' }) => {
  const iconString = iconCode || code || iconInput;
  const parsed = parseReactIconInput(iconString);
  const [svgContent, setSvgContent] = useState(() => (parsed ? svgCache.get(parsed.iconName) || null : null));

  useEffect(() => {
    if (!parsed?.iconName) {
      setSvgContent(null);
      return;
    }

    // If it's a direct Lucide icon name with no react-icons pack, no need to fetch external SVG
    if (!parsed.pack && LucideIcons[parsed.iconName]) {
      setSvgContent(null);
      return;
    }

    if (svgCache.has(parsed.iconName)) {
      setSvgContent(svgCache.get(parsed.iconName));
      return;
    }

    let isCancelled = false;
    const baseName = stripPackPrefix(parsed.iconName, parsed.pack);
    const kebab = camelToKebab(baseName);
    const prefix = PACK_TO_ICONIFY_PREFIX[parsed.pack] || '';

    const fetchIconSvg = async () => {
      try {
        const candidates = [];
        if (prefix === 'ic') {
          candidates.push(
            `https://api.iconify.design/ic/baseline-${kebab}.svg`,
            `https://api.iconify.design/ic/outline-${kebab}.svg`,
            `https://api.iconify.design/ic/round-${kebab}.svg`,
            `https://api.iconify.design/material-symbols/${kebab}.svg`
          );
        } else if (parsed.pack === 'fa' || parsed.pack === 'fa6') {
          candidates.push(
            `https://api.iconify.design/fa6-brands/${kebab}.svg`,
            `https://api.iconify.design/fa-brands/${kebab}.svg`,
            `https://api.iconify.design/fa6-solid/${kebab}.svg`,
            `https://api.iconify.design/fa-solid/${kebab}.svg`,
            `https://api.iconify.design/fa6-regular/${kebab}.svg`,
            `https://api.iconify.design/simple-icons/${kebab}.svg`
          );
        } else if (prefix) {
          candidates.push(`https://api.iconify.design/${prefix}/${kebab}.svg`);
        }

        for (const url of candidates) {
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            if (text && text.includes('<svg')) {
              svgCache.set(parsed.iconName, text);
              if (!isCancelled) setSvgContent(text);
              return;
            }
          }
        }

        // Fallback search via Iconify API for exact icon match
        const searchUrl = `https://api.iconify.design/search?query=${encodeURIComponent(kebab.replace(/-/g, ' '))}&limit=1`;
        const searchRes = await fetch(searchUrl);
        if (searchRes.ok) {
          const data = await searchRes.json();
          const firstIcon = data?.icons?.[0];
          if (firstIcon) {
            const [iconPre, iconId] = firstIcon.split(':');
            const svgRes = await fetch(`https://api.iconify.design/${iconPre}/${iconId}.svg`);
            if (svgRes.ok) {
              const text = await svgRes.text();
              if (text && text.includes('<svg')) {
                svgCache.set(parsed.iconName, text);
                if (!isCancelled) setSvgContent(text);
              }
            }
          }
        }
      } catch (_) {
        // Offline or blocked: fallback Lucide component will render automatically
      }
    };

    fetchIconSvg();
    return () => {
      isCancelled = true;
    };
  }, [parsed?.iconName, parsed?.pack]);

  if (!parsed) return null;

  if (svgContent) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current ${className}`}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        title={parsed.iconName}
      />
    );
  }

  const FallbackComp = getFallbackLucideComponent(parsed.iconName);
  return <FallbackComp className={className} title={parsed.iconName} />;
};
