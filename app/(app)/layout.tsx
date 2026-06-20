import { supaServer } from '@/lib/supabase/server'
import BottomNav from '@/components/BottomNav'
import LoginBanner from '@/components/LoginBanner'

export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex justify-center min-h-dvh bg-bg">
      <div className="w-full max-w-[430px] relative min-h-dvh flex flex-col">
        <main className="flex-1 pb-24">
          {children}
        </main>
        <BottomNav />
        {!user && <LoginBanner />}
        {modal}
      </div>
    </div>
  )
}
