export type StatutPresence = "present" | "absent" | "excuse";

export type GroupesPresence = { present: string[]; absent: string[]; excuse: string[] };

export const LIBELLE_GROUPE: Record<StatutPresence, string> = {
  present: "Présents",
  excuse: "Excusés",
  absent: "Absents",
};

// L'ordre d'affichage du PV : on nomme d'abord ceux qui étaient là.
export const ORDRE_GROUPES: StatutPresence[] = ["present", "excuse", "absent"];

export function grouperPresences(
  lignes: { membre_id: string; statut: string }[],
  nomParId: Map<string, string>,
): GroupesPresence {
  const groupes: GroupesPresence = { present: [], absent: [], excuse: [] };
  for (const l of lignes) {
    const nom = nomParId.get(l.membre_id);
    // Membre supprimé depuis la réunion : on ne peut plus le nommer, on l'omet.
    if (!nom || !(l.statut in groupes)) continue;
    groupes[l.statut as StatutPresence].push(nom);
  }
  for (const statut of ORDRE_GROUPES) {
    groupes[statut].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
  }
  return groupes;
}

// Bloc que le bureau peut coller dans le texte du PV, à sa demande.
export function texteListePresence(groupes: GroupesPresence): string {
  return ORDRE_GROUPES
    .filter((statut) => groupes[statut].length > 0)
    .map((statut) => `${LIBELLE_GROUPE[statut]} (${groupes[statut].length}) : ${groupes[statut].join(", ")}`)
    .join("\n");
}
