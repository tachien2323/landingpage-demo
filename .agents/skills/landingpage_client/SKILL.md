---
name: landingpage_client
description: >-
  Thiết kế, xây dựng và triển khai Cổng thông tin Dịch vụ Khách hàng / Bảo hiểm Doanh nghiệp (Corporate Client Insurance Portal Landing Page) chuẩn thương hiệu Bolttech (Next.js App Router, Song ngữ Việt-Anh, AI Chatbot OpenRouter đọc tài liệu Markdown convert từ PDF/Word/Excel/PPT, Form đăng ký bảo hiểm người thân đồng bộ trực tiếp Google Sheets, trang Quản trị /admin ẩn có mật khẩu, và tự động deploy GitHub + Vercel). Sử dụng skill này bất kỳ khi nào người dùng yêu cầu tạo mới, nhân bản hoặc tùy biến landing page cổng thông tin bảo hiểm cho một khách hàng doanh nghiệp mới.
---

# Corporate Client Insurance Landing Page (`landingpage_client`)

Skill này cung cấp quy trình chuẩn từ A–Z (kèm bộ khung kiến trúc và các bài học khắc phục lỗi thực tế) để khởi tạo nhanh **Cổng thông tin Dịch vụ Khách hàng Doanh nghiệp (Corporate Insurance Portal)** cho từng khách hàng mới của Bolttech.

## 1. Khi nào kích hoạt Skill này
- Người dùng yêu cầu tạo Landing Page / Microsite / Cổng thông tin bảo hiểm sức khỏe & tai nạn cho một doanh nghiệp khách hàng mới (ví dụ: *"Tạo landingpage bảo hiểm cho khách hàng X dùng skill landingpage_client"*).
- Người dùng muốn nhân bản mô hình từ dự án mẫu (`tachien2323/landingpage-demo`) sang khách hàng mới với bộ quyền lợi, biểu phí Gói A/B/C/D, tài liệu PDF/Word/Excel và file Google Sheet riêng.

---

## 2. Quy trình Triển khai Chuẩn 6 Bước (Từ A–Z)

### Bước 1: Thu thập & Chuẩn hóa `context.md` của Khách hàng mới
Nếu dự án mới chưa có file `context.md`, hãy dựa vào mẫu [context-template.md](./examples/context-template.md) và xác nhận nhanh với người dùng các thông số cốt lõi:
1. **Tên Doanh nghiệp Khách hàng & Số Hợp đồng** (VD: `Khách hàng ABC`, Số HĐ `ABC-2027-0001`, Thời hạn bảo hiểm, Nhà bảo hiểm gốc).
2. **Biểu phí & Quyền lợi Gói Người thân (A, B, C, D)**: Mức phí mặc định/năm (có thể sửa sau trong `/admin`).
3. **Danh sách Biểu mẫu & Tài liệu đính kèm**: Link tải Claim Form, Biên bản tai nạn, Mạng lưới bảo lãnh viện phí, hoặc file tài liệu gốc (`.pdf`, `.docx`, `.xlsx`, `.pptx`) để nạp cho AI Chatbot.
4. **Thông tin Liên hệ Chuyên viên**: Chuyên viên chăm sóc hợp đồng & Chuyên viên bồi thường (Miền Bắc / Miền Nam).

### Bước 2: Khởi tạo Kiến trúc Next.js (App Router + TypeScript + Tailwind CSS)
Tuân thủ nghiêm ngặt kiến trúc tách biệt **Client Types** và **Server Store** (chi tiết tại [architecture-and-lessons.md](./references/architecture-and-lessons.md)):
- **Lưu ý đặt tên thư mục:** Nếu tên thư mục chứa chữ in hoa, chạy `create-next-app` trong thư mục tạm tên chữ thường rồi copy sang hoặc khởi tạo `package.json` với `"name"` viết thường.
- **Tách biệt Client/Server cho Turbopack (Next.js 16+):**
  - `src/lib/types.ts`: Chỉ chứa TypeScript interfaces, `DEFAULT_PLANS`, `SHEET_HEADERS`, và hàm thuần client-safe. **Tuyệt đối không** import `fs`, `path`, hoặc `googleapis` vào file được Client Component gọi.
  - `src/lib/store.ts`: Xử lý đọc/ghi JSON và thêm `/*turbopackIgnore: true*/` cho các lệnh `fs`, kết hợp fallback sang `/tmp` khi chạy trên môi trường Serverless của Vercel.
  - `next.config.ts`: Khai báo `serverExternalPackages: ["googleapis", "pdf-parse", "mammoth", "xlsx"]`.

