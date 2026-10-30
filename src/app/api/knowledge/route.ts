import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { KnowledgeDoc, readPortalStore, writePortalStore } from "@/lib/store";
import { convertFileToMarkdown } from "@/lib/file-to-markdown";

export async function GET() {
  const store = readPortalStore();
  return NextResponse.json({
    mainKnowledgeMd: store.mainKnowledgeMd,
    knowledgeDocs: store.knowledgeDocs,
  });
}

// Update master markdown directly
export async function PUT(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { mainKnowledgeMd } = await request.json();
    if (typeof mainKnowledgeMd !== "string") {
      return NextResponse.json({ error: "Invalid markdown content" }, { status: 400 });
    }

    const store = readPortalStore();
    store.mainKnowledgeMd = mainKnowledgeMd;
    writePortalStore(store);

    return NextResponse.json({ ok: true, mainKnowledgeMd: store.mainKnowledgeMd });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update markdown" },
      { status: 500 }
    );
  }
}

// Upload & Convert file (.pdf, .docx, .xlsx, .pptx, .md, .txt) -> .md
export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const convertedMd = await convertFileToMarkdown(file.name, buffer);

    const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
    const doc: KnowledgeDoc = {
      id: `doc-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      fileName: file.name.replace(/\.[^.]+$/, "") + ".md",
      fileType: `${ext} -> MD`,
      uploadedAt: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
      markdownContent: convertedMd,
      sizeBytes: Buffer.byteLength(convertedMd, "utf-8"),
    };

    const store = readPortalStore();
    store.knowledgeDocs.unshift(doc);
    writePortalStore(store);

    return NextResponse.json({
      ok: true,
      doc,
      knowledgeDocs: store.knowledgeDocs,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Lỗi chuyển đổi tài liệu sang .md: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 500 }
    );
  }
}

// Delete an uploaded document
export async function DELETE(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }

    const store = readPortalStore();
    store.knowledgeDocs = store.knowledgeDocs.filter((d) => d.id !== id);
    writePortalStore(store);

    return NextResponse.json({
      ok: true,
      knowledgeDocs: store.knowledgeDocs,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete document" },
      { status: 500 }
    );
  }
}
