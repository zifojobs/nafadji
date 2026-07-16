import { getParametres } from "@/lib/requetes";
import { majParametres } from "../actions";

export default async function AdminParametres() {
  const p = await getParametres();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#1C1C17]">Paramètres</h1>
      <form action={majParametres} className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <label className="block text-sm text-[#3E3E35]">Nom de l&apos;association
          <input name="nom_association" defaultValue={p.nom_association} className="mt-1 w-full rounded-lg border border-[#E2DFD6] p-2" />
        </label>
        <label className="block text-sm text-[#3E3E35]">Cotisation mensuelle
          <input name="montant_mensuel" type="number" step="0.01" defaultValue={Number(p.montant_mensuel)} className="mt-1 w-full rounded-lg border border-[#E2DFD6] p-2" />
        </label>
        <label className="block text-sm text-[#3E3E35]">Devise
          <input name="devise" defaultValue={p.devise} className="mt-1 w-full rounded-lg border border-[#E2DFD6] p-2" />
        </label>
        <button className="nf-btn-grad rounded-lg px-4 py-2 font-semibold text-white">Enregistrer</button>
      </form>
    </div>
  );
}
