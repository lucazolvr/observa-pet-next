'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { saveArticle, deleteArticle } from '@/actions/saveArticle'
import type { Article, ArticleCategory } from '@/types'

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'legislacao', label: 'Legislação' },
  { value: 'cuidados',   label: 'Cuidados' },
  { value: 'campanhas',  label: 'Campanhas' },
  { value: 'eventos',    label: 'Eventos' },
]

function ArticleForm({ article, onDone }: { article?: Article; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (article?.id) fd.set('id', article.id)
    setError(null)
    startTransition(async () => {
      try { await saveArticle(fd); onDone() }
      catch (err) { setError(err instanceof Error ? err.message : 'Erro ao salvar') }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white rounded-card shadow-card p-4 border border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-ink">{article ? 'Editar artigo' : 'Novo artigo'}</h3>
        <button type="button" onClick={onDone} className="text-muted">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted uppercase">Título *</label>
          <input name="title" defaultValue={article?.title} required className="input text-sm" placeholder="Título do artigo" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted uppercase">Categoria *</label>
          <select name="category" defaultValue={article?.category ?? 'cuidados'} className="input text-sm">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted uppercase">Tempo de leitura (min)</label>
          <input name="read_minutes" type="number" min={1} max={60} defaultValue={article?.read_minutes ?? ''} className="input text-sm" placeholder="5" />
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted uppercase">Autor</label>
          <input name="author" defaultValue={article?.author ?? ''} className="input text-sm" placeholder="Nome do autor" />
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted uppercase">Resumo</label>
          <textarea name="excerpt" defaultValue={article?.excerpt ?? ''} rows={2} className="input resize-none text-sm" placeholder="Breve resumo..." />
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted uppercase">Conteúdo *</label>
          <textarea name="body" defaultValue={article?.body} required rows={8} className="input resize-none text-sm font-mono" placeholder="Corpo do artigo..." />
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted uppercase">URL da capa</label>
          <input name="cover_url" defaultValue={article?.cover_url ?? ''} className="input text-sm" placeholder="https://..." />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 py-2.5 rounded-btn bg-blue text-white font-semibold text-sm disabled:opacity-50"
      >
        <Save size={15} />
        {isPending ? 'Salvando…' : 'Salvar artigo'}
      </button>
    </form>
  )
}

export default function ArticleEditorPanel({ articles }: { articles: Article[] }) {
  const [editing, setEditing] = useState<Article | 'new' | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('Tem certeza que quer excluir este artigo?')) return
    startTransition(async () => { await deleteArticle(id) })
  }

  if (editing) {
    return (
      <ArticleForm
        article={editing === 'new' ? undefined : editing}
        onDone={() => setEditing(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setEditing('new')}
        className="flex items-center gap-2 py-3 px-4 rounded-card border-2 border-dashed border-border text-muted text-sm font-semibold hover:border-blue hover:text-blue transition-colors"
      >
        <Plus size={16} />
        Novo artigo
      </button>

      {articles.length === 0 && (
        <p className="text-muted text-sm text-center py-8">Nenhum artigo publicado ainda</p>
      )}

      {articles.map(a => (
        <div key={a.id} className="bg-white rounded-card shadow-card border border-border p-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink text-sm line-clamp-1">{a.title}</p>
            <p className="text-[11px] text-muted mt-0.5">{a.category} · {a.read_minutes ? `${a.read_minutes} min` : '—'}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(a)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-blue hover:bg-blue-soft"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => handleDelete(a.id)}
              disabled={isPending}
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-coral hover:bg-coral/10 disabled:opacity-50"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
