import { db } from "@/lib/db";

// Fichiers PV : bucket privé "pv", un seul fichier par réunion sous `{reunion_id}/{nom}`.
// Pas de colonne en base : la présence du fichier EST la source de vérité.
const BUCKET = "pv";

export const EXTENSIONS_PV = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp", ".heic"];
export const TAILLE_MAX_PV = 10 * 1024 * 1024; // 10 Mo (aussi appliqué par le bucket)

export function nettoyerNomFichier(nom: string) {
  return nom.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "_");
}

export async function getFichierPV(reunionId: string) {
  const { data } = await db.storage.from(BUCKET).list(reunionId);
  const f = (data ?? []).find((e) => !e.name.startsWith("."));
  return f ? { nom: f.name, chemin: `${reunionId}/${f.name}` } : null;
}

export async function getUrlFichierPV(chemin: string) {
  const { data } = await db.storage.from(BUCKET).createSignedUrl(chemin, 3600);
  return data?.signedUrl ?? null;
}

/** ids des réunions ayant un fichier PV (les "dossiers" à la racine du bucket) */
export async function getIdsAvecFichierPV(): Promise<Set<string>> {
  const { data } = await db.storage.from(BUCKET).list("", { limit: 500 });
  return new Set((data ?? []).map((e) => e.name));
}

export async function supprimerFichiersPV(reunionId: string) {
  const { data } = await db.storage.from(BUCKET).list(reunionId);
  if (data?.length) {
    await db.storage.from(BUCKET).remove(data.map((f) => `${reunionId}/${f.name}`));
  }
}

/** Prépare un upload direct navigateur → Supabase (contourne la limite de corps de requête Vercel) */
export async function creerUrlUploadPV(reunionId: string, nomFichier: string) {
  const chemin = `${reunionId}/${nettoyerNomFichier(nomFichier)}`;
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(chemin);
  if (error) return { erreur: error.message };
  return { url: data.signedUrl };
}
