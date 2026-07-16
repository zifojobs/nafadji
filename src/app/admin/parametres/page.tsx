import { getParametres } from "@/lib/requetes";
import { majParametres } from "../actions";

export default async function AdminParametres() {
  const p = await getParametres();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Paramètres</h1>
      <form action={majParametres} className="bg-white rounded-2xl p-4 shadow space-y-3">
        <label className="block text-sm">Nom de l'association
          <input name="nom_association" defaultValue={p.nom_association} className="w-full border rounded-lg p-2 mt-1" />
        </label>
        <label className="block text-sm">Cotisation mensuelle
          <input name="montant_mensuel" type="number" step="0.01" defaultValue={Number(p.montant_mensuel)} className="w-full border rounded-lg p-2 mt-1" />
        </label>
        <label className="block text-sm">Devise
          <input name="devise" defaultValue={p.devise} className="w-full border rounded-lg p-2 mt-1" />
        </label>
        <button className="bg-emerald-700 text-white rounded-lg px-4 py-2 font-semibold">Enregistrer</button>
      </form>
    </div>
  );
}
