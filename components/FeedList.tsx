'use client'

import { useEffect, useRef, useState } from 'react'
import PostCard from '@/components/PostCard'
import { loadMorePosts } from '@/actions/loadMorePosts'
import { Loader2 } from 'lucide-react'
import type { FeedPost } from '@/types'

type Props = {
  initialPosts: FeedPost[]
  initialLikedIds: string[]
  initialSavedIds: string[]
  initialHelpedIds: string[]
  userId: string | null
  filter?: string
  query?: string
  species?: string
}

export default function FeedList({
  initialPosts,
  initialLikedIds,
  initialSavedIds,
  initialHelpedIds,
  userId,
  filter,
  query,
  species,
}: Props) {
  const [posts, setPosts]       = useState(initialPosts)
  const [likedSet, setLiked]   = useState(() => new Set(initialLikedIds))
  const [savedSet, setSaved]   = useState(() => new Set(initialSavedIds))
  const [helpedSet, setHelped] = useState(() => new Set(initialHelpedIds))
  const [page, setPage]         = useState(1)
  const [hasMore, setHasMore]   = useState(initialPosts.length === 20)
  const [loading, setLoading]   = useState(false)
  const sentinelRef             = useRef<HTMLDivElement>(null)

  // Reset when filter/search changes (key prop handles unmount, but keep in sync)
  useEffect(() => {
    setPosts(initialPosts)
    setLiked(new Set(initialLikedIds))
    setSaved(new Set(initialSavedIds))
    setHelped(new Set(initialHelpedIds))
    setPage(1)
    setHasMore(initialPosts.length === 20)
  }, [initialPosts, initialLikedIds, initialSavedIds, initialHelpedIds])

  useEffect(() => {
    if (!hasMore) return
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loading) return
        setLoading(true)
        const result = await loadMorePosts({ page, filter, query, species })
        setPosts(prev => [...prev, ...result.posts])
        setLiked(prev => new Set([...prev, ...result.likedIds]))
        setSaved(prev => new Set([...prev, ...result.savedIds]))
        setHelped(prev => new Set([...prev, ...result.helpedIds]))
        setPage(p => p + 1)
        setHasMore(result.hasMore)
        setLoading(false)
      },
      { rootMargin: '200px' }
    )
    const sentinel = sentinelRef.current
    if (sentinel) observer.observe(sentinel)
    return () => { if (sentinel) observer.unobserve(sentinel) }
  }, [page, hasMore, loading, filter, query, species])

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <span className="text-6xl opacity-20">🐾</span>
        <p className="text-body font-semibold">Nenhum animal encontrado</p>
        <p className="text-muted text-sm">
          {query ? `Sem resultados para "${query}"` : 'Seja o primeiro a reportar um animal na sua região!'}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            userId={userId}
            initialLiked={likedSet.has(post.id)}
            initialSaved={savedSet.has(post.id)}
            initialHelped={helpedSet.has(post.id)}
            onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))}
          />
        ))}
      </div>

      {/* Sentinel para infinite scroll */}
      <div ref={sentinelRef} className="h-4" />

      {loading && (
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="text-muted animate-spin" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-muted text-xs py-6">Você chegou ao fim 🐾</p>
      )}
    </>
  )
}
