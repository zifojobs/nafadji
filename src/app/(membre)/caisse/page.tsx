import { getCaisse, getMouvements, getEncaisseDuMois, getEncaissementsParMois } from "@/lib/requetes";

const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const moisEnCours = () => new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
// "2026-08" → "août 2026"
const fmtMois = (m: string) => new Date(`${m}-01`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

export default async function Caisse() {
  const [caisse, { mouvements, totauxParAnnee }, encaisseDuMois, encaissements] = await Promise.all([
    getCaisse(), getMouvements(), getEncaisseDuMois(), getEncaissementsParMois(),
  ]);

  return (
    <div className="space-y-3.5">
      <div className="nf-up nf-caisse-grad rounded-[20px] border border-[#E3B23C]/35 p-4.5 text-white">
        <div className="text-[11px] uppercase tracking-[.14em] text-white/60">Montant sur le compte bancaire</div>
        <div className="nf-serif mt-1.5 text-[30px] font-bold text-[#E3B23C]">{Number(caisse.solde).toLocaleString("fr-FR")} €</div>
        <div className="mt-1 text-xs text-white/65">Mis à jour le {fmtDate(caisse.maj_le)}</div>
      </div>

      <div className="nf-up nf-up-1 rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
        <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Cotisations encaissées — {moisEnCours()}</div>
        <div className="mt-1.5 text-2xl font-bold text-[#1E8A54]">{encaisseDuMois.toLocaleString("fr-FR")} €</div>
      </div>

      {encaissements.mois.length > 0 && (
        <div className="nf-up nf-up-1 rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
          <h2 className="mb-2 font-semibold text-[#1C1C17]">Cotisations encaissées par mois</h2>
          <ul className="divide-y divide-[#E5E2D9] text-sm">
            {encaissements.mois.map((m) => (
              <li key={m.mois} className="flex justify-between py-2">
                <span><span className="capitalize">{fmtMois(m.mois)}</span><span className="text-[#6B6B60]"> · {m.nb} versement{m.nb > 1 ? "s" : ""}</span></span>
                <span className="font-semibold text-[#1E8A54]">{m.total.toLocaleString("fr-FR")} €</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-[#E5E2D9] pt-2 text-sm">
            <span className="font-semibold">Total depuis le début</span>
            <span className="font-bold text-[#1E8A54]">{encaissements.total.toLocaleString("fr-FR")} €</span>
          </div>
        </div>
      )}

      <div className="nf-up nf-up-1 rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
        <h2 className="mb-2 font-semibold text-[#1C1C17]">Dons et dépenses</h2>
        {mouvements.length === 0 && <p className="text-sm text-[#6B6B60]">Aucun mouvement enregistré.</p>}
        <ul className="divide-y divide-[#E5E2D9] text-sm">
          {mouvements.map((m) => (
            <li key={m.id} className="flex justify-between py-2">
              <span>{m.type === "don" ? "Don" : "Dépense"} — {m.libelle}<span className="text-[#6B6B60]"> · {fmtDate(m.date_mouvement)}</span></span>
              <span className="font-semibold text-[#B3402A]">{Number(m.montant).toLocaleString("fr-FR")} €</span>
            </li>
          ))}
        </ul>
      </div>

      {totauxParAnnee.length > 0 && (
        <div className="nf-up nf-up-2 rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
          <h2 className="mb-2 font-semibold text-[#1C1C17]">Total des sorties par année</h2>
          <ul className="divide-y divide-[#E5E2D9] text-sm">
            {totauxParAnnee.map(([annee, total]) => (
              <li key={annee} className="flex justify-between py-2">
                <span>{annee}</span>
                <span className="font-semibold text-[#B3402A]">{total.toLocaleString("fr-FR")} €</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
