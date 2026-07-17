"use client";
import { useActionState } from "react";
import { suspendreMembre } from "../actions";

export function SuspendreMembre({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(suspendreMembre, null);
  return (
    <form action={formAction} className="mt-2">
      <input type="hidden" name="id" value={id} />
      {state?.erreur && <div className="mb-1 text-sm font-medium text-[#B3402A]">{state.erreur}</div>}
      <button disabled={pending} className="rounded-lg border border-[#B3402A] px-3 py-1.5 text-sm font-semibold text-[#B3402A] disabled:opacity-60">
        {pending ? "…" : "Suspendre (plus d'accès à l'appli, dette gelée)"}
      </button>
    </form>
  );
}
