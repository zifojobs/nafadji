"use client";
import { usePathname } from "next/navigation";

const TITRES: Record<string, string> = {
  "/cotisations": "Mes cotisations",
  "/pv": "Procès-verbaux",
  "/reunions": "Réunions",
};

export function HeroTitle({ prenom }: { prenom: string }) {
  const pathname = usePathname();
  const titre = pathname === "/" ? `Bonjour ${prenom}` : (TITRES[pathname] ?? "Nafadji");
  return <h1 className="nf-serif relative text-[26px] font-bold">{titre}</h1>;
}
