'use client'

import { useEffect, useState } from 'react'

export type PushStatus = 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed' | 'loading'

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setStatus(sub ? 'subscribed' : 'unsubscribed')
      })
    })
  }, [])

  async function subscribe() {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return
    setStatus('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      })
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subscribe', subscription: sub.toJSON() }),
      })
      setStatus('subscribed')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setStatus(msg.includes('denied') ? 'denied' : 'unsubscribed')
    }
  }

  async function unsubscribe() {
    setStatus('loading')
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsubscribe', subscription: sub.toJSON() }),
      })
      await sub.unsubscribe()
    }
    setStatus('unsubscribed')
  }

  return { status, subscribe, unsubscribe }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}
