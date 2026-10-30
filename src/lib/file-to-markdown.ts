import * as XLSX from "xlsx";
import mammoth from "mammoth";
import JSZip from "jszip";

export async function convertFileToMarkdown(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const lower = fileName.toLowerCase();

  // 1. Markdown or Plain Text (.md, .txt, .csv)
  if (lower.endsWith(".md") || lower.endsWith(".txt")) {
    return buffer.toString("utf-8").trim();
  }

  // 2. Excel Spreadsheets (.xlsx, .xls, .csv) -> Markdown Tables
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sections: string[] = [`# Dữ liệu Bảng tính: ${fileName}`];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
        header: 1,
        defval: "",
      });

      const nonEmptyRows = rows.filter((r) =>
        r.some((cell) => String(cell ?? "").trim() !== "")
      );
      if (nonEmptyRows.length === 0) continue;

      sections.push(`## Sheet: ${sheetName}`);
      const headers = nonEmptyRows[0].map((h, i) =>
        String(h || `Cột ${i + 1}`).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim()
      );
      const divider = headers.map(() => "---");

      const mdRows: string[] = [
        `| ${headers.join(" | ")} |`,
        `| ${divider.join(" | ")} |`,
      ];

      for (let i = 1; i < Math.min(nonEmptyRows.length, 500); i++) {
        const row = nonEmptyRows[i];
        const cells = headers.map((_, colIdx) =>
          String(row[colIdx] ?? "")
            .replace(/\|/g, "\\|")
            .replace(/\r?\n/g, " ")
            .trim()
        );
        mdRows.push(`| ${cells.join(" | ")} |`);
      }

      sections.push(mdRows.join("\n"));
    }

    return sections.join("\n\n");
  }

  // 3. Word Documents (.docx, .doc) -> Markdown
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const rawText = result.value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n\n");
      return `# Tài liệu Word: ${fileName}\n\n${rawText}`;
    } catch (err) {
      return `# Tài liệu Word: ${fileName}\n\n(Không thể trích xuất tự động toàn bộ định dạng: ${
        err instanceof Error ? err.message : String(err)
      })`;
    }
  }

  // 4. PowerPoint Presentations (.pptx, .ppt) -> Slide-by-Slide Markdown
  if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) {
    try {
      const zip = await JSZip.loadAsync(buffer);
      const slideFiles = Object.keys(zip.files)
        .filter((k) => /^ppt\/slides\/slide\d+\.xml$/.test(k))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
          const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
          return numA - numB;
        });

      const slideSections: string[] = [`# Bài trình chiếu PowerPoint: ${fileName}`];

      for (let i = 0; i < slideFiles.length; i++) {
        const xml = await zip.files[slideFiles[i]].async("text");
        const matches = Array.from(xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)).map((m) =>
          m[1]
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .trim()
        );
        const lines = matches.filter(Boolean);
        if (lines.length > 0) {
          slideSections.push(`## Slide ${i + 1}\n- ${lines.join("\n- ")}`);
        }
      }

      return slideSections.join("\n\n");
    } catch (err) {
      return `# Tài liệu PowerPoint: ${fileName}\n\n(Lỗi đọc cấu trúc slide: ${
        err instanceof Error ? err.message : String(err)
      })`;
    }
  }

  // 5. PDF Documents (.pdf) -> Markdown
  if (lower.endsWith(".pdf")) {
    try {
      // Dynamic import of pdf-parse (supports both v1 function and v2 PDFParse class)
      const pdfParseModule = (await import("pdf-parse")) as Record<string, unknown>;

      let rawPdfText = "";
      if (typeof pdfParseModule.default === "function") {
        const fn = pdfParseModule.default as (buf: Buffer) => Promise<{ text: string }>;
        const data = await fn(buffer);
        rawPdfText = data.text || "";
      } else if (typeof pdfParseModule.PDFParse === "function") {
        const PDFParseClass = pdfParseModule.PDFParse as new (opts: {
          data: Buffer;
        }) => { getText: () => Promise<{ text: string }> };
        const parser = new PDFParseClass({ data: buffer });
        const data = await parser.getText();
        rawPdfText = data.text || "";
      }

      const cleaned = rawPdfText
        .split(/\r?\n/)
        .map((l: string) => l.trim())
        .filter(Boolean)
        .join("\n\n");
      return `# Tài liệu PDF: ${fileName}\n\n${cleaned}`;
    } catch {
      // Fallback printable text extraction if PDF has custom encoding
      const fallbackText = buffer
        .toString("utf-8")
        .replace(/[^\x20-\x7E\u00A0-\u1EF9\n]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
      return `# Tài liệu PDF: ${fileName}\n\n${fallbackText.slice(0, 15000)}`;
    }
  }

  // Fallback for any other text-based file
  return `# Tài liệu: ${fileName}\n\n${buffer.toString("utf-8")}`;
}
