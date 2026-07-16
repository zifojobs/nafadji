"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { creerSession, detruireSession } from "@/lib/session";

// Anti-bruteforce best-effort (mémoire d'instance) : 5 échecs → 15 min de blocage.
const echecs = new Map<string, { n: number; jusqua: number }>();

export async function login(formData: FormData): Promise<void> {
  const membreId = String(formData.get("membre_id") ?? "");
  const code = String(formData.get("code") ?? "");
  if (!membreId || !code) return;

  const bloc = echecs.get(membreId);
  if (bloc && bloc.n >= 5 && Date.now() < bloc.jusqua) return;

  const { data: membre } = await db.from("membres")
    .select("id, nom_complet, code_hash, is_admin, actif").eq("id", membreId).single();

  if (!membre || !membre.actif || !(await bcrypt.compare(code, membre.code_hash))) {
    const e = echecs.get(membreId) ?? { n: 0, jusqua: 0 };
    echecs.set(membreId, { n: e.n + 1, jusqua: Date.now() + 15 * 60 * 1000 });
    return;
  }

  echecs.delete(membreId);
  await creerSession({ membreId: membre.id, nom: membre.nom_complet, isAdmin: membre.is_admin });
  redirect("/");
}

export async function logout() {
  await detruireSession();
  redirect("/login");
}
