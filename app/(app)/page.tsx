import { Bell, SlidersHorizontal, MapPin, AlertTriangle } from 'lucide-react'
import { supaServer } from '@/lib/supabase/server'
import PostCard from '@/components/PostCard'
import FeedFilters from '@/components/FeedFilters'
import type { FeedPost } from '@/types'
import type { PostType } from '@/types'

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const FILTER_MAP: Record<string, PostType> = {
  avistado:   'avistado',
  adocao:     'adocao',
  resgate:    'resgate',
  tratamento: 'tratamento',
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const supabase = await supaServer()

  const { data: { user } } = await supabase.auth.getUser()

  // Build feed query
  let query = supabase
    .from('posts')
    .select(`
      *,
      pet:pets(*),
      photos:post_photos(url, position),
      author:profiles(id, name, avatar_url, verified),
      likes_count:post_likes(count),
      helps_count:post_helps(count),
      saves_count:post_saves(count),
      comments_count:comments(count)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  if (filter && FILTER_MAP[filter]) {
    query = query.eq('type', FILTER_MAP[filter])
  }

  const { data: posts } = await query

  // Fetch user interaction flags
  let likedSet = new Set<string>()
  let savedSet = new Set<string>()
  let helpedSet = new Set<string>()

  if (user && posts?.length) {
    const postIds = posts.map(p => p.id)
    const [{ data: likes }, { data: saves }, { data: helps }] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
      supabase.from('post_saves').select('post_id').eq('user_id', user.id).in('post_id', postIds),
      supabase.from('post_helps').select('post_id').eq('user_id', user.id).in('post_id', postIds),
    ])
    likedSet  = new Set(likes?.map(l => l.post_id) ?? [])
    savedSet  = new Set(saves?.map(s => s.post_id) ?? [])
    helpedSet = new Set(helps?.map(h => h.post_id) ?? [])
  }

  const userName = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Visitante'
  const userInitials = getInitials(userName)

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur-sm px-4 pt-5 pb-3 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-avatar flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff9a6b, #ff6a55)' }}
          >
            {userInitials}
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-ink">Olá, {userName.split(' ')[0]} 👋</p>
            <p className="text-xs text-muted flex items-center gap-1">
              <MapPin size={11} />
              São Luís, MA
            </p>
          </div>
          <button className="relative w-10 h-10 flex items-center justify-center rounded-avatar bg-card shadow-soft">
            <Bell size={20} className="text-body" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral" />
          </button>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-btn px-4 py-3">
            <span className="text-sm text-muted">Buscar animal, bairro, ONG…</span>
          </div>
          <button
            className="w-12 h-12 rounded-btn bg-blue flex items-center justify-center shadow-btn shrink-0"
            aria-label="Filtros"
          >
            <SlidersHorizontal size={18} className="text-white" />
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="py-3">
        <FeedFilters />
      </div>

      {/* Urgency banner */}
      <div className="px-4 mb-4">
        <div className="bg-[#fff1ee] rounded-card p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-coral shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-coral">3 casos urgentes perto de você</p>
            <p className="text-xs text-[#ff6a55]/80 mt-0.5">
              Animais em São Luís que precisam de ajuda hoje
            </p>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <p className="text-[16px] font-extrabold text-ink tracking-tight">Na sua região</p>
        <button className="text-blue text-sm font-semibold">Ver no mapa</button>
      </div>

      {/* Feed */}
      <div className="px-4 space-y-4">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="flex justify-center opacity-20">
              <span className="text-6xl">🐾</span>
            </div>
            <p className="text-body font-semibold">Nenhum animal encontrado</p>
            <p className="text-muted text-sm">Seja o primeiro a reportar um animal na sua região!</p>
          </div>
        ) : (
          (posts as FeedPost[]).map(post => (
            <PostCard
              key={post.id}
              post={post}
              userId={user?.id ?? null}
              initialLiked={likedSet.has(post.id)}
              initialSaved={savedSet.has(post.id)}
              initialHelped={helpedSet.has(post.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
