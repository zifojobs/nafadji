import { getPVs } from "@/lib/requetes";

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function PVs() {
  const pvs = await getPVs();
  const [dernier, ...anciens] = pvs;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Procès-verbaux</h1>
      {!dernier && <p className="text-gray-600">Aucun PV pour l'instant.</p>}
      {dernier && (
        <article className="bg-white rounded-2xl p-4 shadow">
          <div className="text-sm text-gray-500">Réunion du {fmt(dernier.date_reunion)} — {dernier.lieu}</div>
          <p className="mt-2 whitespace-pre-wrap">{dernier.pv_texte}</p>
        </article>
      )}
      {anciens.length > 0 && (
        <details className="bg-white rounded-2xl p-4 shadow">
          <summary className="font-semibold cursor-pointer">PV précédents ({anciens.length})</summary>
          {anciens.map((pv) => (
            <article key={pv.id} className="border-t mt-3 pt-3">
              <div className="text-sm text-gray-500">Réunion du {fmt(pv.date_reunion)} — {pv.lieu}</div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{pv.pv_texte}</p>
            </article>
          ))}
        </details>
      )}
    </div>
  );
}
