"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  ["/admin/membres", "Membres"],
  ["/admin/cotisations", "Cotisations"],
  ["/admin/reunions", "Réunions & PV"],
  ["/admin/caisse", "Caisse"],
  ["/admin/parametres", "Paramètres"],
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1.5 overflow-x-auto border-b border-[#E5E2D9] bg-white p-2 text-sm">
      {LIENS.map(([href, label]) => {
        const actif = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-full px-3 py-2 ${actif ? "bg-[#0B3D2E] font-semibold text-white" : "text-[#3E3E35] hover:bg-[#F2EFE8]"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
