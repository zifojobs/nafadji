"use client";
import { useActionState } from "react";
import { definirCode } from "../actions";

type Etat = { ok?: string; erreur?: string } | null;

export function ReinitialiserCode({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<Etat, FormData>(definirCode, null);

  return (
    <form action={formAction} className="mt-2 space-y-1.5">
      <input type="hidden" name="id" value={id} />
      {state?.ok && <div className="rounded-lg bg-[#E7F6EE] px-3 py-1.5 text-sm font-semibold text-[#1E8A54]">✓ {state.ok}</div>}
      {state?.erreur && <div className="rounded-lg bg-[#FBEAE5] px-3 py-1.5 text-sm font-medium text-[#B3402A]">{state.erreur}</div>}
      <div className="flex gap-2">
        <input name="code" placeholder="Nouveau code (vide = généré automatiquement)" className="flex-1 rounded-lg border border-[#E2DFD6] p-2 text-sm" />
        <button disabled={pending} className="rounded-lg bg-[#E3B23C] px-3 text-sm font-semibold text-[#1C1C17] disabled:opacity-60">
          {pending ? "…" : "Réinitialiser le code"}
        </button>
      </div>
    </form>
  );
}
