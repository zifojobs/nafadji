import Link from "next/link";
import { lireSession } from "@/lib/session";
import { getEtatMembre, getProchaineReunion, getDernierPV, getCaisse, getParametres } from "@/lib/requetes";

const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function Accueil() {
  const session = (await lireSession())!;
  const [etat, reunion, pv, caisse, params] = await Promise.all([
    getEtatMembre(session.membreId), getProchaineReunion(), getDernierPV(), getCaisse(), getParametres(),
  ]);
  const prenom = session.nom.split(" ")[0];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bonjour {prenom} 👋</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/cotisations" className={`rounded-2xl p-4 text-white ${etat.aJour ? "bg-emerald-700" : "bg-red-700"}`}>
          <div className="text-sm opacity-80">Mes cotisations</div>
          <div className="text-lg font-bold">{etat.aJour ? "À jour ✓" : `En retard (${etat.moisEnRetard.length} mois)`}</div>
          {!etat.aJour && <div className="text-sm">Reste dû : {etat.resteDu} {params.devise === "EUR" ? "€" : params.devise}</div>}
        </Link>
        <Link href="/reunions" className="rounded-2xl p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Prochaine réunion</div>
          <div className="font-bold">{reunion ? `${fmtDate(reunion.date_reunion)} — ${reunion.lieu}` : "Aucune réunion prévue"}</div>
        </Link>
        <Link href="/pv" className="rounded-2xl p-4 bg-white shadow">
          <div className="text-sm text-gray-500">Dernier PV</div>
          <div className="font-bold">{pv ? fmtDate(pv.date_reunion) : "Aucun PV"}</div>
          {pv && <div className="text-sm text-gray-600 line-clamp-2">{pv.pv_texte}</div>}
        </Link>
        <div className="rounded-2xl p-4 bg-emerald-950 text-white">
          <div className="text-sm opacity-80">Caisse de l'association</div>
          <div className="text-2xl font-bold">{Number(caisse.solde).toLocaleString("fr-FR")} €</div>
          <div className="text-xs opacity-70">Mis à jour le {fmtDate(caisse.maj_le)}</div>
        </div>
      </div>
    </div>
  );
}
