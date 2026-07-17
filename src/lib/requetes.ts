import { db } from "@/lib/db";
import { calculerEtat, type EtatCotisations } from "@/lib/cotisations";
import { getFichierPV, getIdsAvecFichierPV, getUrlFichierPV } from "@/lib/pv";

export async function getParametres() {
  const { data } = await db.from("parametres").select("*").eq("id", 1).single();
  return data!;
}

export async function getEtatMembre(membreId: string): Promise<EtatCotisations & { paiements: { mois: string; montant: number; date_paiement: string }[] }> {
  const [{ data: membre }, { data: paiements }, parametres] = await Promise.all([
    db.from("membres").select("date_adhesion").eq("id", membreId).single(),
    db.from("cotisations").select("mois, montant, date_paiement").eq("membre_id", membreId).order("mois"),
    getParametres(),
  ]);
  const etat = calculerEtat({
    dateAdhesion: membre!.date_adhesion,
    paiements: (paiements ?? []).map((p) => ({ mois: p.mois, montant: Number(p.montant) })),
    montantMensuel: Number(parametres.montant_mensuel),
    aujourdhui: new Date().toISOString().slice(0, 10),
  });
  return { ...etat, paiements: paiements ?? [] };
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
