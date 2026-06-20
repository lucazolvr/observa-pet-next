'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { BadgeCheck, Pencil, LogOut } from 'lucide-react'
import EditProfileSheet from '@/components/EditProfileSheet'
import UserPostGrid from '@/components/UserPostGrid'
import { supaBrowser } from '@/lib/supabase/client'
import type { Profile, UserPostItem } from '@/types'

const ROLE_LABEL: Record<string, string> = {
  tutor:      'Tutor',
  protetor:   'Protetor',
  voluntario: 'Voluntário',
  ong:        'ONG',
}

type Props = {
  profile: Profile
  posts: UserPostItem[]
}

export default function PerfilView({ profile, posts }: Props) {
  const [editing, setEditing] = useState(false)
  const router = useRouter()
  const supabase = supaBrowser()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          {/* Avatar */}
          <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-blue-soft ring-2 ring-border shrink-0">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-xl font-extrabold text-blue">
                {initials}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg font-extrabold text-ink leading-tight">{profile.name}</h1>
              {profile.verified && (
                <BadgeCheck size={18} className="text-blue shrink-0" />
              )}
            </div>
            <span className="text-xs font-semibold text-blue bg-blue-soft px-2 py-0.5 rounded-chip mt-1 inline-block">
              {ROLE_LABEL[profile.role] ?? profile.role}
            </span>
            {profile.bio && (
              <p className="text-sm text-body mt-2 leading-snug">{profile.bio}</p>
            )}
            {!profile.bio && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-muted mt-1"
              >
                + Adicionar bio
              </button>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-btn bg-card border border-border text-sm font-semibold text-ink"
          >
            <Pencil size={15} />
            Editar perfil
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-btn bg-card border border-border text-sm font-semibold text-coral"
            aria-label="Sair"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Divider + contagem */}
      <div className="px-5 pb-3 border-b border-border flex items-center gap-1">
        <span className="font-bold text-ink">{posts.length}</span>
        <span className="text-sm text-muted">publicação{posts.length !== 1 ? 'ões' : ''}</span>
      </div>

      {/* Grid */}
      <div className="mt-3">
        <UserPostGrid posts={posts} />
      </div>

      {/* Edit sheet */}
      {editing && (
        <EditProfileSheet profile={profile} onClose={() => setEditing(false)} />
      )}
    </div>
  )
}
