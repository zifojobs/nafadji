import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AdminNav } from "./AdminNav";
import { lireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { logout } from "@/app/login/actions";

// Tout l'espace bureau lit la base à chaque visite (jamais figé au build).
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = (await lireSession())!;
  // Le cookie JWT vit 30 jours : un admin suspendu doit être bloqué même déjà connecté.
  const { data: compte } = await db.from("membres").select("actif").eq("id", session.membreId).single();
  if (!compte?.actif) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#F2EFE8] p-5">
        <div className="max-w-sm rounded-[20px] bg-white p-6 text-center shadow-[0_8px_24px_rgba(28,28,23,.12)]">
          <p className="text-lg font-bold text-[#1C1C17]">Compte suspendu</p>
          <p className="mt-2 text-sm text-[#6B6B60]">Contactez le bureau de l&apos;association pour le réactiver.</p>
          <form action={logout} className="mt-4"><button className="text-sm text-[#6B6B60] underline">Quitter</button></form>
        </div>
      </main>
    );
  }
  return (
    <div className="min-h-dvh bg-[#F2EFE8]">
      <header className="flex items-center justify-between bg-[#1C1C17] p-4 text-white">
        <span className="nf-serif flex items-center gap-2.5 font-bold">
          <Logo size={26} variante="claire" />
          ADN — Bureau
        </span>
        <Link href="/" className="text-sm text-white/75 underline">← Espace membre</Link>
      </header>
      <AdminNav />
      <main className="mx-auto max-w-3xl p-4">{children}</main>
    </div>
  );
}
