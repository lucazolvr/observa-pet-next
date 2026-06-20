'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ExternalLink, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { deletePost } from '@/actions/admin/managePost'
import type { FeedPost } from '@/types'

const TYPE_LABEL: Record<string, string> = {
  avistado: 'Avistado', resgate: 'Resgate', adocao: 'Adoção',
  perdido: 'Perdido', tratamento: 'Tratamento',
}
const TYPE_COLOR: Record<string, string> = {
  avistado: 'bg-blue/10 text-blue', resgate: 'bg-coral/10 text-coral',
  adocao: 'bg-green/10 text-green', perdido: 'bg-amber-100 text-amber-700',
  tratamento: 'bg-purple-100 text-purple-700',
}

function PostRow({ post }: { post: FeedPost }) {
  const [removed, setRemoved] = useState(false)
  const [isPending, start]    = useTransition()
  const photo = post.photos?.[0]?.url

  if (removed) return null

  function handleDelete() {
    if (!confirm(`Remover post de "${post.author?.name ?? 'usuário'}"?`)) return
    start(async () => { await deletePost(post.id); setRemoved(true) })
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      {/* Foto */}
      <div className="relative w-12 h-12 rounded-[10px] overflow-hidden shrink-0 bg-bg">
        {photo
          ? <Image src={photo} alt="" fill className="object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-muted text-xs">—</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLOR[post.type] ?? ''}`}>
            {TYPE_LABEL[post.type] ?? post.type}
          </span>
          {post.pet?.name && <span className="text-sm font-semibold text-ink truncate">{post.pet.name}</span>}
        </div>
        <p className="text-[11px] text-muted truncate">
          {post.author?.name ?? '—'} · {post.neighborhood ?? '—'} ·{' '}
          {formatDistanceToNow(new Date(post.created_at), { locale: ptBR, addSuffix: true })}
        </p>
        {post.caption && <p className="text-[11px] text-body line-clamp-1 mt-0.5">{post.caption}</p>}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/pet/${post.pet_id}`}
          target="_blank"
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-blue"
        >
          <ExternalLink size={14} />
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-coral disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function PostsPanel({ posts }: { posts: FeedPost[] }) {
  const [search, setSearch]   = useState('')
  const [typeFilter, setType] = useState('')

  const visible = posts.filter(p => {
    if (typeFilter && p.type !== typeFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (p.pet?.name ?? '').toLowerCase().includes(q) ||
      (p.author?.name ?? '').toLowerCase().includes(q) ||
      (p.neighborhood ?? '').toLowerCase().includes(q) ||
      (p.caption ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-2 bg-bg border border-border rounded-[14px] px-3 py-2.5">
        <Search size={14} className="text-muted shrink-0" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por animal, autor, bairro…"
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted text-ink"
        />
      </div>

      {/* Filtro por tipo */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {[{ v: '', l: 'Todos' }, { v: 'avistado', l: 'Avistado' }, { v: 'resgate', l: 'Resgate' },
          { v: 'adocao', l: 'Adoção' }, { v: 'perdido', l: 'Perdido' }, { v: 'tratamento', l: 'Tratamento' }
        ].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setType(v)}
            className={`shrink-0 px-3 py-1.5 rounded-chip text-xs font-bold transition-all ${
              typeFilter === v ? 'bg-blue text-white' : 'bg-card border border-border text-body'
            }`}
          >
            {l}
          </button>
        ))}
        <span className="shrink-0 text-xs text-muted self-center ml-auto">{visible.length} posts</span>
      </div>

      {/* Lista */}
      <div className="bg-card border border-border rounded-card divide-y divide-border overflow-hidden">
        {visible.length === 0
          ? <p className="text-muted text-sm text-center py-10">Nenhum post encontrado</p>
          : visible.map(p => <PostRow key={p.id} post={p} />)
        }
      </div>
    </div>
  )
}
