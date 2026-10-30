"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_PLANS,
  FamilyRegistration,
  InsurancePlan,
  KnowledgeDoc,
  SHEET_HEADERS,
  registrationToSheetRows,
} from "@/lib/types";
import {
  ShieldCheck,
  Lock,
  FileUp,
  FileText,
  Trash2,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  Bot,
  ArrowLeft,
  Download,
  RefreshCw,
  Copy,
  Send,
  Loader2,
  DollarSign,
} from "lucide-react";

type AdminTab = "knowledge" | "plans" | "sheets" | "ai";

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("knowledge");

  // Store state
  const [plans, setPlans] = useState<InsurancePlan[]>(DEFAULT_PLANS);
  const [mainKnowledgeMd, setMainKnowledgeMd] = useState("");
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);
  const [registrations, setRegistrations] = useState<FamilyRegistration[]>([]);
  const [openRouterModel, setOpenRouterModel] = useState("deepseek/deepseek-v4.1-flash");
  const [openRouterApiKey, setOpenRouterApiKey] = useState("");
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [googleSheetWebhookUrl, setGoogleSheetWebhookUrl] = useState("");
  const [googleSheetId, setGoogleSheetId] = useState("");
  const [appsScriptSnippet, setAppsScriptSnippet] = useState("");

  // UI feedback
  const [statusBanner, setStatusBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [savingPlans, setSavingPlans] = useState(false);
  const [savingKnowledge, setSavingKnowledge] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingSheet, setTestingSheet] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDoc | null>(null);

  const loadAllAdminData = async (currentPasscode: string) => {
    const headers = { "x-admin-passcode": currentPasscode };
    const [plansRes, kbRes, regRes, settingsRes] = await Promise.all([
      fetch("/api/plans", { headers }),
      fetch("/api/knowledge", { headers }),
      fetch("/api/registrations", { headers }),
      fetch("/api/admin/settings", { headers }),
    ]);

    if (plansRes.ok) {
      const pData = await plansRes.json();
      if (pData.plans) setPlans(pData.plans);
    }
    if (kbRes.ok) {
      const kData = await kbRes.json();
      setMainKnowledgeMd(kData.mainKnowledgeMd || "");
      setKnowledgeDocs(kData.knowledgeDocs || []);
    }
    if (regRes.ok) {
      const rData = await regRes.json();
      setRegistrations(rData.registrations || []);
    }
    if (settingsRes.ok) {
      const sData = await settingsRes.json();
      if (sData.settings) {
        setOpenRouterModel(
          sData.settings.openRouterModel || "deepseek/deepseek-v4.1-flash"
        );
        setHasEnvKey(Boolean(sData.settings.hasEnvOpenRouterKey));
        setGoogleSheetWebhookUrl(sData.settings.googleSheetWebhookUrl || "");
        setGoogleSheetId(sData.settings.googleSheetId || "");
      }
      if (sData.appsScriptSnippet) {
        setAppsScriptSnippet(sData.appsScriptSnippet);
      }
    }
  };

  useEffect(() => {
    const savedPass = sessionStorage.getItem("bt_admin_pass_v1");
    if (savedPass) {
      setPasscode(savedPass);
      fetch("/api/admin/settings", {
        headers: { "x-admin-passcode": savedPass },
      }).then((res) => {
        if (res.ok) {
          setAuthenticated(true);
          loadAllAdminData(savedPass);
        }
      });
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setAuthError(data.error || "Sai mật khẩu quản trị.");
      return;
    }
    sessionStorage.setItem("bt_admin_pass_v1", passcode);
    setAuthenticated(true);
    await loadAllAdminData(passcode);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    setStatusBanner(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/knowledge", {
          method: "POST",
          headers: { "x-admin-passcode": passcode },
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }
        setKnowledgeDocs(data.knowledgeDocs || []);
        if (data.doc) setPreviewDoc(data.doc);
      }

      setStatusBanner({
        type: "success",
        text: "Đã tải file và tự động chuyển đổi (convert) sang định dạng .md cho AI Chatbot thành công!",
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi chuyển đổi file",
      });
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleDeleteDoc = async (id: string) => {
    const res = await fetch(`/api/knowledge?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-admin-passcode": passcode },
    });
    const data = await res.json();
    if (res.ok) {
      setKnowledgeDocs(data.knowledgeDocs || []);
      if (previewDoc?.id === id) setPreviewDoc(null);
    }
  };

  const handleSaveMasterKnowledge = async () => {
    setSavingKnowledge(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/knowledge", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode,
        },
        body: JSON.stringify({ mainKnowledgeMd }),
      });
      if (!res.ok) throw new Error("Không thể lưu nội dung Markdown.");
      setStatusBanner({
        type: "success",
        text: "Đã cập nhật nội dung Knowledge Base (.md) gốc cho AI Chatbot!",
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi lưu Knowledge Base",
      });
    } finally {
      setSavingKnowledge(false);
    }
  };

  const handleSavePlans = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlans(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/plans", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode,
        },
        body: JSON.stringify({ plans }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi lưu biểu phí");
      setPlans(data.plans);
      setStatusBanner({
        type: "success",
        text: "Đã lưu Biểu phí & Quyền lợi Chương trình A, B, C, D! Dữ liệu trên Landing Page, Form đăng ký và Chatbot đã được cập nhật.",
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi lưu biểu phí",
      });
    } finally {
      setSavingPlans(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode,
        },
        body: JSON.stringify({
          openRouterModel,
          openRouterApiKey: openRouterApiKey || undefined,
          googleSheetWebhookUrl,
          googleSheetId,
        }),
      });
      if (!res.ok) throw new Error("Không thể lưu cấu hình.");
      setStatusBanner({
        type: "success",
        text: "Đã lưu cấu hình hệ thống thành công!",
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi lưu cấu hình",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestGoogleSheet = async () => {
    setTestingSheet(true);
    setStatusBanner(null);
    try {
      // Save current URL first
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode,
        },
        body: JSON.stringify({
          googleSheetWebhookUrl,
          googleSheetId,
        }),
      });

      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "testRow" }),
      });
      const data = await res.json();
      setStatusBanner({
        type: data.ok ? "success" : "error",
        text: data.message || "Đã kiểm tra kết nối Google Sheet.",
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        text: err instanceof Error ? err.message : "Lỗi kiểm tra Google Sheet",
      });
    } finally {
      setTestingSheet(false);
    }
  };

  const handleResyncAllToSheet = async () => {
    setTestingSheet(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resyncAll" }),
      });
      const data = await res.json();
      await loadAllAdminData(passcode);
      setStatusBanner({
        type: "success",
        text: data.message,
      });
    } finally {
      setTestingSheet(false);
    }
  };

  const handleExportCsvForIssuance = () => {
    const allRows: (string | number)[][] = [SHEET_HEADERS];
    registrations.forEach((reg) => {
      allRows.push(...registrationToSheetRows(reg));
    });

    const csvContent =
      "\uFEFF" +
      allRows
        .map((r) =>
          r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Danh-sach-cap-don-nguoi-than-DEMO-2027-0001.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#180F50] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-[#E6E8F0] max-w-md w-full p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#180F50] text-[#34C8D2] flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#180F50]">
                Quản trị Hệ thống Bolttech
              </h1>
              <p className="text-xs text-[#4A4766]">
                Cổng thông tin Khách hàng Demo · Admin Backend
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bt-field">
              <label
                htmlFor="admin-passcode"
                className="block text-xs font-bold uppercase tracking-wider text-[#180F50] mb-1"
              >
                Mật khẩu Quản trị (Admin Passcode)
              </label>
              <span id="passcode-hint" className="hint">
                Mật khẩu mặc định bản Demo: <code>bolttech2027</code>
              </span>
              <input
                id="admin-passcode"
                type="password"
                required
                aria-describedby="passcode-hint"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Nhập Admin Passcode..."
                className="bt-input w-full px-4 py-3 rounded-xl border border-[#E6E8F0] text-sm text-[#180F50] focus:outline-none focus:border-[#180F50]"
              />
            </div>

            {authError ? (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {authError}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full bg-[#180F50] hover:bg-[#34C8D2] text-white hover:text-[#180F50] font-extrabold text-sm py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              Đăng nhập Quản trị
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E6E8F0] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1FA3AD] hover:text-[#180F50]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về trang Landing Page</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#180F50]">
      {/* Top Bar */}
      <header className="bg-[#180F50] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#34C8D2]/20 border border-[#34C8D2]/40 flex items-center justify-center text-[#34C8D2]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg">
                Bolttech Demo Portal — Quản trị Backend
              </h1>
              <p className="text-xs text-[#34C8D2]">
                Quản lý Knowledge Base (.md), Biểu phí A/B/C/D, Google Worksheet & OpenRouter AI
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-[#34C8D2] text-white hover:text-[#180F50] text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Xem Landing Page</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-[#E6E8F0] shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("knowledge")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "knowledge"
                ? "bg-[#180F50] text-[#34C8D2]"
                : "text-[#4A4766] hover:bg-[#F7F8FC]"
            }`}
          >
            <FileUp className="w-4 h-4" />
            <span>1. Tài liệu Chatbot & Convert sang .md</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("plans")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "plans"
                ? "bg-[#180F50] text-[#34C8D2]"
                : "text-[#4A4766] hover:bg-[#F7F8FC]"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>2. Biểu phí Gói A, B, C, D</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sheets")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "sheets"
                ? "bg-[#180F50] text-[#34C8D2]"
                : "text-[#4A4766] hover:bg-[#F7F8FC]"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>
              3. Google Worksheet & Danh sách Cấp đơn ({registrations.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "ai"
                ? "bg-[#180F50] text-[#34C8D2]"
                : "text-[#4A4766] hover:bg-[#F7F8FC]"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>4. Cấu hình OpenRouter AI (DeepSeek V4.1 Flash)</span>
          </button>
        </div>

        {/* Status Notification */}
        {statusBanner ? (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-semibold ${
              statusBanner.type === "success"
                ? "bg-[#EAF9FA] border-[#34C8D2] text-[#180F50]"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#1FA3AD] shrink-0" />
              <span>{statusBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-xs underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        ) : null}

        {/* TAB 1: Knowledge Base & File-to-Markdown Converter */}
        {activeTab === "knowledge" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upload & Converted Documents List */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border border-[#E6E8F0] p-6 space-y-4">
                <h2 className="text-lg font-extrabold text-[#180F50]">
                  Tải lên Tài liệu Bảo hiểm (Tự động Convert sang .md)
                </h2>
                <p className="text-xs sm:text-sm text-[#4A4766]">
                  Hỗ trợ tải file <strong>.pdf, .docx, .doc, .xlsx, .xls, .pptx, .ppt, .md, .txt</strong>. Hệ thống sẽ trích xuất toàn bộ bảng biểu, quyền lợi, quy trình và chuyển sang định dạng <code>.md</code> để cập nhật ngay cho AI Chatbot.
                </p>

                <label className="block border-2 border-dashed border-[#34C8D2] hover:border-[#180F50] bg-[#EAF9FA]/50 rounded-2xl p-6 text-center cursor-pointer transition-all">
                  <FileUp className="w-8 h-8 text-[#1FA3AD] mx-auto mb-2" />
                  <span className="block font-bold text-sm text-[#180F50]">
                    {uploadingFile
                      ? "Đang chuyển đổi tài liệu sang .md..."
                      : "Nhấn để chọn file PDF, Word, Excel, PowerPoint, Markdown"}
                  </span>
                  <span className="block text-xs text-[#4A4766] mt-1">
                    Có thể chọn nhiều file cùng lúc
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.md,.txt"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="hidden"
                  />
                </label>

                {/* Uploaded docs list */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#4A4766]">
                    Tài liệu đã chuyển sang .md ({knowledgeDocs.length})
                  </div>
                  {knowledgeDocs.length === 0 ? (
                    <div className="text-xs text-[#4A4766] bg-[#F7F8FC] p-4 rounded-xl border border-[#E6E8F0]">
                      Chưa có tài liệu bổ sung nào được tải lên. Chatbot hiện đang sử dụng Tài liệu Gốc (.md) bên phải.
                    </div>
                  ) : (
                    knowledgeDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0]"
                      >
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="flex items-start gap-2.5 text-left cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-[#1FA3AD] shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-[#180F50] hover:underline">
                              {doc.fileName}
                            </div>
                            <div className="text-[11px] text-[#4A4766]">
                              {doc.fileType} · {(doc.sizeBytes / 1024).toFixed(1)} KB ·{" "}
                              {doc.uploadedAt}
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Xóa tài liệu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {previewDoc ? (
                  <div className="p-4 rounded-xl bg-[#180F50] text-white space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#34C8D2]">
                      <span>Xem trước Markdown: {previewDoc.fileName}</span>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(null)}
                        className="underline cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                    <pre className="text-xs font-mono whitespace-pre-wrap max-h-60 overflow-y-auto text-[#E4E1F5]">
                      {previewDoc.markdownContent}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Master Markdown Editor */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E6E8F0] p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#180F50]">
                      Nội dung Knowledge Base Gốc (.md) của Chương trình Bảo hiểm
                    </h2>
                    <p className="text-xs text-[#4A4766]">
                      Toàn bộ thông tin hợp đồng DEMO-2027-0001, quyền lợi, thủ tục bồi thường, bảo lãnh và lưu ý dưới dạng Markdown.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveMasterKnowledge}
                    disabled={savingKnowledge}
                    className="inline-flex items-center gap-1.5 bg-[#180F50] hover:bg-[#34C8D2] text-white hover:text-[#180F50] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingKnowledge ? "Đang lưu..." : "Lưu nội dung .md"}</span>
                  </button>
                </div>

                <textarea
                  rows={22}
                  value={mainKnowledgeMd}
                  onChange={(e) => setMainKnowledgeMd(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0] font-mono text-xs text-[#180F50] leading-relaxed focus:outline-none focus:border-[#180F50]"
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* TAB 2: Plans A, B, C, D Fee & Benefit Management */}
        {activeTab === "plans" ? (
          <form
            onSubmit={handleSavePlans}
            className="bg-white rounded-2xl border border-[#E6E8F0] p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E8F0]">
              <div>
                <h2 className="text-xl font-extrabold text-[#180F50]">
                  Cấu hình Biểu phí & Hạn mức Chương trình A, B, C, D
                </h2>
                <p className="text-xs sm:text-sm text-[#4A4766] mt-1">
                  Chỉnh sửa mức phí tiêu chuẩn (VNĐ/người/năm) cho từng gói. Thay đổi tại đây sẽ cập nhật ngay lập tức trên bảng quyền lợi, Form đăng ký người thân và AI Chatbot.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingPlans}
                className="inline-flex items-center gap-2 bg-[#180F50] hover:bg-[#34C8D2] text-white hover:text-[#180F50] font-extrabold text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{savingPlans ? "Đang lưu..." : "Lưu Biểu phí A, B, C, D"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan, idx) => (
                <div
                  key={plan.code}
                  className="bg-[#F7F8FC] rounded-2xl border border-[#E6E8F0] p-5 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E6E8F0]">
                    <span className="font-extrabold text-lg text-[#180F50]">
                      {plan.nameVi} ({plan.tierVi})
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#180F50] text-[#34C8D2] font-bold text-xs">
                      Gói {plan.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-[#180F50] mb-1">
                        Mức phí tiêu chuẩn / người / năm (VNĐ)
                      </label>
                      <input
                        type="number"
                        step={50000}
                        value={plan.annualFee}
                        onChange={(e) => {
                          const next = [...plans];
                          next[idx] = {
                            ...plan,
                            annualFee: Number(e.target.value) || 0,
                          };
                          setPlans(next);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#34C8D2] font-extrabold text-base text-[#180F50]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#4A4766] mb-1">
                        Hạn mức Tai nạn
                      </label>
                      <input
                        type="text"
                        value={plan.accidentLimit}
                        onChange={(e) => {
                          const next = [...plans];
                          next[idx] = { ...plan, accidentLimit: e.target.value };
                          setPlans(next);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E8F0]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#4A4766] mb-1">
                        Hạn mức Nội trú
                      </label>
                      <input
                        type="text"
                        value={plan.inpatientLimit}
                        onChange={(e) => {
                          const next = [...plans];
                          next[idx] = { ...plan, inpatientLimit: e.target.value };
                          setPlans(next);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E8F0]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#4A4766] mb-1">
                        Hạn mức Ngoại trú
                      </label>
                      <input
                        type="text"
                        value={plan.outpatientLimit}
                        onChange={(e) => {
                          const next = [...plans];
                          next[idx] = { ...plan, outpatientLimit: e.target.value };
                          setPlans(next);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E8F0]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#4A4766] mb-1">
                        Hạn mức Nha khoa
                      </label>
                      <input
                        type="text"
                        value={plan.dentalLimit}
                        onChange={(e) => {
                          const next = [...plans];
                          next[idx] = { ...plan, dentalLimit: e.target.value };
                          setPlans(next);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6E8F0]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </form>
        ) : null}

        {/* TAB 3: Google Worksheet Integration & Policy Issuance List */}
        {activeTab === "sheets" ? (
          <div className="space-y-6">
            {/* Google Sheet Connection Settings */}
            <div className="bg-white rounded-2xl border border-[#E6E8F0] p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E8F0]">
                <div>
                  <h2 className="text-xl font-extrabold text-[#180F50]">
                    Kết nối Google Worksheet (Ghi trực tiếp dữ liệu Cấp đơn Bảo hiểm)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A4766] mt-1">
                    Khi nhân viên gửi Form đăng ký cho người thân, mỗi người nhà sẽ được tách thành 1 dòng chuẩn hóa và ghi trực tiếp vào Google Worksheet để cấp đơn ngay.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleTestGoogleSheet}
                    disabled={testingSheet}
                    className="inline-flex items-center gap-1.5 bg-[#EAF9FA] hover:bg-[#34C8D2] text-[#180F50] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#34C8D2] cursor-pointer"
                  >
                    {testingSheet ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Gửi dòng kiểm tra (Test Sheet)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="inline-flex items-center gap-1.5 bg-[#180F50] hover:bg-[#34C8D2] text-white hover:text-[#180F50] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu cấu hình Sheet</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#180F50] mb-1">
                      Cách 1 (Khuyên dùng - 1 phút): Google Apps Script Web App URL
                    </label>
                    <input
                      type="url"
                      value={googleSheetWebhookUrl}
                      onChange={(e) => setGoogleSheetWebhookUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0] text-sm text-[#180F50]"
                    />
                    <p className="text-xs text-[#4A4766] mt-1">
                      Mở file Google Sheet của bạn → <strong>Tiện ích mở rộng (Extensions) → Apps Script</strong> → Dán đoạn mã bên phải → Nhấn <strong>Triển khai (Deploy) → Ứng dụng web (Web App)</strong> (Quyền truy cập: Bất kỳ ai) → Dán URL vào ô trên.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#180F50] mb-1">
                      Cách 2 (Tùy chọn): Google Sheet ID (Dùng với Google Service Account)
                    </label>
                    <input
                      type="text"
                      value={googleSheetId}
                      onChange={(e) => setGoogleSheetId(e.target.value)}
                      placeholder="Ví dụ: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0] text-sm text-[#180F50]"
                    />
                  </div>
                </div>

                {/* Apps Script Copy Box */}
                <div className="bg-[#180F50] text-white rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#34C8D2]">
                      Mã Google Apps Script tự động tạo bảng & ghi dòng cấp đơn:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(appsScriptSnippet);
                        setStatusBanner({
                          type: "success",
                          text: "Đã sao chép mã Google Apps Script vào bộ nhớ tạm!",
                        });
                      }}
                      className="inline-flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy mã</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-[#E4E1F5] overflow-x-auto max-h-44 leading-relaxed">
                    {appsScriptSnippet}
                  </pre>
                </div>
              </div>
            </div>

            {/* Policy Issuance Flat Table */}
            <div className="bg-white rounded-2xl border border-[#E6E8F0] p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#180F50]">
                    Danh sách Người thân Đăng ký (Chuẩn Cấp đơn Bảo hiểm)
                  </h3>
                  <p className="text-xs text-[#4A4766]">
                    Hiển thị từng người thân trên 1 dòng độc lập đúng cấu trúc Google Worksheet.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResyncAllToSheet}
                    disabled={testingSheet}
                    className="inline-flex items-center gap-1.5 bg-[#F7F8FC] hover:bg-[#EAF9FA] text-[#180F50] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#E6E8F0] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Đồng bộ lại lên Google Sheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsvForIssuance}
                    className="inline-flex items-center gap-1.5 bg-[#34C8D2] hover:bg-[#2bb5bf] text-[#180F50] font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file CSV/Excel Cấp đơn</span>
                  </button>
                </div>
              </div>

              {registrations.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#4A4766] bg-[#F7F8FC] rounded-2xl border border-[#E6E8F0]">
                  Chưa có đơn đăng ký người thân nào. Hãy thử mở Form đăng ký trên Landing Page và gửi một đơn mẫu!
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#E6E8F0] rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#180F50] text-white">
                        <th className="p-3">Mã ĐK</th>
                        <th className="p-3">Nhân viên</th>
                        <th className="p-3">SĐT / Email</th>
                        <th className="p-3">Người thân</th>
                        <th className="p-3">Quan hệ</th>
                        <th className="p-3">Giới tính / Tuổi</th>
                        <th className="p-3">Gói</th>
                        <th className="p-3">Phí (VNĐ)</th>
                        <th className="p-3">Google Sheet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E8F0]">
                      {registrations.flatMap((reg) =>
                        reg.dependents.map((dep) => (
                          <tr key={`${reg.id}-${dep.id}`} className="hover:bg-[#F7F8FC]">
                            <td className="p-3 font-bold text-[#180F50]">{reg.id}</td>
                            <td className="p-3 font-semibold">
                              {reg.employeeName}
                              {reg.employeeCode ? (
                                <span className="block text-[11px] text-[#4A4766]">
                                  {reg.employeeCode}
                                </span>
                              ) : null}
                            </td>
                            <td className="p-3 text-[#4A4766]">
                              {reg.employeePhone}
                              <span className="block text-[11px]">{reg.employeeEmail}</span>
                            </td>
                            <td className="p-3 font-bold text-[#180F50]">{dep.fullName}</td>
                            <td className="p-3">{dep.relationship}</td>
                            <td className="p-3">
                              {dep.gender} · {dep.age} tuổi
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-[#EAF9FA] text-[#180F50] font-bold">
                                Gói {dep.plan}
                              </span>
                            </td>
                            <td className="p-3 font-extrabold text-[#180F50]">
                              {dep.fee.toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  reg.sheetSynced
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {reg.sheetSynced ? "Đã ghi Sheet" : "Lưu cục bộ"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* TAB 4: OpenRouter AI Model Settings */}
        {activeTab === "ai" ? (
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-2xl border border-[#E6E8F0] p-6 sm:p-8 max-w-2xl space-y-5"
          >
            <div>
              <h2 className="text-xl font-extrabold text-[#180F50]">
                Cấu hình OpenRouter AI cho Chatbot
              </h2>
              <p className="text-xs sm:text-sm text-[#4A4766] mt-1">
                Model mặc định được thiết lập là <strong>DeepSeek V4.1 Flash</strong> (<code>deepseek/deepseek-v4.1-flash</code>) kèm cơ chế tự động fallback an toàn nếu cần.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#180F50] mb-1">
                OpenRouter Model ID
              </label>
              <input
                type="text"
                value={openRouterModel}
                onChange={(e) => setOpenRouterModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0] text-sm font-mono text-[#180F50]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  "deepseek/deepseek-v4.1-flash",
                  "deepseek/deepseek-chat",
                  "google/gemini-2.5-flash",
                  "openai/gpt-4o-mini",
                ].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setOpenRouterModel(m)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#EAF9FA] hover:bg-[#34C8D2] text-[#180F50] font-mono cursor-pointer"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#180F50] mb-1">
                OpenRouter API Key {hasEnvKey ? "(Đã có sẵn trong biến môi trường .env)" : ""}
              </label>
              <input
                type="password"
                value={openRouterApiKey}
                onChange={(e) => setOpenRouterApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0] text-sm font-mono text-[#180F50]"
              />
              <p className="text-xs text-[#4A4766] mt-1">
                Bạn có thể cấu hình qua biến môi trường <code>OPENROUTER_API_KEY</code> trên Vercel hoặc dán trực tiếp tại đây.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 bg-[#180F50] hover:bg-[#34C8D2] text-white hover:text-[#180F50] font-extrabold text-sm px-6 py-3 rounded-xl transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu cấu hình AI Chatbot</span>
            </button>
          </form>
        ) : null}
      </main>
    </div>
  );
}
