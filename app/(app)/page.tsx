import { Suspense } from 'react'
import { MapPin } from 'lucide-react'
import { supaServer } from '@/lib/supabase/server'
import FeedFilters from '@/components/FeedFilters'
import FeedList from '@/components/FeedList'
import SearchBar from '@/components/SearchBar'
import FilterButton from '@/components/FilterButton'
import NotificationBell from '@/components/NotificationBell'
import { countUnread } from '@/lib/notifications'
import type { FeedPost, PostType } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feed',
  description: 'Veja os animais em situação de rua reportados em São Luís, MA',
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const FILTER_MAP: Record<string, PostType> = {
  avistado: 'avistado', adocao: 'adocao',
  resgate: 'resgate',   tratamento: 'tratamento',
}

const PAGE_SIZE = 20

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string; species?: string }>
}) {
  const { filter, q, species } = await searchParams
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
    .limit(PAGE_SIZE)

  if (filter && FILTER_MAP[filter]) {
    query = query.eq('type', FILTER_MAP[filter])
  }

  if (q?.trim()) {
    query = query.or(`caption.ilike.%${q.trim()}%,neighborhood.ilike.%${q.trim()}%`)
  }

  if (species) {
    query = query.eq('pets.species', species)
  }

  const { data: posts } = await query

  // User interaction flags
  let likedIds:  string[] = []
  let savedIds:  string[] = []
  let helpedIds: string[] = []

  if (user && posts?.length) {
    const postIds = posts.map(p => p.id)
    const [{ data: likes }, { data: saves }, { data: helps }] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
      supabase.from('post_saves').select('post_id').eq('user_id', user.id).in('post_id', postIds),
      supabase.from('post_helps').select('post_id').eq('user_id', user.id).in('post_id', postIds),
    ])
    likedIds  = likes?.map(l => l.post_id)  ?? []
    savedIds  = saves?.map(s => s.post_id)  ?? []
    helpedIds = helps?.map(h => h.post_id)  ?? []
  }

  const unreadCount = user ? await countUnread(user.id) : 0
  const userName    = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Visitante'

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur-sm px-4 pt-5 pb-3 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-avatar flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff9a6b, #ff6a55)' }}
          >
            {getInitials(userName)}
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-ink">Olá, {userName.split(' ')[0]} 👋</p>
            <p className="text-xs text-muted flex items-center gap-1">
              <MapPin size={11} />
              São Luís, MA
            </p>
          </div>
          <NotificationBell initialUnread={unreadCount} userId={user?.id ?? null} />
        </div>

        {/* Search + filtro */}
        <div className="flex gap-2">
          <Suspense fallback={
            <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-btn px-4 py-3">
              <span className="text-sm text-muted">Buscar animal, bairro…</span>
            </div>
          }>
            <SearchBar />
          </Suspense>
          <FilterButton hasActiveFilter={!!species} />
        </div>
      </header>

      {/* Filters */}
      <div className="py-3">
        <FeedFilters />
      </div>

<div className="flex items-center justify-between px-4 mb-3">
        <p className="text-[16px] font-extrabold text-ink tracking-tight">
          {q ? `Resultados para "${q}"` : 'Na sua região'}
        </p>
        <button className="text-blue text-sm font-semibold">Ver no mapa</button>
      </div>

      {/* Feed com infinite scroll */}
      <div className="px-4 pb-4">
        <FeedList
          key={`${filter ?? ''}-${q ?? ''}-${species ?? ''}`}
          initialPosts={(posts ?? []) as unknown as FeedPost[]}
          initialLikedIds={likedIds}
          initialSavedIds={savedIds}
          initialHelpedIds={helpedIds}
          userId={user?.id ?? null}
          filter={filter}
          query={q}
          species={species}
        />
      </div>
    </div>
  )
}
