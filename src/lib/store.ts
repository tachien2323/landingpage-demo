import fs from "fs";
import path from "path";
import { DEFAULT_KNOWLEDGE_MD } from "@/data/default-knowledge";
import {
  DEFAULT_PLANS,
  DependentItem,
  FamilyRegistration,
  InsurancePlan,
  KnowledgeDoc,
  PlanCode,
  PortalSettings,
  PortalStoreData,
} from "./types";

export {
  DEFAULT_PLANS,
  type DependentItem,
  type FamilyRegistration,
  type InsurancePlan,
  type KnowledgeDoc,
  type PlanCode,
  type PortalSettings,
  type PortalStoreData,
};

let memoryStore: PortalStoreData | null = null;

function getStorePaths(): string[] {
  const localPath = path.join(process.cwd(), ".data", "portal-store.json");
  const tmpPath = path.join("/tmp", "bolttech-portal-store.json");
  return [localPath, tmpPath];
}

function createInitialStore(): PortalStoreData {
  return {
    plans: DEFAULT_PLANS,
    mainKnowledgeMd: DEFAULT_KNOWLEDGE_MD,
    knowledgeDocs: [],
    registrations: [],
    settings: {
      openRouterModel: process.env.OPENROUTER_MODEL || "deepseek/deepseek-v4.1-flash",
      openRouterApiKey: "",
      googleSheetWebhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL || "",
      googleSheetId:
        process.env.GOOGLE_SHEET_ID || "1ClmsFVg_D-jSU1_lshND_MqAEWSAn_83P3rebQv-4RA",
    },
  };
}

export function readPortalStore(): PortalStoreData {
  const paths = getStorePaths();
  for (const p of paths) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
        const raw = fs.readFileSync(/*turbopackIgnore: true*/ p, "utf-8");
        const parsed = JSON.parse(raw) as Partial<PortalStoreData>;
        const initial = createInitialStore();
        memoryStore = {
          plans: parsed.plans?.length ? parsed.plans : initial.plans,
          mainKnowledgeMd: parsed.mainKnowledgeMd || initial.mainKnowledgeMd,
          knowledgeDocs: parsed.knowledgeDocs || [],
          registrations: parsed.registrations || [],
          settings: {
            ...initial.settings,
            ...(parsed.settings || {}),
          },
        };
        return memoryStore;
      }
    } catch {
      // try next path
    }
  }

  if (memoryStore) {
    return memoryStore;
  }

  memoryStore = createInitialStore();
  return memoryStore;
}

export function writePortalStore(data: PortalStoreData): void {
  memoryStore = data;
  const [localPath, tmpPath] = getStorePaths();

  try {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
    fs.writeFileSync(/*turbopackIgnore: true*/ localPath, JSON.stringify(data, null, 2), "utf-8");
    return;
  } catch {
    // On Vercel serverless, process.cwd() is read-only; write to /tmp instead
  }

  try {
    fs.writeFileSync(/*turbopackIgnore: true*/ tmpPath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Keep in memoryStore if filesystem is completely locked
  }
}

export function getCompiledKnowledgeMarkdown(): string {
  const store = readPortalStore();
  const plansSummary = store.plans
    .map(
      (p) =>
        `- **${p.nameVi} (${p.tierVi})**: Mức phí người thân hiện hành = **${p.annualFee.toLocaleString("vi-VN")} VNĐ/năm** (Tai nạn: ${p.accidentLimit}, Nội trú: ${p.inpatientLimit}, Ngoại trú: ${p.outpatientLimit}, Nha khoa: ${p.dentalLimit}, Thai sản: ${p.maternityLimitVi})`
    )
    .join("\n");

  const docsSection =
    store.knowledgeDocs.length > 0
      ? "\n\n---\n## TÀI LIỆU BỔ SUNG ĐÃ TẢI LÊN (UPLOADED DOCUMENTS CONVERTED TO MARKDOWN)\n\n" +
        store.knowledgeDocs
          .map(
            (doc) =>
              `### Tài liệu: ${doc.fileName} (Cập nhật: ${doc.uploadedAt})\n\n${doc.markdownContent}`
          )
          .join("\n\n---\n\n")
      : "";

  return `${store.mainKnowledgeMd}\n\n---\n## BIỂU PHÍ ĐĂNG KÝ NGƯỜI THÂN CẬP NHẬT MỚI NHẤT TỪ HỆ THỐNG\n${plansSummary}${docsSection}`;
}
