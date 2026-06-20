import BottomNav from '@/components/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center min-h-dvh bg-bg">
      <div className="w-full max-w-[430px] relative min-h-dvh flex flex-col">
        <main className="flex-1 pb-24">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
