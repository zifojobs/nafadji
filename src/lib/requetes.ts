import { db } from "@/lib/db";
import { calculerEtat, type EtatCotisations } from "@/lib/cotisations";
import { getFichierPV, getIdsAvecFichierPV, getUrlFichierPV } from "@/lib/pv";
import { grouperPresences, type GroupesPresence } from "@/lib/presences";

export async function getParametres() {
  const { data } = await db.from("parametres").select("*").eq("id", 1).single();
  return data!;
}

export async function getEtatMembre(membreId: string): Promise<EtatCotisations & { versements: { montant: number; date_paiement: string; note: string | null }[] }> {
  const [{ data: membre }, { data: versements }, { data: suspensions }, parametres] = await Promise.all([
    db.from("membres").select("date_adhesion, exempte_cotisation").eq("id", membreId).single(),
    db.from("cotisations").select("montant, date_paiement, note").eq("membre_id", membreId).order("date_paiement", { ascending: false }),
    db.from("suspensions").select("debut, fin").eq("membre_id", membreId),
    getParametres(),
  ]);
  const etat = calculerEtat({
    dateAdhesion: membre!.date_adhesion,
    versements: (versements ?? []).map((v) => ({ montant: Number(v.montant) })),
    suspensions: suspensions ?? [],
    // Membre d'honneur : ne cotise pas, jamais de dette calculée pour lui.
    montantMensuel: membre!.exempte_cotisation ? 0 : Number(parametres.montant_mensuel),
    aujourdhui: new Date().toISOString().slice(0, 10),
  });
  return { ...etat, versements: versements ?? [] };
}

// Total des cotisations réellement encaissées ce mois-ci (les dettes saisies
// en négatif n'en font pas partie : ce n'est pas de l'argent reçu).
export async function getEncaisseDuMois() {
  const debutMois = `${new Date().toISOString().slice(0, 7)}-01`;
  const { data } = await db.from("cotisations").select("montant").gte("date_paiement", debutMois);
  return (data ?? []).reduce((s, v) => s + Math.max(0, Number(v.montant)), 0);
}

// Prix de l'application convenu le 22/07/2026 : l'objectif de la collecte « Achat appli ».
export const OBJECTIF_ACHAT_APPLI = 500;

// Total collecté pour l'achat de l'appli, sur l'accueil membre.
export async function getTotalAchatAppli() {
  const { data } = await db.from("contributions_achat").select("montant");
  return (data ?? []).reduce((s, c) => s + Number(c.montant), 0);
}

// Noms de ceux qui ont participé à l'achat de l'appli (demande de Bangaly, 06/10) :
// les noms seulement, jamais les montants individuels.
export async function getParticipantsAchatAppli() {
  const [{ data: contributions }, { data: membres }] = await Promise.all([
    db.from("contributions_achat").select("membre_id"),
    db.from("membres").select("id, nom_complet"),
  ]);
  const ids = new Set((contributions ?? []).map((c) => c.membre_id));
  return (membres ?? [])
    .filter((m) => ids.has(m.id))
    .map((m) => m.nom_complet)
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
}

// Historique des encaissements, mois par mois, du plus récent au plus ancien.
// Même règle que getEncaisseDuMois : les dettes saisies en négatif ne sont pas
// de l'argent reçu, elles ne comptent ni dans un mois ni dans le total.
export async function getEncaissementsParMois() {
  const { data } = await db.from("cotisations").select("montant, date_paiement");
  const parMois = new Map<string, { total: number; nb: number }>();
  let total = 0;
  for (const v of data ?? []) {
    const montant = Number(v.montant);
    if (montant <= 0) continue;
    const mois = String(v.date_paiement).slice(0, 7);
    const ligne = parMois.get(mois) ?? { total: 0, nb: 0 };
    parMois.set(mois, { total: ligne.total + montant, nb: ligne.nb + 1 });
    total += montant;
  }
  return {
    mois: [...parMois.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([mois, l]) => ({ mois, ...l })),
    total,
  };
}

