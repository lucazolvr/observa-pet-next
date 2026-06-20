'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

export default function PushToggle() {
  const { status, subscribe, unsubscribe } = usePushNotifications()

  if (status === 'unsupported' || status === 'loading') return null

  if (status === 'denied') {
    return (
      <span className="text-xs text-muted">
        Permissão negada
      </span>
    )
  }

  if (status === 'subscribed') {
    return (
      <button
        onClick={unsubscribe}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted px-3 py-1.5 rounded-chip bg-card border border-border"
      >
        <BellOff size={13} />
        Desativar
      </button>
    )
  }

  return (
    <button
      onClick={subscribe}
      className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-chip bg-blue"
    >
      <Bell size={13} />
      Ativar push
    </button>
  )
}
