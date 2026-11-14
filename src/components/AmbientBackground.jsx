import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const AmbientBackground = () => {
  const { effectiveTheme } = useTheme();
  const isLight = effectiveTheme === 'light';

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 transition-colors duration-500 ${isLight ? 'bg-[#BDD4D4]' : 'bg-slate-950'}`}>
      
      {/* Dynamic scenic background texture with gradient mesh */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${isLight ? 'opacity-10 mix-blend-multiply' : 'opacity-25 mix-blend-overlay'}`}
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80')`,
        }}
      />

      {/* Top radial gradient flare featuring #69EBDA */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] blur-3xl rounded-full transition-all duration-700 ${
        isLight 
          ? 'bg-gradient-to-b from-[#69EBDA]/20 via-[#69EBDA]/10 to-transparent' 
          : 'bg-gradient-to-b from-[#69EBDA]/20 via-teal-500/10 to-transparent'
      }`} />

      {/* Ambient Animated Blobs behind the liquid glass elements */}
      {/* Blob 1: Signature #69EBDA Aqua Blob Top Right */}
      <div className={`absolute -top-24 right-10 w-[550px] h-[550px] rounded-full blur-[130px] animate-blob transition-all duration-700 ${
        isLight 
          ? 'bg-gradient-to-tr from-[#69EBDA]/25 to-teal-400/20' 
          : 'bg-gradient-to-tr from-[#69EBDA]/25 to-cyan-400/20'
      }`} />

      {/* Blob 2: Muted Slate-Teal Blob Center Left */}
      <div className={`absolute top-[35%] -left-32 w-[600px] h-[600px] rounded-full blur-[140px] animate-blob-slow transition-all duration-700 ${
        isLight 
          ? 'bg-gradient-to-br from-[#69EBDA]/20 via-teal-600/15 to-transparent' 
          : 'bg-gradient-to-br from-violet-600/20 via-indigo-500/15 to-purple-800/10'
      }`} />

      {/* Blob 3: Emerald / Turquoise / Aqua Blob Bottom Center */}
      <div className={`absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-blob transition-all duration-700 ${
        isLight 
          ? 'bg-gradient-to-tl from-[#69EBDA]/20 to-teal-500/15' 
          : 'bg-gradient-to-tl from-emerald-500/20 to-teal-400/15'
      }`} />

      {/* Blob 4: Warm Pearl accent subtle flare */}
      <div className={`absolute top-[60%] right-[-10%] w-[450px] h-[450px] rounded-full blur-[140px] transition-all duration-700 ${
        isLight 
          ? 'bg-gradient-to-tr from-[#69EBDA]/20 via-cyan-300/15 to-transparent' 
          : 'bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-transparent'
      }`} />

      {/* Subtle digital grid or noise grain overlay */}
      <div className={`absolute inset-0 [background-size:32px_32px] transition-opacity duration-700 ${
        isLight 
          ? 'bg-[radial-gradient(rgba(105,235,218,0.3)_1px,transparent_1px)] opacity-60' 
          : 'bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] opacity-40'
      }`} />

      {/* Vignette softening in light mode, darkening in dark mode */}
      <div className={`absolute inset-0 transition-all duration-700 ${
        isLight 
          ? 'bg-gradient-to-b from-transparent via-[#BDD4D4]/10 to-[#BDD4D4]/30' 
          : 'bg-radial from-transparent via-slate-950/40 to-slate-950/90'
      }`} />

    </div>
  );
};
