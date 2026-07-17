import Link from "next/link";
import { lireSession } from "@/lib/session";
import { logout } from "@/app/login/actions";
import { db } from "@/lib/db";
import { Logo } from "@/components/Logo";
import { HeroTitle } from "./HeroTitle";
import { TabBar } from "./TabBar";

const fmtDate = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default async function MembreLayout({ children }: { children: React.ReactNode }) {
  const session = (await lireSession())!;
  // Le cookie JWT vit 30 jours : un membre suspendu doit être bloqué même déjà connecté.
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
  const prenom = session.nom.split(" ")[0];

  return (
    <div className="min-h-dvh bg-[#F2EFE8] pb-24 text-[#1C1C17]">
      <header className="nf-radial-hero relative overflow-hidden rounded-b-[28px] px-4.5 pb-14 pt-4 text-white">
        <div className="nf-motif pointer-events-none absolute inset-0 opacity-[0.06]" />
        <div className="relative mb-4.5 flex items-center justify-between">
          <span className="nf-serif flex items-center gap-2.5 text-[17px] font-bold tracking-wide">
            <Logo size={30} variante="claire" />
            ADN
          </span>
          <div className="flex items-center gap-3 text-[12.5px]">
            {session.isAdmin && <Link href="/admin" className="text-white/75 underline">Espace bureau</Link>}
            <form action={logout}><button className="text-white/75 underline">Quitter</button></form>
          </div>
        </div>
        <HeroTitle prenom={prenom} />
        <div className="relative mt-1 text-[12.5px] capitalize text-white/65">{fmtDate(new Date())}</div>
      </header>
      <main className="relative mx-auto -mt-8 max-w-2xl px-4">{children}</main>
      <TabBar />
    </div>
  );
}
