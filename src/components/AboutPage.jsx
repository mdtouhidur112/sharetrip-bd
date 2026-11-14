import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Compass,
  Plane,
  Car,
  Ship,
  MapPin,
  Globe2,
  Handshake,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Target,
  Eye,
  Briefcase,
  Layers,
  Wallet,
  CalendarCheck,
  FileSignature,
  Award,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  Clock,
  Image as ImageIcon,
  Users
} from 'lucide-react';
import { StorageService } from '../services/storageService';

const SPRING = { type: 'spring', stiffness: 380, damping: 30 };

const SERVICE_ICONS = {
  A: Building2,
  B: Plane,
  C: Car,
  D: Ship,
  E: Compass,
  F: Globe2
};

export const AboutPage = ({ onBack, onOpenContact }) => {
  const [contactInfo, setContactInfo] = useState(() => StorageService.getContactInfo());
  const [about, setAbout] = useState(() => StorageService.getAboutPage());
  const [activeNav, setActiveNav] = useState('overview');

  useEffect(() => {
    const syncContact = () => setContactInfo(StorageService.getContactInfo());
    const syncAbout = () => setAbout(StorageService.getAboutPage());
    window.addEventListener('app:contact-info-updated', syncContact);
    window.addEventListener('app:about-page-updated', syncAbout);
    return () => {
      window.removeEventListener('app:contact-info-updated', syncContact);
      window.removeEventListener('app:about-page-updated', syncAbout);
    };
  }, []);

  const websiteUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://sharetripbd.com';
  const businessAddress = contactInfo?.address?.primary || 'Dhaka, Bangladesh';
  const contactNumber = contactInfo?.phone?.hotline || contactInfo?.whatsapp || '+880 1711-234567';
  const officialEmail =
    contactInfo?.email?.concierge || contactInfo?.email?.bookings || 'info@sharetripbd.com';
  const rawWa = (contactInfo?.whatsapp || '').replace(/[^0-9]/g, '');

  const jumpTo = (id) => {
    setActiveNav(id);
    const el = document.getElementById(`about-${id}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  const glassCard =
    'rounded-3xl bg-[#5C6977]/95 dark:bg-slate-900/80 backdrop-blur-2xl border border-[#69EBDA]/30 dark:border-white/15 shadow-[0_14px_40px_rgba(15,23,42,0.18)] text-white';

  const activities = Array.isArray(about.activities) ? about.activities : [];
  const galleryImages = Array.isArray(about.galleryImages) ? about.galleryImages : [];
  const teamMembers = Array.isArray(about.teamMembers) ? about.teamMembers : [];
  const overviewParagraphs = Array.isArray(about.overviewParagraphs) ? about.overviewParagraphs : [];
  const missions = Array.isArray(about.missions) ? about.missions : [];
  const services = Array.isArray(about.services) ? about.services : [];
  const partnershipSteps = Array.isArray(about.partnershipSteps) ? about.partnershipSteps : [];
  const commissionCategories = Array.isArray(about.commissionCategories) ? about.commissionCategories : [];
  const settlementPoints = Array.isArray(about.settlementPoints) ? about.settlementPoints : [];
  const benefits = Array.isArray(about.benefits) ? about.benefits : [];
  const commitments = Array.isArray(about.commitments) ? about.commitments : [];
  const whyChooseItems = Array.isArray(about.whyChooseItems) ? about.whyChooseItems : [];

  return (
    <div className="relative min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Bar: Back Button + Quick Section Jump Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.96 }}
          transition={SPRING}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#5C6977]/95 dark:bg-slate-900/90 backdrop-blur-xl border border-[#69EBDA]/40 text-white text-xs sm:text-sm font-bold shadow-md hover:border-[#69EBDA] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#69EBDA]" />
          <span>হোমে ফিরে যান</span>
        </motion.button>

        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#5C6977]/90 dark:bg-slate-900/85 backdrop-blur-xl border border-[#69EBDA]/30">
          {[
            { id: 'overview', label: 'Company Overview' },
            { id: 'services', label: 'Our Services' },
            { id: 'partnership', label: 'Partnership' },
            { id: 'benefits', label: 'Benefits' },
            { id: 'principles', label: 'Principles' },
            { id: 'why-us', label: 'Why Choose Us' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => jumpTo(item.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeNav === item.id
                  ? 'bg-[#69EBDA] text-slate-950 shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* HERO: BUSINESS PROFILE                                                */}
      {/* ===================================================================== */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className={`${glassCard} relative overflow-hidden p-6 sm:p-10 mb-8`}
      >
        {about.heroImageUrl && (
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={about.heroImageUrl}
              alt={about.brandTitle || 'About Cover'}
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-950/80" />
          </div>
        )}
        <div className="absolute -top-28 -right-28 w-80 h-80 rounded-full bg-[#69EBDA]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            {about.badgeText && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/45 text-[#69EBDA] text-xs font-extrabold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{about.badgeText}</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-['Outfit',sans-serif]">
              {about.brandTitle || 'SHARE TRIP BD'}
            </h1>

            {about.tagline && (
              <p className="text-base sm:text-lg font-bold text-[#69EBDA]">{about.tagline}</p>
            )}

            {activities.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {activities.map((activity, idx) => (
                  <span
                    key={`${activity}-${idx}`}
                    className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold text-slate-100"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            )}

            {about.businessModel && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/35 border border-[#69EBDA]/30 text-xs font-bold text-slate-100">
                <Handshake className="w-4 h-4 text-[#69EBDA] shrink-0" />
                <span>Business Model: {about.businessModel}</span>
              </div>
            )}
          </div>

          {/* Live Business Contact Snapshot Card */}
          <div className="w-full lg:w-[360px] shrink-0 rounded-2xl bg-slate-950/45 border border-white/15 p-5 space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#69EBDA]">
              Official Corporate Details
            </h2>
            <div className="space-y-2.5 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <Globe2 className="w-4 h-4 text-[#69EBDA] shrink-0 mt-0.5" />
                <span className="break-all">{websiteUrl}</span>
              </div>
              {businessAddress && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#69EBDA] shrink-0 mt-0.5" />
                  <span>{businessAddress}</span>
                </div>
              )}
              {contactNumber && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#69EBDA] shrink-0 mt-0.5" />
                  <span>{contactNumber}</span>
                </div>
              )}
              {officialEmail && (
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-[#69EBDA] shrink-0 mt-0.5" />
                  <span className="break-all">{officialEmail}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ===================================================================== */}
      {/* OPTIONAL PHOTO GALLERY (CONTROLLED FROM ADMIN ABOUT CONTROL)          */}
      {/* ===================================================================== */}
      {galleryImages.length > 0 && (
        <section className="space-y-4 mb-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-teal-950 dark:text-[#69EBDA] text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Gallery
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
              Our Journey & Showcase
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((img, idx) => (
              <div key={img.id || idx} className={`${glassCard} overflow-hidden group`}>
                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-950/40">
                  <img
                    src={img.url}
                    alt={img.caption || `Gallery ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {img.caption && (
                  <div className="p-3.5 text-xs font-semibold text-slate-100">{img.caption}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* OPTIONAL TEAM / LEADERSHIP (CONTROLLED FROM ADMIN ABOUT CONTROL)      */}
      {/* ===================================================================== */}
      {teamMembers.length > 0 && (
        <section className="space-y-4 mb-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-teal-950 dark:text-[#69EBDA] text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Leadership
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
              Our Team & Management
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member, idx) => (
              <div key={member.id || idx} className={`${glassCard} p-5 flex items-start gap-4`}>
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-[#69EBDA]/40 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#69EBDA]/15 border border-[#69EBDA]/35 flex items-center justify-center text-[#69EBDA] font-black text-lg shrink-0">
                    {(member.name || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-white">{member.name}</h3>
                  {member.role && (
                    <div className="text-xs font-bold text-[#69EBDA]">{member.role}</div>
                  )}
                  {member.bio && (
                    <p className="text-xs text-slate-200 leading-relaxed">{member.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* PAGE 1: COMPANY OVERVIEW                                              */}
      {/* ===================================================================== */}
      <section id="about-overview" className="space-y-6 mb-10">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-teal-950 dark:text-[#69EBDA] text-xs font-black uppercase tracking-wider">
            Page 01
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
            Company Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {overviewParagraphs.length > 0 && (
            <div className={`${glassCard} p-6 lg:col-span-2 space-y-3.5`}>
              <div className="flex items-center gap-2.5 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>1. About {about.brandTitle || 'Share Trip BD'}</span>
              </div>
              {overviewParagraphs.map((p, idx) => (
                <p key={idx} className="text-sm leading-relaxed text-slate-100">
                  {p}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-6">
            {about.vision && (
              <div className={`${glassCard} p-6 space-y-3`}>
                <div className="flex items-center gap-2.5 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider">
                  <Eye className="w-4 h-4" />
                  <span>2. Our Vision</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-100">{about.vision}</p>
              </div>
            )}

            {about.businessApproach && (
              <div className={`${glassCard} p-6 space-y-3`}>
                <div className="flex items-center gap-2.5 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider">
                  <Briefcase className="w-4 h-4" />
                  <span>4. Our Business Approach</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                  {about.businessApproach}
                </p>
              </div>
            )}
          </div>
        </div>

        {missions.length > 0 && (
          <div className={`${glassCard} p-6`}>
            <div className="flex items-center gap-2.5 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider mb-4">
              <Target className="w-4 h-4" />
              <span>3. Our Mission</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {missions.map((mission, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-950/35 border border-white/10"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#69EBDA] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-100 leading-relaxed">{mission}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* PAGE 2: OUR SERVICES                                                  */}
      {/* ===================================================================== */}
      {services.length > 0 && (
        <section id="about-services" className="space-y-6 mb-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-teal-950 dark:text-[#69EBDA] text-xs font-black uppercase tracking-wider">
              Page 02
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
              5. Services Offered
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((srv, sIdx) => {
              const Icon = SERVICE_ICONS[srv.code] || Compass;
              const pts = Array.isArray(srv.points) ? srv.points : [];
              return (
                <div key={`${srv.code}-${sIdx}`} className={`${glassCard} p-6 flex flex-col justify-between space-y-4`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-[#69EBDA]/15 border border-[#69EBDA]/40 flex items-center justify-center text-[#69EBDA]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-black text-[#69EBDA]">
                        Service {srv.code || sIdx + 1}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white">{srv.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-200">{srv.intro}</p>

                    {pts.length > 0 && (
                      <div className="pt-1 space-y-1.5">
                        {srv.pointsTitle && (
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#69EBDA]">
                            {srv.pointsTitle}
                          </p>
                        )}
                        <ul className="space-y-1.5">
                          {pts.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-100">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#69EBDA] shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {srv.note && (
                    <p className="text-[11px] text-slate-300 italic border-t border-white/10 pt-3">
                      {srv.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* PAGE 3: MERCHANT PARTNERSHIP PROGRAM                                  */}
      {/* ===================================================================== */}
      <section id="about-partnership" className="space-y-6 mb-10">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-teal-950 dark:text-[#69EBDA] text-xs font-black uppercase tracking-wider">
            Page 03
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
            Merchant Partnership Program
          </h2>
        </div>

        {(about.partnershipIntro || partnershipSteps.length > 0) && (
          <div className={`${glassCard} p-6 space-y-5`}>
            {about.partnershipIntro && (
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-[#69EBDA]">6. Our Partnership Model</h3>
                <p className="text-sm text-slate-100 leading-relaxed">{about.partnershipIntro}</p>
              </div>
            )}

            {partnershipSteps.length > 0 && (
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-3">
                  How the Partnership Works
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {partnershipSteps.map((st, idx) => (
                    <div
                      key={`${st.step}-${idx}`}
                      className="p-4 rounded-2xl bg-slate-950/40 border border-[#69EBDA]/25 space-y-2"
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#69EBDA]/20 text-[#69EBDA] text-[11px] font-black">
                        {st.step}
                      </span>
                      <h4 className="text-sm font-extrabold text-white">{st.title}</h4>
                      <p className="text-xs text-slate-200 leading-relaxed">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(about.commissionIntro || commissionCategories.length > 0) && (
            <div className={`${glassCard} p-6 lg:col-span-2 space-y-4`}>
              <div className="flex items-center gap-2 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>7. Flexible Commission Structure</span>
              </div>
              {about.commissionIntro && (
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {about.commissionIntro}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {commissionCategories.map((c, idx) => (
                  <div key={`${c.label}-${idx}`} className="p-3.5 rounded-2xl bg-slate-950/35 border border-white/10 space-y-1">
                    <div className="text-xs font-extrabold text-[#69EBDA]">{c.label}</div>
                    <p className="text-xs text-slate-200 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(about.settlementIntro || settlementPoints.length > 0) && (
            <div className={`${glassCard} p-6 space-y-4`}>
              <div className="flex items-center gap-2 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider">
                <Wallet className="w-4 h-4" />
                <span>8. Payment & Settlement Policy</span>
              </div>
              {about.settlementIntro && (
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {about.settlementIntro}
                </p>
              )}
              <ul className="space-y-2">
                {settlementPoints.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#69EBDA] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 4: BENEFITS & COMMITMENT                                         */}
      {/* ===================================================================== */}
      {(benefits.length > 0 || commitments.length > 0) && (
        <section id="about-benefits" className="space-y-6 mb-10">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-teal-950 dark:text-[#69EBDA] text-xs font-black uppercase tracking-wider">
              Page 04
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
              9. Benefits for Merchant Partners
            </h2>
          </div>

          {benefits.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((b, idx) => (
                <div key={`${b.num}-${idx}`} className={`${glassCard} p-5 space-y-2`}>
                  <span className="text-xs font-black text-[#69EBDA]">{b.num}</span>
                  <h3 className="text-sm font-extrabold text-white">{b.title}</h3>
                  <p className="text-xs text-slate-200 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          )}

          {commitments.length > 0 && (
            <div className={`${glassCard} p-6 space-y-4`}>
              <div className="flex items-center gap-2 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>10. Our Commitment to Merchants</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {commitments.map((c, idx) => (
                  <div key={`${c.name}-${idx}`} className="p-3.5 rounded-2xl bg-slate-950/35 border border-white/10">
                    <div className="text-xs font-extrabold text-[#69EBDA] mb-1">{c.name}</div>
                    <p className="text-xs text-slate-200 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===================================================================== */}
      {/* PAGE 5: OPERATING PRINCIPLES & PARTNERSHIP PROCESS                    */}
      {/* ===================================================================== */}
      <section id="about-principles" className="space-y-6 mb-10">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-teal-950 dark:text-[#69EBDA] text-xs font-black uppercase tracking-wider">
            Page 05
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
            Operating Principles & Partnership Process
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${glassCard} p-6 space-y-4`}>
            <div className="flex items-center gap-2 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider">
              <CalendarCheck className="w-4 h-4" />
              <span>11. Booking & Service Coordination</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Share Trip BD will coordinate booking requests with the relevant merchant according to the agreed procedure. A booking will be treated as confirmed only after the required confirmation from the merchant or authorized service provider.
            </p>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Merchants are expected to provide accurate information about their services, prices, availability, operating conditions, and applicable restrictions.
            </p>
          </div>

          <div className={`${glassCard} p-6 space-y-4`}>
            <div className="flex items-center gap-2 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>12. Cancellation, Refund & Customer Support</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Cancellation, rescheduling, refund, and no-show policies will follow the applicable terms of the relevant merchant, airline, ship operator, hotel, transportation provider, or tour operator.
            </p>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Any commission adjustment arising from a cancellation, refund, or booking modification will be determined by the written merchant agreement and the relevant service terms.
            </p>
          </div>

          <div className={`${glassCard} p-6 space-y-3`}>
            <div className="flex items-center gap-2 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider">
              <FileSignature className="w-4 h-4" />
              <span>13. Partnership Agreement & Responsibilities</span>
            </div>
            <ul className="space-y-1.5">
              {[
                'The services covered by the partnership.',
                'Individually negotiated commission rates and their calculation basis.',
                'Booking confirmation and service delivery procedures.',
                'Payment and settlement schedules.',
                'Cancellation, refund, and dispute-resolution procedures.',
                'Confidentiality and other applicable commercial terms.'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#69EBDA] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${glassCard} p-6 space-y-3`}>
            <div className="flex items-center gap-2 text-[#69EBDA] font-extrabold text-sm uppercase tracking-wider">
              <Handshake className="w-4 h-4" />
              <span>14. How to Become Our Merchant Partner</span>
            </div>
            <ol className="space-y-2">
              {[
                'Contact Share Trip BD to express your interest.',
                'Share details of your business, services, and commercial requirements.',
                'Discuss commission rates, booking procedures, and settlement terms.',
                'Finalize and sign the merchant partnership agreement.',
                'Begin service coordination and mutually agreed promotional activities.'
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-100">
                  <span className="w-5 h-5 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-[#69EBDA] font-black flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PAGE 6: WHY CHOOSE & CTA                                              */}
      {/* ===================================================================== */}
      <section id="about-why-us" className="space-y-6">
        {whyChooseItems.length > 0 && (
          <>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#69EBDA]/20 border border-[#69EBDA]/40 text-teal-950 dark:text-[#69EBDA] text-xs font-black uppercase tracking-wider">
                Page 06
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit',sans-serif]">
                15. Why Choose {about.brandTitle || 'Share Trip BD'}?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {whyChooseItems.map((item, idx) => (
                <div key={`${item.title}-${idx}`} className={`${glassCard} p-5 space-y-2`}>
                  <div className="flex items-center gap-2 text-[#69EBDA]">
                    <Award className="w-4 h-4 shrink-0" />
                    <h3 className="text-sm font-extrabold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={`${glassCard} p-6 sm:p-8 relative overflow-hidden`}>
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#69EBDA]/15 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="text-xs font-extrabold uppercase tracking-widest text-[#69EBDA]">
                16. Let&apos;s Grow Together • Partner With {about.brandTitle || 'Share Trip BD'} Today
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif]">
                {about.ctaTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {about.ctaDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {rawWa && (
                <a
                  href={`https://wa.me/${rawWa}?text=${encodeURIComponent(
                    `Hello ${about.brandTitle || 'Share Trip BD'}! We are interested in becoming a Merchant Partner.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#22c35e] text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Partner via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {onOpenContact && (
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#69EBDA] to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
                >
                  <Phone className="w-4 h-4" />
                  <span>Contact Us</span>
                </button>
              )}
            </div>
          </div>

          {about.documentNote && (
            <div className="mt-6 pt-4 border-t border-white/15 text-[11px] text-slate-300">
              <strong>Document Note:</strong> {about.documentNote}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
