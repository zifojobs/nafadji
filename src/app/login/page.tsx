import { db } from "@/lib/db";
import { login } from "./actions";

export default async function LoginPage() {
  const { data: membres } = await db.from("membres")
    .select("id, nom_complet").eq("actif", true).order("nom_complet");

  return (
    <main className="min-h-dvh flex items-center justify-center bg-emerald-950 p-4">
      <form action={login} className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-xl">
        <h1 className="text-xl font-bold text-emerald-950">Association Nafadji</h1>
        <p className="text-sm text-gray-600">Choisissez votre nom puis saisissez votre code personnel.</p>
        <select name="membre_id" required className="w-full border rounded-lg p-3 text-base">
          <option value="">— Votre nom —</option>
          {(membres ?? []).map((m) => <option key={m.id} value={m.id}>{m.nom_complet}</option>)}
        </select>
        <input name="code" type="password" inputMode="numeric" required placeholder="Code personnel"
          className="w-full border rounded-lg p-3 text-base" />
        <button className="w-full bg-emerald-700 text-white rounded-lg p-3 font-semibold">Se connecter</button>
      </form>
    </main>
  );
}
