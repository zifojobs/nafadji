import { ORDRE_GROUPES, LIBELLE_GROUPE, type GroupesPresence } from "@/lib/presences";

// Liste des présents/excusés/absents affichée en tête du PV. Elle est toujours
// reconstruite depuis la feuille d'appel : si la présence change, elle suit.
export function ListePresence({ groupes }: { groupes: GroupesPresence | undefined }) {
  if (!groupes) return null;
  const remplis = ORDRE_GROUPES.filter((statut) => groupes[statut].length > 0);
  if (remplis.length === 0) return null;

  return (
    <div className="space-y-1 rounded-lg bg-[#F4F1E8] px-3 py-2 text-sm">
      {remplis.map((statut) => (
        <p key={statut}>
          <span className="font-semibold text-[#1C1C17]">{LIBELLE_GROUPE[statut]} ({groupes[statut].length})</span>
          {" : "}
          <span className="text-[#4A4A40]">{groupes[statut].join(", ")}</span>
        </p>
      ))}
    </div>
  );
}
