'use server'

import { supaServer } from '@/lib/supabase/server'
import { escapeSearch } from '@/lib/security'
import type { FeedPost } from '@/types'

const FEED_SELECT = `
  *,
  pet:pets!pet_id(*),
  photos:post_photos(url, position),
  author:profiles!author_id(id, name, avatar_url, verified),
  likes_count:post_likes(count),
  helps_count:post_helps(count),
  saves_count:post_saves(count),
  comments_count:comments(count)
`

const FILTER_MAP: Record<string, string> = {
  avistado: 'avistado', adocao: 'adocao',
  resgate: 'resgate',   tratamento: 'tratamento',
}

const PAGE_SIZE = 20

export async function loadMorePosts({
  page,
  filter,
  query,
  species,
}: {
  page: number
  filter?: string
  query?: string
  species?: string
}): Promise<{
  posts: FeedPost[]
  likedIds: string[]
  savedIds: string[]
  helpedIds: string[]
  hasMore: boolean
}> {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()

  const offset = page * PAGE_SIZE

  let q = supabase
    .from('posts')
    .select(FEED_SELECT)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (filter && FILTER_MAP[filter]) {
    q = q.eq('type', FILTER_MAP[filter])
  }

  if (query?.trim()) {
    const term = escapeSearch(query.trim())
    q = q.or(`caption.ilike.%${term}%,neighborhood.ilike.%${term}%`)
  }

  if (species) {
    q = q.eq('pets.species', species)
  }

  const { data: posts } = await q
  const list = (posts ?? []) as unknown as FeedPost[]

  let likedIds:  string[] = []
  let savedIds:  string[] = []
  let helpedIds: string[] = []

  if (user && list.length) {
    const ids = list.map(p => p.id)
    const [{ data: likes }, { data: saves }, { data: helps }] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', ids),
      supabase.from('post_saves').select('post_id').eq('user_id', user.id).in('post_id', ids),
      supabase.from('post_helps').select('post_id').eq('user_id', user.id).in('post_id', ids),
    ])
    likedIds  = likes?.map(l => l.post_id)  ?? []
    savedIds  = saves?.map(s => s.post_id)  ?? []
    helpedIds = helps?.map(h => h.post_id)  ?? []
  }

  return {
    posts: list,
    likedIds,
    savedIds,
    helpedIds,
    hasMore: list.length === PAGE_SIZE,
  }
}
