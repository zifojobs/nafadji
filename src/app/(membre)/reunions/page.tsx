import { getReunions } from "@/lib/requetes";

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function Reunions() {
  const reunions = await getReunions();
  const maintenant = Date.now();
  const futures = reunions.filter((r) => new Date(r.date_reunion).getTime() >= maintenant).reverse();
  const passees = reunions.filter((r) => new Date(r.date_reunion).getTime() < maintenant);

  return (
    <div className="space-y-3.5">
      <h2 className="text-[11px] font-bold uppercase tracking-[.14em] text-[#6B6B60]">À venir</h2>
      {futures.length === 0 && <p className="text-[#6B6B60]">Aucune réunion prévue.</p>}
      {futures.map((r, i) => (
        <div
          key={r.id}
          className="nf-up nf-caisse-grad rounded-[20px] p-4.5 text-white"
          style={{ animationDelay: `${0.07 * Math.min(i, 4)}s` }}
        >
          <div className="nf-serif font-bold capitalize">{fmt(r.date_reunion)}</div>
          <div className="mt-1 text-sm text-white/80">{r.lieu}</div>
          {r.ordre_du_jour && <p className="mt-2 whitespace-pre-wrap text-sm opacity-90">Ordre du jour : {r.ordre_du_jour}</p>}
        </div>
      ))}
      <h2 className="mt-5 text-[11px] font-bold uppercase tracking-[.14em] text-[#6B6B60]">Passées</h2>
      {passees.map((r) => (
        <div key={r.id} className="nf-up rounded-[20px] bg-white p-4 text-sm shadow-[0_8px_24px_rgba(28,28,23,.12)]">
          <span className="font-semibold capitalize">{fmt(r.date_reunion)}</span> — {r.lieu}
          {r.pv_texte ? <span className="text-[#1E8A54]"> · PV disponible</span> : <span className="text-[#9A9A90]"> · pas de PV</span>}
        </div>
      ))}
    </div>
  );
}
