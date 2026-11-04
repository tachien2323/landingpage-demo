"use client";

import React, { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  ZoomIn,
  X,
  Download,
  ExternalLink,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageSquarePlus,
} from "lucide-react";

interface ClaimsNotesContactProps {
  onOpenFamilyModal: () => void;
  onAskQuestion: (question: string) => void;
  onOpenChat: () => void;
}

export function ClaimsNotesContact({
  onOpenFamilyModal,
  onAskQuestion,
  onOpenChat,
}: ClaimsNotesContactProps) {
  const { t } = useLanguage();
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);
  const lightboxRef = useRef<HTMLDialogElement>(null);

  // Fallback for browsers without <dialog closedby="any"> support (light-dismiss-a-dialog best practice)
  useEffect(() => {
    const dialog = lightboxRef.current;
    if (!dialog) return;

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };
      dialog.addEventListener("click", handleBackdropClick);
      return () => dialog.removeEventListener("click", handleBackdropClick);
    }
  }, []);

  const openLightbox = (src: string, alt: string) => {
    setZoomImage({ src, alt });
    const dialog = lightboxRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  };

  const closeLightbox = () => {
    const dialog = lightboxRef.current;
    if (dialog && dialog.open) {
      dialog.close();
    }
    setZoomImage(null);
  };

  const diagrams = [
    {
      title: t.claims.tabProcess,
      desktop: "https://baohiem24g.com/bt/wp-content/uploads/2026/10/quy-trinh-desktop.webp",
      mobile: "https://baohiem24g.com/bt/wp-content/uploads/2026/10/quy-trinh-mobile-scaled.webp",
    },
    {
      title: t.claims.tabDocs,
      desktop: "https://baohiem24g.com/bt/wp-content/uploads/2026/10/chung-tu-desktop.webp",
      mobile: "https://baohiem24g.com/bt/wp-content/uploads/2026/10/chung-tu-mobile-scaled.webp",
    },
  ];

  return (
    <>
      {/* Section III: Claims Guide & Lookup / Forms */}
      <section id="claims" className="bg-white border-y border-[#E6E8F0] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1FA3AD]">
              {t.claims.sectionTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#180F50] mt-1">
              {t.claims.title}
            </h2>
            <p className="text-[#4A4766] mt-2 text-base">{t.claims.subtitle}</p>
          </div>

          {/* 2 Infographic Diagrams (Desktop & Mobile responsive + Lightbox Zoom) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {diagrams.map((item) => (
              <div
                key={item.title}
                className="bg-[#F7F8FC] rounded-2xl border border-[#E6E8F0] p-4 sm:p-5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-[#180F50] text-base sm:text-lg">
                    {item.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => openLightbox(item.desktop, item.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1FA3AD] hover:text-[#180F50] bg-white px-3 py-1.5 rounded-lg border border-[#E6E8F0] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <ZoomIn className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.claims.clickToZoom}</span>
                  </button>
                </div>

                {/* Desktop image */}
                <button
                  type="button"
                  onClick={() => openLightbox(item.desktop, item.title)}
                  className="hidden sm:block relative group rounded-xl overflow-hidden border border-[#E6E8F0] bg-white shadow-sm cursor-zoom-in"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.desktop}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-auto object-contain group-hover:scale-[1.01] transition-transform"
                  />
                </button>

                {/* Mobile image */}
                <button
                  type="button"
                  onClick={() => openLightbox(item.mobile, item.title)}
                  className="sm:hidden relative group rounded-xl overflow-hidden border border-[#E6E8F0] bg-white shadow-sm cursor-zoom-in"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.mobile}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-auto object-contain"
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Pre-visit Lookup & Downloadable Forms Boxes */}
          <div id="forms" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
            {/* Lookup Box */}
            <div className="bg-[#F7F8FC] rounded-2xl border border-[#E6E8F0] p-6 sm:p-7">
              <h3 className="text-xl font-extrabold text-[#180F50]">
                {t.claims.lookupTitle}
              </h3>
              <p className="text-sm text-[#4A4766] mt-1">{t.claims.lookupSubtitle}</p>

              <ul className="mt-5 divide-y divide-dashed divide-[#E6E8F0]">
                {t.claims.lookupLinks.map((link) => {
                  const isWarning = link.type === "WARNING";
                  const Icon =
                    link.type === "XLSX"
                      ? FileSpreadsheet
                      : isWarning
                      ? AlertTriangle
                      : FileText;
                  return (
                    <li key={link.title} className="py-3.5 first:pt-0 last:pb-0">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isWarning
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-[#EAF9FA] text-[#1FA3AD]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div
                              className={`font-bold text-sm sm:text-base group-hover:underline ${
                                isWarning ? "text-red-700" : "text-[#180F50]"
                              }`}
                            >
                              {link.title}
                            </div>
                            <div className="text-xs text-[#4A4766] mt-0.5 leading-relaxed">
                              {link.desc}
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#4A4766] group-hover:text-[#1FA3AD] shrink-0 mt-1" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Downloadable Forms Box */}
            <div className="bg-[#F7F8FC] rounded-2xl border border-[#E6E8F0] p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-[#180F50]">
                  {t.claims.formsTitle}
                </h3>
                <p className="text-sm text-[#4A4766] mt-1">{t.claims.formsSubtitle}</p>

                <ul className="mt-5 space-y-4">
                  {t.claims.formsLinks.map((form) => (
                    <li
                      key={form.title}
                      className="bg-white rounded-xl border border-[#E6E8F0] p-4 hover:border-[#34C8D2] transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#180F50] text-[#34C8D2] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                            {form.type}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-[#180F50] text-sm sm:text-base whitespace-nowrap">
                                {form.title}
                              </h4>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EAF9FA] text-[#1FA3AD] whitespace-nowrap">
                                {form.subBadge}
                              </span>
                            </div>
                            <p className="text-xs text-[#4A4766] mt-1 leading-relaxed">
                              {form.desc}
                            </p>
                          </div>
                        </div>
                        <a
                          href={form.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#EAF9FA] hover:bg-[#34C8D2] text-[#180F50] font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shrink-0 whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5 shrink-0" />
                          <span>{t.claims.downloadBtn}</span>
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[#EAF9FA] border border-[#34C8D2]/30 text-xs sm:text-sm text-[#180F50] leading-relaxed">
                💡 <strong>{t.claims.quickTipLead}</strong> {t.claims.quickTipTextBefore}{" "}
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="font-bold text-[#1FA3AD] underline cursor-pointer whitespace-nowrap"
                >
                  {t.claims.quickTipLink}
                </button>{" "}
                {t.claims.quickTipTextAfter}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section IV: 8 Important Notes */}
      <section id="notes" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1FA3AD]">
            {t.notes.sectionTag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#180F50] mt-1 text-balance">
            {t.notes.title}
          </h2>
          <p className="text-[#4A4766] mt-2 text-base text-balance">
            {t.notes.subtitle}
          </p>
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-[#E6E8F0] p-6 sm:p-8 shadow-xs">
          <ol className="divide-y divide-[#E6E8F0]">
            {t.notes.items.map((note, idx) => (
              <li
                key={idx}
                className="py-4 first:pt-0 last:pb-0 flex items-start gap-4"
              >
                <span className="w-8 h-8 rounded-lg bg-[#EAF9FA] text-[#180F50] font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm sm:text-base text-[#4A4766] leading-relaxed">
                  <strong className="text-[#180F50] font-bold">{note.bold}</strong>{" "}
                  {note.text}
                  {"linkText" in note && note.linkText ? (
                    <>
                      <a
                        href={t.notes.blacklistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1FA3AD] font-semibold underline hover:text-[#180F50] whitespace-nowrap"
                      >
                        {note.linkText}
                      </a>
                      {note.afterLink}
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Section V: Family Dependent Insurance Enrollment Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#180F50] via-[#221669] to-[#163868] text-white p-8 sm:p-10 lg:p-12 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#34C8D2] bg-white/10 px-3 py-1 rounded-full border border-[#34C8D2]/30 whitespace-nowrap">
                {t.familyBanner.sectionTag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 leading-tight text-balance">
                {t.familyBanner.title}
              </h2>
              <p className="text-[#E4E1F5] mt-3 text-sm sm:text-base leading-relaxed">
                {t.familyBanner.subtitle}
              </p>

              <ul className="mt-5 space-y-2 text-sm text-white/90">
                {[
                  t.familyBanner.bullet1,
                  t.familyBanner.bullet2,
                  t.familyBanner.bullet3,
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#34C8D2] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center lg:justify-end shrink-0">
              <button
                type="button"
                onClick={onOpenFamilyModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#34C8D2] hover:bg-[#2bb5bf] text-[#180F50] font-extrabold text-base px-7 py-4 rounded-2xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                <Users className="w-5 h-5 shrink-0" />
                <span>{t.familyBanner.openModalBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section VI: Contact & Support */}
      <section id="contact" className="bg-white border-t border-[#E6E8F0] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1FA3AD]">
              {t.contact.sectionTag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#180F50] mt-1">
              {t.contact.title}
            </h2>
            <p className="text-[#4A4766] mt-2 text-base">{t.contact.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Col 1: Benefits Consultation */}
            <div className="bg-[#F7F8FC] rounded-2xl border border-[#E6E8F0] p-6">
              <h3 className="text-lg font-extrabold text-[#180F50] pb-3 border-b border-[#E6E8F0]">
                {t.contact.col1Title}
              </h3>
              <ul className="mt-4 divide-y divide-dashed divide-[#E6E8F0] space-y-3">
                <li className="pt-3 first:pt-0">
                  <div className="font-bold text-[#180F50] whitespace-nowrap">Ms. Cao Vân Anh</div>
                  <div className="mt-1 flex flex-col gap-1 text-sm text-[#4A4766]">
                    <a
                      href="tel:0902176609"
                      className="inline-flex items-center gap-2 hover:text-[#1FA3AD] whitespace-nowrap"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#1FA3AD] shrink-0" />
                      <span>0902 176 609</span>
                    </a>
                    <a
                      href="mailto:vananh.cao@bolttech.io"
                      className="inline-flex items-center gap-2 hover:text-[#1FA3AD] whitespace-nowrap"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#1FA3AD] shrink-0" />
                      <span>vananh.cao@bolttech.io</span>
                    </a>
                  </div>
                </li>
                <li className="pt-3">
                  <div className="font-bold text-[#180F50] whitespace-nowrap">Ms. Phan Thị Hiền</div>
                  <div className="mt-1 flex flex-col gap-1 text-sm text-[#4A4766]">
                    <a
                      href="tel:0979494095"
                      className="inline-flex items-center gap-2 hover:text-[#1FA3AD] whitespace-nowrap"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#1FA3AD] shrink-0" />
                      <span>0979 494 095</span>
                    </a>
                    <a
                      href="mailto:hien.phan@bolttech.io"
                      className="inline-flex items-center gap-2 hover:text-[#1FA3AD] whitespace-nowrap"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#1FA3AD] shrink-0" />
                      <span>hien.phan@bolttech.io</span>
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Col 2: Claims Support */}
            <div className="bg-[#F7F8FC] rounded-2xl border border-[#E6E8F0] p-6">
              <h3 className="text-lg font-extrabold text-[#180F50] pb-3 border-b border-[#E6E8F0]">
                {t.contact.col2Title}
              </h3>
              <ul className="mt-4 divide-y divide-dashed divide-[#E6E8F0] space-y-3">
                <li className="pt-3 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#180F50] whitespace-nowrap">
                      Mr. Dương Hùng Chiến
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#EAF9FA] text-[#1FA3AD] whitespace-nowrap">
                      {t.contact.northRegion}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-col gap-1 text-sm text-[#4A4766]">
                    <a
                      href="tel:0838830038"
                      className="inline-flex items-center gap-2 hover:text-[#1FA3AD] whitespace-nowrap"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#1FA3AD] shrink-0" />
                      <span>0838 830 038</span>
                    </a>
                    <a
                      href="mailto:chien.duong@bolttech.io"
                      className="inline-flex items-center gap-2 hover:text-[#1FA3AD] whitespace-nowrap"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#1FA3AD] shrink-0" />
                      <span>chien.duong@bolttech.io</span>
                    </a>
                  </div>
                </li>
                <li className="pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#180F50] whitespace-nowrap">
                      Ms. Nguyễn Thị Ánh Thuyết
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#EAF9FA] text-[#1FA3AD] whitespace-nowrap">
                      {t.contact.southRegion}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-col gap-1 text-sm text-[#4A4766]">
                    <a
                      href="tel:0967740239"
                      className="inline-flex items-center gap-2 hover:text-[#1FA3AD] whitespace-nowrap"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#1FA3AD] shrink-0" />
                      <span>0967 740 239</span>
                    </a>
                    <a
                      href="mailto:thuyet.nguyen@bolttech.io"
                      className="inline-flex items-center gap-2 hover:text-[#1FA3AD] whitespace-nowrap"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#1FA3AD] shrink-0" />
                      <span>thuyet.nguyen@bolttech.io</span>
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Col 3: Mailing Addresses */}
            <div className="bg-[#F7F8FC] rounded-2xl border border-[#E6E8F0] p-6">
              <h3 className="text-lg font-extrabold text-[#180F50] pb-3 border-b border-[#E6E8F0]">
                {t.contact.col3Title}
              </h3>
              <ul className="mt-4 divide-y divide-dashed divide-[#E6E8F0] space-y-3">
                <li className="pt-3 first:pt-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#1FA3AD] shrink-0" />
                    <span className="font-bold text-[#180F50] whitespace-nowrap">
                      {t.contact.hanoiOffice}
                    </span>
                    <span className="text-xs font-semibold text-[#1FA3AD] whitespace-nowrap">
                      · Mr. Dương Hùng Chiến
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4A4766] mt-1 leading-relaxed">
                    {t.contact.hanoiAddress}
                  </p>
                  <a
                    href="tel:+842471080668"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#180F50] hover:text-[#1FA3AD] mt-1 whitespace-nowrap"
                  >
                    <Phone className="w-3 h-3 text-[#1FA3AD] shrink-0" />
                    <span>024 7108 0668</span>
                  </a>
                </li>

                <li className="pt-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#1FA3AD] shrink-0" />
                    <span className="font-bold text-[#180F50] whitespace-nowrap">
                      {t.contact.hcmOffice}
                    </span>
                    <span className="text-xs font-semibold text-[#1FA3AD] whitespace-nowrap">
                      · Ms. Nguyễn Thị Ánh Thuyết
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#4A4766] mt-1 leading-relaxed">
                    {t.contact.hcmAddress}
                  </p>
                  <a
                    href="tel:+842471080668"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#180F50] hover:text-[#1FA3AD] mt-1 whitespace-nowrap"
                  >
                    <Phone className="w-3 h-3 text-[#1FA3AD] shrink-0" />
                    <span>024 7108 0668</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom AI Advisor Prompt Chips CTA */}
          <div className="mt-14 bg-[#EAF9FA] rounded-3xl border border-[#34C8D2]/30 p-8 sm:p-10 text-center max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#180F50] text-balance">
              {t.contact.ctaTitle}
            </h3>
            <p className="text-sm sm:text-base text-[#4A4766] mt-2 max-w-2xl mx-auto text-balance">
              {t.contact.ctaDesc}
            </p>

            {/* Suggested Question Chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              {t.contact.suggestedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onAskQuestion(q)}
                  className="bg-white hover:bg-[#FFFDF0] text-[#180F50] border border-[#180F50]/15 hover:border-[#180F50] rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                >
                  <span className="text-[#1FA3AD] font-bold mr-1">“</span>
                  {q}
                  <span className="text-[#1FA3AD] font-bold ml-1">”</span>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 bg-[#180F50] hover:bg-[#34C8D2] text-white hover:text-[#180F50] font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl transition-colors cursor-pointer shadow-md whitespace-nowrap"
              >
                <MessageSquarePlus className="w-5 h-5 shrink-0" />
                <span>{t.contact.openChatBtn}</span>
              </button>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-[#4A4766]">
              {t.contact.hotlinePrefix}{" "}
              <a href="tel:+842471080668" className="font-bold text-[#180F50] underline whitespace-nowrap">
                024 7108 0668
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#180F50] text-[#C9C4E8] py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <p>{t.footer.copyright}</p>
          <a href="#" className="hover:text-[#34C8D2] font-semibold transition-colors whitespace-nowrap">
            {t.footer.backToTop}
          </a>
        </div>
      </footer>

      {/* Native <dialog closedby="any"> Lightbox Modal for Diagrams */}
      <dialog
        ref={lightboxRef}
        {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-label={zoomImage?.alt || "Diagram preview"}
        onClose={() => setZoomImage(null)}
        className="bt-dialog"
      >
        {zoomImage ? (
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#E6E8F0] flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#180F50] text-white">
              <span className="font-bold text-sm sm:text-base">{zoomImage.alt}</span>
              <button
                type="button"
                onClick={closeLightbox}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap"
              >
                <X className="w-4 h-4 shrink-0" />
                <span>{t.claims.closeZoom}</span>
              </button>
            </div>
            <div className="p-4 overflow-auto bg-[#F7F8FC] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoomImage.src}
                alt={zoomImage.alt}
                className="max-w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
