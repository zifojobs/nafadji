"use client";
import { useActionState } from "react";
import { creerMembre } from "../actions";

type Etat = { ok?: string; erreur?: string } | null;

export function MembreForm() {
  const [state, formAction, pending] = useActionState<Etat, FormData>(creerMembre, null);

  return (
    <form action={formAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(28,28,23,.08)]">
      <h2 className="font-semibold text-[#1C1C17]">Ajouter un membre</h2>
      {state?.ok && (
        <div className="rounded-lg bg-[#E7F6EE] px-3 py-2 text-sm font-semibold text-[#1E8A54]">✓ {state.ok}</div>
      )}
      {state?.erreur && (
        <div className="rounded-lg bg-[#FBEAE5] px-3 py-2 text-sm font-medium text-[#B3402A]">{state.erreur}</div>
      )}
      <input name="nom_complet" required placeholder="Nom complet" className="w-full rounded-lg border border-[#E2DFD6] p-2" />
      <div className="flex gap-3">
        <input name="telephone" placeholder="Téléphone (optionnel)" className="flex-1 rounded-lg border border-[#E2DFD6] p-2" />
        <input name="date_adhesion" type="date" required className="rounded-lg border border-[#E2DFD6] p-2" />
      </div>
      <div className="flex items-center gap-3">
        <input name="code" placeholder="Code personnel (vide = généré automatiquement)" className="flex-1 rounded-lg border border-[#E2DFD6] p-2" />
        <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="is_admin" /> Bureau</label>
      </div>
      <label className="flex items-center gap-1 text-sm"><input type="checkbox" name="exempte_cotisation" /> Membre d&apos;honneur (ne cotise pas)</label>
      <button disabled={pending} className="nf-btn-grad rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-60">
        {pending ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}
