'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ExternalLink, Search, CheckSquare, Square, X, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { deletePost, deletePostsBulk } from '@/actions/admin/managePost'
import AdminCreatePostModal from '@/components/admin/AdminCreatePostModal'
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

type PostRowProps = {
  post: FeedPost
  selecting: boolean
  selected: boolean
  onToggle: () => void
  onDeleted: (id: string) => void
}

function PostRow({ post, selecting, selected, onToggle, onDeleted }: PostRowProps) {
  const [isPending, start] = useTransition()
  const photo = post.photos?.[0]?.url

  function handleDelete() {
    if (!confirm(`Remover post de "${post.author?.name ?? 'usuário'}"?`)) return
    start(async () => { await deletePost(post.id); onDeleted(post.id) })
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors ${
        selected ? 'bg-blue/5' : ''
      } ${selecting ? 'cursor-pointer' : ''}`}
      onClick={selecting ? onToggle : undefined}
    >
      {/* Checkbox ou thumbnail */}
      {selecting ? (
        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
          {selected
            ? <CheckSquare size={18} className="text-blue" />
            : <Square size={18} className="text-muted" />
          }
        </div>
      ) : (
        <div className="relative w-12 h-12 rounded-[10px] overflow-hidden shrink-0 bg-bg">
          {photo
            ? <Image src={photo} alt="" fill className="object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-muted text-xs">—</div>
          }
        </div>
      )}

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

      {/* Ações (só visíveis fora do modo seleção) */}
      {!selecting && (
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/pet/${post.pet_id}`}
            target="_blank"
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-blue"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink size={14} />
          </Link>
          <button
            onClick={e => { e.stopPropagation(); handleDelete() }}
            disabled={isPending}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-coral disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function PostsPanel({ posts: initialPosts }: { posts: FeedPost[] }) {
  const [posts, setPosts]         = useState(initialPosts)
  const [search, setSearch]       = useState('')
  const [typeFilter, setType]     = useState('')
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [isPending, start]        = useTransition()
  const [showCreate, setShowCreate] = useState(false)

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

  const visibleIds = visible.map(p => p.id)
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selected.has(id))

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        visibleIds.forEach(id => next.delete(id))
        return next
      })
    } else {
      setSelected(prev => new Set([...prev, ...visibleIds]))
    }
  }

  function exitSelecting() {
    setSelecting(false)
    setSelected(new Set())
  }

  function handleDeleted(id: string) {
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  function handleBulkDelete() {
    const ids = [...selected].filter(id => visibleIds.includes(id))
    if (!ids.length) return
    if (!confirm(`Excluir ${ids.length} post${ids.length > 1 ? 's' : ''}? Esta ação é irreversível.`)) return
    start(async () => {
      await deletePostsBulk(ids)
      setPosts(prev => prev.filter(p => !ids.includes(p.id)))
      setSelected(new Set())
      setSelecting(false)
    })
  }

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

      {/* Filtros + contador + botão selecionar */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 items-center">
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

        <span className="shrink-0 text-xs text-muted ml-auto">{visible.length} posts</span>

        <button
          onClick={() => selecting ? exitSelecting() : setSelecting(true)}
          className={`shrink-0 px-3 py-1.5 rounded-chip text-xs font-bold transition-all flex items-center gap-1 ${
            selecting
              ? 'bg-muted/10 text-muted border border-border'
              : 'bg-card border border-border text-body hover:border-blue hover:text-blue'
          }`}
        >
          {selecting ? <><X size={12} /> Cancelar</> : <><CheckSquare size={12} /> Selecionar</>}
        </button>
      </div>

      {/* Barra de seleção em lote */}
      {selecting && (
        <div className="flex items-center gap-3 px-3 py-2 bg-blue/5 border border-blue/20 rounded-[12px]">
          <button
            onClick={toggleAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue"
          >
            {allSelected
              ? <CheckSquare size={15} />
              : <Square size={15} className="text-muted" />
            }
            {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
          </button>

          <span className="text-xs text-muted ml-auto">
            {selected.size > 0 ? `${selected.size} selecionado${selected.size > 1 ? 's' : ''}` : 'Nenhum selecionado'}
          </span>

          <button
            onClick={handleBulkDelete}
            disabled={selected.size === 0 || isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-coral text-white text-xs font-bold disabled:opacity-40 transition-opacity"
          >
            <Trash2 size={12} />
            {isPending ? 'Excluindo…' : `Excluir${selected.size > 0 ? ` (${selected.size})` : ''}`}
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="bg-card border border-border rounded-card divide-y divide-border overflow-hidden">
        {visible.length === 0
          ? <p className="text-muted text-sm text-center py-10">Nenhum post encontrado</p>
          : visible.map(p => (
            <PostRow
              key={p.id}
              post={p}
              selecting={selecting}
              selected={selected.has(p.id)}
              onToggle={() => toggleOne(p.id)}
              onDeleted={handleDeleted}
            />
          ))
        }
      </div>
    </div>
  )
}