// Tout ce qu'il faut pour afficher les feuilles d'appel : les membres à appeler
// et ce qui a déjà été saisi, toutes réunions confondues (l'appel est rejouable).
export async function getDonneesFeuillesAppel() {
  const [{ data: membres }, { data: presences }, { data: versements }] = await Promise.all([
    db.from("membres").select("id, nom_complet, exempte_cotisation").eq("actif", true),
    db.from("presences").select("reunion_id, membre_id, statut"),
    db.from("cotisations").select("reunion_id, membre_id, montant").not("reunion_id", "is", null),
  ]);
  return {
    membres: [...(membres ?? [])].sort((a, b) =>
      a.nom_complet.localeCompare(b.nom_complet, "fr", { sensitivity: "base" }),
    ),
    presences: presences ?? [],
    versements: versements ?? [],
  };
}

// Présents / excusés / absents de chaque réunion, prêts à afficher.
// Les membres suspendus sont inclus : ils ont pu assister à une réunion passée.
export async function getPresencesParReunion(): Promise<Map<string, GroupesPresence>> {
  const [{ data: presences }, { data: membres }] = await Promise.all([
    db.from("presences").select("reunion_id, membre_id, statut"),
    db.from("membres").select("id, nom_complet"),
  ]);
  const nomParId = new Map((membres ?? []).map((m) => [m.id, m.nom_complet]));
  const parReunion = new Map<string, { membre_id: string; statut: string }[]>();
  for (const p of presences ?? []) {
    const lignes = parReunion.get(p.reunion_id) ?? [];
    lignes.push({ membre_id: p.membre_id, statut: p.statut });
    parReunion.set(p.reunion_id, lignes);
  }
  return new Map([...parReunion].map(([id, lignes]) => [id, grouperPresences(lignes, nomParId)]));
}

export async function getProchaineReunion() {
  const { data } = await db.from("reunions").select("*")
    .gte("date_reunion", new Date().toISOString()).order("date_reunion").limit(1);
  return data?.[0] ?? null;
}

export async function getDernierPV() {
  const pvs = await getPVs();
  return pvs[0] ?? null;
}

export async function getCaisse() {
  const { data } = await db.from("caisse").select("*").eq("id", 1).single();
  return data!;
}

export async function getReunions() {
  const { data } = await db.from("reunions").select("*").order("date_reunion", { ascending: false });
  return data ?? [];
}

// Un PV existe s'il a du texte OU un fichier joint (bucket "pv")
export async function getPVs() {
  const [{ data }, idsAvecFichier] = await Promise.all([
    db.from("reunions").select("id, date_reunion, lieu, pv_texte").order("date_reunion", { ascending: false }),
    getIdsAvecFichierPV(),
  ]);
  const avecPV = (data ?? []).filter((r) => r.pv_texte || idsAvecFichier.has(r.id));
  return Promise.all(
    avecPV.map(async (r) => {
      if (!idsAvecFichier.has(r.id)) return { ...r, fichier: null };
      const f = await getFichierPV(r.id);
      return { ...r, fichier: f ? { nom: f.nom, url: await getUrlFichierPV(f.chemin) } : null };
    }),
  );
}

// Journal des dons et dépenses + total des sorties par année (transparence).
export async function getMouvements() {
  const { data } = await db.from("mouvements").select("*").order("date_mouvement", { ascending: false });
  const mouvements = data ?? [];
  const totaux = new Map<string, number>();
  for (const m of mouvements) {
    const annee = String(m.date_mouvement).slice(0, 4);
    totaux.set(annee, (totaux.get(annee) ?? 0) + Number(m.montant));
  }
  return {
    mouvements,
    totauxParAnnee: [...totaux.entries()].sort((a, b) => b[0].localeCompare(a[0])),
  };
}
