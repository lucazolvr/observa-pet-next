'use client'

import { useRef, useState, useTransition } from 'react'
import { X, Camera } from 'lucide-react'
import Image from 'next/image'
import { updateProfile } from '@/actions/updateProfile'
import type { Profile } from '@/types'

const ROLE_LABEL: Record<string, string> = {
  tutor:      'Tutor',
  protetor:   'Protetor',
  voluntario: 'Voluntário',
  ong:        'ONG',
}

type Props = {
  profile: Profile
  onClose: () => void
}

export default function EditProfileSheet({ profile, onClose }: Props) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Foto deve ter no máximo 5 MB'); return }
    setAvatarPreview(URL.createObjectURL(file))
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    setError(null)
    startTransition(async () => {
      try {
        await updateProfile(fd)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    })
  }

  const avatarSrc = avatarPreview ?? profile.avatar_url
  const initials  = profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-bg rounded-t-sheet pb-[env(safe-area-inset-bottom)] animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="font-bold text-ink">Editar perfil</h2>
          <button onClick={onClose} className="text-muted p-1">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-5">
          {/* Avatar */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden bg-blue-soft ring-2 ring-border"
            >
              {avatarSrc ? (
                <Image src={avatarSrc} alt="Avatar" fill className="object-cover" />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-xl font-extrabold text-blue">
                  {initials}
                </span>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </div>
            </button>
            <input
              ref={fileRef}
              name="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Nome</label>
            <input
              name="name"
              defaultValue={profile.name}
              required
              maxLength={80}
              className="input"
              placeholder="Seu nome"
            />
          </div>

          {/* Papel (read-only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Papel</label>
            <p className="text-sm text-body px-3 py-2 bg-card rounded-card">
              {ROLE_LABEL[profile.role] ?? profile.role}
            </p>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wide">Bio</label>
            <textarea
              name="bio"
              defaultValue={profile.bio ?? ''}
              rows={3}
              maxLength={200}
              className="input resize-none"
              placeholder="Conte um pouco sobre você..."
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Botões */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-btn font-semibold text-sm text-body bg-card"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-btn font-semibold text-sm text-white bg-blue disabled:opacity-50"
            >
              {isPending ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
