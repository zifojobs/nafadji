import { lireSession } from "@/lib/session";
import { getEtatMembre, getParametres } from "@/lib/requetes";

const fmtMois = (m: string) => new Date(m).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

export default async function Cotisations() {
  const session = (await lireSession())!;
  const [etat, params] = await Promise.all([getEtatMembre(session.membreId), getParametres()]);
  const payes = new Set(etat.paiements.map((p) => p.mois));

  return (
    <div className="space-y-3.5">
      <div className="flex gap-3.5">
        <div className="nf-up flex-1 rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
          <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Total versé</div>
          <div className="mt-1.5 font-bold">{etat.totalVerse} €</div>
        </div>
        <div className="nf-up nf-up-1 flex-1 rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
          <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Reste dû</div>
          <div className="mt-1.5 font-bold">{etat.resteDu} €</div>
        </div>
      </div>
      <ul className="space-y-2.5">
        {etat.moisDus.slice().reverse().map((mois, i) => (
          <li
            key={mois}
            className="nf-up flex items-center justify-between rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,28,23,.12)]"
            style={{ animationDelay: `${0.07 * Math.min(i, 4)}s` }}
          >
            <span className="capitalize">{fmtMois(mois)}</span>
            {payes.has(mois)
              ? <span className="text-sm font-semibold text-[#1E8A54]">Payé ✓</span>
              : <span className="text-sm font-semibold text-[#B3402A]">En retard — {params.montant_mensuel} €</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
