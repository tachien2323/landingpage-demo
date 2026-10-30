export type PlanCode = "A" | "B" | "C" | "D";

export interface InsurancePlan {
  code: PlanCode;
  nameVi: string;
  nameEn: string;
  tierVi: string;
  tierEn: string;
  annualFee: number; // VND / person / year
  accidentLimit: string;
  inpatientLimit: string;
  outpatientLimit: string;
  dentalLimit: string;
  maternityLimitVi: string;
  maternityLimitEn: string;
}

export interface KnowledgeDoc {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  markdownContent: string;
  sizeBytes: number;
}

export interface DependentItem {
  id: string;
  fullName: string;
  relationship: string;
  gender: "Nam" | "Nữ" | "Male" | "Female";
  age: number;
  dobOrId?: string;
  plan: PlanCode;
  fee: number;
}

export interface FamilyRegistration {
  id: string;
  createdAt: string;
  policyNumber: string;
  employeeName: string;
  employeeCode: string;
  employeePhone: string;
  employeeEmail: string;
  dependents: DependentItem[];
  totalFee: number;
  sheetSynced: boolean;
  sheetSyncMessage?: string;
}

export interface PortalSettings {
  openRouterModel: string;
  openRouterApiKey?: string;
  googleSheetWebhookUrl: string;
  googleSheetId: string;
}

export interface PortalStoreData {
  plans: InsurancePlan[];
  mainKnowledgeMd: string;
  knowledgeDocs: KnowledgeDoc[];
  registrations: FamilyRegistration[];
  settings: PortalSettings;
}

export const DEFAULT_PLANS: InsurancePlan[] = [
  {
    code: "A",
    nameVi: "Chương trình A",
    nameEn: "Plan A",
    tierVi: "Gói Cao cấp (Diamond)",
    tierEn: "Diamond Tier",
    annualFee: 6500000,
    accidentLimit: "500.000.000 ₫",
    inpatientLimit: "120.000.000 ₫",
    outpatientLimit: "15.000.000 ₫",
    dentalLimit: "3.500.000 ₫",
    maternityLimitVi: "30.000.000 ₫",
    maternityLimitEn: "30,000,000 VND",
  },
  {
    code: "B",
    nameVi: "Chương trình B",
    nameEn: "Plan B",
    tierVi: "Gói Nâng cao (Gold)",
    tierEn: "Gold Tier",
    annualFee: 4800000,
    accidentLimit: "300.000.000 ₫",
    inpatientLimit: "80.000.000 ₫",
    outpatientLimit: "10.000.000 ₫",
    dentalLimit: "2.500.000 ₫",
    maternityLimitVi: "20.000.000 ₫",
    maternityLimitEn: "20,000,000 VND",
  },
  {
    code: "C",
    nameVi: "Chương trình C",
    nameEn: "Plan C",
    tierVi: "Gói Tiêu chuẩn (Silver)",
    tierEn: "Silver Tier",
    annualFee: 3500000,
    accidentLimit: "200.000.000 ₫",
    inpatientLimit: "60.000.000 ₫",
    outpatientLimit: "7.000.000 ₫",
    dentalLimit: "1.500.000 ₫",
    maternityLimitVi: "15.000.000 ₫",
    maternityLimitEn: "15,000,000 VND",
  },
  {
    code: "D",
    nameVi: "Chương trình D",
    nameEn: "Plan D",
    tierVi: "Gói Cơ bản (Bronze)",
    tierEn: "Bronze Tier",
    annualFee: 2400000,
    accidentLimit: "100.000.000 ₫",
    inpatientLimit: "40.000.000 ₫",
    outpatientLimit: "4.500.000 ₫",
    dentalLimit: "1.000.000 ₫",
    maternityLimitVi: "Không áp dụng",
    maternityLimitEn: "Not applicable",
  },
];

export const SHEET_HEADERS = [
  "Mã Đăng Ký",
  "Thời Gian Gửi",
  "Số Hợp Đồng",
  "Họ Tên Nhân Viên",
  "Mã NV / Phòng Ban",
  "Số Điện Thoại NV",
  "Email NV",
  "Họ Tên Người Thân",
  "Mối Quan Hệ",
  "Giới Tính",
  "Tuổi",
  "Ngày Sinh / CCCD / GKS",
  "Chương Trình (A/B/C/D)",
  "Mức Phí Người Thân (VNĐ)",
  "Tổng Phí Đơn NV (VNĐ)",
  "Trạng Thái Cấp Đơn",
];

export function registrationToSheetRows(reg: FamilyRegistration): (string | number)[][] {
  return reg.dependents.map((dep) => [
    reg.id,
    new Date(reg.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
    reg.policyNumber,
    reg.employeeName,
    reg.employeeCode || "",
    reg.employeePhone,
    reg.employeeEmail,
    dep.fullName,
    dep.relationship,
    dep.gender,
    dep.age,
    dep.dobOrId || "",
    `Chương trình ${dep.plan}`,
    dep.fee,
    reg.totalFee,
    "Chờ cấp đơn",
  ]);
}
