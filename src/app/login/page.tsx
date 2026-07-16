import { db } from "@/lib/db";
import { LoginForm } from "./LoginForm";

// La liste des membres doit être lue à chaque visite (sinon la page est figée au build
// et les membres créés après coup n'apparaissent pas dans la liste de connexion).
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { data: membres } = await db.from("membres")
    .select("id, nom_complet").eq("actif", true).order("nom_complet");

  return (
    <main className="nf-radial-login relative flex min-h-dvh items-center justify-center p-5">
      <div className="nf-motif pointer-events-none fixed inset-0 opacity-5" />
      <LoginForm membres={membres ?? []} />
    </main>
  );
}
