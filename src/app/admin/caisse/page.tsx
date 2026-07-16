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
      <h1 className="text-xl font-bold text-[#1C1C17]">Caisse</h1>
      <div className="nf-caisse-grad rounded-2xl border border-[#E3B23C]/35 p-4 text-white">
        <div className="text-sm text-white/70">Solde actuel</div>
        <div className="nf-serif text-3xl font-bold text-[#E3B23C]">{Number(caisse.solde).toLocaleString("fr-FR")} €</div>
      </div>
      <form action={majCaisse} className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="font-semibold text-[#1C1C17]">Mettre à jour le solde</h2>
        <input name="solde" type="number" step="0.01" required placeholder="Nouveau solde" className="w-full rounded-lg border border-[#E2DFD6] p-2" />
        <input name="note" placeholder="Motif (ex : dépense funérailles, dons...)" className="w-full rounded-lg border border-[#E2DFD6] p-2" />
        <button className="nf-btn-grad rounded-lg px-4 py-2 font-semibold text-white">Enregistrer</button>
      </form>
      <div className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">Historique</h2>
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
