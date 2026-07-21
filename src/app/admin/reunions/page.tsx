import { getReunions } from "@/lib/requetes";
import { getFichierPV, getUrlFichierPV } from "@/lib/pv";
import { creerReunion, modifierReunion, supprimerReunion } from "../actions";
import { PVForm } from "./PVForm";

// datetime-local attend "YYYY-MM-DDTHH:mm" en heure locale
const versLocal = (iso: string) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default async function AdminReunions() {
  const reunions = await getReunions();
  const fichiers = await Promise.all(
    reunions.map(async (r) => {
      const f = await getFichierPV(r.id);
      return f ? { nom: f.nom, url: await getUrlFichierPV(f.chemin) } : null;
    }),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1C1C17]">Réunions & PV</h1>

      <form action={creerReunion} className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
        <h2 className="font-semibold text-[#1C1C17]">Nouvelle réunion</h2>
        <div className="flex flex-wrap gap-2">
          <input name="date_reunion" type="datetime-local" required placeholder="Date et heure" className="rounded-lg border border-[#E2DFD6] p-2" />
          <input name="lieu" required placeholder="Lieu (ex. Chez Djiby DANFAKHA)" className="flex-1 rounded-lg border border-[#E2DFD6] p-2" />
        </div>
        <textarea name="adresse" placeholder="Adresse (optionnel — ex. 1 Résidence du Vieux Moulin - 91350 Grigny)" rows={2} className="w-full rounded-lg border border-[#E2DFD6] p-2" />
        <textarea name="ordre_du_jour" placeholder="Ordre du jour (optionnel)" rows={2} className="w-full rounded-lg border border-[#E2DFD6] p-2" />
        <button className="nf-btn-grad rounded-lg px-4 py-2 font-semibold text-white">Créer</button>
      </form>

      {reunions.length > 0 && (
        <p className="text-sm text-[#6B6B60]">Touchez une réunion pour l&apos;ouvrir : c&apos;est là que se modifie la réunion et que se rédige (ou se joint) le PV.</p>
      )}

      {reunions.map((r, i) => {
        const aPV = Boolean(r.pv_texte) || Boolean(fichiers[i]);
        return (
          <details key={r.id} className="rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
            <summary className="flex cursor-pointer flex-wrap items-center gap-2 font-semibold capitalize text-[#1C1C17]">
              <span className="flex-1">
                {new Date(r.date_reunion).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} — {r.lieu}
              </span>
              {aPV
                ? <span className="rounded-full bg-[#E8F3ED] px-3 py-1 text-xs font-bold normal-case text-[#1E8A54]">PV ✓</span>
                : <span className="rounded-full bg-[#FBF3DF] px-3 py-1 text-xs font-bold normal-case text-[#9A6A00]">✍️ PV à rédiger</span>}
            </summary>
            <form action={modifierReunion} className="mt-3 space-y-2 border-t border-[#E5E2D9] pt-3">
              <input type="hidden" name="id" value={r.id} />
              <div className="flex flex-wrap gap-2">
                <input name="date_reunion" type="datetime-local" defaultValue={versLocal(r.date_reunion)} placeholder="Date et heure" className="rounded-lg border border-[#E2DFD6] p-2" />
                <input name="lieu" defaultValue={r.lieu} placeholder="Lieu (ex. Chez Djiby DANFAKHA)" className="flex-1 rounded-lg border border-[#E2DFD6] p-2" />
              </div>
              <textarea name="adresse" defaultValue={r.adresse ?? ""} placeholder="Adresse (optionnel — ex. 1 Résidence du Vieux Moulin - 91350 Grigny)" rows={2} className="w-full rounded-lg border border-[#E2DFD6] p-2" />
              <textarea name="ordre_du_jour" defaultValue={r.ordre_du_jour ?? ""} placeholder="Ordre du jour (optionnel)" rows={2} className="w-full rounded-lg border border-[#E2DFD6] p-2" />
              <button className="rounded-lg bg-[#1C1C17] px-3 py-1.5 text-sm text-white">Enregistrer</button>
            </form>
            <PVForm reunionId={r.id} texteInitial={r.pv_texte ?? ""} fichier={fichiers[i]} />
            <form action={supprimerReunion} className="mt-2 text-right">
              <input type="hidden" name="id" value={r.id} />
              <button className="text-xs text-[#B3402A]">Supprimer la réunion</button>
            </form>
          </details>
        );
      })}
    </div>
  );
}
