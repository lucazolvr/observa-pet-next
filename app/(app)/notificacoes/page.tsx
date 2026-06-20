import { redirect } from 'next/navigation'
import { supaServer } from '@/lib/supabase/server'
import { fetchNotifications } from '@/lib/notifications'
import NotificationList from '@/components/NotificationList'

export const dynamic = 'force-dynamic'

export default async function NotificacoesPage() {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const notifications = await fetchNotifications(user.id)

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="px-5 pt-5 pb-3 border-b border-border">
        <h1 className="text-[22px] font-extrabold text-ink">Notificações</h1>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  )
}
