"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", icon: "🏠", label: "Accueil" },
  { href: "/cotisations", icon: "💶", label: "Cotisations" },
  { href: "/pv", icon: "📄", label: "PV" },
  { href: "/reunions", icon: "📅", label: "Réunions" },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-[#E5E2D9] bg-white/92 pb-3 pt-2.5 backdrop-blur-md">
      {TABS.map((t) => {
        const actif = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`w-1/4 text-center text-[10.5px] ${actif ? "font-extrabold text-[#0B3D2E]" : "text-[#8A8A7E]"}`}
          >
            <span className="mb-0.5 block text-xl">{t.icon}</span>
            {t.label}
            {actif && <span className="mx-auto mt-0.5 block h-1 w-1 rounded-sm bg-[#E3B23C]" />}
          </Link>
        );
      })}
    </nav>
  );
}
