export function getExpectedAdminPasscode(): string {
  return (process.env.ADMIN_PASSCODE || "bolttech2027").trim();
}

export function verifyAdminRequest(request: Request): boolean {
  const expected = getExpectedAdminPasscode();
  const headerPass = request.headers.get("x-admin-passcode")?.trim();
  if (headerPass && headerPass === expected) {
    return true;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/bt_admin_passcode=([^;]+)/);
  if (match && decodeURIComponent(match[1]) === expected) {
    return true;
  }

  return false;
}
