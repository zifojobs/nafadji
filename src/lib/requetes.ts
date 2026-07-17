import { db } from "@/lib/db";
import { calculerEtat, type EtatCotisations } from "@/lib/cotisations";
import { getFichierPV, getIdsAvecFichierPV, getUrlFichierPV } from "@/lib/pv";

export async function getParametres() {
  const { data } = await db.from("parametres").select("*").eq("id", 1).single();
  return data!;
}

export async function getEtatMembre(membreId: string): Promise<EtatCotisations & { versements: { montant: number; date_paiement: string; note: string | null }[] }> {
  const [{ data: membre }, { data: versements }, { data: suspensions }, parametres] = await Promise.all([
    db.from("membres").select("date_adhesion").eq("id", membreId).single(),
    db.from("cotisations").select("montant, date_paiement, note").eq("membre_id", membreId).order("date_paiement", { ascending: false }),
    db.from("suspensions").select("debut, fin").eq("membre_id", membreId),
    getParametres(),
  ]);
  const etat = calculerEtat({
    dateAdhesion: membre!.date_adhesion,
    versements: (versements ?? []).map((v) => ({ montant: Number(v.montant) })),
    suspensions: suspensions ?? [],
    montantMensuel: Number(parametres.montant_mensuel),
    aujourdhui: new Date().toISOString().slice(0, 10),
  });
  return { ...etat, versements: versements ?? [] };
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
