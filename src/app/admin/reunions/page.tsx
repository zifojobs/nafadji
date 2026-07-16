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
      <h1 className="text-xl font-bold text-[#1C1C17]">Réunions & PV</h1>

      <form action={creerReunion} className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="font-semibold text-[#1C1C17]">Nouvelle réunion</h2>
        <div className="flex flex-wrap gap-2">
          <input name="date_reunion" type="datetime-local" required className="rounded-lg border border-[#E2DFD6] p-2" />
          <input name="lieu" required placeholder="Lieu" className="flex-1 rounded-lg border border-[#E2DFD6] p-2" />
        </div>
        <textarea name="ordre_du_jour" placeholder="Ordre du jour (optionnel)" rows={2} className="w-full rounded-lg border border-[#E2DFD6] p-2" />
        <button className="nf-btn-grad rounded-lg px-4 py-2 font-semibold text-white">Créer</button>
      </form>

      {reunions.map((r) => (
        <details key={r.id} className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
          <summary className="cursor-pointer font-semibold capitalize text-[#1C1C17]">
            {new Date(r.date_reunion).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} — {r.lieu}
            {r.pv_texte && <span className="text-sm text-[#1E8A54]"> · PV rédigé</span>}
          </summary>
          <form action={modifierReunion} className="mt-3 space-y-2 border-t border-[#E5E2D9] pt-3">
            <input type="hidden" name="id" value={r.id} />
            <div className="flex flex-wrap gap-2">
              <input name="date_reunion" type="datetime-local" defaultValue={versLocal(r.date_reunion)} className="rounded-lg border border-[#E2DFD6] p-2" />
              <input name="lieu" defaultValue={r.lieu} className="flex-1 rounded-lg border border-[#E2DFD6] p-2" />
            </div>
            <textarea name="ordre_du_jour" defaultValue={r.ordre_du_jour ?? ""} rows={2} className="w-full rounded-lg border border-[#E2DFD6] p-2" />
            <button className="rounded-lg bg-[#1C1C17] px-3 py-1.5 text-sm text-white">Enregistrer</button>
          </form>
          <form action={redigerPV} className="mt-3 space-y-2 border-t border-[#E5E2D9] pt-3">
            <input type="hidden" name="id" value={r.id} />
            <label className="text-sm font-semibold text-[#1C1C17]">Procès-verbal</label>
            <textarea name="pv_texte" defaultValue={r.pv_texte ?? ""} rows={6} placeholder="Rédiger le PV ici..." className="w-full rounded-lg border border-[#E2DFD6] p-2" />
            <button className="nf-btn-grad rounded-lg px-3 py-1.5 text-sm text-white">Enregistrer le PV</button>
          </form>
          <form action={supprimerReunion} className="mt-2 text-right">
            <input type="hidden" name="id" value={r.id} />
            <button className="text-xs text-[#B3402A]">Supprimer la réunion</button>
          </form>
        </details>
      ))}
    </div>
  );
}
