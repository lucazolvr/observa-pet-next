'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { supaBrowser } from '@/lib/supabase/client'

type Props = {
  initialUnread: number
  userId: string | null
}

export default function NotificationBell({ initialUnread, userId }: Props) {
  const [unread, setUnread] = useState(initialUnread)
  const supabase = supaBrowser()

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => setUnread(n => n + 1)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false)
          setUnread(count ?? 0)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, userId])

  return (
    <Link
      href="/notificacoes"
      className="relative w-10 h-10 flex items-center justify-center rounded-avatar bg-card shadow-soft"
      aria-label={`Notificações${unread > 0 ? ` (${unread} não lidas)` : ''}`}
    >
      <Bell size={20} className="text-body" />
      {unread > 0 && (
        <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-coral flex items-center justify-center">
          <span className="text-[9px] font-bold text-white px-0.5">
            {unread > 99 ? '99+' : unread}
          </span>
        </span>
      )}
    </Link>
  )
}
