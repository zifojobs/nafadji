import { db } from "@/lib/db";
import { getParametres } from "@/lib/requetes";
import { calculerEtat } from "@/lib/cotisations";
import { enregistrerCotisation, supprimerCotisation } from "../actions";

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
      <h1 className="text-xl font-bold">Cotisations</h1>

      <form action={enregistrerCotisation} className="bg-white rounded-2xl p-4 shadow space-y-3">
        <h2 className="font-semibold">Enregistrer un paiement</h2>
        <select name="membre_id" required className="w-full border rounded-lg p-2">
          <option value="">— Membre —</option>
          {(membres ?? []).map((m) => <option key={m.id} value={m.id}>{m.nom_complet}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          <input name="mois" type="month" defaultValue={moisCourant} required className="border rounded-lg p-2" />
          <input name="montant" type="number" step="0.01" defaultValue={Number(params.montant_mensuel)} required className="w-24 border rounded-lg p-2" />
          <input name="date_paiement" type="date" defaultValue={aujourdhui} required className="border rounded-lg p-2" />
        </div>
        <input name="note" placeholder="Note (optionnel)" className="w-full border rounded-lg p-2" />
        <button className="bg-emerald-700 text-white rounded-lg px-4 py-2 font-semibold">Enregistrer</button>
      </form>

      <div className="bg-white rounded-2xl p-4 shadow">
        <h2 className="font-semibold mb-2">État des membres</h2>
        <ul className="divide-y">
          {etats.map((m) => (
            <li key={m.id} className="py-2 flex justify-between text-sm">
              <span>{m.nom_complet}</span>
              {m.etat.aJour
                ? <span className="text-emerald-700 font-semibold">À jour ✓</span>
                : <span className="text-red-700 font-semibold">{m.etat.moisEnRetard.length} mois — {m.etat.resteDu} €</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow">
        <h2 className="font-semibold mb-2">Derniers paiements</h2>
        <ul className="divide-y text-sm">
          {(cotisations ?? []).slice(0, 20).map((c) => (
            <li key={c.id} className="py-2 flex justify-between items-center">
              <span>
                {(membres ?? []).find((m) => m.id === c.membre_id)?.nom_complet ?? "?"} — {new Date(c.mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} — {Number(c.montant)} €
              </span>
              <form action={supprimerCotisation}>
                <input type="hidden" name="id" value={c.id} />
                <button className="text-red-600 text-xs">Annuler</button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
