import { db } from "@/lib/db";
import { getParametres } from "@/lib/requetes";
import { calculerEtat } from "@/lib/cotisations";
import { supprimerCotisation } from "../actions";
import { CotisationForm } from "./CotisationForm";

export default async function AdminCotisations() {
  const [{ data: membres }, { data: cotisations }, params] = await Promise.all([
    db.from("membres").select("id, nom_complet, date_adhesion").eq("actif", true).order("nom_complet"),
    db.from("cotisations").select("*").order("date_paiement", { ascending: false }),
    getParametres(),
  ]);
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const moisCourant = aujourdhui.slice(0, 7);

  const etats = (membres ?? []).map((m) => ({
    ...m,
    etat: calculerEtat({
      dateAdhesion: m.date_adhesion,
      paiements: (cotisations ?? []).filter((c) => c.membre_id === m.id).map((c) => ({ mois: c.mois, montant: Number(c.montant) })),
      montantMensuel: Number(params.montant_mensuel),
      aujourdhui,
    }),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1C1C17]">Cotisations</h1>

      <CotisationForm
        membres={membres ?? []}
        moisCourant={moisCourant}
        montantDefaut={Number(params.montant_mensuel)}
        aujourdhui={aujourdhui}
      />

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">État des membres</h2>
        <ul className="divide-y divide-[#E5E2D9]">
          {etats.map((m) => (
            <li key={m.id} className="flex justify-between py-2 text-sm">
              <span>{m.nom_complet}</span>
              {m.etat.aJour
                ? <span className="font-semibold text-[#1E8A54]">À jour ✓</span>
                : <span className="font-semibold text-[#B3402A]">{m.etat.moisEnRetard.length} mois — {m.etat.resteDu} €</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">Derniers paiements</h2>
        <ul className="divide-y divide-[#E5E2D9] text-sm">
          {(cotisations ?? []).slice(0, 20).map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2">
              <span>
                {(membres ?? []).find((m) => m.id === c.membre_id)?.nom_complet ?? "?"} — {new Date(c.mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} — {Number(c.montant)} €
              </span>
              <form action={supprimerCotisation}>
                <input type="hidden" name="id" value={c.id} />
                <button className="text-xs text-[#B3402A]">Annuler</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
