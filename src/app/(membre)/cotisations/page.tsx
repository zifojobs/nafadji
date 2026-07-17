import { lireSession } from "@/lib/session";
import { getEtatMembre } from "@/lib/requetes";

const fmtMois = (m: string) => new Date(m).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const fmtSolde = (s: number) => `${s > 0 ? "+" : ""}${s.toLocaleString("fr-FR")} €`;

export default async function Cotisations() {
  const session = (await lireSession())!;
  const etat = await getEtatMembre(session.membreId);

  return (
    <div className="space-y-3.5">
      <div className={`nf-up rounded-[20px] p-4.5 text-white shadow-[0_8px_24px_rgba(28,28,23,.12)] ${etat.aJour ? "nf-statut-ok" : "nf-statut-retard"}`}>
        <div className="text-[11px] uppercase tracking-[.14em] opacity-70">Mon solde</div>
        <div className="mt-1.5 text-2xl font-extrabold">{fmtSolde(etat.solde)}</div>
        <div className="mt-1 text-sm opacity-90">
          {etat.solde < 0
            ? `En retard de ${etat.moisRetard} mois`
            : etat.aJourJusqua
              ? `À jour jusqu'à ${fmtMois(etat.aJourJusqua)} ✓`
              : "À jour ✓"}
        </div>
      </div>

      <div className="flex gap-3.5">
        <div className="nf-up nf-up-1 flex-1 rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
          <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Total versé</div>
          <div className="mt-1.5 font-bold">{etat.totalVerse.toLocaleString("fr-FR")} €</div>
        </div>
        <div className="nf-up nf-up-2 flex-1 rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
          <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">{etat.solde < 0 ? "Dette" : "Avance"}</div>
          <div className="mt-1.5 font-bold">{Math.abs(etat.solde).toLocaleString("fr-FR")} €</div>
        </div>
      </div>

      <div className="nf-up nf-up-3 rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">Mes versements</h2>
        {etat.versements.length === 0 && <p className="text-sm text-[#6B6B60]">Aucun versement enregistré.</p>}
        <ul className="divide-y divide-[#E5E2D9] text-sm">
          {etat.versements.map((v, i) => (
            <li key={i} className="flex justify-between py-2">
              <span>{fmtDate(v.date_paiement)}{v.note ? <span className="text-[#6B6B60]"> · {v.note}</span> : null}</span>
              <span className="font-semibold">{Number(v.montant).toLocaleString("fr-FR")} €</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