### Bước 3: Xây dựng Giao diện (UI/UX & Quy chuẩn Typography Chống Rớt Chữ)
Giao diện gồm 6 phân khu công khai trên Landing Page (ẩn hoàn toàn nút `/admin` khỏi thanh điều hướng công khai):
1. **Sticky Header (`src/components/Header.tsx`)**:
   - Chỉ hiển thị Logo thương hiệu + 6 mục điều hướng ngắn gọn (`Thông tin chung`, `Quyền lợi`, `Bồi thường`, `Lưu ý`, `Biểu mẫu`, `Liên hệ`) + Nút CTA `Đăng ký người thân` + Nút chuyển ngôn ngữ `VI | EN`.
   - **Ẩn hoàn toàn nút Quản trị (`/admin`)** trên Landing Page công khai (Quản trị viên truy cập trực tiếp qua URL `/admin`).
   - Đặt `shrink-0` và `whitespace-nowrap` cho nút CTA và cụm `VI | EN` (nền đặc `#261B6E` viền `#34C8D2/40`) để không bao giờ tràn ngang khỏi khung `max-w-7xl`.
2. **Mục I — Hero & Thông tin chung + Biểu mẫu cần tải (`src/components/HeroAndGeneral.tsx`)**:
   - Trong danh sách **Biểu mẫu cần tải**, tách tên tiếng Anh (`Claim Form`, `Accident Report`, v.v.) thành nhãn `subBadge` riêng thay vì ghép dài vào tiêu đề `<h4>`, và không để đuôi `(.docx)` / `(.doc)` ở cuối câu mô tả để tránh rớt 1 từ xuống dòng.
3. **Mục II — Quyền lợi bảo hiểm & Bảng so sánh Chương trình A, B, C, D (`src/components/BenefitsSection.tsx`)**:
   - Đồng bộ thời gian thực mức phí Gói A/B/C/D từ API `/api/plans`.
4. **Mục III, IV, V, VI — Hướng dẫn bồi thường, 8 Lưu ý quan trọng, Banner Người thân & Liên hệ (`src/components/ClaimsNotesContact.tsx`)**:
   - Dùng `<dialog closedby="any">` nguyên bản cho Lightbox phóng to sơ đồ quy trình bồi thường.
   - Mở rộng khung tiêu đề phụ (`max-w-4xl`), áp dụng `text-wrap: balance` cho `h1..h6, th` và `text-wrap: pretty` cho `p, li` trong `src/app/globals.css`, đồng thời gắn `whitespace-nowrap shrink-0` cho mọi nút bấm để không bao giờ bị rớt chữ lẻ (*orphans/runts*).

### Bước 4: Modal Đăng ký Người thân & Đồng bộ Google Sheets Trực tiếp
- **Modal (`src/components/FamilyRegistrationModal.tsx`)**: Cho phép thêm `>1` người thân trong 1 lần đăng ký, tự động tính phí theo gói A/B/C/D và tổng phí.
- **Google Sheets (`src/lib/google-sheets.ts` + CLI `gsheets`)**:
  - Tự động tạo mới Google Spreadsheet bằng công cụ `gsheets` CLI (hoặc kết nối `GOOGLE_SHEET_ID` có sẵn), tạo 18 cột chuẩn để cấp đơn bảo hiểm ngay và tô màu dòng tiêu đề (`#180F50` chữ trắng in đậm).

### Bước 5: AI Chatbot (OpenRouter) & Trang Quản trị (`/admin`)
- **AI Chatbot (`src/components/ChatbotWidget.tsx` & `src/app/api/chat/route.ts`)**:
  - Mặc định dùng model `deepseek/deepseek-v4.1-flash` qua OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`), có bộ trả lời thông minh dự phòng (Smart Local Fallback) khi chưa cấu hình API Key.
- **Trang Quản trị (`src/app/admin/page.tsx` & `src/lib/file-to-markdown.ts`)**:
  - Bảo vệ bằng mật khẩu (`ADMIN_PASSCODE`, mặc định `bolttech2027`).
  - Hỗ trợ upload file `.pdf`, `.docx`, `.xlsx`, `.pptx`, `.md`, `.txt` và tự động convert sang `.md` làm nguồn tri thức (Knowledge Base) cho Chatbot.
  - Cho phép chỉnh sửa trực tiếp biểu phí Chương trình A, B, C, D và cấu hình Google Sheet / OpenRouter Model.

### Bước 6: Kiểm thử Build, Đẩy lên GitHub & Publish lên Vercel
1. Chạy `npm run build` để đảm bảo 0 lỗi TypeScript và Turbopack.
2. Khởi tạo Git repository, đẩy lên GitHub và kết nối project trên Vercel.
3. Cấu hình biến môi trường trên Vercel (`OPENROUTER_MODEL`, `OPENROUTER_API_KEY`, `ADMIN_PASSCODE`, `GOOGLE_SHEET_ID`) và tắt `ssoProtection` để CBNV khách hàng truy cập công khai.
