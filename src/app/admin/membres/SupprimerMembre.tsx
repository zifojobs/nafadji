"use client";
import { useActionState } from "react";
import { supprimerMembre } from "../actions";

type Etat = { erreur?: string } | null;

export function SupprimerMembre({ id, nom }: { id: string; nom: string }) {
  const [state, formAction, pending] = useActionState<Etat, FormData>(supprimerMembre, null);

  return (
    <form
      action={formAction}
      className="mt-2 text-right"
      onSubmit={(e) => {
        if (!confirm(`Supprimer définitivement ${nom} ?\n\nSes cotisations enregistrées seront aussi supprimées.\nPour un simple départ, préférez décocher « Actif ».`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      {state?.erreur && (
        <div className="mb-1 rounded-lg bg-[#FBEAE5] px-3 py-2 text-left text-sm font-medium text-[#B3402A]">{state.erreur}</div>
      )}
      <button disabled={pending} className="text-xs font-semibold text-[#B3402A] disabled:opacity-50">
        {pending ? "Suppression..." : "Supprimer ce membre"}
      </button>
    </form>
  );
}
