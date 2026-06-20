'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Save, Eye, EyeOff, FileText, Globe, ImagePlus, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { saveArticle, deleteArticle } from '@/actions/saveArticle'
import { uploadArticleCover } from '@/actions/admin/uploadArticleCover'
import { compressImage } from '@/lib/imageUtils'
import type { Article, ArticleCategory } from '@/types'

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'legislacao', label: '⚖️ Legislação' },
  { value: 'cuidados',   label: '🩺 Cuidados' },
  { value: 'campanhas',  label: '📣 Campanhas' },
  { value: 'eventos',    label: '📅 Eventos' },
]

// Render markdown simples sem dependência extra
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="font-bold text-base mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-extrabold text-lg mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-extrabold text-xl mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-border px-1 rounded text-sm font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/(<\/li>\n?<li)/g, '$1')
    .replace(/(<li[^>]*>.*<\/li>)/gs, '<ul class="my-2 space-y-0.5">$1</ul>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^(?!<[hul])(.+)$/gm, '<p class="mb-3">$1</p>')
    .replace(/<p class="mb-3"><\/p>/g, '')
}

function ArticleForm({ article, onDone }: { article?: Article; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]    = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [body, setBody]      = useState(article?.body ?? '')
  const [coverUrl, setCoverUrl] = useState(article?.cover_url ?? '')
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const isDraft = !article?.published_at

  async function handleCoverFile(file: File) {
    setCoverError(null)
    setCoverUploading(true)
    try {
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.set('file', compressed)
      const url = await uploadArticleCover(fd)
      setCoverUrl(url)
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'Erro no upload')
    } finally {
      setCoverUploading(false)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>, publish?: boolean) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (article?.id) fd.set('id', article.id)
    fd.set('body', body)
    if (publish) fd.set('published_at', new Date().toISOString())
    else if (article?.published_at) fd.set('published_at', article.published_at)
    setError(null)
    startTransition(async () => {
      try { await saveArticle(fd); onDone() }
      catch (err) { setError(err instanceof Error ? err.message : 'Erro ao salvar') }
    })
  }

  return (
    <form
      onSubmit={e => handleSubmit(e)}
      className="flex flex-col gap-4 bg-card rounded-card shadow-card p-5 border border-border"
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-ink text-base">
          {article ? 'Editar artigo' : 'Novo artigo'}
          {article && (isDraft
            ? <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">RASCUNHO</span>
            : <span className="ml-2 text-[10px] bg-green/10 text-green px-2 py-0.5 rounded-full font-bold">PUBLICADO</span>
          )}
        </h3>
        <button type="button" onClick={onDone} className="text-muted p-1"><X size={18} /></button>
      </div>

      {/* Título */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-muted uppercase">Título *</label>
        <input
          name="title"
          defaultValue={article?.title}
          required
          className="input text-sm"
          placeholder="Título do artigo"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Categoria */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted uppercase">Categoria *</label>
          <select name="category" defaultValue={article?.category ?? 'cuidados'} className="input text-sm">
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        {/* Tempo leitura */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted uppercase">Leitura (min)</label>
          <input
            name="read_minutes"
            type="number" min={1} max={60}
            defaultValue={article?.read_minutes ?? ''}
            className="input text-sm"
            placeholder="5"
          />
        </div>
        {/* Autor */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-muted uppercase">Autor</label>
          <input name="author" defaultValue={article?.author ?? ''} className="input text-sm" placeholder="Nome" />
        </div>
      </div>

      {/* Resumo */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-muted uppercase">Resumo</label>
        <textarea
          name="excerpt"
          defaultValue={article?.excerpt ?? ''}
          rows={2}
          className="input resize-none text-sm"
          placeholder="Breve resumo exibido no feed de artigos…"
        />
      </div>

      {/* Capa */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-muted uppercase">Capa do artigo</label>

        {/* Input oculto que passa a URL pro FormData */}
        <input type="hidden" name="cover_url" value={coverUrl} />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverFile(f) }}
        />

        {coverUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="capa" className="w-full h-40 object-cover rounded-[14px]" />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-ink/70 text-white text-xs font-semibold backdrop-blur-sm disabled:opacity-50"
            >
              {coverUploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
              Trocar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            className="flex flex-col items-center justify-center gap-2 h-32 rounded-[14px] border-2 border-dashed border-border text-muted hover:border-blue hover:text-blue transition-colors disabled:opacity-50"
          >
            {coverUploading
              ? <><Loader2 size={22} className="animate-spin" /><span className="text-xs font-semibold">Comprimindo e enviando…</span></>
              : <><ImagePlus size={22} /><span className="text-xs font-semibold">Clique para adicionar capa</span><span className="text-[10px]">JPG, PNG ou WebP · até 5 MB</span></>
            }
          </button>
        )}
        {coverError && <p className="text-xs text-coral">{coverError}</p>}
      </div>

      {/* Body com preview */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-muted uppercase">Conteúdo * (Markdown)</label>
          <button
            type="button"
            onClick={() => setPreview(p => !p)}
            className="flex items-center gap-1 text-[11px] text-blue font-semibold"
          >
            {preview ? <><EyeOff size={12} />Editar</> : <><Eye size={12} />Preview</>}
          </button>
        </div>
        {preview ? (
          <div
            className="min-h-[200px] p-3 bg-bg rounded-[12px] border border-border text-sm text-body prose-sm overflow-auto"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
          />
        ) : (
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            rows={12}
            className="input resize-y text-sm font-mono leading-relaxed"
            placeholder="## Título&#10;&#10;Corpo do artigo em **Markdown**…&#10;&#10;- Item 1&#10;- Item 2"
          />
        )}
        <p className="text-[10px] text-muted text-right">{body.length} caracteres</p>
      </div>

      {error && <p className="text-sm text-coral">{error}</p>}

      {/* Botões */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-btn bg-bg border border-border text-body font-semibold text-sm disabled:opacity-50"
        >
          <Save size={14} />
          {isPending ? 'Salvando…' : 'Salvar rascunho'}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={e => {
            // submete o form manualmente com publish=true
            const form = (e.currentTarget as HTMLElement).closest('form') as HTMLFormElement
            handleSubmit({ preventDefault: () => {}, currentTarget: form } as any, true)
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-btn bg-blue text-white font-bold text-sm disabled:opacity-50"
        >
          <Globe size={14} />
          {isPending ? '…' : (isDraft ? 'Publicar agora' : 'Republicar')}
        </button>
      </div>
    </form>
  )
}

export default function ArticleEditorPanel({ articles }: { articles: Article[] }) {
  const [editing, setEditing]      = useState<Article | 'new' | null>(null)
  const [isPending, startTransition] = useTransition()
  const [search, setSearch]        = useState('')

  function handleDelete(id: string) {
    if (!confirm('Excluir este artigo permanentemente?')) return
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

  const published = articles.filter(a => !!a.published_at)
  const drafts    = articles.filter(a => !a.published_at)
  const filtered  = search
    ? articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    : articles

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setEditing('new')}
        className="flex items-center gap-2 py-3 px-4 rounded-card border-2 border-dashed border-border text-muted text-sm font-semibold hover:border-blue hover:text-blue transition-colors"
      >
        <Plus size={16} />Novo artigo
      </button>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total', value: articles.length, color: 'text-ink' },
          { label: 'Publicados', value: published.length, color: 'text-green' },
          { label: 'Rascunhos', value: drafts.length, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-bg border border-border rounded-[12px] p-3 text-center">
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-bg border border-border rounded-[14px] px-3 py-2.5">
        <FileText size={14} className="text-muted shrink-0" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar artigo…"
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted text-ink"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-muted text-sm text-center py-8">Nenhum artigo encontrado</p>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map(a => (
          <div key={a.id} className="bg-card rounded-card shadow-card border border-border p-4 flex items-start gap-3">
            {/* Cover thumbnail */}
            {a.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.cover_url} alt="" className="w-16 h-16 object-cover rounded-[10px] shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-[10px] bg-bg border border-border flex items-center justify-center shrink-0">
                <FileText size={20} className="text-muted" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="font-semibold text-ink text-sm line-clamp-1">{a.title}</p>
                {!a.published_at && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold shrink-0">RASCUNHO</span>
                )}
              </div>
              <p className="text-[11px] text-muted">
                {CATEGORIES.find(c => c.value === a.category)?.label ?? a.category}
                {a.read_minutes ? ` · ${a.read_minutes} min` : ''}
                {a.author ? ` · ${a.author}` : ''}
              </p>
              {a.published_at && (
                <p className="text-[11px] text-muted mt-0.5">
                  Publicado {formatDistanceToNow(new Date(a.published_at), { locale: ptBR, addSuffix: true })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setEditing(a)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-blue hover:bg-blue/10"
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
    </div>
  )
}
