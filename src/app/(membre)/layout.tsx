import Link from "next/link";
import { lireSession } from "@/lib/session";
import { logout } from "@/app/login/actions";

export default async function MembreLayout({ children }: { children: React.ReactNode }) {
  const session = (await lireSession())!;
  return (
    <div className="min-h-dvh bg-gray-50 pb-20">
      <header className="bg-emerald-950 text-white p-4 flex items-center justify-between">
        <span className="font-bold">Nafadji</span>
        <div className="flex items-center gap-3 text-sm">
          {session.isAdmin && <Link href="/admin" className="underline">Espace bureau</Link>}
          <form action={logout}><button className="opacity-80">Quitter</button></form>
        </div>
      </header>
      <main className="p-4 max-w-2xl mx-auto">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex justify-around p-2 text-xs text-center">
        <Link href="/" className="p-2">🏠<br />Accueil</Link>
        <Link href="/cotisations" className="p-2">💶<br />Cotisations</Link>
        <Link href="/pv" className="p-2">📄<br />PV</Link>
        <Link href="/reunions" className="p-2">📅<br />Réunions</Link>
      </nav>
    </div>
  );
}
