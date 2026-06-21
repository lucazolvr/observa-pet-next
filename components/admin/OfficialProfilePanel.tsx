'use client'

import { useState, useTransition, useRef } from 'react'
import Image from 'next/image'
import { Crown, Plus, Trash2, ExternalLink, ImagePlus, Loader2, CheckSquare, Square, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  updateOfficialProfile,
  createOfficialPost,
  type CreateOfficialPostResult,
} from '@/actions/admin/officialProfile'
import { deletePost, deletePostsBulk } from '@/actions/admin/managePost'
import OfficialBadge from '@/components/OfficialBadge'
import NeighborhoodCombobox from '@/components/NeighborhoodCombobox'
import type { Profile, FeedPost } from '@/types'

// ─── Seção: editar perfil ───────────────────────────────────────────────────

function ProfileEditor({ profile }: { profile: Profile }) {
  const [isPending, start] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    setSuccess(false)
    start(async () => {
      const res = await updateOfficialProfile(fd)
      if (res.error) setError(res.error)
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-blue-soft shrink-0">
          {profile.avatar_url
            ? <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
            : <span className="flex items-center justify-center w-full h-full text-xl font-extrabold text-blue">
                {profile.name.slice(0, 2).toUpperCase()}
              </span>
          }
        </div>
        <div>
          <p className="font-bold text-ink">{profile.name}</p>
          <OfficialBadge size="sm" />
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">Nome do perfil</span>
        <input
          name="name"
          defaultValue={profile.name}
          required
          maxLength={60}
          className="bg-bg border border-border rounded-[10px] px-3 py-2 text-sm text-ink outline-none focus:border-blue"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">Bio</span>
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ''}
          rows={3}
          maxLength={300}
          className="bg-bg border border-border rounded-[10px] px-3 py-2 text-sm text-ink outline-none focus:border-blue resize-none"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted">URL do avatar</span>
        <input
          name="avatar_url"
          defaultValue={profile.avatar_url ?? ''}
          type="url"
          placeholder="https://..."
          className="bg-bg border border-border rounded-[10px] px-3 py-2 text-sm text-ink outline-none focus:border-blue"
        />
      </label>

      {error   && <p className="text-xs text-coral">{error}</p>}
      {success && <p className="text-xs text-green">Perfil atualizado!</p>}

      <button
        type="submit"
        disabled={isPending}
        className="py-2.5 rounded-btn bg-blue text-white text-sm font-bold disabled:opacity-50"
      >
        {isPending ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </form>
  )
}

// ─── Seção: criar post oficial ──────────────────────────────────────────────

const TIPO_TO_STATUS: Record<string, string> = {
  avistado: 'avistado', resgate: 'urgente', adocao: 'adocao',
  perdido: 'avistado',  tratamento: 'tratamento',
}

const TIPOS = [
  { v: 'avistado',   l: '👁️ Avistado'   },
  { v: 'resgate',    l: '🚨 Resgate'    },
  { v: 'adocao',     l: '🏠 Adoção'     },
  { v: 'perdido',    l: '❓ Perdido'    },
  { v: 'tratamento', l: '🏥 Tratamento' },
]
const ESPECIES    = [{ v: 'cachorro', l: '🐶 Cachorro' }, { v: 'gato', l: '🐱 Gato' }, { v: 'outro', l: '🐾 Outro' }]
const SEXOS       = ['Macho', 'Fêmea', 'Não identificado']
const PORTES      = ['Pequeno', 'Médio', 'Grande']
const COMPORTAMENTOS = ['Dócil','Assustado','Agressivo','Brincalhão','Tímido','Sociável','Independente','Carente']
const CONDICAO_LABELS: Record<number, string> = { 1:'Muito magro', 2:'Magro', 3:'Ideal', 4:'Sobrepeso', 5:'Obeso' }

const fieldClass = "bg-bg border border-border rounded-[10px] px-3 py-2 text-sm text-ink outline-none focus:border-blue w-full"

function Lbl({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold text-muted">{children}</span>
}

function ChipBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-chip text-xs font-bold border transition-all ${
        active ? 'bg-blue text-white border-blue' : 'border-border text-body hover:border-blue hover:text-blue'
      }`}>
      {children}
    </button>
  )
}

function CreatePostForm({ onCreated }: { onCreated: (post: FeedPost) => void }) {
  const [isPending, start]  = useTransition()
  const [error, setError]   = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Campos controlados
  const [tipo,       setTipo]       = useState('')
  const [species,    setSpecies]    = useState('')
  const [gender,     setGender]     = useState('')
  const [porte,      setPorte]      = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [condicao,   setCondicao]   = useState<number | null>(null)
  const [feridas,    setFeridas]    = useState(false)
  const [feridasDesc,setFeridasDesc]= useState('')
  const [comportamento, setComportamento] = useState<string[]>([])
  const [descricao,  setDescricao]  = useState('')
  const [name,       setName]       = useState('')
  const [breed,      setBreed]      = useState('')
  const [ageText,    setAgeText]    = useState('')
  const [locationText,setLocationText] = useState('')

  function toggleComportamento(c: string) {
    setComportamento(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6)
    setPhotoFiles(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function reset() {
    setTipo(''); setSpecies(''); setGender(''); setPorte(''); setNeighborhood('')
    setCondicao(null); setFeridas(false); setFeridasDesc(''); setComportamento([])
    setDescricao(''); setName(''); setBreed(''); setAgeText(''); setLocationText('')
    setPhotoFiles([]); setPreviews([]); setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tipo)    { setError('Selecione o tipo de aviso');  return }
    if (!species) { setError('Selecione a espécie');        return }

    const fd = new FormData()
    fd.set('tipo',           tipo)
    fd.set('species',        species)
    fd.set('status',         TIPO_TO_STATUS[tipo] ?? 'avistado')
    fd.set('name',           name)
    fd.set('breed',          breed)
    fd.set('age_text',       ageText)
    fd.set('gender',         gender)
    fd.set('porte',          porte)
    fd.set('neighborhood',   neighborhood)
    fd.set('location_text',  locationText)
    fd.set('overview',       descricao)
    fd.set('caption',        descricao)
    fd.set('personality',    comportamento.join(', '))
    if (condicao != null) fd.set('condicao_corporal', String(condicao))
    fd.set('feridas',        String(feridas))
    fd.set('feridas_desc',   feridasDesc)
    photoFiles.forEach(f => fd.append('photos', f))

    setError(null)
    start(async () => {
      const res: CreateOfficialPostResult = await createOfficialPost(fd)
      if ('error' in res) {
        setError(res.error)
      } else {
        reset()
        window.location.reload()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Tipo de aviso */}
      <div className="flex flex-col gap-1.5">
        <Lbl>Tipo de aviso *</Lbl>
        <div className="flex gap-2 flex-wrap">
          {TIPOS.map(({ v, l }) => <ChipBtn key={v} active={tipo === v} onClick={() => setTipo(v)}>{l}</ChipBtn>)}
        </div>
      </div>

      {/* Espécie */}
      <div className="flex flex-col gap-1.5">
        <Lbl>Espécie *</Lbl>
        <div className="flex gap-2">
          {ESPECIES.map(({ v, l }) => <ChipBtn key={v} active={species === v} onClick={() => setSpecies(v)}>{l}</ChipBtn>)}
        </div>
      </div>

      {/* Nome + Bairro */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Lbl>Nome do animal</Lbl>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Opcional" maxLength={60} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <Lbl>Bairro</Lbl>
          <NeighborhoodCombobox value={neighborhood} onChange={setNeighborhood} />
        </div>
      </div>

      {/* Raça + Idade */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Lbl>Raça</Lbl>
          <input value={breed} onChange={e => setBreed(e.target.value)} placeholder="Opcional" maxLength={60} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <Lbl>Idade</Lbl>
          <input value={ageText} onChange={e => setAgeText(e.target.value)} placeholder="Ex: ~1 ano" maxLength={40} className={fieldClass} />
        </div>
      </div>

      {/* Sexo + Porte */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Lbl>Sexo</Lbl>
          <div className="flex gap-2 flex-wrap">
            {SEXOS.map(s => <ChipBtn key={s} active={gender === s} onClick={() => setGender(s)}>{s}</ChipBtn>)}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Lbl>Porte</Lbl>
          <div className="flex gap-2">
            {PORTES.map(p => <ChipBtn key={p} active={porte === p} onClick={() => setPorte(p)}>{p}</ChipBtn>)}
          </div>
        </div>
      </div>

      {/* Condição corporal */}
      <div className="flex flex-col gap-1.5">
        <Lbl>Condição corporal</Lbl>
        <div className="flex gap-2">
          {([1,2,3,4,5] as const).map(n => (
            <ChipBtn key={n} active={condicao === n} onClick={() => setCondicao(condicao === n ? null : n)}>
              {n}
            </ChipBtn>
          ))}
        </div>
        {condicao && <p className="text-xs text-muted">{condicao} — {CONDICAO_LABELS[condicao]}</p>}
      </div>

      {/* Feridas */}
      <div className="flex flex-col gap-1.5">
        <Lbl>Feridas visíveis?</Lbl>
        <div className="flex gap-2">
          <ChipBtn active={feridas}  onClick={() => setFeridas(true)}>Sim</ChipBtn>
          <ChipBtn active={!feridas} onClick={() => setFeridas(false)}>Não</ChipBtn>
        </div>
        {feridas && (
          <textarea value={feridasDesc} onChange={e => setFeridasDesc(e.target.value)}
            placeholder="Descreva as feridas…" rows={2} maxLength={300}
            className="bg-bg border border-border rounded-[10px] px-3 py-2 text-sm text-ink outline-none focus:border-blue resize-none mt-1" />
        )}
      </div>

      {/* Comportamento */}
      <div className="flex flex-col gap-1.5">
        <Lbl>Comportamento</Lbl>
        <div className="flex gap-2 flex-wrap">
          {COMPORTAMENTOS.map(c => (
            <ChipBtn key={c} active={comportamento.includes(c)} onClick={() => toggleComportamento(c)}>{c}</ChipBtn>
          ))}
        </div>
      </div>

      {/* Descrição */}
      <div className="flex flex-col gap-1">
        <Lbl>Descrição</Lbl>
        <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
          rows={3} maxLength={500} placeholder="Descreva a situação e o estado do animal…"
          className="bg-bg border border-border rounded-[10px] px-3 py-2 text-sm text-ink outline-none focus:border-blue resize-none" />
        <p className="text-[11px] text-muted text-right">{descricao.length}/500</p>
      </div>

      {/* Endereço */}
      <div className="flex flex-col gap-1">
        <Lbl>Endereço</Lbl>
        <input value={locationText} onChange={e => setLocationText(e.target.value)}
          placeholder="Ex: Rua das Flores, próx. ao mercado" maxLength={200} className={fieldClass} />
      </div>

      {/* Fotos */}
      <div className="flex flex-col gap-1.5">
        <Lbl>Fotos (até 6)</Lbl>
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-[10px] overflow-hidden border border-border">
                <Image src={src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
        <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-[10px] text-xs text-muted hover:text-blue hover:border-blue transition-colors w-fit">
          <ImagePlus size={14} /> Adicionar fotos
        </button>
      </div>

      {error && <p className="text-xs text-coral">{error}</p>}

      <button type="submit" disabled={isPending}
        className="py-2.5 rounded-btn bg-blue text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
        {isPending ? <><Loader2 size={14} className="animate-spin" /> Publicando…</> : <><Plus size={14} /> Publicar post oficial</>}
      </button>
    </form>
  )
}

// ─── Seção: lista de posts oficiais ─────────────────────────────────────────

function OfficialPostsList({ initialPosts }: { initialPosts: FeedPost[] }) {
  const [posts, setPosts]     = useState(initialPosts)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [isPending, start]    = useTransition()

  const allSelected = posts.length > 0 && posts.every(p => selected.has(p.id))

  function toggleOne(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(posts.map(p => p.id)))
  }

  function exitSelecting() { setSelecting(false); setSelected(new Set()) }

  function handleDelete(id: string) {
    if (!confirm('Excluir este post?')) return
    start(async () => {
      await deletePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
    })
  }

  function handleBulkDelete() {
    const ids = [...selected]
    if (!ids.length) return
    if (!confirm(`Excluir ${ids.length} post${ids.length > 1 ? 's' : ''}?`)) return
    start(async () => {
      await deletePostsBulk(ids)
      setPosts(prev => prev.filter(p => !ids.includes(p.id)))
      setSelected(new Set())
      setSelecting(false)
    })
  }

  if (!posts.length) {
    return <p className="text-sm text-muted text-center py-8">Nenhum post publicado ainda.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{posts.length} posts</span>
        <button
          onClick={() => selecting ? exitSelecting() : setSelecting(true)}
          className={`px-3 py-1.5 rounded-chip text-xs font-bold flex items-center gap-1 border transition-colors ${
            selecting ? 'bg-muted/10 text-muted border-border' : 'bg-card border-border text-body hover:border-blue hover:text-blue'
          }`}
        >
          {selecting ? <><X size={12} /> Cancelar</> : <><CheckSquare size={12} /> Selecionar</>}
        </button>
      </div>

      {selecting && (
        <div className="flex items-center gap-3 px-3 py-2 bg-blue/5 border border-blue/20 rounded-[12px]">
          <button onClick={toggleAll} className="flex items-center gap-1.5 text-xs font-semibold text-blue">
            {allSelected ? <CheckSquare size={15} /> : <Square size={15} className="text-muted" />}
            {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
          </button>
          <span className="text-xs text-muted ml-auto">
            {selected.size > 0 ? `${selected.size} selecionado${selected.size > 1 ? 's' : ''}` : 'Nenhum'}
          </span>
          <button onClick={handleBulkDelete} disabled={selected.size === 0 || isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-coral text-white text-xs font-bold disabled:opacity-40">
            <Trash2 size={12} />
            {isPending ? 'Excluindo…' : `Excluir${selected.size > 0 ? ` (${selected.size})` : ''}`}
          </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-card divide-y divide-border overflow-hidden">
        {posts.map(p => {
          const photo = p.photos?.[0]?.url
          const isSelected = selected.has(p.id)
          return (
            <div
              key={p.id}
              onClick={selecting ? () => toggleOne(p.id) : undefined}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isSelected ? 'bg-blue/5' : ''
              } ${selecting ? 'cursor-pointer' : ''}`}
            >
              {selecting ? (
                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                  {isSelected ? <CheckSquare size={18} className="text-blue" /> : <Square size={18} className="text-muted" />}
                </div>
              ) : (
                <div className="relative w-12 h-12 rounded-[10px] overflow-hidden shrink-0 bg-bg">
                  {photo
                    ? <Image src={photo} alt="" fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-muted text-xs">—</div>
                  }
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">
                  {p.pet?.name ?? '—'} <span className="text-muted font-normal">· {p.type}</span>
                </p>
                <p className="text-[11px] text-muted">
                  {p.neighborhood ?? '—'} · {formatDistanceToNow(new Date(p.created_at), { locale: ptBR, addSuffix: true })}
                </p>
              </div>

              {!selecting && (
                <div className="flex items-center gap-1 shrink-0">
                  <a href={`/pet/${p.pet_id}`} target="_blank"
                    className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-blue"
                    onClick={e => e.stopPropagation()}>
                    <ExternalLink size={14} />
                  </a>
                  <button onClick={() => handleDelete(p.id)} disabled={isPending}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-coral disabled:opacity-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Painel principal ────────────────────────────────────────────────────────

type SubTab = 'perfil' | 'criar' | 'posts'

type Props = {
  profile: Profile | null
  posts: FeedPost[]
}

export default function OfficialProfilePanel({ profile, posts }: Props) {
  const [sub, setSub] = useState<SubTab>('perfil')

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Crown size={32} className="text-amber-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-ink">Nenhum perfil oficial configurado</p>
        <p className="text-xs text-muted mt-1">
          Execute <code className="bg-bg px-1 rounded">UPDATE profiles SET is_official = true WHERE id = &apos;seu-user-id&apos;</code> no Supabase.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tabs */}
      <div className="flex border-b border-border">
        {([
          { v: 'perfil', l: 'Perfil' },
          { v: 'criar',  l: '+ Novo post' },
          { v: 'posts',  l: `Posts (${posts.length})` },
        ] as { v: SubTab; l: string }[]).map(({ v, l }) => (
          <button key={v} onClick={() => setSub(v)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              sub === v ? 'border-amber-500 text-amber-600' : 'border-transparent text-muted hover:text-body'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {sub === 'perfil' && <ProfileEditor profile={profile} />}
      {sub === 'criar'  && <CreatePostForm onCreated={() => setSub('posts')} />}
      {sub === 'posts'  && <OfficialPostsList initialPosts={posts} />}
    </div>
  )
}
