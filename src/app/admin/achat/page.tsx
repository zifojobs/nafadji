import { db } from "@/lib/db";
import { OBJECTIF_ACHAT_APPLI as OBJECTIF } from "@/lib/requetes";
import { supprimerContributionAchat } from "../actions";
import { ContributionForm } from "./ContributionForm";
import { BoutonSoumettre } from "@/components/BoutonSoumettre";

const fmtEuros = (n: number) => `${n.toLocaleString("fr-FR")} €`;

export default async function AdminAchat() {
  const [{ data: membresBruts }, { data: contributions }] = await Promise.all([
    db.from("membres").select("id, nom_complet, actif"),
    db.from("contributions_achat").select("*").order("date_versement", { ascending: false }),
  ]);
  const membres = [...(membresBruts ?? [])].sort((a, b) =>
    a.nom_complet.localeCompare(b.nom_complet, "fr", { sensitivity: "base" }),
  );
  const parMembre = new Map<string, number>();
  for (const c of contributions ?? []) parMembre.set(c.membre_id, (parMembre.get(c.membre_id) ?? 0) + Number(c.montant));
  const total = [...parMembre.values()].reduce((s, n) => s + n, 0);
  const nomDe = (id: string) => membres.find((m) => m.id === id)?.nom_complet ?? "?";
  // Un membre suspendu qui a déjà participé reste compté ; il n'est juste plus sollicité.
  const ontParticipe = membres.filter((m) => parMembre.has(m.id));
  const actifs = membres.filter((m) => m.actif);
  const pasEncore = actifs.filter((m) => !parMembre.has(m.id));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1C1C17]">Achat de l&apos;application</h1>

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-[#1E8A54]">{fmtEuros(total)}</span>
          <span className="text-sm text-[#6B6B60]">sur {fmtEuros(OBJECTIF)}</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E5E2D9]">
          <div className="h-full rounded-full bg-[#1E8A54]" style={{ width: `${Math.min(100, (total / OBJECTIF) * 100)}%` }} />
        </div>
        <p className="mt-2 text-sm text-[#6B6B60]">
          {total >= OBJECTIF ? "Objectif atteint ✓" : `Reste ${fmtEuros(OBJECTIF - total)}`} · {ontParticipe.length} membre{ontParticipe.length > 1 ? "s" : ""} sur {actifs.length}
        </p>
      </div>

      <ContributionForm membres={actifs} aujourdhui={new Date().toISOString().slice(0, 10)} />

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">Qui a participé ({ontParticipe.length})</h2>
        {ontParticipe.length === 0 && <p className="text-sm text-[#6B6B60]">Aucune participation enregistrée.</p>}
        <ul className="divide-y divide-[#E5E2D9] text-sm">
          {ontParticipe.map((m) => (
            <li key={m.id} className="flex justify-between py-2">
              <span>{m.nom_complet}</span>
              <span className="font-semibold text-[#1E8A54]">{fmtEuros(parMembre.get(m.id)!)}</span>
            </li>
          ))}
        </ul>
        {pasEncore.length > 0 && (
          <>
            <h3 className="mt-4 mb-1 text-sm font-semibold text-[#6B6B60]">Pas encore ({pasEncore.length})</h3>
            <p className="text-sm text-[#6B6B60]">{pasEncore.map((m) => m.nom_complet).join(" · ")}</p>
          </>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">Versements</h2>
        <ul className="divide-y divide-[#E5E2D9] text-sm">
          {(contributions ?? []).map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2">
              <span>{nomDe(c.membre_id)} — {fmtEuros(Number(c.montant))} — le {new Date(c.date_versement).toLocaleDateString("fr-FR")}</span>
              <form action={supprimerContributionAchat}>
                <input type="hidden" name="id" value={c.id} />
                <BoutonSoumettre enCours="…" className="text-xs text-[#B3402A]">Annuler</BoutonSoumettre>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
