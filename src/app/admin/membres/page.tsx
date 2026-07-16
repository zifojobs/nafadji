import { db } from "@/lib/db";
import { creerMembre, modifierMembre, definirCode } from "../actions";

export default async function AdminMembres() {
  const { data: membres } = await db.from("membres").select("*").order("nom_complet");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Membres ({membres?.length ?? 0})</h1>

      <form action={creerMembre} className="bg-white rounded-2xl p-4 shadow space-y-3">
        <h2 className="font-semibold">Ajouter un membre</h2>
        <input name="nom_complet" required placeholder="Nom complet" className="w-full border rounded-lg p-2" />
        <div className="flex gap-3">
          <input name="telephone" placeholder="Téléphone (optionnel)" className="flex-1 border rounded-lg p-2" />
          <input name="date_adhesion" type="date" required className="border rounded-lg p-2" />
        </div>
        <div className="flex gap-3 items-center">
          <input name="code" required placeholder="Code personnel initial" className="flex-1 border rounded-lg p-2" />
          <label className="text-sm flex items-center gap-1"><input type="checkbox" name="is_admin" /> Bureau</label>
        </div>
        <button className="bg-emerald-700 text-white rounded-lg px-4 py-2 font-semibold">Ajouter</button>
      </form>

      <div className="space-y-3">
        {(membres ?? []).map((m) => (
          <details key={m.id} className="bg-white rounded-xl p-3 shadow">
            <summary className="cursor-pointer flex justify-between">
              <span className={m.actif ? "" : "line-through text-gray-400"}>
                {m.nom_complet} {m.is_admin && <span className="text-xs bg-gray-900 text-white rounded px-1">bureau</span>}
              </span>
              <span className="text-sm text-gray-500">adhésion {new Date(m.date_adhesion).toLocaleDateString("fr-FR")}</span>
            </summary>
            <form action={modifierMembre} className="mt-3 space-y-2 border-t pt-3">
              <input type="hidden" name="id" value={m.id} />
              <input name="nom_complet" defaultValue={m.nom_complet} className="w-full border rounded-lg p-2" />
              <div className="flex gap-2">
                <input name="telephone" defaultValue={m.telephone ?? ""} placeholder="Téléphone" className="flex-1 border rounded-lg p-2" />
                <input name="date_adhesion" type="date" defaultValue={m.date_adhesion} className="border rounded-lg p-2" />
              </div>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1"><input type="checkbox" name="is_admin" defaultChecked={m.is_admin} /> Bureau</label>
                <label className="flex items-center gap-1"><input type="checkbox" name="actif" defaultChecked={m.actif} /> Actif</label>
              </div>
              <button className="bg-gray-900 text-white rounded-lg px-3 py-1.5 text-sm">Enregistrer</button>
            </form>
            <form action={definirCode} className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={m.id} />
              <input name="code" required placeholder="Nouveau code" className="flex-1 border rounded-lg p-2 text-sm" />
              <button className="bg-amber-600 text-white rounded-lg px-3 text-sm">Réinitialiser le code</button>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}
