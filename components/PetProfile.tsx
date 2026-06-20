'use client'

import { CheckCircle2, Star, MessageCircle, Phone } from 'lucide-react'
import { supaBrowser } from '@/lib/supabase/client'
import { helpUrl } from '@/lib/whatsapp'
import { useToast } from '@/components/Toast'
import PetCarousel from '@/components/PetCarousel'
import CommentList from '@/components/CommentList'
import type { PetWithPosts, Comment } from '@/types'

const ROLE_LABEL: Record<string, string> = {
  tutor:      'Tutor',
  protetor:   'Protetor',
  voluntario: 'Voluntário',
  ong:        'ONG',
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function count(arr: { count: number }[] | undefined) {
  return arr?.[0]?.count ?? 0
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[16px] font-extrabold text-ink mb-3">{children}</h2>
}

type Props = {
  pet: PetWithPosts
  latestPost: PetWithPosts['posts'][0] | null
  initialComments: Comment[]
  userId: string | null
  isModal: boolean
}

export default function PetProfile({ pet, latestPost, initialComments, userId, isModal }: Props) {
  const { showToast } = useToast()
  const supabase = supaBrowser()

  const photos = latestPost?.photos ?? []
  const responsible = pet.ong ?? pet.creator
  const whatsappNumber = process.env.NEXT_PUBLIC_OBSERVAPET_WHATSAPP

  function openWhatsApp() {
    window.open(helpUrl(pet.name, pet.neighborhood), '_blank', 'noopener,noreferrer')
  }

  async function handleHelp() {
    openWhatsApp()
    if (userId && latestPost) {
      await supabase.from('post_helps').upsert({ post_id: latestPost.id, user_id: userId })
      showToast('Redirecionando para o WhatsApp 🐾')
    }
  }

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Carousel */}
      <PetCarousel photos={photos} status={pet.status} isModal={isModal} />

      {/* Main info */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h1 className="text-[27px] font-extrabold text-ink tracking-tight leading-tight">
            {pet.name ?? 'Animal sem nome'}
          </h1>
          {pet.rating && (
            <div className="flex items-center gap-1 bg-amber/10 px-2.5 py-1 rounded-full shrink-0">
              <Star size={13} className="text-amber fill-amber" />
              <span className="text-[13px] font-bold text-amber">{Number(pet.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Info chips */}
        {(pet.breed || pet.age_text || pet.gender || pet.neighborhood) && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {pet.breed && <Chip>{pet.breed}</Chip>}
            {pet.age_text && <Chip>{pet.age_text}</Chip>}
            {pet.gender && <Chip>{pet.gender}</Chip>}
            {pet.neighborhood && <Chip>{pet.neighborhood}</Chip>}
          </div>
        )}
      </div>

      {/* Responsible */}
      {responsible && (
        <div className="px-5 pb-5 flex items-center gap-3 border-b border-border">
          <div
            className="w-10 h-10 rounded-avatar flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff9a6b, #ff6a55)' }}
          >
            {getInitials(responsible.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-ink truncate">{responsible.name}</span>
              {responsible.verified && (
                <CheckCircle2 size={13} className="text-blue shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted">
              {pet.ong ? 'ONG' : pet.creator ? (ROLE_LABEL[pet.creator.role] ?? pet.creator.role) : ''}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={openWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-btn bg-blue-soft text-blue text-[13px] font-bold"
              aria-label="Mensagem"
            >
              <MessageCircle size={15} />
              <span>Msg</span>
            </button>
            <a
              href={`tel:${whatsappNumber}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-btn bg-green/10 text-green text-[13px] font-bold"
              aria-label="Ligar"
            >
              <Phone size={15} />
              <span>Ligar</span>
            </a>
          </div>
        </div>
      )}

      {/* Content sections */}
      <div className="flex flex-col gap-6 px-5 pt-5">
        {pet.traits && pet.traits.length > 0 && (
          <section>
            <SectionTitle>Características</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {pet.traits.map(t => <Chip key={t}>{t}</Chip>)}
            </div>
          </section>
        )}

        {pet.overview && (
          <section>
            <SectionTitle>Sobre</SectionTitle>
            <p className="text-sm text-body leading-relaxed">{pet.overview}</p>
          </section>
        )}

        {pet.personality && (
          <section>
            <SectionTitle>Personalidade</SectionTitle>
            <p className="text-sm text-body leading-relaxed">{pet.personality}</p>
          </section>
        )}
      </div>

      {/* Comments */}
      <div className="mt-6 border-t border-border pt-5">
        <CommentList
          postId={latestPost?.id ?? ''}
          petId={pet.id}
          initialComments={initialComments}
          userId={userId}
        />
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-[430px] flex gap-3 px-5 py-3 bg-card border-t border-border pb-safe">
          <button
            onClick={openWhatsApp}
            className="flex-1 py-3 rounded-btn border-2 border-blue text-blue text-sm font-bold active:scale-[.97] transition-transform"
          >
            Mensagem
          </button>
          <button
            onClick={handleHelp}
            className="flex-1 py-3 rounded-btn bg-blue text-white text-sm font-bold shadow-btn active:scale-[.97] transition-transform"
          >
            Quero ajudar
          </button>
        </div>
      </div>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-blue-soft text-blue text-[12px] font-semibold rounded-chip px-3 py-1 whitespace-nowrap">
      {children}
    </span>
  )
}
