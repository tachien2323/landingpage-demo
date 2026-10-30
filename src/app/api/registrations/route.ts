import { NextResponse } from "next/server";
import {
  DependentItem,
  FamilyRegistration,
  PlanCode,
  readPortalStore,
  writePortalStore,
} from "@/lib/store";
import { syncRegistrationToGoogleSheet } from "@/lib/google-sheets";

export async function GET() {
  const store = readPortalStore();
  return NextResponse.json({
    registrations: store.registrations,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const store = readPortalStore();

    // Action: test row to Google Sheet from Admin
    if (body.action === "testRow") {
      const sampleReg: FamilyRegistration = {
        id: `TEST-${Date.now().toString().slice(-5)}`,
        createdAt: new Date().toISOString(),
        policyNumber: "DEMO-2027-0001",
        employeeName: "Nguyễn Văn An (Dòng kiểm tra kết nối)",
        employeeCode: "NV-DEMO-01",
        employeePhone: "0902176609",
        employeeEmail: "demo.employee@bolttech.io",
        dependents: [
          {
            id: "dep-1",
            fullName: "Trần Thị Bình (Người thân mẫu)",
            relationship: "Vợ / Chồng",
            gender: "Nữ",
            age: 32,
            dobOrId: "15/08/1995",
            plan: "A",
            fee: store.plans.find((p) => p.code === "A")?.annualFee || 6500000,
          },
        ],
        totalFee: store.plans.find((p) => p.code === "A")?.annualFee || 6500000,
        sheetSynced: false,
      };

      const syncRes = await syncRegistrationToGoogleSheet(sampleReg);
      return NextResponse.json({
        ok: syncRes.synced,
        message: syncRes.message,
      });
    }

    // Action: resync all unsynced registrations to Google Sheet
    if (body.action === "resyncAll") {
      let syncedCount = 0;
      let lastMessage = "";
      for (const reg of store.registrations) {
        if (!reg.sheetSynced) {
          const res = await syncRegistrationToGoogleSheet(reg);
          reg.sheetSynced = res.synced;
          reg.sheetSyncMessage = res.message;
          lastMessage = res.message;
          if (res.synced) syncedCount++;
        }
      }
      writePortalStore(store);
      return NextResponse.json({
        ok: true,
        syncedCount,
        message:
          syncedCount > 0
            ? `Đã đồng bộ thành công ${syncedCount} đơn đăng ký lên Google Worksheet.`
            : lastMessage || "Tất cả đơn đăng ký đã được đồng bộ trước đó hoặc chưa cấu hình URL.",
      });
    }

    // Standard Family Registration submission
    const {
      employeeName,
      employeeCode,
      employeePhone,
      employeeEmail,
      dependents,
    } = body;

    if (!employeeName || !Array.isArray(dependents) || dependents.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên nhân viên và ít nhất 1 người thân." },
        { status: 400 }
      );
    }

    const planMap = new Map(store.plans.map((p) => [p.code, p.annualFee]));

    const normalizedDependents: DependentItem[] = dependents.map(
      (dep: Partial<DependentItem>, idx: number) => {
        const planCode: PlanCode =
          dep.plan && ["A", "B", "C", "D"].includes(dep.plan)
            ? (dep.plan as PlanCode)
            : "A";
        const fee = planMap.get(planCode) || 6500000;
        return {
          id: dep.id || `dep-${ idx + 1 }`,
          fullName: String(dep.fullName || "").trim(),
          relationship: String(dep.relationship || "Vợ / Chồng").trim(),
          gender: (dep.gender as DependentItem["gender"]) || "Nam",
          age: Number(dep.age) || 30,
          dobOrId: String(dep.dobOrId || "").trim(),
          plan: planCode,
          fee,
        };
      }
    );

    const totalFee = normalizedDependents.reduce((sum, d) => sum + d.fee, 0);
    const regId = `BT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRegistration: FamilyRegistration = {
      id: regId,
      createdAt: new Date().toISOString(),
      policyNumber: "DEMO-2027-0001",
      employeeName: String(employeeName).trim(),
      employeeCode: String(employeeCode || "").trim(),
      employeePhone: String(employeePhone || "").trim(),
      employeeEmail: String(employeeEmail || "").trim(),
      dependents: normalizedDependents,
      totalFee,
      sheetSynced: false,
    };

    // Immediately sync to Google Worksheet for policy issuance
    const syncResult = await syncRegistrationToGoogleSheet(newRegistration);
    newRegistration.sheetSynced = syncResult.synced;
    newRegistration.sheetSyncMessage = syncResult.message;

    store.registrations.unshift(newRegistration);
    writePortalStore(store);

    return NextResponse.json({
      ok: true,
      registration: newRegistration,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Lỗi xử lý đăng ký: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 }
    );
  }
}
