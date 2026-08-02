"use client";
import { useActionState } from "react";
import { enregistrerFeuilleAppel, type FeuilleState } from "../actions";

const STATUTS = [
  { valeur: "present", libelle: "Présent", actif: "peer-checked:border-[#1E8A54] peer-checked:bg-[#E8F3ED] peer-checked:text-[#1E8A54]" },
  { valeur: "absent", libelle: "Absent", actif: "peer-checked:border-[#B3402A] peer-checked:bg-[#FBEAE5] peer-checked:text-[#B3402A]" },
  { valeur: "excuse", libelle: "Excusé", actif: "peer-checked:border-[#9A6A00] peer-checked:bg-[#FBF3DF] peer-checked:text-[#9A6A00]" },
] as const;

export function FeuilleAppel({
  reunionId, membres, statuts, montants, montantDefaut,
}: {
  reunionId: string;
  membres: { id: string; nom_complet: string; exempte_cotisation: boolean }[];
  statuts: Record<string, string>;
  montants: Record<string, number>;
  montantDefaut: number;
}) {
  const [state, formAction, pending] = useActionState<FeuilleState, FormData>(enregistrerFeuilleAppel, null);

  if (membres.length === 0) return null;

  return (
    <form action={formAction} className="mt-3 space-y-3 border-t border-[#E5E2D9] pt-3">
      <input type="hidden" name="reunion_id" value={reunionId} />
      <input type="hidden" name="membre_ids" value={membres.map((m) => m.id).join(",")} />

      <div>
        <span className="text-sm font-semibold text-[#1C1C17]">Feuille d&apos;appel</span>
        <p className="text-sm text-[#6B6B60]">
          Cochez la présence et saisissez le montant remis pendant la réunion. Vous pouvez
          réenregistrer autant de fois que nécessaire : cela corrige, cela ne double pas.
        </p>
      </div>

      {state?.erreur && <div className="rounded-lg bg-[#FBEAE5] px-3 py-2 text-sm font-medium text-[#B3402A]">{state.erreur}</div>}
      {state?.ok && <div className="rounded-lg bg-[#E8F3ED] px-3 py-2 text-sm font-medium text-[#1E8A54]">{state.ok}</div>}

      <ul className="divide-y divide-[#E5E2D9]">
        {membres.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center gap-2 py-2.5">
            <span className="w-full text-sm font-medium text-[#1C1C17]">
              {m.nom_complet}
              {m.exempte_cotisation && <span className="ml-1.5 text-xs font-normal text-[#9A8B5E]">· membre d&apos;honneur</span>}
            </span>
            <div className="flex gap-1.5">
              {STATUTS.map((s) => (
                <label key={s.valeur} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`statut_${m.id}`}
                    value={s.valeur}
                    defaultChecked={statuts[m.id] === s.valeur}
                    disabled={pending}
                    className="peer sr-only"
                  />
                  <span className={`inline-block rounded-lg border border-[#E2DFD6] px-2.5 py-1.5 text-xs font-semibold text-[#6B6B60] ${s.actif}`}>
                    {s.libelle}
                  </span>
                </label>
              ))}
            </div>
            <input
              name={`montant_${m.id}`}
              type="number"
              step="0.01"
              disabled={pending}
              defaultValue={montants[m.id] ?? ""}
              placeholder={`${montantDefaut} €`}
              aria-label={`Montant versé par ${m.nom_complet}`}
              className="ml-auto w-24 rounded-lg border border-[#E2DFD6] p-2 text-sm"
            />
          </li>
        ))}
      </ul>

      <button disabled={pending} className="nf-btn-grad rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Enregistrement…" : "Enregistrer la feuille"}
      </button>
    </form>
  );
}
