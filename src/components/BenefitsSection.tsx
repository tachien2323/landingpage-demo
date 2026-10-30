"use client";

import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { InsurancePlan, PlanCode } from "@/lib/types";
import {
  BookOpen,
  FileText,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  Users,
  Sparkles,
} from "lucide-react";

interface BenefitsSectionProps {
  plans: InsurancePlan[];
  onSelectPlanForFamily: (plan: PlanCode) => void;
}

export function BenefitsSection({ plans, onSelectPlanForFamily }: BenefitsSectionProps) {
  const { lang, t } = useLanguage();
  const docIcons = [BookOpen, FileText, ShieldAlert, Smartphone];

  const getPlan = (code: PlanCode) => plans.find((p) => p.code === code) || plans[0];
  const planA = getPlan("A");
  const planB = getPlan("B");
  const planC = getPlan("C");
  const planD = getPlan("D");

  return (
    <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Section Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1FA3AD]">
          {t.benefits.sectionTag}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#180F50] mt-1">
          {t.benefits.title}
        </h2>
        <p className="text-[#4A4766] mt-2 text-base">{t.benefits.subtitle}</p>
      </div>

      {/* 4 Benefit Document Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {t.benefits.docs.map((doc, idx) => {
          const Icon = docIcons[idx] || FileText;
          return (
            <div
              key={doc.title}
              className="bg-white rounded-2xl border border-[#E6E8F0] p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#34C8D2] transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#EAF9FA] text-[#180F50] flex items-center justify-center group-hover:bg-[#180F50] group-hover:text-[#34C8D2] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F7F8FC] text-[#4A4766] border border-[#E6E8F0]">
                    {doc.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#180F50]">{doc.title}</h3>
                <p className="text-sm text-[#4A4766] mt-2 leading-relaxed">{doc.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E6E8F0]">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1FA3AD] hover:text-[#180F50] transition-colors"
                >
                  <span>{t.benefits.viewDoc}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plans A, B, C, D Comparison Table (with responsive-table modern web guidance) */}
      <div className="mt-12 bg-white rounded-2xl border border-[#E6E8F0] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1FA3AD] mb-1">
              <Sparkles className="w-4 h-4" />
              <span>A · B · C · D</span>
            </div>
            <h3 id="plans-table-caption" className="text-xl sm:text-2xl font-extrabold text-[#180F50]">
              {t.benefits.tableTitle}
            </h3>
            <p className="text-sm text-[#4A4766] mt-1">{t.benefits.tableSubtitle}</p>
          </div>

          <button
            type="button"
            onClick={() => onSelectPlanForFamily("A")}
            className="inline-flex items-center justify-center gap-2 bg-[#180F50] hover:bg-[#34C8D2] text-white hover:text-[#180F50] font-bold text-sm px-5 py-3 rounded-xl transition-colors cursor-pointer self-start lg:self-center shrink-0"
          >
            <Users className="w-4 h-4" />
            <span>{t.benefits.registerFamilyCta}</span>
          </button>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-labelledby="plans-table-caption"
          className="table-wrapper"
        >
          <table
            className="bt-benefits-table text-left text-sm"
            style={
              {
                "--label-2": lang === "vi" ? "Chương trình A" : "Plan A",
                "--label-3": lang === "vi" ? "Chương trình B" : "Plan B",
                "--label-4": lang === "vi" ? "Chương trình C" : "Plan C",
                "--label-5": lang === "vi" ? "Chương trình D" : "Plan D",
              } as React.CSSProperties
            }
          >
            <thead>
              <tr className="bg-[#180F50] text-white">
                <th className="p-4 font-bold text-sm rounded-tl-xl">
                  {t.benefits.colBenefit}
                </th>
                {[planA, planB, planC, planD].map((p, i) => (
                  <th
                    key={p.code}
                    className={`p-4 font-bold text-sm ${
                      i === 3 ? "rounded-tr-xl" : ""
                    }`}
                  >
                    <div className="text-[#34C8D2] text-xs uppercase tracking-wider">
                      {lang === "vi" ? p.tierVi : p.tierEn}
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5">
                      {lang === "vi" ? p.nameVi : p.nameEn}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8F0]">
              {/* Annual Fee Row */}
              <tr className="bg-[#EAF9FA]/60">
                <th className="p-4 font-bold text-[#180F50] bg-[#EAF9FA]">
                  {t.benefits.rows.fee}
                </th>
                {[planA, planB, planC, planD].map((p) => (
                  <td key={p.code} className="p-4 font-extrabold text-[#180F50] text-base">
                    <div>{p.annualFee.toLocaleString("vi-VN")} ₫</div>
                    <button
                      type="button"
                      onClick={() => onSelectPlanForFamily(p.code)}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#1FA3AD] hover:text-[#180F50] underline cursor-pointer"
                    >
                      {lang === "vi" ? `Chọn gói ${p.code}` : `Select Plan ${p.code}`}
                    </button>
                  </td>
                ))}
              </tr>

              {/* Accident */}
              <tr>
                <th className="p-4 font-semibold text-[#180F50]">
                  {t.benefits.rows.accident}
                </th>
                <td className="p-4 text-[#4A4766] font-medium">{planA.accidentLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planB.accidentLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planC.accidentLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planD.accidentLimit}</td>
              </tr>

              {/* Inpatient */}
              <tr>
                <th className="p-4 font-semibold text-[#180F50]">
                  {t.benefits.rows.inpatient}
                </th>
                <td className="p-4 text-[#4A4766] font-medium">{planA.inpatientLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planB.inpatientLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planC.inpatientLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planD.inpatientLimit}</td>
              </tr>

              {/* Outpatient */}
              <tr>
                <th className="p-4 font-semibold text-[#180F50]">
                  {t.benefits.rows.outpatient}
                </th>
                <td className="p-4 text-[#4A4766] font-medium">{planA.outpatientLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planB.outpatientLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planC.outpatientLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planD.outpatientLimit}</td>
              </tr>

              {/* Dental */}
              <tr>
                <th className="p-4 font-semibold text-[#180F50]">
                  {t.benefits.rows.dental}
                </th>
                <td className="p-4 text-[#4A4766] font-medium">{planA.dentalLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planB.dentalLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planC.dentalLimit}</td>
                <td className="p-4 text-[#4A4766] font-medium">{planD.dentalLimit}</td>
              </tr>

              {/* Maternity */}
              <tr>
                <th className="p-4 font-semibold text-[#180F50]">
                  {t.benefits.rows.maternity}
                </th>
                <td className="p-4 text-[#4A4766] font-medium">
                  {lang === "vi" ? planA.maternityLimitVi : planA.maternityLimitEn}
                </td>
                <td className="p-4 text-[#4A4766] font-medium">
                  {lang === "vi" ? planB.maternityLimitVi : planB.maternityLimitEn}
                </td>
                <td className="p-4 text-[#4A4766] font-medium">
                  {lang === "vi" ? planC.maternityLimitVi : planC.maternityLimitEn}
                </td>
                <td className="p-4 text-[#4A4766] font-medium">
                  {lang === "vi" ? planD.maternityLimitVi : planD.maternityLimitEn}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
