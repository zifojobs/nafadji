"use client";
import { useActionState } from "react";
import { enregistrerContributionAchat, type ContributionState } from "../actions";

export function ContributionForm({ membres, aujourdhui }: { membres: { id: string; nom_complet: string }[]; aujourdhui: string }) {
  const [state, formAction, pending] = useActionState<ContributionState, FormData>(enregistrerContributionAchat, null);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
      <h2 className="font-semibold text-[#1C1C17]">Enregistrer une participation</h2>
      <p className="text-sm text-[#6B6B60]">Séparé des cotisations mensuelles : ce montant ne change pas le solde du membre.</p>
      {state?.erreur && (
        <div className="rounded-lg bg-[#FBEAE5] px-3 py-2 text-sm font-medium text-[#B3402A]">{state.erreur}</div>
      )}
      <select name="membre_id" required className="w-full rounded-lg border border-[#E2DFD6] p-2">
        <option value="">— Membre —</option>
        {membres.map((m) => <option key={m.id} value={m.id}>{m.nom_complet}</option>)}
      </select>
      <div className="flex flex-wrap gap-2">
        <input name="montant" type="number" step="0.01" min="0.01" placeholder="Montant €" required className="w-28 rounded-lg border border-[#E2DFD6] p-2" />
        <input name="date_versement" type="date" defaultValue={aujourdhui} required className="rounded-lg border border-[#E2DFD6] p-2" />
      </div>
      <button disabled={pending} className="nf-btn-grad rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-60">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
