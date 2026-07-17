"use client";
import { useActionState } from "react";
import { majCaisse, type CaisseState } from "../actions";

export function MajCaisseForm() {
  const [state, formAction, pending] = useActionState<CaisseState, FormData>(majCaisse, null);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
      <h2 className="font-semibold text-[#1C1C17]">Mettre à jour le montant en banque</h2>
      {state?.erreur && (
        <div className="rounded-lg bg-[#FBEAE5] px-3 py-2 text-sm font-medium text-[#B3402A]">{state.erreur}</div>
      )}
      {state?.ok && (
        <div className="rounded-lg bg-[#E9F4EE] px-3 py-2 text-sm font-medium text-[#1E8A54]">{state.ok}</div>
      )}
      <input name="solde" type="number" step="0.01" required placeholder="Montant sur le compte" className="w-full rounded-lg border border-[#E2DFD6] p-2" />
      <input name="note" placeholder="Note (optionnel)" className="w-full rounded-lg border border-[#E2DFD6] p-2" />
      <button disabled={pending} className="nf-btn-grad rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-60">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
