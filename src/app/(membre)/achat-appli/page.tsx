import { getTotalAchatAppli, getParticipantsAchatAppli, OBJECTIF_ACHAT_APPLI } from "@/lib/requetes";

export default async function AchatAppli() {
  const [total, noms] = await Promise.all([getTotalAchatAppli(), getParticipantsAchatAppli()]);
  return (
    <div className="space-y-3.5">
      <div className="nf-up rounded-[20px] bg-white p-4.5 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-[#1E8A54]">{total.toLocaleString("fr-FR")} €</span>
          <span className="text-sm text-[#6B6B60]">sur {OBJECTIF_ACHAT_APPLI.toLocaleString("fr-FR")} €</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E2D9]">
          <div className="h-full rounded-full bg-[#1E8A54]" style={{ width: `${Math.min(100, (total / OBJECTIF_ACHAT_APPLI) * 100)}%` }} />
        </div>
      </div>

      <div className="nf-up nf-up-1 rounded-[20px] bg-white p-4.5 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
        <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Ont participé ({noms.length})</div>
        {noms.length === 0 && <p className="mt-2 text-sm text-[#6B6B60]">Aucune participation pour l&apos;instant.</p>}
        <ul className="mt-1 divide-y divide-[#E5E2D9]">
          {noms.map((nom) => (
            <li key={nom} className="py-2">{nom}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
