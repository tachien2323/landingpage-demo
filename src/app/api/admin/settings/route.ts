import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { readPortalStore, writePortalStore } from "@/lib/store";
import { APPS_SCRIPT_SNIPPET } from "@/lib/google-sheets";

export async function GET(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = readPortalStore();
  return NextResponse.json({
    settings: {
      openRouterModel: store.settings.openRouterModel || "deepseek/deepseek-v4.1-flash",
      hasEnvOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
      hasCustomOpenRouterKey: Boolean(store.settings.openRouterApiKey),
      googleSheetWebhookUrl: store.settings.googleSheetWebhookUrl || "",
      googleSheetId: store.settings.googleSheetId || "",
    },
    appsScriptSnippet: APPS_SCRIPT_SNIPPET,
  });
}

export async function PUT(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const store = readPortalStore();

    if (typeof body.openRouterModel === "string" && body.openRouterModel.trim()) {
      store.settings.openRouterModel = body.openRouterModel.trim();
    }
    if (typeof body.openRouterApiKey === "string") {
      store.settings.openRouterApiKey = body.openRouterApiKey.trim();
    }
    if (typeof body.googleSheetWebhookUrl === "string") {
      store.settings.googleSheetWebhookUrl = body.googleSheetWebhookUrl.trim();
    }
    if (typeof body.googleSheetId === "string") {
      store.settings.googleSheetId = body.googleSheetId.trim();
    }

    writePortalStore(store);

    return NextResponse.json({
      ok: true,
      settings: store.settings,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save settings" },
      { status: 500 }
    );
  }
}
