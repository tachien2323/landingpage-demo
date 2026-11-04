"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";
import { ShieldCheck, Users, Globe, Menu, X, Settings } from "lucide-react";

interface HeaderProps {
  onOpenFamilyModal: () => void;
}

export function Header({ onOpenFamilyModal }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "#general", label: t.nav.general },
    { href: "#benefits", label: t.nav.benefits },
    { href: "#claims", label: t.nav.claims },
    { href: "#notes", label: t.nav.notes },
    { href: "#forms", label: t.nav.forms },
    { href: "#contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#180F50] text-white shadow-lg border-b border-white/10">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#34C8D2] focus:text-[#180F50] focus:px-4 focus:py-2 focus:rounded-lg font-semibold"
      >
        {t.brand.skipToContent}
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 lg:gap-4">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#34C8D2]/15 border border-[#34C8D2]/40 flex items-center justify-center text-[#34C8D2] group-hover:bg-[#34C8D2] group-hover:text-[#180F50] transition-colors shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
              {t.brand.company}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-[#34C8D2] tracking-wide whitespace-nowrap">
              {t.brand.clientSub}
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center gap-0.5 shrink-0">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-2.5 py-2 rounded-lg text-[13px] font-medium text-[#E4E1F5] hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/admin"
            className="px-2.5 py-2 rounded-lg text-xs font-medium text-[#C9C4E8] hover:text-[#34C8D2] hover:bg-white/10 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
            title="Admin Backend"
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span>{t.nav.admin}</span>
          </Link>
        </nav>

        {/* Actions: Family Registration CTA & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenFamilyModal}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#34C8D2] hover:bg-[#2bb5bf] text-[#180F50] font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>{t.nav.registerBtn}</span>
          </button>

          {/* Bilingual Toggle VI / EN */}
          <div
            className="inline-flex items-center gap-0.5 bg-[#261B6E] border border-[#34C8D2]/40 rounded-xl p-1 shrink-0 shadow-inner"
            role="group"
            aria-label="Language switcher"
          >
            <Globe className="w-3.5 h-3.5 text-[#34C8D2] ml-1.5 mr-0.5 hidden sm:block shrink-0" />
            <button
              type="button"
              onClick={() => setLang("vi")}
              aria-pressed={lang === "vi"}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                lang === "vi"
                  ? "bg-[#34C8D2] text-[#180F50] shadow-xs"
                  : "text-white hover:text-[#34C8D2] hover:bg-white/10"
              }`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                lang === "en"
                  ? "bg-[#34C8D2] text-[#180F50] shadow-xs"
                  : "text-white hover:text-[#34C8D2] hover:bg-white/10"
              }`}
            >
              EN
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/25 text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen ? (
        <div className="xl:hidden bg-[#180F50] border-t border-white/10 px-4 pt-3 pb-5 space-y-2 shadow-2xl">
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#E4E1F5] hover:text-white hover:bg-white/10 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#34C8D2] hover:bg-white/10 inline-flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              {t.nav.admin}
            </Link>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenFamilyModal();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#34C8D2] text-[#180F50] font-bold text-sm px-4 py-3 rounded-xl shadow-md"
            >
              <Users className="w-4 h-4" />
              <span>{t.nav.registerBtn}</span>
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
