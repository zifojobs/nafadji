"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { enregistrerTextePV, preparerUploadPV, retirerFichierPV } from "../actions";

// Garder en phase avec EXTENSIONS_PV (lib/pv.ts) — pas d'import : lib/pv est côté serveur
const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic";

export function PVForm({
  reunionId, texteInitial, fichier, listePresence,
}: {
  reunionId: string;
  texteInitial: string;
  fichier: { nom: string; url: string | null } | null;
  listePresence: string;
}) {
  const [pending, setPending] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [nomChoisi, setNomChoisi] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const fichierRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const texteRef = useRef<HTMLTextAreaElement>(null);

  // Insertion à la demande, au curseur (donc en tête si le texte n'a pas été touché).
  // Le PV affiché garde de toute façon sa liste à jour : ceci sert à la retoucher.
  function onInsererPresence() {
    const zone = texteRef.current;
    if (!zone) return;
    const bloc = `${listePresence}\n\n`;
    const pos = zone.selectionStart ?? 0;
    zone.value = zone.value.slice(0, pos) + bloc + zone.value.slice(pos);
    zone.focus();
    zone.selectionStart = zone.selectionEnd = pos + bloc.length;
  }

  // Réunion sans PV → on déplie la carte à l'arrivée pour que le formulaire soit visible
  // (attribut posé côté client uniquement : le serveur ne le contrôle pas, pas de repli après enregistrement)
  useEffect(() => {
    if (!texteInitial && !fichier) formRef.current?.closest("details")?.setAttribute("open", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const texte = String(new FormData(e.currentTarget).get("pv_texte") ?? "");
    const f = fichierRef.current?.files?.[0];
    setPending(true);
    setErreur(null);
    setOk(false);
    try {
      if (f) {
        const prep = await preparerUploadPV(reunionId, f.name, f.size);
        if (prep.erreur || !prep.url) throw new Error(prep.erreur ?? "Préparation de l'envoi impossible");
        const res = await fetch(prep.url, {
          method: "PUT",
          headers: { "content-type": f.type || "application/octet-stream" },
          body: f,
        });
        if (!res.ok) throw new Error("L'envoi du fichier a échoué — réessayez.");
      }
      const resTexte = await enregistrerTextePV(reunionId, texte);
      if (resTexte?.erreur) throw new Error(resTexte.erreur);
      if (fichierRef.current) fichierRef.current.value = "";
      setNomChoisi(null);
      setOk(true);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setPending(false);
    }
  }

  function onRetirerFichier() {
    if (!confirm("Retirer le fichier joint à ce PV ?")) return;
    setPending(true);
    startTransition(async () => {
      await retirerFichierPV(reunionId);
      setPending(false);
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-3 space-y-2 border-t border-[#E5E2D9] pt-3">
      <label className="text-sm font-semibold text-[#1C1C17]">Procès-verbal</label>
      {erreur && <div className="rounded-lg bg-[#FBEAE5] px-3 py-2 text-sm font-medium text-[#B3402A]">{erreur}</div>}
      {ok && <div className="rounded-lg bg-[#E8F3ED] px-3 py-2 text-sm font-medium text-[#1E8A54]">PV enregistré ✓</div>}
      <textarea ref={texteRef} name="pv_texte" defaultValue={texteInitial} rows={6} placeholder="Rédiger le PV ici..." className="w-full rounded-lg border border-[#E2DFD6] p-2" />
      {listePresence && (
        <button
          type="button"
          onClick={onInsererPresence}
          disabled={pending}
          className="rounded-lg border border-[#E2DFD6] px-3 py-1.5 text-xs font-semibold text-[#0B3D2E] disabled:opacity-60"
        >
          ↓ Insérer la liste des présents dans le texte
        </button>
      )}
      {fichier && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#F4F1E8] px-3 py-2 text-sm">
          <span>📎</span>
          {fichier.url
            ? <a href={fichier.url} target="_blank" rel="noreferrer" className="font-medium text-[#0B3D2E] underline">{fichier.nom}</a>
            : <span className="font-medium">{fichier.nom}</span>}
          <button type="button" onClick={onRetirerFichier} disabled={pending} className="ml-auto text-xs text-[#B3402A]">Retirer</button>
        </div>
      )}
      <div className="text-sm">
        <input
          ref={fichierRef}
          type="file"
          name="pv_fichier"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => setNomChoisi(e.currentTarget.files?.[0]?.name ?? null)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fichierRef.current?.click()}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#0B3D2E] px-3 py-1.5 text-sm font-semibold text-[#0B3D2E] disabled:opacity-60"
          >
            📎 {fichier ? "Remplacer le fichier" : "Joindre un fichier"}
          </button>
          {nomChoisi ? (
            <span className="flex items-center gap-1.5 font-medium text-[#1C1C17]">
              {nomChoisi}
              <button
                type="button"
                onClick={() => { if (fichierRef.current) fichierRef.current.value = ""; setNomChoisi(null); }}
                aria-label="Annuler le fichier choisi"
                className="text-[#B3402A]"
              >
                ✕
              </button>
            </span>
          ) : (
            <span className="text-[#6B6B60]">PDF, Word ou photo — 10 Mo max</span>
          )}
        </div>
      </div>
      <button disabled={pending} className="nf-btn-grad rounded-lg px-3 py-1.5 text-sm text-white disabled:opacity-60">
        {pending ? "Enregistrement…" : "Enregistrer le PV"}
      </button>
    </form>
  );
}
