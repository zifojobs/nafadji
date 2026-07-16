import { getReunions } from "@/lib/requetes";
import { creerReunion, modifierReunion, redigerPV, supprimerReunion } from "../actions";

// datetime-local attend "YYYY-MM-DDTHH:mm" en heure locale
const versLocal = (iso: string) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default async function AdminReunions() {
  const reunions = await getReunions();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Réunions & PV</h1>

      <form action={creerReunion} className="bg-white rounded-2xl p-4 shadow space-y-3">
        <h2 className="font-semibold">Nouvelle réunion</h2>
        <div className="flex gap-2 flex-wrap">
          <input name="date_reunion" type="datetime-local" required className="border rounded-lg p-2" />
          <input name="lieu" required placeholder="Lieu" className="flex-1 border rounded-lg p-2" />
        </div>
        <textarea name="ordre_du_jour" placeholder="Ordre du jour (optionnel)" rows={2} className="w-full border rounded-lg p-2" />
        <button className="bg-emerald-700 text-white rounded-lg px-4 py-2 font-semibold">Créer</button>
      </form>

      {reunions.map((r) => (
        <details key={r.id} className="bg-white rounded-2xl p-4 shadow">
          <summary className="cursor-pointer font-semibold capitalize">
            {new Date(r.date_reunion).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} — {r.lieu}
            {r.pv_texte && <span className="text-emerald-700 text-sm"> · PV rédigé</span>}
          </summary>
          <form action={modifierReunion} className="mt-3 space-y-2 border-t pt-3">
            <input type="hidden" name="id" value={r.id} />
            <div className="flex gap-2 flex-wrap">
              <input name="date_reunion" type="datetime-local" defaultValue={versLocal(r.date_reunion)} className="border rounded-lg p-2" />
              <input name="lieu" defaultValue={r.lieu} className="flex-1 border rounded-lg p-2" />
            </div>
            <textarea name="ordre_du_jour" defaultValue={r.ordre_du_jour ?? ""} rows={2} className="w-full border rounded-lg p-2" />
            <button className="bg-gray-900 text-white rounded-lg px-3 py-1.5 text-sm">Enregistrer</button>
          </form>
          <form action={redigerPV} className="mt-3 space-y-2 border-t pt-3">
            <input type="hidden" name="id" value={r.id} />
            <label className="text-sm font-semibold">Procès-verbal</label>
            <textarea name="pv_texte" defaultValue={r.pv_texte ?? ""} rows={6} placeholder="Rédiger le PV ici..." className="w-full border rounded-lg p-2" />
            <button className="bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-sm">Enregistrer le PV</button>
          </form>
          <form action={supprimerReunion} className="mt-2 text-right">
            <input type="hidden" name="id" value={r.id} />
            <button className="text-red-600 text-xs">Supprimer la réunion</button>
          </form>
        </details>
      ))}
    </div>
  );
}
