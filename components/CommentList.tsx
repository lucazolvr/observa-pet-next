'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { postComment } from '@/actions/postComment'
import { useToast } from '@/components/Toast'
import type { Comment } from '@/types'

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

type Props = {
  postId: string
  petId: string
  initialComments: Comment[]
  userId: string | null
}

export default function CommentList({ postId, petId, initialComments, userId }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSend() {
    if (!text.trim()) return
    if (!userId) { router.push('/login'); return }

    const optimistic: Comment = {
      id: `opt-${Date.now()}`,
      text: text.trim(),
      created_at: new Date().toISOString(),
      author: { name: 'Você', avatar_url: null },
    }

    setComments(prev => [...prev, optimistic])
    const saved = text
    setText('')

    startTransition(async () => {
      try {
        await postComment(postId, petId, saved)
      } catch {
        setComments(prev => prev.filter(c => c.id !== optimistic.id))
        setText(saved)
        showToast('Erro ao enviar comentário')
      }
    })
  }

  return (
    <section className="px-5 pb-4">
      <h2 className="text-[16px] font-extrabold text-ink mb-3">
        Comentários{comments.length > 0 && ` (${comments.length})`}
      </h2>

      {comments.length === 0 ? (
        <p className="text-muted text-sm mb-4">Seja o primeiro a comentar 🐾</p>
      ) : (
        <ul className="space-y-4 mb-4">
          {comments.map(c => (
            <li key={c.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-avatar flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #ff9a6b, #ff6a55)' }}
              >
                {getInitials(c.author.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-ink">{c.author.name}</span>
                  <span className="text-[11px] text-muted">
                    {formatDistanceToNow(new Date(c.created_at), { locale: ptBR, addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-body leading-relaxed mt-0.5">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Deixe um comentário…"
          className="
            flex-1 resize-none rounded-[14px] border border-border bg-bg
            px-3 py-2.5 text-sm text-body placeholder:text-muted
            focus:outline-none focus:border-blue transition-colors
          "
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isPending}
          className="
            px-4 py-2.5 rounded-btn bg-blue text-white text-sm font-bold
            shadow-btn disabled:opacity-40 disabled:shadow-none
            active:scale-[.97] transition-transform shrink-0
          "
        >
          Enviar
        </button>
      </div>
    </section>
  )
}
