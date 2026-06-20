'use client'

import { useRouter } from 'next/navigation'

export default function PetProfileBackdrop() {
  const router = useRouter()
  return (
    <div
      className="fixed inset-0 z-40 animate-fade-in"
      style={{ background: 'rgba(11,18,32,.4)' }}
      onClick={() => router.back()}
      aria-hidden="true"
    />
  )
}
