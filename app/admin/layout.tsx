import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f8f9fc]">
      {/* Topbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-5 py-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-blue flex items-center justify-center shrink-0">
          <Shield size={15} className="text-white" />
        </div>
        <h1 className="font-extrabold text-ink text-[16px]">ObservaPet Admin</h1>
        <Link href="/" className="ml-auto text-xs text-muted font-semibold hover:text-blue">
          ← App
        </Link>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
