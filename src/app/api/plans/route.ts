import { NextResponse } from "next/server";
import { InsurancePlan, readPortalStore, writePortalStore } from "@/lib/store";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET() {
  const store = readPortalStore();
  return NextResponse.json({ plans: store.plans });
}

export async function PUT(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { plans } = body as { plans: InsurancePlan[] };

    if (!Array.isArray(plans) || plans.length === 0) {
      return NextResponse.json({ error: "Invalid plans data" }, { status: 400 });
    }

    const store = readPortalStore();
    store.plans = plans.map((p) => ({
      ...p,
      annualFee: Number(p.annualFee) || 0,
    }));
    writePortalStore(store);

    return NextResponse.json({ ok: true, plans: store.plans });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update plans" },
      { status: 500 }
    );
  }
}
