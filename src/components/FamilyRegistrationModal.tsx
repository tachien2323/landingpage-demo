"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { FamilyRegistration, InsurancePlan, PlanCode } from "@/lib/types";
import {
  Users,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface FamilyRegistrationModalProps {
  isOpen: boolean;
  initialPlan?: PlanCode;
  plans: InsurancePlan[];
  onClose: () => void;
}

interface DependentDraft {
  id: string;
  fullName: string;
  relationship: string;
  gender: "Nam" | "Nữ";
  age: string;
  dobOrId: string;
  plan: PlanCode;
}

export function FamilyRegistrationModal({
  isOpen,
  initialPlan = "A",
  plans,
  onClose,
}: FamilyRegistrationModalProps) {
  const { lang, t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [employeeName, setEmployeeName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [employeePhone, setEmployeePhone] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");

  const [dependents, setDependents] = useState<DependentDraft[]>([
    {
      id: "dep-1",
      fullName: "",
      relationship: t.familyModal.relations[0],
      gender: "Nữ",
      age: "30",
      dobOrId: "",
      plan: initialPlan,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<FamilyRegistration | null>(null);

  // Update first dependent plan if opened with a specific plan
  useEffect(() => {
    if (isOpen && !submittedResult) {
      setDependents((prev) =>
        prev.map((d, idx) => (idx === 0 ? { ...d, plan: initialPlan } : d))
      );
    }
  }, [initialPlan, isOpen, submittedResult]);

  // Open / close native <dialog> via showModal() (light-dismiss-a-dialog best practice)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Fallback for browsers without closedby="any" support + ARIA :user-invalid sync
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleNativeClose = () => {
      onClose();
    };
    dialog.addEventListener("close", handleNativeClose);

    let removeBackdropClick: (() => void) | undefined;
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
      removeBackdropClick = () => dialog.removeEventListener("click", handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener("close", handleNativeClose);
      if (removeBackdropClick) removeBackdropClick();
    };
  }, [onClose]);

  // Sync aria-invalid with CSS :user-invalid state (validate-input-after-interaction best practice)
  const syncAriaInvalid = (
    e: React.FocusEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>
  ) => {
    const el = e.currentTarget;
    try {
      if (el.matches(":user-invalid")) {
        el.setAttribute("aria-invalid", "true");
      } else {
        el.setAttribute("aria-invalid", "false");
      }
    } catch {
      // fallback if :user-invalid not supported
    }
  };

  const getFeeForPlan = (code: PlanCode): number => {
    return plans.find((p) => p.code === code)?.annualFee || 6500000;
  };

  const totalFee = dependents.reduce((sum, dep) => sum + getFeeForPlan(dep.plan), 0);

  const handleAddDependent = () => {
    setDependents((prev) => [
      ...prev,
      {
        id: `dep-${Date.now()}-${prev.length + 1}`,
        fullName: "",
        relationship: t.familyModal.relations[1] || t.familyModal.relations[0],
        gender: "Nam",
        age: "8",
        dobOrId: "",
        plan: initialPlan,
      },
    ]);
  };

  const handleRemoveDependent = (id: string) => {
    if (dependents.length <= 1) return;
    setDependents((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDependentChange = <K extends keyof DependentDraft>(
    id: string,
    field: K,
    value: DependentDraft[K]
  ) => {
    setDependents((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName,
          employeeCode,
          employeePhone,
          employeeEmail,
          dependents: dependents.map((d) => ({
            ...d,
            age: Number(d.age) || 1,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit registration");
      }

      setSubmittedResult(data.registration);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error submitting form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetNew = () => {
    setSubmittedResult(null);
    setDependents([
      {
        id: `dep-${Date.now()}`,
        fullName: "",
        relationship: t.familyModal.relations[0],
        gender: "Nữ",
        age: "30",
        dobOrId: "",
        plan: initialPlan,
      },
    ]);
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-labelledby="family-modal-title"
      className="bt-dialog"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E6E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#180F50] text-white px-6 py-5 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#34C8D2]/20 border border-[#34C8D2]/40 flex items-center justify-center text-[#34C8D2] shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 id="family-modal-title" className="text-lg sm:text-xl font-extrabold">
                {t.familyModal.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#C9C4E8] mt-0.5">
                {t.familyModal.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label={t.familyModal.cancelBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-[#F7F8FC]">
          {submittedResult ? (
            /* Success Confirmation State */
            <div className="bg-white rounded-2xl border border-[#34C8D2] p-6 sm:p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#EAF9FA] text-[#1FA3AD] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#180F50]">
                  {t.familyModal.successTitle}
                </h3>
                <p className="text-sm text-[#4A4766] mt-1 max-w-lg mx-auto">
                  {t.familyModal.successDesc}
                </p>
              </div>

              <div className="bg-[#F7F8FC] rounded-2xl border border-[#E6E8F0] p-5 text-left max-w-xl mx-auto space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-[#E6E8F0] pb-2.5">
                  <span className="text-[#4A4766] font-medium">
                    {t.familyModal.regIdLabel}
                  </span>
                  <span className="font-extrabold text-[#180F50] bg-[#EAF9FA] px-3 py-1 rounded-lg">
                    {submittedResult.id}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#E6E8F0] pb-2.5">
                  <span className="text-[#4A4766] font-medium">
                    {t.familyModal.empName.replace(" *", "")}:
                  </span>
                  <span className="font-bold text-[#180F50]">
                    {submittedResult.employeeName}
                  </span>
                </div>

                <div className="space-y-1.5 border-b border-[#E6E8F0] pb-2.5">
                  <div className="text-xs font-bold uppercase text-[#1FA3AD]">
                    {t.familyModal.totalCountLabel} {submittedResult.dependents.length}{" "}
                    {t.familyModal.peopleUnit}
                  </div>
                  {submittedResult.dependents.map((d, i) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between text-xs sm:text-sm bg-white p-2.5 rounded-lg border border-[#E6E8F0]"
                    >
                      <span>
                        <strong>
                          {i + 1}. {d.fullName}
                        </strong>{" "}
                        ({d.relationship}, {d.gender}, {d.age}t) —{" "}
                        <span className="text-[#1FA3AD] font-semibold">
                          Gói {d.plan}
                        </span>
                      </span>
                      <span className="font-bold text-[#180F50]">
                        {d.fee.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-[#180F50]">
                    {t.familyModal.totalFeeLabel}
                  </span>
                  <span className="text-lg font-extrabold text-[#1FA3AD]">
                    {submittedResult.totalFee.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-[#EAF9FA] border border-[#34C8D2]/40 flex items-start gap-2.5 text-xs text-[#180F50]">
                  <FileSpreadsheet className="w-4 h-4 text-[#1FA3AD] shrink-0 mt-0.5" />
                  <div>
                    <strong>{t.familyModal.sheetStatusLabel}</strong>{" "}
                    {submittedResult.sheetSyncMessage}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetNew}
                  className="px-5 py-2.5 rounded-xl border border-[#180F50]/20 text-[#180F50] font-semibold text-sm hover:bg-[#EAF9FA] transition-colors cursor-pointer"
                >
                  {t.familyModal.newRegBtn}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#180F50] text-white font-bold text-sm hover:bg-[#34C8D2] hover:text-[#180F50] transition-colors cursor-pointer"
                >
                  {t.familyModal.closeSuccessBtn}
                </button>
              </div>
            </div>
          ) : (
            /* Enrollment Form */
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {errorMsg ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                  {errorMsg}
                </div>
              ) : null}

              {/* 1. Employee Information */}
              <div className="bg-white rounded-2xl border border-[#E6E8F0] p-5 sm:p-6 shadow-2xs">
                <h3 className="text-base font-extrabold text-[#180F50] pb-3 border-b border-[#E6E8F0] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1FA3AD]" />
                  <span>{t.familyModal.empSection}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {/* Employee Name */}
                  <div className="bt-field">
                    <label
                      htmlFor="emp-name"
                      className="block text-xs font-bold uppercase tracking-wide text-[#180F50] mb-1"
                    >
                      {t.familyModal.empName}
                    </label>
                    <span id="emp-name-hint" className="hint">
                      {t.familyModal.empNameHint}
                    </span>
                    <input
                      id="emp-name"
                      name="employeeName"
                      type="text"
                      required
                      minLength={2}
                      autoComplete="name"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      onBlur={syncAriaInvalid}
                      onInput={syncAriaInvalid}
                      aria-describedby="emp-name-hint"
                      aria-errormessage="emp-name-error"
                      placeholder={t.familyModal.empNamePlaceholder}
                      className="bt-input w-full px-3.5 py-2.5 rounded-xl border border-[#E6E8F0] text-sm text-[#180F50] focus:outline-none focus:border-[#180F50]"
                    />
                    <div id="emp-name-error" className="error-msg">
                      <span aria-hidden="true">❌ </span>
                      {t.familyModal.empNameError}
                    </div>
                  </div>

                  {/* Employee ID / Dept */}
                  <div className="bt-field">
                    <label
                      htmlFor="emp-code"
                      className="block text-xs font-bold uppercase tracking-wide text-[#180F50] mb-1"
                    >
                      {t.familyModal.empCode}
                    </label>
                    <span className="hint">DEMO-2027-0001</span>
                    <input
                      id="emp-code"
                      name="employeeCode"
                      type="text"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder={t.familyModal.empCodePlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E8F0] text-sm text-[#180F50] focus:outline-none focus:border-[#180F50]"
                    />
                  </div>

                  {/* Employee Phone */}
                  <div className="bt-field">
                    <label
                      htmlFor="emp-phone"
                      className="block text-xs font-bold uppercase tracking-wide text-[#180F50] mb-1"
                    >
                      {t.familyModal.empPhone}
                    </label>
                    <span id="emp-phone-hint" className="hint">
                      {t.familyModal.empPhoneHint}
                    </span>
                    <input
                      id="emp-phone"
                      name="employeePhone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      pattern="[0-9+\s]{9,15}"
                      value={employeePhone}
                      onChange={(e) => setEmployeePhone(e.target.value)}
                      onBlur={syncAriaInvalid}
                      onInput={syncAriaInvalid}
                      aria-describedby="emp-phone-hint"
                      aria-errormessage="emp-phone-error"
                      placeholder={t.familyModal.empPhonePlaceholder}
                      className="bt-input w-full px-3.5 py-2.5 rounded-xl border border-[#E6E8F0] text-sm text-[#180F50] focus:outline-none focus:border-[#180F50]"
                    />
                    <div id="emp-phone-error" className="error-msg">
                      <span aria-hidden="true">❌ </span>
                      {t.familyModal.empPhoneError}
                    </div>
                  </div>

                  {/* Employee Email */}
                  <div className="bt-field">
                    <label
                      htmlFor="emp-email"
                      className="block text-xs font-bold uppercase tracking-wide text-[#180F50] mb-1"
                    >
                      {t.familyModal.empEmail}
                    </label>
                    <span id="emp-email-hint" className="hint">
                      {t.familyModal.empEmailHint}
                    </span>
                    <input
                      id="emp-email"
                      name="employeeEmail"
                      type="email"
                      autoComplete="email"
                      required
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                      onBlur={syncAriaInvalid}
                      onInput={syncAriaInvalid}
                      aria-describedby="emp-email-hint"
                      aria-errormessage="emp-email-error"
                      placeholder={t.familyModal.empEmailPlaceholder}
                      className="bt-input w-full px-3.5 py-2.5 rounded-xl border border-[#E6E8F0] text-sm text-[#180F50] focus:outline-none focus:border-[#180F50]"
                    />
                    <div id="emp-email-error" className="error-msg">
                      <span aria-hidden="true">❌ </span>
                      {t.familyModal.empEmailError}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Dependents List (>1 family member supported) */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-[#180F50]">
                    {t.familyModal.depSection}
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddDependent}
                    className="inline-flex items-center gap-1.5 bg-[#180F50] hover:bg-[#34C8D2] text-white hover:text-[#180F50] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.familyModal.addDependentBtn}</span>
                  </button>
                </div>

                {dependents.map((dep, idx) => {
                  const currentFee = getFeeForPlan(dep.plan);
                  return (
                    <div
                      key={dep.id}
                      className="bg-white rounded-2xl border border-[#E6E8F0] p-5 shadow-2xs space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-[#E6E8F0]">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#EAF9FA] text-[#180F50] font-extrabold text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-sm text-[#180F50]">
                            {t.familyModal.dependentCardTitle} {idx + 1}
                          </span>
                        </div>

                        {dependents.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveDependent(dep.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 px-2.5 py-1 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.familyModal.removeBtn}</span>
                          </button>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Dependent Full Name */}
                        <div>
                          <label className="block text-xs font-bold text-[#180F50] mb-1">
                            {t.familyModal.depName}
                          </label>
                          <input
                            type="text"
                            required
                            value={dep.fullName}
                            onChange={(e) =>
                              handleDependentChange(dep.id, "fullName", e.target.value)
                            }
                            placeholder={t.familyModal.depNamePlaceholder}
                            className="bt-input w-full px-3.5 py-2.5 rounded-xl border border-[#E6E8F0] text-sm text-[#180F50] focus:outline-none focus:border-[#180F50]"
                          />
                        </div>

                        {/* Relationship */}
                        <div>
                          <label className="block text-xs font-bold text-[#180F50] mb-1">
                            {t.familyModal.depRelation}
                          </label>
                          <select
                            value={dep.relationship}
                            onChange={(e) =>
                              handleDependentChange(dep.id, "relationship", e.target.value)
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E8F0] text-sm text-[#180F50] bg-white focus:outline-none focus:border-[#180F50]"
                          >
                            {t.familyModal.relations.map((rel) => (
                              <option key={rel} value={rel}>
                                {rel}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="block text-xs font-bold text-[#180F50] mb-1">
                            {t.familyModal.depGender}
                          </label>
                          <select
                            value={dep.gender}
                            onChange={(e) =>
                              handleDependentChange(
                                dep.id,
                                "gender",
                                e.target.value as "Nam" | "Nữ"
                              )
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E8F0] text-sm text-[#180F50] bg-white focus:outline-none focus:border-[#180F50]"
                          >
                            {t.familyModal.genders.map((g) => (
                              <option key={g.value} value={g.value}>
                                {g.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Age */}
                        <div>
                          <label className="block text-xs font-bold text-[#180F50] mb-1">
                            {t.familyModal.depAge}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={65}
                            required
                            value={dep.age}
                            onChange={(e) =>
                              handleDependentChange(dep.id, "age", e.target.value)
                            }
                            placeholder={t.familyModal.depAgePlaceholder}
                            className="bt-input w-full px-3.5 py-2.5 rounded-xl border border-[#E6E8F0] text-sm text-[#180F50] focus:outline-none focus:border-[#180F50]"
                          />
                        </div>

                        {/* DOB or National ID / Birth Cert (Helpful for policy issuance) */}
                        <div>
                          <label className="block text-xs font-bold text-[#180F50] mb-1">
                            {t.familyModal.depDobOrId}
                          </label>
                          <input
                            type="text"
                            value={dep.dobOrId}
                            onChange={(e) =>
                              handleDependentChange(dep.id, "dobOrId", e.target.value)
                            }
                            placeholder={t.familyModal.depDobOrIdPlaceholder}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E8F0] text-sm text-[#180F50] focus:outline-none focus:border-[#180F50]"
                          />
                        </div>

                        {/* Selected Plan (A, B, C, D) */}
                        <div>
                          <label className="block text-xs font-bold text-[#180F50] mb-1">
                            {t.familyModal.depPlan}
                          </label>
                          <select
                            value={dep.plan}
                            onChange={(e) =>
                              handleDependentChange(
                                dep.id,
                                "plan",
                                e.target.value as PlanCode
                              )
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#34C8D2] text-sm font-bold text-[#180F50] bg-[#EAF9FA]/50 focus:outline-none focus:border-[#180F50]"
                          >
                            {plans.map((p) => (
                              <option key={p.code} value={p.code}>
                                {lang === "vi" ? p.nameVi : p.nameEn} —{" "}
                                {p.annualFee.toLocaleString("vi-VN")} ₫
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Corresponding Fee Bar */}
                      <div className="flex items-center justify-between bg-[#EAF9FA] px-4 py-2.5 rounded-xl border border-[#34C8D2]/30 text-sm">
                        <span className="font-semibold text-[#180F50]">
                          {t.familyModal.depFee} (
                          {lang === "vi" ? `Chương trình ${dep.plan}` : `Plan ${dep.plan}`}
                          ):
                        </span>
                        <span className="font-extrabold text-[#180F50] text-base">
                          {currentFee.toLocaleString("vi-VN")} VNĐ{" "}
                          <span className="text-xs font-normal text-[#4A4766]">
                            {t.familyModal.perYear}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary & Submit Bar */}
              <div className="bg-[#180F50] text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#34C8D2] font-bold">
                    {t.familyModal.totalSummary}
                  </div>
                  <div className="text-sm text-[#C9C4E8] mt-1">
                    {t.familyModal.totalCountLabel}{" "}
                    <strong className="text-white">
                      {dependents.length} {t.familyModal.peopleUnit}
                    </strong>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                    {t.familyModal.totalFeeLabel}{" "}
                    <span className="text-[#34C8D2]">
                      {totalFee.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3 rounded-xl border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {t.familyModal.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 bg-[#34C8D2] hover:bg-[#2bb5bf] disabled:opacity-60 text-[#180F50] font-extrabold text-sm sm:text-base px-6 py-3 rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{t.familyModal.submittingBtn}</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>{t.familyModal.submitBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}
