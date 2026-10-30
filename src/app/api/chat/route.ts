import { NextResponse } from "next/server";
import { getCompiledKnowledgeMarkdown, readPortalStore } from "@/lib/store";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

function buildLocalIntelligentAnswer(
  question: string,
  lang: "vi" | "en",
  storePlans: ReturnType<typeof readPortalStore>["plans"],
  compiledMd: string
): string {
  const q = question.toLowerCase();
  const planLines = storePlans
    .map(
      (p) =>
        `- **${lang === "vi" ? p.nameVi : p.nameEn} (${
          lang === "vi" ? p.tierVi : p.tierEn
        })**: **${p.annualFee.toLocaleString("vi-VN")} VNĐ/năm** (Tai nạn: ${
          p.accidentLimit
        } | Nội trú: ${p.inpatientLimit} | Ngoại trú: ${p.outpatientLimit} | Nha khoa: ${
          p.dentalLimit
        })`
    )
    .join("\n");

  if (
    q.includes("phí") ||
    q.includes("người thân") ||
    q.includes("người nhà") ||
    q.includes("gói a") ||
    q.includes("chương trình") ||
    q.includes("family") ||
    q.includes("rate") ||
    q.includes("premium") ||
    q.includes("plan")
  ) {
    return lang === "vi"
      ? `Dưới đây là **Biểu phí & Quyền lợi đăng ký bảo hiểm cho Người thân** (cập nhật trực tiếp từ hệ thống):\n\n${planLines}\n\nBạn có thể nhấn nút **"Đăng ký cho người thân"** trên trang để điền thông tin (hỗ trợ đăng ký >1 người thân cùng lúc và ghi trực tiếp vào bảng Google Worksheet cấp đơn).`
      : `Here are the **Family Dependent Plans & Annual Premiums** (synced from the portal):\n\n${planLines}\n\nClick **"Enroll Family Members"** at the top of the page to submit your family dependents directly to the policy issuance Google Worksheet.`;
  }

  if (q.includes("ngoại trú") || q.includes("outpatient") || q.includes("khám")) {
    return lang === "vi"
      ? `**Quyền lợi Điều trị Ngoại trú (Outpatient)** theo hợp đồng \`DEMO-2027-0001\`:\n- **Chương trình A**: 15.000.000 VNĐ/năm (tối đa 2.500.000 VNĐ/lần khám)\n- **Chương trình B**: 10.000.000 VNĐ/năm (tối đa 1.800.000 VNĐ/lần khám)\n- **Chương trình C**: 7.000.000 VNĐ/năm (tối đa 1.200.000 VNĐ/lần khám)\n- **Chương trình D**: 4.500.000 VNĐ/năm (tối đa 800.000 VNĐ/lần khám)\n\n**Lưu ý quan trọng**:\n- Cần có **đơn thuốc điều trị** hoặc hướng điều trị của bác sĩ (không bao gồm vitamin/thực phẩm chức năng).\n- Nội soi dạ dày có gây mê được chi trả theo quyền lợi Ngoại trú (nếu không có Giấy ra viện).`
      : `**Outpatient Treatment Benefits** under Policy \`DEMO-2027-0001\`:\n- **Plan A**: 15,000,000 VND/year (up to 2,500,000 VND/visit)\n- **Plan B**: 10,000,000 VND/year (up to 1,800,000 VND/visit)\n- **Plan C**: 7,000,000 VND/year (up to 1,200,000 VND/visit)\n- **Plan D**: 4,500,000 VND/year (up to 800,000 VND/visit)\n\n**Important Note**: A doctor's prescription or treatment plan is mandatory for reimbursement (excluding vitamins/supplements).`;
  }

  if (
    q.includes("nội trú") ||
    q.includes("nằm viện") ||
    q.includes("giấy tờ") ||
    q.includes("hồ sơ") ||
    q.includes("bồi thường") ||
    q.includes("inpatient") ||
    q.includes("document") ||
    q.includes("claim")
  ) {
    return lang === "vi"
      ? `**Hồ sơ & Thủ tục Bồi thường (Nội trú / Ngoại trú)**:\n\n1. **Giấy yêu cầu trả tiền bảo hiểm (Claim Form)**: Điền đầy đủ và ký tên (không cần xác nhận công ty).\n2. **Chứng từ y tế**: Sổ khám bệnh / Giấy ra viện, Đơn thuốc, Chỉ định & Kết quả xét nghiệm / X-quang / siêu âm, Bảng kê chi tiết viện phí.\n3. **Chứng từ thanh toán**: Hóa đơn tài chính GTGT (VAT) hợp lệ.\n4. **Biên bản tường trình tai nạn**: Bắt buộc nếu khám/điều trị do tai nạn.\n\n**Nơi nhận hồ sơ bản cứng**:\n- **Hà Nội**: Mr. Dương Hùng Chiến (` +
          "`0838 830 038`" +
          `) — Phòng 3A, Tầng 11, Tòa nhà Harec, 4A Láng Hạ, Ba Đình.\n- **TP.HCM**: Ms. Nguyễn Thị Ánh Thuyết (` +
          "`0967 740 239`" +
          `) — Tầng 3, Tòa nhà An Khánh, 63 Phạm Ngọc Thạch, P. Xuân Hòa.`
      : `**Required Documents for Claim Reimbursement**:\n\n1. **Completed & Signed Claim Form** (no company stamp required).\n2. **Medical Documents**: Medical book/prescription, Discharge summary (for inpatient), Lab/X-ray results, Itemized hospital bill.\n3. **Payment Receipts**: Official VAT invoice(s).\n4. **Accident Report**: Required for accident-related claims.\n\n**Claims Mailing Offices**:\n- **Hanoi**: Mr. Duong Hung Chien (` +
          "`0838 830 038`" +
          `) — Room 3A, 11th Fl, Harec Building, 4A Lang Ha.\n- **HCMC**: Ms. Nguyen Thi Anh Thuyet (` +
          "`0967 740 239`" +
          `) — 3rd Fl, An Khanh Building, 63 Pham Ngoc Thach.`;
  }

  if (q.includes("bảo lãnh") || q.includes("bệnh viện") || q.includes("direct billing") || q.includes("hospital")) {
    return lang === "vi"
      ? `**Hướng dẫn Bảo lãnh viện phí trực tiếp (Direct Billing)**:\n- **Bước 1**: Tra cứu *Danh sách cơ sở bảo lãnh viện phí* tại mục **III · Hướng dẫn bồi thường** và đảm bảo cơ sở không nằm trong *Danh sách từ chối bảo hiểm (Blacklist)*.\n- **Bước 2**: Xuất trình **Thẻ bảo hiểm (hoặc App Fullerton Health Concierge)** + **CCCD/Hộ chiếu/Giấy khai sinh** tại quầy bảo lãnh.\n- **Thời gian xử lý**: Ngoại trú khoảng **30 phút**; Nội trú khoảng **3–4 giờ** hoặc trước khi xuất viện.\n- **Lưu ý**: Nếu cơ sở không bảo lãnh trực tiếp (hoặc điều trị tai nạn/cấp cứu), bạn hoàn toàn có thể tự thanh toán trước và nộp hồ sơ bồi thường sau.`
      : `**Cashless Direct Billing Guide**:\n- **Step 1**: Check the *Direct Billing Hospital Network* list in **Section III** and avoid facilities on the *Blacklist*.\n- **Step 2**: Present your **Insurance Card (or Fullerton Health Concierge App)** + **National ID/Passport/Birth Certificate** at the hospital's insurance desk.\n- **Processing Time**: Outpatient ~**30 minutes**; Inpatient **3–4 hours** or prior to discharge.`;
  }

  // Search uploaded custom markdown docs if query matches keywords in them
  const lines = compiledMd.split("\n");
  const matchedSnippets = lines
    .filter((line) => {
      const words = q.split(/\s+/).filter((w) => w.length > 3);
      return words.some((w) => line.toLowerCase().includes(w));
    })
    .slice(0, 8);

  if (matchedSnippets.length > 0) {
    return (
      (lang === "vi"
        ? `Thông tin trích xuất từ **Cơ sở tri thức (Knowledge Base .md)** của chương trình:\n\n`
        : `Information retrieved from the **Policy Knowledge Base (.md)**:\n\n`) +
      matchedSnippets.map((s) => `- ${s.replace(/^#+\s*/, "")}`).join("\n") +
      `\n\n---\n${planLines}`
    );
  }

  return lang === "vi"
    ? `Tôi là **Trợ lý AI Bolttech Việt Nam** cho Hợp đồng **DEMO-2027-0001**.\n\nTóm tắt nhanh thông tin chương trình:\n${planLines}\n\n- **Tư vấn quyền lợi**: Ms. Cao Vân Anh (\`0902 176 609\`) · Ms. Phan Thị Hiền (\`0979 494 095\`)\n- **Hỗ trợ bồi thường**: Mr. Dương Hùng Chiến (\`0838 830 038\` - Miền Bắc) · Ms. Nguyễn Thị Ánh Thuyết (\`0967 740 239\` - Miền Nam)`
    : `I am the **Bolttech Vietnam AI Advisor** for Policy **DEMO-2027-0001**.\n\nQuick program summary:\n${planLines}\n\n- **Benefits Consultation**: Ms. Cao Van Anh (\`0902 176 609\`) · Ms. Phan Thi Hien (\`0979 494 095\`)\n- **Claims Support**: Mr. Duong Hung Chien (\`0838 830 038\` - North) · Ms. Nguyen Thi Anh Thuyet (\`0967 740 239\` - South)`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const lang: "vi" | "en" = body.lang === "en" ? "en" : "vi";

    const store = readPortalStore();
    const compiledKnowledge = getCompiledKnowledgeMarkdown();

    const apiKey = (
      store.settings.openRouterApiKey ||
      process.env.OPENROUTER_API_KEY ||
      ""
    ).trim();

    const preferredModel = (
      store.settings.openRouterModel ||
      process.env.OPENROUTER_MODEL ||
      "deepseek/deepseek-v4.1-flash"
    ).trim();

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";

    // If no OpenRouter API Key is configured yet, use the built-in Knowledge Base responder
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      const reply = buildLocalIntelligentAnswer(
        lastUserMessage,
        lang,
        store.plans,
        compiledKnowledge
      );
      return NextResponse.json({
        reply,
        modelUsed: `${preferredModel} (Local Knowledge Base Mode)`,
      });
    }

    const systemPrompt = `Bạn là Trợ lý Tư vấn Bảo hiểm AI chính thức của Bolttech Việt Nam dành cho Cán bộ nhân viên của Khách hàng Demo (Số hợp đồng: DEMO-2027-0001).
Nhiệm vụ của bạn là giải đáp chính xác, rõ ràng, thân thiện và chuyên nghiệp mọi câu hỏi về quyền lợi bảo hiểm, thủ tục bồi thường, bảo lãnh viện phí, các lưu ý quan trọng và chương trình đăng ký bảo hiểm cho người thân (Gói A, B, C, D) dựa HOÀN TOÀN trên dữ liệu Knowledge Base (.md) dưới đây.
Ngôn ngữ phản hồi ưu tiên hiện tại: ${lang === "vi" ? "Tiếng Việt" : "English"}.
Định dạng câu trả lời bằng Markdown gọn gàng (dùng in đậm **bold** cho số tiền/hạn mức và gạch đầu dòng rõ ràng).

=== DỮ LIỆU KNOWLEDGE BASE (.MD) TỪ BACKEND ===
${compiledKnowledge}
=== KẾT THÚC KNOWLEDGE BASE ===`;

    // Candidate models: try user's configured model first (e.g. deepseek/deepseek-v4.1-flash),
    // then gracefully fallback to deepseek/deepseek-chat if OpenRouter maps V4.1 Flash under standard DeepSeek slug
    const candidateModels = Array.from(
      new Set([
        preferredModel,
        "deepseek/deepseek-chat",
        "google/gemini-2.5-flash",
      ])
    );

    for (const modelId of candidateModels) {
      try {
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://bolttech-demo-portal.vercel.app",
            "X-Title": "Bolttech Vietnam Customer Service Portal Demo",
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.slice(-10),
            ],
            temperature: 0.3,
          }),
        });

        if (orRes.ok) {
          const data = await orRes.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            return NextResponse.json({
              reply: content,
              modelUsed: modelId,
            });
          }
        }
      } catch {
        // try next candidate model
      }
    }

    // Fallback to local knowledge base answer if OpenRouter network/key error occurs
    const fallbackReply = buildLocalIntelligentAnswer(
      lastUserMessage,
      lang,
      store.plans,
      compiledKnowledge
    );
    return NextResponse.json({
      reply: fallbackReply,
      modelUsed: `${preferredModel} (Fallback Knowledge Base)`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Lỗi xử lý câu hỏi Chatbot: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 500 }
    );
  }
}
