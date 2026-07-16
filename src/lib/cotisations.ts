export type Paiement = { mois: string; montant: number };
export type EtatCotisations = {
  moisDus: string[]; moisEnRetard: string[];
  aJour: boolean; totalVerse: number; resteDu: number;
};

// Tout en chaînes "YYYY-MM-01" — aucune manipulation de fuseau horaire.
export function calculerEtat(args: {
  dateAdhesion: string; paiements: Paiement[]; montantMensuel: number; aujourdhui: string;
}): EtatCotisations {
  const [ya, ma] = args.dateAdhesion.split("-").map(Number);
  const [yn, mn] = args.aujourdhui.split("-").map(Number);

  const moisDus: string[] = [];
  for (let y = ya, m = ma; y < yn || (y === yn && m <= mn); m === 12 ? (y++, m = 1) : m++) {
    moisDus.push(`${y}-${String(m).padStart(2, "0")}-01`);
  }

  const payes = new Set(args.paiements.map((p) => p.mois));
  const moisEnRetard = moisDus.filter((m) => !payes.has(m));
  const totalVerse = args.paiements.reduce((s, p) => s + p.montant, 0);

  return {
    moisDus, moisEnRetard,
    aJour: moisEnRetard.length === 0,
    totalVerse,
    resteDu: moisEnRetard.length * args.montantMensuel,
  };
}
