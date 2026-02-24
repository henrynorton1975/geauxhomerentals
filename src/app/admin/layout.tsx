import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-[#1a1a2e] text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold" style={{ color: "#D4A843" }}>
              Geaux Admin
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="text-gray-300 hover:text-white">Dashboard</Link>
              <Link href="/admin/listings" className="text-gray-300 hover:text-white">Listings</Link>
              <Link href="/admin/applications" className="text-gray-300 hover:text-white">Applications</Link>
            </nav>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            View Public Site →
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
