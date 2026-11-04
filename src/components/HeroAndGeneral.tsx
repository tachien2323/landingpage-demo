"use client";

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  FileCheck2,
  Users,
  MessageSquareText,
  Building2,
  FileBadge,
  CalendarRange,
  Globe2,
} from "lucide-react";

interface HeroAndGeneralProps {
  onOpenFamilyModal: () => void;
  onOpenChat: () => void;
}

export function HeroAndGeneral({ onOpenFamilyModal, onOpenChat }: HeroAndGeneralProps) {
  const { t } = useLanguage();

  const icons = [Building2, FileBadge, CalendarRange, Globe2];

  return (
    <>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#180F50] via-[#1E1460] to-[#122B59] text-white py-16 sm:py-20 lg:py-24">
        {/* Decorative Subtle Glow */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#34C8D2]/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#34C8D2]/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#34C8D2]/40 text-[#34C8D2] text-xs sm:text-sm font-bold tracking-wider uppercase mb-6 whitespace-nowrap">
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white max-w-4xl mx-auto text-balance">
            {t.hero.title}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#E4E1F5] max-w-3xl mx-auto leading-relaxed text-balance">
            {t.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#claims"
              className="inline-flex items-center gap-2 bg-[#34C8D2] hover:bg-[#2bb5bf] text-[#180F50] font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-lg transition-all whitespace-nowrap"
            >
              <FileCheck2 className="w-5 h-5 shrink-0" />
              <span>{t.hero.btnClaims}</span>
            </a>

            <button
              type="button"
              onClick={onOpenFamilyModal}
              className="inline-flex items-center gap-2 bg-white hover:bg-[#EAF9FA] text-[#180F50] font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Users className="w-5 h-5 text-[#1FA3AD] shrink-0" />
              <span>{t.hero.btnFamily}</span>
            </button>

            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageSquareText className="w-5 h-5 text-[#34C8D2] shrink-0" />
              <span>{t.hero.btnChat}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section I: General Information */}
      <section id="general" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E6E8F0] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-[#E6E8F0]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1FA3AD]">
                {t.general.sectionTag}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#180F50] mt-1">
                {t.general.title}
              </h2>
            </div>
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-[#EAF9FA] text-[#180F50] border border-[#34C8D2]/30 self-start sm:self-center whitespace-nowrap">
              DEMO-2027-0001
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E8F0] pt-6">
            {t.general.items.map((item, idx) => {
              const Icon = icons[idx] || Building2;
              return (
                <div
                  key={item.label}
                  className={`py-4 sm:py-2 ${
                    idx === 0 ? "sm:pr-6" : "sm:px-6"
                  } flex items-start gap-3.5`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EAF9FA] text-[#180F50] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-[#1FA3AD]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#4A4766] whitespace-nowrap">
                      {item.label}
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-[#180F50] mt-0.5 whitespace-nowrap">
                      {item.value}
                    </div>
                    <div className="text-xs sm:text-sm text-[#4A4766] mt-0.5">
                      {item.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
