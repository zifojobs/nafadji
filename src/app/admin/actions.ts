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
  const { data: membre } = await db.from("membres").select("actif").eq("id", s.membreId).single();
  if (!membre?.actif) throw new Error("Accès refusé");
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
    exempte_cotisation: formData.get("exempte_cotisation") === "on",
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
    exempte_cotisation: formData.get("exempte_cotisation") === "on",
  }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/membres");
}

export async function definirCode(
  _prev: { ok?: string; erreur?: string } | null,
  formData: FormData,
): Promise<{ ok?: string; erreur?: string } | null> {
  await exigerAdmin();
  // Code laissé vide → généré automatiquement (6 chiffres), affiché au bureau après réinitialisation.
  const saisi = String(formData.get("code") ?? "").trim();
  const code = saisi || String(crypto.randomInt(100000, 999999));
  const { error } = await db.from("membres")
    .update({ code_hash: await bcrypt.hash(code, 10) })
    .eq("id", String(formData.get("id")));
  if (error) return { erreur: error.message };
  revalidatePath("/admin/membres");
  return { ok: `Nouveau code : ${code} (à transmettre en privé)` };
}

export type CotisationState = { erreur?: string } | null;

export async function enregistrerVersement(_prevState: CotisationState, formData: FormData): Promise<CotisationState> {
  await exigerAdmin();
  const montant = Number(formData.get("montant"));
  // Négatif accepté : sert à saisir une dette (ex. arriéré antérieur à l'appli).
  if (!Number.isFinite(montant) || montant === 0) return { erreur: "Le montant ne peut pas être nul." };
  const { error } = await db.from("cotisations").insert({
    membre_id: String(formData.get("membre_id")),
    montant,
    date_paiement: String(formData.get("date_paiement")),
    note: String(formData.get("note") ?? "").trim() || null,
  });
  if (error) return { erreur: error.message };
  revalidatePath("/admin/cotisations");
  revalidatePath("/cotisations");
  revalidatePath("/");
  return null;
}

export async function supprimerCotisation(formData: FormData) {
  await exigerAdmin();
  await db.from("cotisations").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/cotisations");
  revalidatePath("/cotisations");
  revalidatePath("/");
}

export async function creerReunion(formData: FormData) {
  await exigerAdmin();
  await db.from("reunions").insert({
    date_reunion: new Date(String(formData.get("date_reunion"))).toISOString(),
    lieu: String(formData.get("lieu")).trim(),
    adresse: String(formData.get("adresse") ?? "").trim() || null,
    ordre_du_jour: String(formData.get("ordre_du_jour") ?? "").trim() || null,
  });
  revalidatePath("/admin/reunions");
  revalidatePath("/reunions");
  revalidatePath("/");
}

export async function modifierReunion(formData: FormData) {
  await exigerAdmin();
  await db.from("reunions").update({
    date_reunion: new Date(String(formData.get("date_reunion"))).toISOString(),
    lieu: String(formData.get("lieu")).trim(),
    adresse: String(formData.get("adresse") ?? "").trim() || null,
    ordre_du_jour: String(formData.get("ordre_du_jour") ?? "").trim() || null,
  }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/reunions");
  revalidatePath("/reunions");
  revalidatePath("/");
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

export type CaisseState = { ok?: string; erreur?: string } | null;

export async function majCaisse(_prev: CaisseState, formData: FormData): Promise<CaisseState> {
  const session = await exigerAdmin();
  const solde = Number(formData.get("solde"));
  if (!Number.isFinite(solde)) return { erreur: "Montant invalide." };
  const note = String(formData.get("note") ?? "").trim() || null;
  const maintenant = new Date().toISOString();

  const { error } = await db.from("caisse")
    .update({ solde, maj_le: maintenant, maj_par: session.membreId }).eq("id", 1);
  if (error) return { erreur: error.message };
  await db.from("caisse_historique").insert({ solde, maj_le: maintenant, maj_par: session.membreId, note });
  revalidatePath("/admin/caisse");
  revalidatePath("/caisse");
  revalidatePath("/");
  return { ok: `Montant enregistré : ${solde.toLocaleString("fr-FR")} € ✓` };
}

export async function ajouterMouvement(formData: FormData) {
  const session = await exigerAdmin();
  await db.from("mouvements").insert({
    type: String(formData.get("type")),
    libelle: String(formData.get("libelle")).trim(),
    montant: Number(formData.get("montant")),
    date_mouvement: String(formData.get("date_mouvement")),
    cree_par: session.membreId,
  });
  revalidatePath("/admin/caisse");
  revalidatePath("/caisse");
}

export async function supprimerMouvement(formData: FormData) {
  await exigerAdmin();
  await db.from("mouvements").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/caisse");
  revalidatePath("/caisse");
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
    return { erreur: "Ce membre apparaît dans l'historique de caisse — suspendez-le plutôt." };
  if (error) return { erreur: error.message };
  revalidatePath("/admin/membres");
  return null;
}

export async function suspendreMembre(
  _prev: { erreur?: string } | null,
  formData: FormData,
): Promise<{ erreur?: string } | null> {
  const session = await exigerAdmin();
  const id = String(formData.get("id"));
  if (id === session.membreId)
    return { erreur: "Vous ne pouvez pas suspendre votre propre compte." };
  // La période de suspension gèle la dette ; actif=false coupe l'accès à l'appli.
  const { error } = await db.from("suspensions").insert({ membre_id: id, cree_par: session.membreId });
  if (error) return { erreur: error.message };
  await db.from("membres").update({ actif: false }).eq("id", id);
  revalidatePath("/admin/membres");
  return null;
}

export async function reactiverMembre(formData: FormData) {
  await exigerAdmin();
  const id = String(formData.get("id"));
  await db.from("suspensions").update({ fin: new Date().toISOString().slice(0, 10) })
    .eq("membre_id", id).is("fin", null);
  await db.from("membres").update({ actif: true }).eq("id", id);
  revalidatePath("/admin/membres");
}
