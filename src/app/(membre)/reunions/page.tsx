import { getReunions } from "@/lib/requetes";

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function Reunions() {
  const reunions = await getReunions();
  const maintenant = Date.now();
  const futures = reunions.filter((r) => new Date(r.date_reunion).getTime() >= maintenant).reverse();
  const passees = reunions.filter((r) => new Date(r.date_reunion).getTime() < maintenant);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Réunions</h1>
      <h2 className="font-semibold text-gray-700">À venir</h2>
      {futures.length === 0 && <p className="text-gray-600">Aucune réunion prévue.</p>}
      {futures.map((r) => (
        <div key={r.id} className="bg-emerald-700 text-white rounded-2xl p-4">
          <div className="font-bold capitalize">{fmt(r.date_reunion)}</div>
          <div>{r.lieu}</div>
          {r.ordre_du_jour && <p className="text-sm mt-2 opacity-90 whitespace-pre-wrap">Ordre du jour : {r.ordre_du_jour}</p>}
        </div>
      ))}
      <h2 className="font-semibold text-gray-700">Passées</h2>
      {passees.map((r) => (
        <div key={r.id} className="bg-white rounded-xl p-3 shadow text-sm">
          <span className="capitalize font-semibold">{fmt(r.date_reunion)}</span> — {r.lieu}
          {r.pv_texte ? <span className="text-emerald-700"> · PV disponible</span> : <span className="text-gray-400"> · pas de PV</span>}
        </div>
      ))}
    </div>
  );
}
