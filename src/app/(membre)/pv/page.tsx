import { getPVs } from "@/lib/requetes";

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function PVs() {
  const pvs = await getPVs();
  const [dernier, ...anciens] = pvs;
  return (
    <div className="space-y-3.5">
      {!dernier && <p className="text-[#6B6B60]">Aucun PV pour l&apos;instant.</p>}
      {dernier && (
        <article className="nf-up rounded-[20px] bg-white p-4.5 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
          <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Réunion du {fmt(dernier.date_reunion)} — {dernier.lieu}</div>
          {dernier.pv_texte && <p className="mt-2 whitespace-pre-wrap">{dernier.pv_texte}</p>}
          {dernier.fichier?.url && (
            <a href={dernier.fichier.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0B3D2E] px-4 py-2 text-sm font-semibold text-white">
              📎 Ouvrir le PV ({dernier.fichier.nom})
            </a>
          )}
        </article>
      )}
      {anciens.length > 0 && (
        <details className="nf-up nf-up-1 rounded-[20px] bg-white p-4.5 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
          <summary className="cursor-pointer font-semibold">PV précédents ({anciens.length})</summary>
          {anciens.map((pv) => (
            <article key={pv.id} className="mt-3 border-t border-[#E5E2D9] pt-3">
              <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Réunion du {fmt(pv.date_reunion)} — {pv.lieu}</div>
              {pv.pv_texte && <p className="mt-1 whitespace-pre-wrap text-sm">{pv.pv_texte}</p>}
              {pv.fichier?.url && (
                <a href={pv.fichier.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B3D2E] underline">
                  📎 Ouvrir le PV ({pv.fichier.nom})
                </a>
              )}
            </article>
          ))}
        </details>
      )}
    </div>
  );
}
