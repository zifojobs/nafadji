import { NextRequest, NextResponse } from "next/server";
import { verifierToken } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("nafadji_session")?.value;
  const session = token ? await verifierToken(token) : null;
  const { pathname } = req.nextUrl;

  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  if (pathname.startsWith("/admin") && !session.isAdmin)
    return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|manifest|icons|api).*)"],
};
