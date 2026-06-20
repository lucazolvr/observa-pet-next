'use client'

import { useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, CheckCheck, MessageCircle, Heart, HelpingHand, Star } from 'lucide-react'
import { markAllRead } from '@/actions/markNotificationsRead'
import type { Notification } from '@/types'

const TYPE_ICON: Record<string, React.ElementType> = {
  comment:  MessageCircle,
  like:     Heart,
  help:     HelpingHand,
  mention:  Bell,
  system:   Star,
}

const TYPE_COLOR: Record<string, string> = {
  comment:  '#2a6af0',
  like:     '#ff6a55',
  help:     '#1faa67',
  mention:  '#d98a00',
  system:   '#7c5cfc',
}

function NotifIcon({ type }: { type: string }) {
  const Icon  = TYPE_ICON[type] ?? Bell
  const color = TYPE_COLOR[type] ?? '#36425a'
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      style={{ background: `${color}22` }}
    >
      <Icon size={16} style={{ color }} />
    </div>
  )
}

export default function NotificationList({ notifications }: { notifications: Notification[] }) {
  const [isPending, startTransition] = useTransition()
  const hasUnread = notifications.some(n => !n.read)

  function handleMarkAll() {
    startTransition(async () => { await markAllRead() })
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted">
        <Bell size={40} strokeWidth={1.5} />
        <p className="text-sm">Nenhuma notificação ainda</p>
      </div>
    )
  }

  return (
    <div>
      {/* Ação marcar tudo */}
      {hasUnread && (
        <div className="flex justify-end px-5 py-2">
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue disabled:opacity-50"
          >
            <CheckCheck size={14} />
            Marcar tudo como lido
          </button>
        </div>
      )}

      <div className="flex flex-col divide-y divide-border">
        {notifications.map(n => {
          const timeAgo = formatDistanceToNow(new Date(n.created_at), { locale: ptBR, addSuffix: true })
          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 px-5 py-4 transition-colors ${
                !n.read ? 'bg-blue-soft/20' : 'bg-bg'
              }`}
            >
              <NotifIcon type={n.type} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-ink' : 'text-body'}`}>
                  {n.text}
                </p>
                <p className="text-[11px] text-muted mt-1">{timeAgo}</p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-blue mt-1.5 shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
