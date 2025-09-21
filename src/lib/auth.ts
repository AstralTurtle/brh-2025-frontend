import { NextRequest } from "next/server";
import { decodeJwt, importSPKI, jwtVerify } from "jose";

type AuthResult = { userId: string | null };

export async function getUserFromRequest(req: NextRequest): Promise<AuthResult> {
  const token = req.cookies.get("jwt")?.value;
  const allowAnon = process.env.ALLOW_ANON === "true";

  if (!token) {
    return allowAnon ? { userId: "dev-user" } : { userId: null };
  }

  const publicKeyPem = process.env.JWT_PUBLIC_KEY;

  if (publicKeyPem) {
    try {
      const key =
        (await importSPKI(publicKeyPem, "RS256").catch(() =>
          importSPKI(publicKeyPem, "ES256")
        )) as any;
      const { payload } = await jwtVerify(token, key);
      return { userId: (payload.sub as string) || (payload.userId as string) || null };
    } catch {
      return allowAnon ? { userId: "dev-user" } : { userId: null };
    }
  }

  // Dev fallback: decode without verification
  try {
    const decoded = decodeJwt(token);
    const uid = (decoded.sub as string) || (decoded.userId as string) || null;
    return uid ? { userId: uid } : (allowAnon ? { userId: "dev-user" } : { userId: null });
  } catch {
    return allowAnon ? { userId: "dev-user" } : { userId: null };
  }
}