import { db } from "@/lib/db";
import { getParametres } from "@/lib/requetes";
import { calculerEtat } from "@/lib/cotisations";
import { modifierMembre, reactiverMembre } from "../actions";
import { MembreForm } from "./MembreForm";
import { SupprimerMembre } from "./SupprimerMembre";
import { SuspendreMembre } from "./SuspendreMembre";
import { ReinitialiserCode } from "./ReinitialiserCode";

export default async function AdminMembres() {
  const [{ data: membresBruts }, { data: versements }, { data: suspensions }, params] = await Promise.all([
    db.from("membres").select("*"),
    db.from("cotisations").select("membre_id, montant"),
    db.from("suspensions").select("membre_id, debut, fin"),
    getParametres(),
  ]);
  const aujourdhui = new Date().toISOString().slice(0, 10);
  // Tri insensible à la casse/accents : l'ordre SQL brut mélange majuscules et minuscules.
  const membres = [...(membresBruts ?? [])].sort((a, b) =>
    a.nom_complet.localeCompare(b.nom_complet, "fr", { sensitivity: "base" }),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1C1C17]">Membres ({membres.length})</h1>

      <MembreForm />

      <div className="space-y-3">
        {membres.map((m) => {
          const etat = calculerEtat({
            dateAdhesion: m.date_adhesion,
            versements: (versements ?? []).filter((v) => v.membre_id === m.id).map((v) => ({ montant: Number(v.montant) })),
            suspensions: (suspensions ?? []).filter((s) => s.membre_id === m.id),
            // Membre d'honneur : ne cotise pas, jamais de dette calculée.
            montantMensuel: m.exempte_cotisation ? 0 : Number(params.montant_mensuel),
            aujourdhui,
          });
          return (
            <details key={m.id} className="rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-1.5">
                <span className={m.actif ? "" : "text-[#9A9A90] line-through"}>
                  {m.nom_complet} {m.is_admin && <span className="rounded bg-[#1C1C17] px-1 text-xs text-white">bureau</span>}
                  {m.exempte_cotisation && <span className="rounded bg-[#E3B23C] px-1 text-xs font-semibold text-[#1C1C17]">Membre d&apos;honneur</span>}
                  {!m.actif && <span className="ml-1 rounded bg-[#9A9A90] px-1 text-xs text-white">Suspendu</span>}
                  {m.actif && etat.moisRetard >= 3 && (
                    <span className="ml-1 rounded bg-[#FBEAE5] px-1 text-xs font-semibold text-[#B3402A]">⚠ {etat.moisRetard} mois de retard</span>
                  )}
                </span>
                <span className="text-sm text-[#6B6B60]">adhésion {new Date(m.date_adhesion).toLocaleDateString("fr-FR")}</span>
              </summary>
              <form action={modifierMembre} className="mt-3 space-y-2 border-t border-[#E5E2D9] pt-3">
                <input type="hidden" name="id" value={m.id} />
                <input name="nom_complet" defaultValue={m.nom_complet} className="w-full rounded-lg border border-[#E2DFD6] p-2" />
                <div className="flex gap-2">
                  <input name="telephone" defaultValue={m.telephone ?? ""} placeholder="Téléphone" className="flex-1 rounded-lg border border-[#E2DFD6] p-2" />
                  <input name="date_adhesion" type="date" defaultValue={m.date_adhesion} className="rounded-lg border border-[#E2DFD6] p-2" />
                </div>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-1"><input type="checkbox" name="is_admin" defaultChecked={m.is_admin} /> Bureau</label>
                  <label className="flex items-center gap-1"><input type="checkbox" name="exempte_cotisation" defaultChecked={m.exempte_cotisation} /> Membre d&apos;honneur (ne cotise pas)</label>
                </div>
                <button className="rounded-lg bg-[#1C1C17] px-3 py-1.5 text-sm text-white">Enregistrer</button>
              </form>
              <ReinitialiserCode id={m.id} />
              {m.actif ? (
                <SuspendreMembre id={m.id} />
              ) : (
                <form action={reactiverMembre} className="mt-2">
                  <input type="hidden" name="id" value={m.id} />
                  <button className="rounded-lg bg-[#1E8A54] px-3 py-1.5 text-sm font-semibold text-white">Réactiver</button>
                </form>
              )}
              <SupprimerMembre id={m.id} nom={m.nom_complet} />
            </details>
          );
        })}
      </div>
    </div>
  );
}
