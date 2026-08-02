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

export type FeuilleState = { ok?: string; erreur?: string } | null;

// Feuille d'appel : présence + versement encaissé séance tenante, en une seule
// validation. Rejouable — réenregistrer la même feuille corrige, ne duplique pas.
export async function enregistrerFeuilleAppel(_prev: FeuilleState, formData: FormData): Promise<FeuilleState> {
  await exigerAdmin();
  const reunionId = String(formData.get("reunion_id"));
  const { data: reunion } = await db.from("reunions").select("date_reunion").eq("id", reunionId).single();
  if (!reunion) return { erreur: "Réunion introuvable." };
  // Le versement est daté du jour de la réunion, pas du jour de la saisie :
  // c'est ce qui le range dans le bon mois d'encaissement.
  const dateVersement = new Date(reunion.date_reunion).toISOString().slice(0, 10);

  const membreIds = String(formData.get("membre_ids") ?? "").split(",").filter(Boolean);
  if (membreIds.length === 0) return { erreur: "Aucun membre à appeler." };

  const presences: { reunion_id: string; membre_id: string; statut: string }[] = [];
  const versements: { membre_id: string; reunion_id: string; montant: number; date_paiement: string }[] = [];
  let nbPresents = 0;
  let totalEncaisse = 0;

  for (const id of membreIds) {
    const statut = String(formData.get(`statut_${id}`) ?? "");
    if (statut === "present" || statut === "absent" || statut === "excuse") {
      presences.push({ reunion_id: reunionId, membre_id: id, statut });
      if (statut === "present") nbPresents++;
    }
    const saisi = String(formData.get(`montant_${id}`) ?? "").trim();
    if (saisi === "") continue;
    const montant = Number(saisi);
    if (!Number.isFinite(montant)) return { erreur: "Un des montants saisis n'est pas un nombre." };
    if (montant === 0) continue;
    versements.push({ membre_id: id, reunion_id: reunionId, montant, date_paiement: dateVersement });
    totalEncaisse += Math.max(0, montant);
  }

  if (presences.length > 0) {
    const { error } = await db.from("presences").upsert(presences, { onConflict: "reunion_id,membre_id" });
    if (error) return { erreur: error.message };
  }

  // On efface uniquement ce que CETTE feuille avait déjà écrit (reunion_id posé) :
  // les versements saisis hors réunion n'ont pas de reunion_id et ne sont pas touchés.
  const { error: erreurPurge } = await db.from("cotisations")
    .delete().eq("reunion_id", reunionId).in("membre_id", membreIds);
  if (erreurPurge) return { erreur: erreurPurge.message };

  if (versements.length > 0) {
    const { error } = await db.from("cotisations").insert(versements);
    // La purge a déjà eu lieu : le bureau doit savoir que les montants sont à ressaisir.
    if (error) return { erreur: `Les montants n'ont pas été enregistrés, ressaisissez-les — ${error.message}` };
  }

  revalidatePath("/admin/reunions");
  revalidatePath("/admin/cotisations");
  revalidatePath("/cotisations");
  revalidatePath("/caisse");
  revalidatePath("/pv");
  revalidatePath("/");
  return { ok: `Feuille enregistrée — ${nbPresents} présent${nbPresents > 1 ? "s" : ""}, ${totalEncaisse.toLocaleString("fr-FR")} € encaissés ✓` };
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
