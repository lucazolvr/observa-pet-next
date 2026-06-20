import webpush from 'web-push'

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:lucazolvr@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export { webpush }

export async function sendPushToUser(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string }
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  } catch (err) {
    console.error('[webpush] send failed', err)
  }
}
