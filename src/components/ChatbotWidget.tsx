"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  MessageSquareText,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  Loader2,
} from "lucide-react";

interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
}

interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  externalPrompt: { text: string; nonce: number } | null;
}

function renderSimpleMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={idx} className="h-2" />;
    }
    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    const cleanLine = isBullet ? trimmed.slice(2) : line;

    // Parse **bold** and `code` and URLs
    const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`|https?:\/\/[^\s)]+)/g);

    const content = parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={pIdx} className="font-bold text-[#180F50]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={pIdx}
            className="px-1.5 py-0.5 rounded bg-[#EAF9FA] text-[#180F50] font-mono text-xs"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (/^https?:\/\//.test(part)) {
        return (
          <a
            key={pIdx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1FA3AD] underline break-all font-medium"
          >
            {part}
          </a>
        );
      }
      return <React.Fragment key={pIdx}>{part}</React.Fragment>;
    });

    if (isBullet) {
      return (
        <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
          <span className="text-[#1FA3AD] font-bold mt-0.5">•</span>
          <span className="flex-1">{content}</span>
        </div>
      );
    }

    return (
      <div key={idx} className="py-0.5">
        {content}
      </div>
    );
  });
}

export function ChatbotWidget({
  isOpen,
  onToggle,
  externalPrompt,
}: ChatbotWidgetProps) {
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastNonceRef = useRef<number>(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen]);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userTurn: ChatTurn = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const nextHistory = [...messages, userTurn];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          messages: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const assistantTurn: ChatTurn = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          data.reply ||
          (lang === "vi"
            ? "Xin lỗi, hiện tại hệ thống đang bận. Vui lòng thử lại sau."
            : "Sorry, the service is temporarily busy. Please try again."),
        modelUsed: data.modelUsed,
      };
      setMessages((prev) => [...prev, assistantTurn]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            lang === "vi"
              ? "Không thể kết nối tới máy chủ AI. Vui lòng kiểm tra kết nối mạng."
              : "Could not reach the AI server. Please check your connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger question when clicked from page chips
  useEffect(() => {
    if (
      externalPrompt &&
      externalPrompt.text &&
      externalPrompt.nonce !== lastNonceRef.current
    ) {
      lastNonceRef.current = externalPrompt.nonce;
      sendQuestion(externalPrompt.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen ? (
        <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[410px] h-[560px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-[#E6E8F0] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#180F50] text-white px-5 py-4 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#34C8D2] text-[#180F50] flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                  <span>{t.chatbot.headerTitle}</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#34C8D2]" />
                </div>
                <div className="text-[11px] text-[#C9C4E8]">{t.chatbot.headerSub}</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([])}
                title={t.chatbot.clearChat}
                className="p-2 rounded-xl text-[#C9C4E8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onToggle(false)}
                className="p-2 rounded-xl text-[#C9C4E8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F8FC]">
            {/* Welcome Message */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#180F50] text-[#34C8D2] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-[#E6E8F0] rounded-2xl rounded-tl-xs p-3.5 text-xs sm:text-sm text-[#4A4766] shadow-2xs leading-relaxed">
                {renderSimpleMarkdown(t.chatbot.welcomeMsg)}
              </div>
            </div>

            {/* Quick Prompt Chips when chat is empty */}
            {messages.length === 0 ? (
              <div className="pl-9 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#4A4766]">
                  {t.chatbot.quickPromptsLabel}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.contact.suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendQuestion(q)}
                      className="text-left text-xs bg-[#EAF9FA] hover:bg-[#34C8D2] text-[#180F50] font-medium px-3 py-1.5 rounded-xl border border-[#34C8D2]/30 transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Conversation Turns */}
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex items-start justify-end gap-2">
                  <div className="bg-[#180F50] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs sm:text-sm max-w-[82%] shadow-xs">
                    {m.content}
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-[#EAF9FA] text-[#180F50] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#180F50] text-[#34C8D2] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-[#E6E8F0] rounded-2xl rounded-tl-xs p-3.5 text-xs sm:text-sm text-[#4A4766] max-w-[85%] shadow-2xs leading-relaxed">
                    {renderSimpleMarkdown(m.content)}
                    {m.modelUsed ? (
                      <div className="mt-2 pt-1.5 border-t border-[#E6E8F0] text-[10px] text-[#4A4766]/70 flex items-center justify-between">
                        <span>AI Model: {m.modelUsed}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            )}

            {loading ? (
              <div className="flex items-center gap-2 text-xs text-[#4A4766] pl-9">
                <Loader2 className="w-4 h-4 animate-spin text-[#1FA3AD]" />
                <span>{t.chatbot.thinking}</span>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white border-t border-[#E6E8F0] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chatbot.inputPlaceholder}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F7F8FC] border border-[#E6E8F0] text-xs sm:text-sm text-[#180F50] focus:outline-none focus:border-[#180F50]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="inline-flex items-center justify-center gap-1.5 bg-[#180F50] hover:bg-[#34C8D2] disabled:opacity-50 text-white hover:text-[#180F50] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t.chatbot.sendBtn}</span>
            </button>
          </form>
        </div>
      ) : null}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="group flex items-center gap-2.5 bg-[#180F50] hover:bg-[#34C8D2] text-white hover:text-[#180F50] font-extrabold text-sm px-5 py-3.5 rounded-full shadow-2xl border-2 border-[#34C8D2] transition-all cursor-pointer"
        aria-label="Toggle AI Advisor Chat"
      >
        <MessageSquareText className="w-5 h-5 text-[#34C8D2] group-hover:text-[#180F50]" />
        <span>{lang === "vi" ? "Hỏi Trợ lý AI" : "Ask AI Advisor"}</span>
      </button>
    </div>
  );
}
