'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Bookmark, MapPin, CheckCircle2, MoreHorizontal, Share2 } from 'lucide-react'
import ReportModal from '@/components/ReportModal'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supaBrowser } from '@/lib/supabase/client'
import { helpUrl } from '@/lib/whatsapp'
import { useToast } from '@/components/Toast'
import { logEvent } from '@/actions/logEvent'
import StatusBadge from '@/components/StatusBadge'
import PawMark from '@/components/PawMark'
import type { FeedPost } from '@/types'

const POST_TYPE_LABEL: Record<string, string> = {
  avistado:   'Avistado',
  resgate:    'Resgate',
  adocao:     'Para adoção',
  perdido:    'Perdido',
  tratamento: 'Em tratamento',
}

const SPECIES_LABEL: Record<string, string> = {
  cachorro: '🐕 Cachorro',
  gato:     '🐈 Gato',
  outro:    '🐾 Animal',
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function count(arr: { count: number }[] | undefined) {
  return arr?.[0]?.count ?? 0
}

type Props = {
  post: FeedPost
  userId: string | null
  initialLiked: boolean
  initialSaved: boolean
  initialHelped: boolean
}

export default function PostCard({ post, userId, initialLiked, initialSaved, initialHelped }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = supaBrowser()

  const [liked, setLiked] = useState(initialLiked)
  const [saved, setSaved] = useState(initialSaved)
  const [helped, setHelped] = useState(initialHelped)
  const [likeCount, setLikeCount] = useState(count(post.likes_count))
  const [helpCount, setHelpCount] = useState(count(post.helps_count))
  const [showReport, setShowReport] = useState(false)

  const pet = post.pet
  const author = post.author
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { locale: ptBR, addSuffix: true })

  async function toggleLike() {
    if (!userId) { router.push('/login'); return }
    const next = !liked
    setLiked(next)
    setLikeCount(c => c + (next ? 1 : -1))
    if (next) {
      await supabase.from('post_likes').upsert({ post_id: post.id, user_id: userId })
    } else {
      await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: userId })
    }
  }

  async function toggleSave() {
    if (!userId) { router.push('/login'); return }
    const next = !saved
    setSaved(next)
    if (next) {
      await supabase.from('post_saves').upsert({ post_id: post.id, user_id: userId })
    } else {
      await supabase.from('post_saves').delete().match({ post_id: post.id, user_id: userId })
    }
  }

  async function handleHelp() {
    if (!userId) { router.push('/login'); return }
    const url = helpUrl(pet.name, pet.neighborhood)
    window.open(url, '_blank', 'noopener,noreferrer')
    logEvent('help', post.id).catch(() => {})
    if (!helped) {
      setHelped(true)
      setHelpCount(c => c + 1)
      await supabase.from('post_helps').upsert({ post_id: post.id, user_id: userId })
    }
    showToast('Redirecionando para o WhatsApp 🐾')
  }

  function goToPetProfile() {
    router.push(`/pet/${pet.id}`)
  }

  async function handleShare() {
    const url = `${window.location.origin}/pet/${pet.id}`
    const text = `${pet.name ?? 'Animal'} precisa de ajuda em ${pet.neighborhood ?? 'São Luís'}! 🐾`
    const hasShare = 'share' in navigator
    logEvent('share', post.id, { method: hasShare ? 'native' : 'clipboard' }).catch(() => {})
    if (hasShare) {
      await navigator.share({ title: 'ObservaPet', text, url })
    } else {
      await navigator.clipboard.writeText(url)
      showToast('Link copiado!')
    }
  }

  return (
  <>
    <article className="bg-card rounded-card shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div
          className="w-10 h-10 rounded-avatar flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, #ff9a6b, #ff6a55)' }}
        >
          {getInitials(author.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[14.5px] font-bold text-ink truncate">{author.name}</span>
            {author.verified && (
              <CheckCircle2 size={13} className="text-blue shrink-0" />
            )}
          </div>
          <p className="text-[12px] text-muted">
            {POST_TYPE_LABEL[post.type] ?? post.type} · {timeAgo}
          </p>
        </div>
        <StatusBadge status={pet.status} />
        <button
          onClick={() => { if (!userId) { router.push('/login'); return }; setShowReport(true) }}
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted"
          aria-label="Mais opções"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <button
          onClick={goToPetProfile}
          className="w-full text-left px-4 pb-3 text-sm text-body leading-relaxed"
        >
          {post.caption}
        </button>
      )}

      {/* Photo */}
      <button onClick={goToPetProfile} className="w-full relative block">
        {post.photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.photos[0].url}
            alt={pet.name ?? 'Animal'}
            className="w-full h-56 object-cover"
          />
        ) : (
          <div
            className="w-full h-56 flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #e8f0ff 0%, #dce8ff 100%)' }}
          >
            <PawMark size={64} className="text-blue/20" />
          </div>
        )}

        {/* Location pin */}
        {(post.location_text || pet.neighborhood) && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-ink/70 backdrop-blur-sm rounded-[8px] px-2.5 py-1">
            <MapPin size={11} className="text-white/80" />
            <span className="text-white text-[11px] font-medium">
              {post.location_text ?? pet.neighborhood}
              {post.distance_text && ` · ${post.distance_text}`}
            </span>
          </div>
        )}

        {/* Species tag */}
        <div className="absolute top-3 right-3 bg-ink/70 backdrop-blur-sm rounded-[8px] px-2.5 py-1">
          <span className="text-white text-[11px] font-medium">
            {SPECIES_LABEL[pet.species]}
          </span>
        </div>

        {/* Ver perfil pill */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-blue text-[11px] font-bold">Ver perfil ›</span>
        </div>
      </button>

      {/* Counters */}
      <div className="px-4 py-2">
        <p className="text-[12.5px] text-muted">
          <span className="font-semibold text-body">{helpCount}</span> apoiam ·{' '}
          <span className="font-semibold text-body">{likeCount}</span> ajudando ·{' '}
          <span className="font-semibold text-body">{count(post.comments_count)}</span> comentários
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-3 pb-4 border-t border-border pt-3">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-chip text-sm font-semibold transition-colors ${
            liked ? 'text-coral' : 'text-muted'
          }`}
          aria-label="Curtir"
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        </button>

        <button
          onClick={goToPetProfile}
          className="flex items-center gap-1.5 px-3 py-2 rounded-chip text-sm font-semibold text-muted transition-colors"
          aria-label="Comentar"
        >
          <MessageCircle size={18} />
        </button>

        <button
          onClick={toggleSave}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-chip text-sm font-semibold transition-colors ${
            saved ? 'text-blue' : 'text-muted'
          }`}
          aria-label="Salvar"
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-chip text-sm font-semibold text-muted transition-colors"
          aria-label="Compartilhar"
        >
          <Share2 size={18} />
        </button>

        <div className="flex-1" />

        <button
          onClick={handleHelp}
          className="
            px-5 py-2.5 rounded-btn
            bg-blue text-white text-sm font-bold
            shadow-btn
            active:scale-[.97] transition-transform
          "
        >
          {helped ? 'Ajudando ✓' : 'Ajudar'}
        </button>
      </div>
    </article>

    {showReport && (
      <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
    )}
  </>
  )
}
