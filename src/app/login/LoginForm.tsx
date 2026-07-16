"use client";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Logo } from "@/components/Logo";

export function LoginForm({ membres }: { membres: { id: string; nom_complet: string }[] }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, null);

  return (
    <form
      action={formAction}
      className="nf-pop relative w-full max-w-sm rounded-3xl bg-[#F7F5F0]/98 p-7 shadow-[0_24px_60px_rgba(0,0,0,.45),0_0_0_1px_rgba(227,178,60,.25)]"
    >
      <Logo size={74} variante="sombre" />
      <h1 className="nf-serif mt-3.5 text-center text-2xl font-bold tracking-wide text-[#0B3D2E]">
        Association Nafadji
      </h1>
      <p className="mb-6 mt-2 text-center text-[10.5px] uppercase tracking-[.24em] text-[#9A8B5E]">
        Diaspora
      </p>

      {state?.erreur && (
        <div className="mb-4 rounded-xl bg-[#FBEAE5] px-4 py-3 text-sm font-medium text-[#B3402A]">
          {state.erreur}
        </div>
      )}

      <label className="mb-1.5 block text-[12.5px] font-bold text-[#3E3E35]">Votre nom</label>
      <select
        name="membre_id"
        required
        className="mb-4 w-full rounded-2xl border-[1.5px] border-[#E2DFD6] bg-white p-3.5 text-base transition focus:border-[#0B3D2E] focus:outline-none focus:ring-4 focus:ring-[#0B3D2E]/15"
      >
        <option value="">— Choisissez votre nom —</option>
        {membres.map((m) => (
          <option key={m.id} value={m.id}>{m.nom_complet}</option>
        ))}
      </select>

      <label className="mb-1.5 block text-[12.5px] font-bold text-[#3E3E35]">Code personnel</label>
      <input
        name="code"
        type="password"
        inputMode="numeric"
        required
        placeholder="••••"
        className="mb-4 w-full rounded-2xl border-[1.5px] border-[#E2DFD6] bg-white p-3.5 text-base transition focus:border-[#0B3D2E] focus:outline-none focus:ring-4 focus:ring-[#0B3D2E]/15"
      />

      <button
        disabled={pending}
        className="nf-btn-grad w-full rounded-2xl py-3.5 text-base font-bold text-white shadow-[0_6px_18px_rgba(11,61,46,.35)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
      <div className="nf-filet" />
      <p className="mt-3.5 text-center text-xs text-[#6B6B60]">Code oublié ? Contactez un membre du bureau.</p>
    </form>
  );
}
