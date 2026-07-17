"use server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { lireSession, type Session } from "@/lib/session";
import { creerUrlUploadPV, supprimerFichiersPV, EXTENSIONS_PV, TAILLE_MAX_PV } from "@/lib/pv";

async function exigerAdmin(): Promise<Session> {
  const s = await lireSession();
  if (!s?.isAdmin) throw new Error("Accès refusé");
  return s;
}

export async function creerMembre(
  _prev: { ok?: string; erreur?: string } | null,
  formData: FormData,
): Promise<{ ok?: string; erreur?: string } | null> {
  await exigerAdmin();
  const nom = String(formData.get("nom_complet")).trim();
  // Code laissé vide → généré automatiquement (6 chiffres), affiché au bureau après création
  const saisi = String(formData.get("code") ?? "").trim();
  const code = saisi || String(crypto.randomInt(100000, 999999));
  const { error } = await db.from("membres").insert({
    nom_complet: nom,
    telephone: String(formData.get("telephone") ?? "").trim() || null,
    date_adhesion: String(formData.get("date_adhesion")),
    is_admin: formData.get("is_admin") === "on",
    code_hash: await bcrypt.hash(code, 10),
  });
  if (error) return { erreur: error.message };
  revalidatePath("/admin/membres");
  return { ok: `${nom} créé — code personnel : ${code} (à lui transmettre en privé)` };
}

export async function modifierMembre(formData: FormData) {
  await exigerAdmin();
  await db.from("membres").update({
    nom_complet: String(formData.get("nom_complet")).trim(),
    telephone: String(formData.get("telephone") ?? "").trim() || null,
    date_adhesion: String(formData.get("date_adhesion")),
    is_admin: formData.get("is_admin") === "on",
    actif: formData.get("actif") === "on",
  }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/membres");
}

export async function definirCode(formData: FormData) {
  await exigerAdmin();
  await db.from("membres")
    .update({ code_hash: await bcrypt.hash(String(formData.get("code")), 10) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/membres");
}

export type CotisationState = { erreur?: string } | null;

export async function enregistrerCotisation(_prevState: CotisationState, formData: FormData): Promise<CotisationState> {
  await exigerAdmin();
  const mois = String(formData.get("mois")) + "-01"; // input type=month → "YYYY-MM"
  const { error } = await db.from("cotisations").insert({
    membre_id: String(formData.get("membre_id")),
    mois,
    montant: Number(formData.get("montant")),
    date_paiement: String(formData.get("date_paiement")),
    note: String(formData.get("note") ?? "").trim() || null,
  });
  if (error?.code === "23505") return { erreur: "Ce mois est déjà payé pour ce membre." };
  if (error) return { erreur: error.message };
  revalidatePath("/admin/cotisations");
  return null;
}

export async function supprimerCotisation(formData: FormData) {
  await exigerAdmin();
  await db.from("cotisations").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/cotisations");
}

export async function creerReunion(formData: FormData) {
  await exigerAdmin();
  await db.from("reunions").insert({
    date_reunion: new Date(String(formData.get("date_reunion"))).toISOString(),
    lieu: String(formData.get("lieu")).trim(),
    ordre_du_jour: String(formData.get("ordre_du_jour") ?? "").trim() || null,
  });
  revalidatePath("/admin/reunions");
}

export async function modifierReunion(formData: FormData) {
  await exigerAdmin();
  await db.from("reunions").update({
    date_reunion: new Date(String(formData.get("date_reunion"))).toISOString(),
    lieu: String(formData.get("lieu")).trim(),
    ordre_du_jour: String(formData.get("ordre_du_jour") ?? "").trim() || null,
  }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/reunions");
}

function revaliderPV() {
  revalidatePath("/admin/reunions");
  revalidatePath("/pv");
  revalidatePath("/");
}

export async function enregistrerTextePV(reunionId: string, texte: string): Promise<{ erreur?: string } | null> {
  await exigerAdmin();
  const { error } = await db.from("reunions")
    .update({ pv_texte: texte.trim() || null })
    .eq("id", reunionId);
  if (error) return { erreur: error.message };
  revaliderPV();
  return null;
}

// L'upload part directement du navigateur vers Supabase (URL signée) :
// le corps des requêtes Vercel est plafonné à ~4,5 Mo, trop peu pour une photo de PV.
export async function preparerUploadPV(reunionId: string, nomFichier: string, taille: number): Promise<{ url?: string; erreur?: string }> {
  await exigerAdmin();
  const ext = nomFichier.slice(nomFichier.lastIndexOf(".")).toLowerCase();
  if (!EXTENSIONS_PV.includes(ext))
    return { erreur: `Format non accepté (${ext}). Formats : PDF, Word, photo (JPG/PNG/HEIC).` };
  if (taille > TAILLE_MAX_PV) return { erreur: "Fichier trop lourd (maximum 10 Mo)." };
  // Un seul fichier par réunion : l'ancien est retiré avant l'envoi du nouveau
  await supprimerFichiersPV(reunionId);
  return creerUrlUploadPV(reunionId, nomFichier);
}

export async function retirerFichierPV(reunionId: string) {
  await exigerAdmin();
  await supprimerFichiersPV(reunionId);
  revaliderPV();
}

export async function supprimerReunion(formData: FormData) {
  await exigerAdmin();
  const id = String(formData.get("id"));
  await supprimerFichiersPV(id);
  await db.from("reunions").delete().eq("id", id);
  revaliderPV();
}

export async function majCaisse(formData: FormData) {
  const session = await exigerAdmin();
  const solde = Number(formData.get("solde"));
  const note = String(formData.get("note") ?? "").trim() || null;
  const maintenant = new Date().toISOString();

  const { error } = await db.from("caisse")
    .update({ solde, maj_le: maintenant, maj_par: session.membreId }).eq("id", 1);
  if (error) throw new Error(error.message);
  await db.from("caisse_historique").insert({ solde, maj_le: maintenant, maj_par: session.membreId, note });
  revalidatePath("/admin/caisse");
}

export async function majParametres(formData: FormData) {
  await exigerAdmin();
  await db.from("parametres").update({
    montant_mensuel: Number(formData.get("montant_mensuel")),
    devise: String(formData.get("devise")),
    nom_association: String(formData.get("nom_association")).trim(),
  }).eq("id", 1);
  revalidatePath("/admin/parametres");
}

export async function supprimerMembre(
  _prev: { erreur?: string } | null,
  formData: FormData,
): Promise<{ erreur?: string } | null> {
  const session = await exigerAdmin();
  const id = String(formData.get("id"));
  if (id === session.membreId)
    return { erreur: "Vous ne pouvez pas supprimer votre propre compte." };
  // Supprime aussi ses cotisations (cascade). Bloqué si le membre apparaît
  // dans l'historique de caisse (on ne réécrit pas l'historique).
  const { error } = await db.from("membres").delete().eq("id", id);
  if (error?.code === "23503")
    return { erreur: "Ce membre apparaît dans l'historique de caisse — désactivez-le plutôt (décocher « Actif »)." };
  if (error) return { erreur: error.message };
  revalidatePath("/admin/membres");
  return null;
}
