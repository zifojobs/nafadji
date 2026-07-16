import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type Session = { membreId: string; nom: string; isAdmin: boolean };

const COOKIE = "nafadji_session";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function signerToken(s: Session): Promise<string> {
  return new SignJWT(s).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret());
}

export async function verifierToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return { membreId: payload.membreId as string, nom: payload.nom as string, isAdmin: payload.isAdmin as boolean };
  } catch {
    return null;
  }
}

export async function creerSession(s: Session) {
  (await cookies()).set(COOKIE, await signerToken(s), {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
}

export async function lireSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? verifierToken(token) : null;
}

export async function detruireSession() {
  (await cookies()).delete(COOKIE);
}
