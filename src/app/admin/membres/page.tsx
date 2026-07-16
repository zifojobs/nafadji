import { db } from "@/lib/db";
import { modifierMembre, definirCode } from "../actions";
import { MembreForm } from "./MembreForm";
import { SupprimerMembre } from "./SupprimerMembre";

export default async function AdminMembres() {
  const { data: membres } = await db.from("membres").select("*").order("nom_complet");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1C1C17]">Membres ({membres?.length ?? 0})</h1>

      <MembreForm />

      <div className="space-y-3">
        {(membres ?? []).map((m) => (
          <details key={m.id} className="rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
            <summary className="flex cursor-pointer justify-between">
              <span className={m.actif ? "" : "text-[#9A9A90] line-through"}>
                {m.nom_complet} {m.is_admin && <span className="rounded bg-[#1C1C17] px-1 text-xs text-white">bureau</span>}
              </span>
              <span className="text-sm text-[#6B6B60]">adhésion {new Date(m.date_adhesion).toLocaleDateString("fr-FR")}</span>
            </summary>
            <form action={modifierMembre} className="mt-3 space-y-2 border-t border-[#E5E2D9] pt-3">
              <input type="hidden" name="id" value={m.id} />
              <input name="nom_complet" defaultValue={m.nom_complet} className="w-full rounded-lg border border-[#E2DFD6] p-2" />
              <div className="flex gap-2">
                <input name="telephone" defaultValue={m.telephone ?? ""} placeholder="Téléphone" className="flex-1 rounded-lg border border-[#E2DFD6] p-2" />
                <input name="date_adhesion" type="date" defaultValue={m.date_adhesion} className="rounded-lg border border-[#E2DFD6] p-2" />
              </div>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1"><input type="checkbox" name="is_admin" defaultChecked={m.is_admin} /> Bureau</label>
                <label className="flex items-center gap-1"><input type="checkbox" name="actif" defaultChecked={m.actif} /> Actif</label>
              </div>
              <button className="rounded-lg bg-[#1C1C17] px-3 py-1.5 text-sm text-white">Enregistrer</button>
            </form>
            <form action={definirCode} className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={m.id} />
              <input name="code" required placeholder="Nouveau code" className="flex-1 rounded-lg border border-[#E2DFD6] p-2 text-sm" />
              <button className="rounded-lg bg-[#E3B23C] px-3 text-sm font-semibold text-[#1C1C17]">Réinitialiser le code</button>
            </form>
            <SupprimerMembre id={m.id} nom={m.nom_complet} />
          </details>
        ))}
      </div>
    </div>
  );
}
