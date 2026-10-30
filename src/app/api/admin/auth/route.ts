import { NextResponse } from "next/server";
import { getExpectedAdminPasscode } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();
    const expected = getExpectedAdminPasscode();

    if (String(passcode || "").trim() !== expected) {
      return NextResponse.json(
        { ok: false, error: "Mật khẩu quản trị (Admin Passcode) không chính xác." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("bt_admin_passcode", expected, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
