export type Versement = { montant: number };
export type Suspension = { debut: string; fin: string | null };
export type EtatCotisations = {
  moisDus: string[];
  totalVerse: number;
  solde: number;
  moisRetard: number;
  aJour: boolean;
  aJourJusqua: string | null;
};

// Tout en chaînes "YYYY-MM-01" — aucune manipulation de fuseau horaire.
const moisSuivant = (y: number, m: number): [number, number] => (m === 12 ? [y + 1, 1] : [y, m + 1]);
const cle = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}-01`;

export function calculerEtat(args: {
  dateAdhesion: string; versements: Versement[]; suspensions?: Suspension[];
  montantMensuel: number; aujourdhui: string;
}): EtatCotisations {
  if (!(args.montantMensuel > 0)) {
    const totalVerse = args.versements.reduce((s, v) => s + v.montant, 0);
    return { moisDus: [], totalVerse, solde: totalVerse, moisRetard: 0, aJour: true, aJourJusqua: null };
  }
  const [ya, ma] = args.dateAdhesion.split("-").map(Number);
  const [yn, mn] = args.aujourdhui.split("-").map(Number);
  const suspensions = args.suspensions ?? [];

  // Un mois est gelé si son 1er jour tombe dans une suspension (fin ouverte = aujourd'hui).
  const gele = (mois: string) =>
    suspensions.some((s) => s.debut <= mois && mois <= (s.fin ?? args.aujourdhui));

  const moisDus: string[] = [];
  for (let y = ya, m = ma; y < yn || (y === yn && m <= mn); [y, m] = moisSuivant(y, m)) {
    const mois = cle(y, m);
    if (!gele(mois)) moisDus.push(mois);
  }

  const totalVerse = args.versements.reduce((s, v) => s + v.montant, 0);
  const solde = totalVerse - moisDus.length * args.montantMensuel;
  const moisRetard = solde < 0 ? Math.ceil(-solde / args.montantMensuel) : 0;

  // Avance : mois couverts au-delà des mois dus, projetés sur les mois futurs.
  const moisCouverts = Math.floor(totalVerse / args.montantMensuel);
  let aJourJusqua: string | null = null;
  if (solde >= 0 && moisCouverts > moisDus.length) {
    let y = yn, m = mn;
    for (let i = moisDus.length; i < moisCouverts; i++) [y, m] = moisSuivant(y, m);
    aJourJusqua = cle(y, m);
  }

  return { moisDus, totalVerse, solde, moisRetard, aJour: solde >= 0, aJourJusqua };
}
