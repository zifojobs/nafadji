import { db } from "@/lib/db";
import { getCaisse } from "@/lib/requetes";
import { majCaisse } from "../actions";

export default async function AdminCaisse() {
  const [caisse, { data: historique }, { data: membres }] = await Promise.all([
    getCaisse(),
    db.from("caisse_historique").select("*").order("maj_le", { ascending: false }).limit(30),
    db.from("membres").select("id, nom_complet"),
  ]);
  const nom = (id: string | null) => (membres ?? []).find((m) => m.id === id)?.nom_complet ?? "—";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Caisse</h1>
      <div className="bg-emerald-950 text-white rounded-2xl p-4">
        <div className="text-sm opacity-80">Solde actuel</div>
        <div className="text-3xl font-bold">{Number(caisse.solde).toLocaleString("fr-FR")} €</div>
      </div>
      <form action={majCaisse} className="bg-white rounded-2xl p-4 shadow space-y-3">
        <h2 className="font-semibold">Mettre à jour le solde</h2>
        <input name="solde" type="number" step="0.01" required placeholder="Nouveau solde" className="w-full border rounded-lg p-2" />
        <input name="note" placeholder="Motif (ex : dépense funérailles, dons...)" className="w-full border rounded-lg p-2" />
        <button className="bg-emerald-700 text-white rounded-lg px-4 py-2 font-semibold">Enregistrer</button>
      </form>
      <div className="bg-white rounded-2xl p-4 shadow">
        <h2 className="font-semibold mb-2">Historique</h2>
        <ul className="divide-y text-sm">
          {(historique ?? []).map((h) => (
            <li key={h.id} className="py-2">
              <span className="font-semibold">{Number(h.solde).toLocaleString("fr-FR")} €</span>
              {" · "}{new Date(h.maj_le).toLocaleString("fr-FR")} · {nom(h.maj_par)}
              {h.note && <div className="text-gray-500">{h.note}</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
