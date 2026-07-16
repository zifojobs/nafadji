import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gray-100">
      <header className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <span className="font-bold">Nafadji — Bureau</span>
        <Link href="/" className="text-sm underline">← Espace membre</Link>
      </header>
      <nav className="bg-white border-b p-2 flex gap-1 overflow-x-auto text-sm">
        {[["/admin/membres", "Membres"], ["/admin/cotisations", "Cotisations"], ["/admin/reunions", "Réunions & PV"], ["/admin/caisse", "Caisse"], ["/admin/parametres", "Paramètres"]].map(([href, label]) => (
          <Link key={href} href={href} className="px-3 py-2 rounded-lg hover:bg-gray-100 whitespace-nowrap">{label}</Link>
        ))}
      </nav>
      <main className="p-4 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
