import Link from "next/link";
import { lireSession } from "@/lib/session";
import { getEtatMembre, getProchaineReunion, getDernierPV, getCaisse, getMouvements, getEncaisseDuMois, getTotalAchatAppli, OBJECTIF_ACHAT_APPLI } from "@/lib/requetes";

const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const moisEnCours = () => new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

export default async function Accueil() {
  const session = (await lireSession())!;
  const [etat, reunion, pv, caisse, { mouvements }, encaisseDuMois, totalAchat] = await Promise.all([
    getEtatMembre(session.membreId), getProchaineReunion(), getDernierPV(), getCaisse(), getMouvements(), getEncaisseDuMois(),
    getTotalAchatAppli(),
  ]);
  const dernierMouvement = mouvements[0] ?? null;

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <Link
        href="/cotisations"
        className={`nf-up rounded-[20px] p-4.5 text-white shadow-[0_8px_24px_rgba(28,28,23,.12)] ${etat.aJour ? "nf-statut-ok" : "nf-statut-retard"}`}
      >
        <div className="text-[11px] uppercase tracking-[.14em] opacity-70">Mes cotisations</div>
        <div className="mt-1.5 text-lg font-extrabold">{etat.aJour ? "À jour" : `En retard (${etat.moisRetard} mois)`}</div>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/18 px-3 py-1 text-[12.5px] font-bold">
          {etat.solde < 0 ? `Dette : ${(-etat.solde).toLocaleString("fr-FR")} €` : etat.solde > 0 ? `Avance : +${etat.solde.toLocaleString("fr-FR")} €` : "✓ à jour"}
        </span>
      </Link>

      <Link href="/reunions" className="nf-up nf-up-1 rounded-[20px] bg-white p-4.5 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
        <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Prochaine réunion</div>
        <div className="mt-1.5 font-bold">{reunion ? `${fmtDate(reunion.date_reunion)} — ${reunion.lieu}` : "Aucune réunion prévue"}</div>
      </Link>

      <Link href="/pv" className="nf-up nf-up-2 rounded-[20px] bg-white p-4.5 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
        <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Dernier procès-verbal</div>
        <div className="mt-1.5 font-bold">{pv ? fmtDate(pv.date_reunion) : "Aucun PV"}</div>
        {pv && <div className="mt-1 line-clamp-2 text-sm text-[#6B6B60]">{pv.pv_texte ?? `📎 ${pv.fichier?.nom ?? "Fichier joint"}`}</div>}
      </Link>

      <Link href="/caisse" className="nf-up nf-up-3 nf-caisse-grad rounded-[20px] border border-[#E3B23C]/35 p-4.5 text-white">
        <div className="text-[11px] uppercase tracking-[.14em] text-white/60">Caisse de l&apos;association →</div>
        <div className="nf-serif mt-1.5 text-[30px] font-bold text-[#E3B23C]">{Number(caisse.solde).toLocaleString("fr-FR")} €</div>
        <div className="mt-1 text-xs text-white/65">Mis à jour le {fmtDate(caisse.maj_le)}</div>
      </Link>

      <Link href="/caisse" className="nf-up nf-up-4 rounded-[20px] bg-white p-4.5 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
        <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Dons et dépenses</div>
        <div className="mt-1.5 font-bold">
          {dernierMouvement ? (
            <>
              {dernierMouvement.type === "don" ? "Don" : "Dépense"} —{" "}
              <span className="text-[#B3402A]">{Number(dernierMouvement.montant).toLocaleString("fr-FR")} €</span>
            </>
          ) : "Aucun mouvement"}
        </div>
        {dernierMouvement && <div className="mt-1 line-clamp-1 text-sm text-[#6B6B60]">{dernierMouvement.libelle}</div>}
      </Link>

      <Link href="/caisse" className="nf-up nf-up-5 rounded-[20px] bg-white p-4.5 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
        <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Cotisations — {moisEnCours()}</div>
        <div className="mt-1.5 text-lg font-extrabold text-[#1E8A54]">{encaisseDuMois.toLocaleString("fr-FR")} €</div>
      </Link>

      <Link href="/achat-appli" className="nf-up nf-up-5 rounded-[20px] bg-white p-4.5 shadow-[0_8px_24px_rgba(28,28,23,.12)]">
        <div className="text-[11px] uppercase tracking-[.14em] text-[#9A8B5E]">Achat de l&apos;application</div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-lg font-extrabold text-[#1E8A54]">{totalAchat.toLocaleString("fr-FR")} €</span>
          <span className="text-sm text-[#6B6B60]">sur {OBJECTIF_ACHAT_APPLI.toLocaleString("fr-FR")} €</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E2D9]">
          <div className="h-full rounded-full bg-[#1E8A54]" style={{ width: `${Math.min(100, (totalAchat / OBJECTIF_ACHAT_APPLI) * 100)}%` }} />
        </div>
      </Link>
    </div>
  );
}
