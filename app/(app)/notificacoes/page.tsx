import { redirect } from 'next/navigation'
import { supaServer } from '@/lib/supabase/server'
import { fetchNotifications } from '@/lib/notifications'
import NotificationList from '@/components/NotificationList'
import PushToggle from '@/components/PushToggle'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Notificações' }

export default async function NotificacoesPage() {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const notifications = await fetchNotifications(user.id)

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-ink">Notificações</h1>
        <PushToggle />
      </div>
      <NotificationList notifications={notifications} />
    </div>
  )
}
