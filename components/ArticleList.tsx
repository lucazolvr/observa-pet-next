'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'
import type { Article, ArticleCategory } from '@/types'

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'todos',      label: 'Todos' },
  { value: 'legislacao', label: 'Legislação' },
  { value: 'cuidados',   label: 'Cuidados' },
  { value: 'campanhas',  label: 'Campanhas' },
  { value: 'eventos',    label: 'Eventos' },
]

const CAT_COLORS: Record<ArticleCategory, { bg: string; fg: string }> = {
  legislacao: { bg: '#e8f0ff', fg: '#2a6af0' },
  cuidados:   { bg: '#e6f6ee', fg: '#1faa67' },
  campanhas:  { bg: '#fff1ee', fg: '#ff6a55' },
  eventos:    { bg: '#fff6e6', fg: '#d98a00' },
}

const CAT_LABEL: Record<ArticleCategory, string> = {
  legislacao: 'Legislação',
  cuidados:   'Cuidados',
  campanhas:  'Campanhas',
  eventos:    'Eventos',
}

function ArticleCard({ article, expanded, onToggle }: {
  article: Article
  expanded: boolean
  onToggle: () => void
}) {
  const { bg, fg } = CAT_COLORS[article.category] ?? { bg: '#e8f0ff', fg: '#2a6af0' }
  const timeAgo = formatDistanceToNow(new Date(article.published_at), { locale: ptBR, addSuffix: true })
  const preview = article.excerpt ?? article.body.slice(0, 120)

  return (
    <article
      className={`rounded-card overflow-hidden transition-shadow ${
        expanded ? 'bg-blue-soft/30' : 'bg-card shadow-card'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-4"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-chip shrink-0"
            style={{ background: bg, color: fg }}
          >
            {CAT_LABEL[article.category]}
          </span>
          <span className="text-[11px] text-muted">{timeAgo}</span>
        </div>

        <h3 className={`font-bold text-ink leading-snug mb-1 ${expanded ? '' : 'line-clamp-2'}`}>
          {article.title}
        </h3>

        {!expanded && (
          <p className="text-sm text-muted line-clamp-2">{preview}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            {article.author && (
              <span className="text-[11px] text-muted">{article.author}</span>
            )}
            {article.read_minutes && (
              <div className="flex items-center gap-1">
                <Clock size={11} className="text-muted" />
                <span className="text-[11px] text-muted">{article.read_minutes} min</span>
              </div>
            )}
          </div>
          <div className="text-muted">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3">
          <p className="text-sm text-body leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
            {article.body}
          </p>
        </div>
      )}
    </article>
  )
}

export default function ArticleList({ articles }: { articles: Article[] }) {
  const [cat, setCat] = useState('todos')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = cat === 'todos'
    ? articles
    : articles.filter(a => a.category === cat)

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-none">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => { setCat(c.value); setExpandedId(null) }}
            className={`px-3 py-1.5 rounded-chip text-xs font-semibold whitespace-nowrap transition-colors ${
              cat === c.value ? 'bg-blue text-white' : 'bg-blue-soft text-blue'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="px-5 flex flex-col gap-3 pb-8">
        {filtered.length === 0 ? (
          <p className="text-muted text-sm text-center py-10">
            {articles.length === 0
              ? 'Nenhum artigo publicado ainda'
              : 'Nenhum artigo nesta categoria'}
          </p>
        ) : (
          filtered.map(a => (
            <ArticleCard
              key={a.id}
              article={a}
              expanded={expandedId === a.id}
              onToggle={() => setExpandedId(expandedId === a.id ? null : a.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
