import { lireSession } from "@/lib/session";
import { getEtatMembre, getParametres } from "@/lib/requetes";

const fmtMois = (m: string) => new Date(m).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

export default async function Cotisations() {
  const session = (await lireSession())!;
  const [etat, params] = await Promise.all([getEtatMembre(session.membreId), getParametres()]);
  const payes = new Set(etat.paiements.map((p) => p.mois));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mes cotisations</h1>
      <div className="flex gap-4">
        <div className="bg-white rounded-xl p-3 shadow flex-1"><div className="text-xs text-gray-500">Total versé</div><div className="font-bold">{etat.totalVerse} €</div></div>
        <div className="bg-white rounded-xl p-3 shadow flex-1"><div className="text-xs text-gray-500">Reste dû</div><div className="font-bold">{etat.resteDu} €</div></div>
      </div>
      <ul className="space-y-2">
        {etat.moisDus.slice().reverse().map((mois) => (
          <li key={mois} className="bg-white rounded-xl p-3 shadow flex justify-between items-center">
            <span className="capitalize">{fmtMois(mois)}</span>
            {payes.has(mois)
              ? <span className="text-emerald-700 font-semibold text-sm">Payé ✓</span>
              : <span className="text-red-700 font-semibold text-sm">En retard — {params.montant_mensuel} €</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
