// scripts/seed-admin.mjs — usage : node scripts/seed-admin.mjs "Nom Complet" 1234 [--admin]
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
config({ path: ".env.local" });

const [nom, code] = process.argv.slice(2);
const isAdmin = process.argv.includes("--admin");
if (!nom || !code) { console.error('usage : node scripts/seed-admin.mjs "Nom" code [--admin]'); process.exit(1); }

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const { error } = await db.from("membres").insert({
  nom_complet: nom, code_hash: bcrypt.hashSync(code, 10), is_admin: isAdmin, date_adhesion: new Date().toISOString().slice(0, 10),
});
console.log(error ? `Erreur : ${error.message}` : `✅ ${nom} créé (${isAdmin ? "bureau" : "membre"})`);
