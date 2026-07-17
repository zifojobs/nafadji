import { db } from "@/lib/db";
import { getParametres } from "@/lib/requetes";
import { calculerEtat } from "@/lib/cotisations";
import { supprimerCotisation } from "../actions";
import { CotisationForm } from "./CotisationForm";

const fmtSolde = (s: number) => `${s > 0 ? "+" : ""}${s.toLocaleString("fr-FR")} €`;

export default async function AdminCotisations() {
  const [{ data: membres }, { data: versements }, { data: suspensions }, params] = await Promise.all([
    db.from("membres").select("id, nom_complet, date_adhesion").eq("actif", true).order("nom_complet"),
    db.from("cotisations").select("*").order("date_paiement", { ascending: false }),
    db.from("suspensions").select("membre_id, debut, fin"),
    getParametres(),
  ]);
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const etats = (membres ?? []).map((m) => ({
    ...m,
    etat: calculerEtat({
      dateAdhesion: m.date_adhesion,
      versements: (versements ?? []).filter((v) => v.membre_id === m.id).map((v) => ({ montant: Number(v.montant) })),
      suspensions: (suspensions ?? []).filter((s) => s.membre_id === m.id),
      montantMensuel: Number(params.montant_mensuel),
      aujourdhui,
    }),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1C1C17]">Cotisations</h1>

      <CotisationForm
        membres={membres ?? []}
        montantDefaut={Number(params.montant_mensuel)}
        aujourdhui={aujourdhui}
      />

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">Solde des membres</h2>
        <ul className="divide-y divide-[#E5E2D9]">
          {etats.map((m) => (
            <li key={m.id} className="flex justify-between py-2 text-sm">
              <span>{m.nom_complet}</span>
              {m.etat.solde < 0
                ? <span className="font-semibold text-[#B3402A]">{fmtSolde(m.etat.solde)} — {m.etat.moisRetard} mois</span>
                : <span className="font-semibold text-[#1E8A54]">{m.etat.solde > 0 ? `${fmtSolde(m.etat.solde)} d'avance` : "À jour ✓"}</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">Derniers versements</h2>
        <ul className="divide-y divide-[#E5E2D9] text-sm">
          {(versements ?? []).slice(0, 20).map((v) => (
            <li key={v.id} className="flex items-center justify-between py-2">
              <span>
                {(membres ?? []).find((m) => m.id === v.membre_id)?.nom_complet ?? "?"} — {Number(v.montant).toLocaleString("fr-FR")} € — le {new Date(v.date_paiement).toLocaleDateString("fr-FR")}
                {v.note && <span className="text-[#6B6B60]"> · {v.note}</span>}
              </span>
              <form action={supprimerCotisation}>
                <input type="hidden" name="id" value={v.id} />
                <button className="text-xs text-[#B3402A]">Annuler</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
