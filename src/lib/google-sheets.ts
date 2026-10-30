import { google } from "googleapis";
import { readPortalStore } from "./store";
import { FamilyRegistration, SHEET_HEADERS, registrationToSheetRows } from "./types";

export { SHEET_HEADERS, registrationToSheetRows };

export async function syncRegistrationToGoogleSheet(
  reg: FamilyRegistration
): Promise<{ synced: boolean; message: string }> {
  const store = readPortalStore();
  const webhookUrl =
    store.settings.googleSheetWebhookUrl?.trim() ||
    process.env.GOOGLE_SHEET_WEBHOOK_URL?.trim() ||
    "";
  const sheetId =
    store.settings.googleSheetId?.trim() ||
    process.env.GOOGLE_SHEET_ID?.trim() ||
    "1ClmsFVg_D-jSU1_lshND_MqAEWSAn_83P3rebQv-4RA";
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() || "";
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n").trim();

  const rows = registrationToSheetRows(reg);

  // Method 1: Google Apps Script Webhook URL
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "appendRows",
          headers: SHEET_HEADERS,
          rows,
        }),
      });

      if (response.ok) {
        return {
          synced: true,
          message: `Đã ghi ${rows.length} dòng người thân vào Google Worksheet (Apps Script Webhook).`,
        };
      } else {
        const errText = await response.text().catch(() => "");
        return {
          synced: false,
          message: `Webhook Google Sheet trả về mã lỗi ${response.status}: ${errText.slice(0, 120)}`,
        };
      }
    } catch (err) {
      return {
        synced: false,
        message: `Lỗi kết nối Google Sheet Webhook: ${
          err instanceof Error ? err.message : String(err)
        }`,
      };
    }
  }

  // Method 2: Google Sheets API v4 (Service Account)
  if (sheetId && clientEmail && privateKey) {
    try {
      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });

      // Check if Row 1 has headers
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "A1:P1",
      });

      if (!existing.data.values || existing.data.values.length === 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: "A1:P1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [SHEET_HEADERS],
          },
        });
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "A1",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: rows,
        },
      });

      return {
        synced: true,
        message: `Đã ghi trực tiếp ${rows.length} dòng người thân vào Google Sheet ID ${sheetId.slice(0, 8)}...`,
      };
    } catch (err) {
      return {
        synced: false,
        message: `Lỗi Google Sheets API: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  return {
    synced: false,
    message:
      "Đã lưu trên hệ thống. Chưa cấu hình URL Google Worksheet trong trang Quản trị (/admin) — có thể đồng bộ hoặc xuất file chuẩn cấp đơn bất kỳ lúc nào.",
  };
}

export const APPS_SCRIPT_SNIPPET = `// Dán đoạn mã này vào file Google Sheet của bạn:
// Tiện ích mở rộng (Extensions) -> Apps Script -> Dán mã -> Triển khai (Deploy) -> Ứng dụng web (Web App)
// Chọn: Thực thi dưới dạng "Tôi (Me)" & Quyền truy cập "Bất kỳ ai (Anyone)"

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Tự động tạo dòng tiêu đề chuẩn cấp đơn nếu Sheet đang trống
    if (sheet.getLastRow() === 0 && data.headers) {
      sheet.appendRow(data.headers);
      sheet.getRange(1, 1, 1, data.headers.length)
        .setFontWeight("bold")
        .setBackground("#180F50")
        .setFontColor("#FFFFFF");
    }
    
    // Ghi từng người thân thành 1 dòng riêng biệt để cấp đơn ngay
    if (data.rows && data.rows.length > 0) {
      data.rows.forEach(function(row) {
        sheet.appendRow(row);
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ ok: true, count: (data.rows || []).length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
