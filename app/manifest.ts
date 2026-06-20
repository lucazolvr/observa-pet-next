import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ObservaPet',
    short_name: 'ObservaPet',
    description: 'Rede social para animais em situação de rua em São Luís, MA',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f7fb',
    theme_color: '#2a6af0',
    orientation: 'portrait',
    categories: ['social', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    ],
  }
}
