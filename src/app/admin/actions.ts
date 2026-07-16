"use server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { lireSession, type Session } from "@/lib/session";

async function exigerAdmin(): Promise<Session> {
  const s = await lireSession();
  if (!s?.isAdmin) throw new Error("Accès refusé");
  return s;
}

export async function creerMembre(formData: FormData) {
  await exigerAdmin();
  const code = String(formData.get("code"));
  await db.from("membres").insert({
    nom_complet: String(formData.get("nom_complet")).trim(),
    telephone: String(formData.get("telephone") ?? "").trim() || null,
    date_adhesion: String(formData.get("date_adhesion")),
    is_admin: formData.get("is_admin") === "on",
    code_hash: await bcrypt.hash(code, 10),
  });
  revalidatePath("/admin/membres");
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

export async function enregistrerCotisation(formData: FormData) {
  await exigerAdmin();
  const mois = String(formData.get("mois")) + "-01"; // input type=month → "YYYY-MM"
  const { error } = await db.from("cotisations").insert({
    membre_id: String(formData.get("membre_id")),
    mois,
    montant: Number(formData.get("montant")),
    date_paiement: String(formData.get("date_paiement")),
    note: String(formData.get("note") ?? "").trim() || null,
  });
  if (error?.code === "23505") throw new Error("Ce mois est déjà payé pour ce membre.");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cotisations");
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

export async function redigerPV(formData: FormData) {
  await exigerAdmin();
  await db.from("reunions")
    .update({ pv_texte: String(formData.get("pv_texte")).trim() || null })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/reunions");
}

export async function supprimerReunion(formData: FormData) {
  await exigerAdmin();
  await db.from("reunions").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/reunions");
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
