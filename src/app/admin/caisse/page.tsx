import { db } from "@/lib/db";
import { getCaisse, getMouvements } from "@/lib/requetes";
import { majCaisse, ajouterMouvement, supprimerMouvement } from "../actions";

export default async function AdminCaisse() {
  const [caisse, { mouvements, totauxParAnnee }, { data: historique }, { data: membres }] = await Promise.all([
    getCaisse(),
    getMouvements(),
    db.from("caisse_historique").select("*").order("maj_le", { ascending: false }).limit(30),
    db.from("membres").select("id, nom_complet"),
  ]);
  const nom = (id: string | null) => (membres ?? []).find((m) => m.id === id)?.nom_complet ?? "—";
  const aujourdhui = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1C1C17]">Caisse</h1>
      <div className="nf-caisse-grad rounded-2xl border border-[#E3B23C]/35 p-4 text-white">
        <div className="text-sm text-white/70">Montant sur le compte bancaire</div>
        <div className="nf-serif text-3xl font-bold text-[#E3B23C]">{Number(caisse.solde).toLocaleString("fr-FR")} €</div>
      </div>

      <form action={majCaisse} className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="font-semibold text-[#1C1C17]">Mettre à jour le montant en banque</h2>
        <input name="solde" type="number" step="0.01" required placeholder="Montant sur le compte" className="w-full rounded-lg border border-[#E2DFD6] p-2" />
        <input name="note" placeholder="Note (optionnel)" className="w-full rounded-lg border border-[#E2DFD6] p-2" />
        <button className="nf-btn-grad rounded-lg px-4 py-2 font-semibold text-white">Enregistrer</button>
      </form>

      <form action={ajouterMouvement} className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="font-semibold text-[#1C1C17]">Ajouter un don ou une dépense</h2>
        <p className="text-sm text-[#6B6B60]">Visible par tous les membres (transparence). N&apos;affecte pas le montant en banque affiché.</p>
        <div className="flex flex-wrap gap-2">
          <select name="type" required className="rounded-lg border border-[#E2DFD6] p-2">
            <option value="depense">Dépense</option>
            <option value="don">Don</option>
          </select>
          <input name="montant" type="number" step="0.01" min="0.01" required placeholder="Montant €" className="w-28 rounded-lg border border-[#E2DFD6] p-2" />
          <input name="date_mouvement" type="date" defaultValue={aujourdhui} required className="rounded-lg border border-[#E2DFD6] p-2" />
        </div>
        <input name="libelle" required placeholder="Motif (ex : don funérailles, location salle…)" className="w-full rounded-lg border border-[#E2DFD6] p-2" />
        <button className="nf-btn-grad rounded-lg px-4 py-2 font-semibold text-white">Ajouter</button>
      </form>

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">Dons et dépenses</h2>
        {mouvements.length === 0 && <p className="text-sm text-[#6B6B60]">Aucun mouvement enregistré.</p>}
        <ul className="divide-y divide-[#E5E2D9] text-sm">
          {mouvements.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-2">
              <span>
                <span className="font-semibold">{m.type === "don" ? "Don" : "Dépense"}</span> — {m.libelle} · {new Date(m.date_mouvement).toLocaleDateString("fr-FR")} · {Number(m.montant).toLocaleString("fr-FR")} €
              </span>
              <form action={supprimerMouvement}>
                <input type="hidden" name="id" value={m.id} />
                <button className="text-xs text-[#B3402A]">Supprimer</button>
              </form>
            </li>
          ))}
        </ul>
        {totauxParAnnee.length > 0 && (
          <ul className="mt-3 border-t border-[#E5E2D9] pt-2 text-sm">
            {totauxParAnnee.map(([annee, total]) => (
              <li key={annee} className="flex justify-between py-1">
                <span>Total sorties {annee}</span>
                <span className="font-semibold">{total.toLocaleString("fr-FR")} €</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">Historique du montant en banque</h2>
        <ul className="divide-y divide-[#E5E2D9] text-sm">
          {(historique ?? []).map((h) => (
            <li key={h.id} className="py-2">
              <span className="font-semibold">{Number(h.solde).toLocaleString("fr-FR")} €</span>
              {" · "}{new Date(h.maj_le).toLocaleString("fr-FR")} · {nom(h.maj_par)}
              {h.note && <div className="text-[#6B6B60]">{h.note}</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
