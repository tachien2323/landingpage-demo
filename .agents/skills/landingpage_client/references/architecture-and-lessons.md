# Kiến trúc Chi tiết & Bài học Kinh nghiệm Thực tế (`landingpage_client`)

Tài liệu này lưu trữ các quy chuẩn kỹ thuật và cách xử lý triệt để các lỗi thường gặp khi triển khai Cổng thông tin Bảo hiểm Khách hàng trên Next.js 16 (Turbopack) + Vercel.

---

## 1. Cấu trúc Thư mục Chuẩn

```text
project-root/
├── context.md                          # Yêu cầu & dữ liệu riêng của khách hàng
├── next.config.ts                      # Khai báo serverExternalPackages
├── src/
│   ├── app/
│   │   ├── globals.css                 # Biến màu thương hiệu, text-wrap balance/pretty, overflow-x: clip
│   │   ├── layout.tsx                  # Font Inter (latin + vietnamese) & LanguageProvider
│   │   ├── page.tsx                    # Trang chủ tập hợp 6 phân khu + Modal + Chatbot
│   │   ├── admin/
│   │   │   └── page.tsx                # Trang Quản trị ẩn (/admin) bảo vệ bằng passcode
│   │   └── api/
│   │       ├── admin/auth/route.ts     # Xác thực passcode Admin
│   │       ├── admin/settings/route.ts # Lưu cấu hình OpenRouter & Google Sheets
│   │       ├── chat/route.ts           # Kết nối OpenRouter AI + đọc Knowledge Base .md
│   │       ├── knowledge/route.ts      # Upload & convert PDF/Word/Excel/PPT -> Markdown (.md)
│   │       ├── plans/route.ts          # Đọc/cập nhật biểu phí Chương trình A, B, C, D
│   │       └── registrations/route.ts  # Nhận đơn đăng ký người thân & ghi vào Google Sheets
│   ├── components/
│   │   ├── Header.tsx                  # Sticky Header (ẩn nút Quản trị, cố định cụm VI/EN)
│   │   ├── HeroAndGeneral.tsx          # Hero + Thông tin hợp đồng + Biểu mẫu tải về
│   │   ├── BenefitsSection.tsx         # Bảng quyền lợi & mức phí Gói A, B, C, D
│   │   ├── ClaimsNotesContact.tsx      # Hướng dẫn bồi thường, 8 lưu ý, Banner người thân, Liên hệ
│   │   ├── FamilyRegistrationModal.tsx # Form đăng ký >1 người thân (native <dialog>)
│   │   └── ChatbotWidget.tsx           # Khung chat AI nổi góc phải
│   ├── data/
│   │   ├── default-knowledge.ts        # Nội dung Markdown mặc định của chương trình bảo hiểm
│   │   └── store.json                  # Dữ liệu lưu trữ cục bộ
│   ├── i18n/
│   │   ├── LanguageContext.tsx         # Context chuyển đổi ngôn ngữ VI / EN
│   │   └── translations.ts             # Từ điển song ngữ Việt - Anh
│   └── lib/
│       ├── types.ts                    # Client-safe types, DEFAULT_PLANS, SHEET_HEADERS
│       ├── store.ts                    # Server-only đọc/ghi dữ liệu (có fallback /tmp trên Vercel)
│       ├── file-to-markdown.ts         # Bộ chuyển đổi PDF, DOCX, XLSX, PPTX sang Markdown (.md)
│       └── google-sheets.ts            # Đồng bộ Google Sheets qua Webhook hoặc Service Account API
```

---

## 2. Các Bài học & Quy tắc Chống Lỗi Quan trọng

### 2.1. Tránh lỗi `Can't resolve 'child_process' / 'fs' / 'net'` trên Next.js 16 Turbopack
- **Nguyên nhân:** Client Components (`"use client"`) import hằng số (`DEFAULT_PLANS`, `SHEET_HEADERS`) từ file có `import fs from "fs"` hoặc `import { google } from "googleapis"`.
- **Cách khắc phục:**
  1. Đặt toàn bộ kiểu dữ liệu (`InsurancePlan`, `FamilyRegistration`, `KnowledgeDoc`) và hằng số (`DEFAULT_PLANS`, `SHEET_HEADERS`, `registrationToSheetRows`) vào `src/lib/types.ts` (không chứa bất kỳ thư viện Node.js nào).
  2. Trong `next.config.ts`, luôn cấu hình:
     ```ts
     import type { NextConfig } from "next";
     const nextConfig: NextConfig = {
       serverExternalPackages: ["googleapis", "pdf-parse", "mammoth", "xlsx"],
     };
     export default nextConfig;
     ```

### 2.2. Quy tắc Typography & Chống Rớt Chữ Lẻ (Orphans / Runts)
- **Trong `src/app/globals.css`:**
  - Khóa tràn ngang toàn trang: `html, body { overflow-x: clip; }`
  - Cân bằng dòng tiêu đề: `h1, h2, h3, h4, h5, h6, th { text-wrap: balance; }`
  - Chống rớt 1 từ cuối đoạn văn: `p, blockquote, li, .pretty-text { text-wrap: pretty; overflow-wrap: break-word; }`
- **Trên mọi Nút bấm (Buttons) & Nhãn (Badges):**
  - Luôn thêm `whitespace-nowrap shrink-0` vào các nút CTA (`Đăng ký người thân`, `Tải về`, `VI | EN`) để chữ trên nút không bao giờ bị gãy làm 2 dòng.
- **Trên Thanh Header (`src/components/Header.tsx`):**
  - Giữ nhãn menu ngắn gọn (`Thông tin chung`, `Quyền lợi`, `Bồi thường`, `Lưu ý`, `Biểu mẫu`, `Liên hệ`) để tổng chiều rộng 3 khối (Logo + Menu + Nút CTA & `VI | EN`) luôn `< 1.150px`, nằm gọn trong `max-w-7xl` (`1.280px`).
  - **Không hiển thị** nút `Quản trị` trên thanh menu công khai.
- **Trong Danh sách Biểu mẫu Cần tải:**
  - Tách tên tiếng Anh (`Claim Form`, `Accident Report`) thành badge phụ (`subBadge`) thay vì nối dài vào tiêu đề tiếng Việt; không để phần mở rộng file `(.docx)`, `(.pdf)` ở cuối câu mô tả.
