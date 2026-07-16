import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AdminNav } from "./AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F2EFE8]">
      <header className="flex items-center justify-between bg-[#1C1C17] p-4 text-white">
        <span className="nf-serif flex items-center gap-2.5 font-bold">
          <Logo size={26} variante="claire" />
          Nafadji — Bureau
        </span>
        <Link href="/" className="text-sm text-white/75 underline">← Espace membre</Link>
      </header>
      <AdminNav />
      <main className="mx-auto max-w-3xl p-4">{children}</main>
    </div>
  );
}
