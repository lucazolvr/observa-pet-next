# ObservaPet — Fase 2: Perfil do Animal

**Data**: 2026-06-20  
**Depende de**: Fase 1 (Foundation + Feed)  
**Abordagem**: Route Interception (`@modal`) — overlay slide-up sobre o feed com URL própria. Componente `<PetProfile/>` compartilhado entre overlay e página full-screen.

---

## Escopo

Esta fase entrega:
- Perfil do animal como overlay animado sobre o feed (route interception)
- Carrossel de fotos com setas e dots
- Chips de info (raça, idade, sexo, local)
- Seção do responsável com botões Mensagem e Ligar (sempre ObservaPet)
- Seções de conteúdo condicionais: Características, Sobre, Personalidade (vindas dos campos do formulário da Fase 3)
- Comentários: leitura + escrita (Server Action otimista)
- Barra fixa inferior: Mensagem + Quero Ajudar → WhatsApp
- Página full-screen `/pet/[id]` para acesso direto / refresh

Fora do escopo: swipe no carrossel, fotos reais (Storage), edição de comentários, paginação de comentários, formulário de adição (Fase 3).

---

## Estrutura de arquivos

```
app/
  @modal/
    (.)pet/
      [id]/
        page.tsx          # intercepta /pet/[id] → overlay sobre o feed
    default.tsx           # null — sem modal aberto
  (app)/
    layout.tsx            # atualizado: recebe { children, modal }
  pet/
    [id]/
      page.tsx            # acesso direto / refresh → full-screen
components/
  PetProfile.tsx          # componente compartilhado (Client)
  PetCarousel.tsx         # carrossel de fotos (Client)
  CommentList.tsx         # lista de comentários + input (Client)
actions/
  postComment.ts          # Server Action: insert comment + revalidatePath
```

---

## Seção 1: Roteamento e overlay

### Route Interception

`app/@modal/(.)pet/[id]/page.tsx` intercepta navegações para `/pet/[id]` originadas dentro do app. O layout `(app)` é atualizado para receber o slot `modal`:

```tsx
// app/(app)/layout.tsx
export default function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <div className="flex justify-center min-h-dvh bg-bg">
      <div className="w-full max-w-[430px] relative min-h-dvh flex flex-col">
        <main className="flex-1 pb-24">{children}</main>
        <BottomNav />
        {modal}
      </div>
    </div>
  )
}
```

`app/@modal/default.tsx` retorna `null` (sem modal ativo).

### Overlay (modal page)

```tsx
// app/@modal/(.)pet/[id]/page.tsx
export default async function PetModalPage({ params }) {
  const { pet, latestPost } = await fetchPet(params.id)
  return (
    <>
      {/* Backdrop */}
      <PetProfileBackdrop />
      {/* Sheet slide-up */}
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        <div className="w-full max-w-[430px] h-[96dvh] bg-card rounded-t-sheet overflow-y-auto animate-slide-up pointer-events-auto">
          <PetProfile pet={pet} latestPost={latestPost} isModal />
        </div>
      </div>
    </>
  )
}
```

`<PetProfileBackdrop/>` — Client Component: backdrop `rgba(11,18,32,.4)` com `animate-fade-in`, click → `router.back()`.

### Página full-screen (acesso direto)

```tsx
// app/pet/[id]/page.tsx
export default async function PetPage({ params }) {
  const { pet, latestPost } = await fetchPet(params.id)
  return (
    <div className="min-h-dvh bg-card">
      <PetProfile pet={pet} latestPost={latestPost} isModal={false} />
    </div>
  )
}
```

---

## Seção 2: Camada de dados

### `fetchPet(id)` — lib/pet.ts

```ts
export async function fetchPet(id: string) {
  const supabase = await supaServer()
  const { data: pet } = await supabase
    .from('pets')
    .select(`
      *,
      creator:profiles!created_by(id, name, role, avatar_url, verified),
      ong:ongs(id, name, avatar_url, verified),
      posts(
        id, type, caption, location_text, neighborhood, created_at,
        photos:post_photos(url, position),
        likes_count:post_likes(count),
        helps_count:post_helps(count),
        comments_count:comments(count)
      )
    `)
    .eq('id', id)
    .order('created_at', { foreignTable: 'posts', ascending: false })
    .single()

  const latestPost = pet?.posts?.[0] ?? null
  return { pet, latestPost }
}
```

### Query de comentários

```ts
supabase
  .from('comments')
  .select('id, text, created_at, author:profiles(name, avatar_url)')
  .eq('post_id', postId)
  .order('created_at', { ascending: true })
  .limit(20)
```

### Server Action: `postComment`

```ts
// actions/postComment.ts
'use server'
export async function postComment(postId: string, petId: string, text: string) {
  if (!text.trim() || text.length > 500) throw new Error('Comentário inválido')
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  await supabase.from('comments').insert({ post_id: postId, author_id: user.id, text: text.trim() })
  revalidatePath(`/pet/${petId}`)
}
```

---

## Seção 3: `<PetProfile/>` — layout completo

Client Component. Props: `pet`, `latestPost`, `isModal: boolean`.

### Carrossel (`<PetCarousel/>`)

- Altura fixa `h-[316px]`
- Fotos do `latestPost.photos` ordenadas por `position`
- **Sem fotos**: gradiente `from-blue-soft to-blue/20` + `<PawMark size={72} className="text-blue/20"/>`
- **Com fotos**: `<img>` com `object-cover`
- Setas ◀▶: `useState(currentIndex)`, clamp entre 0 e `photos.length - 1`
- Dots: bolinhas na base, ativo = branco sólido, inativo = branco/40
- Índice `1 / N` no canto inferior direito
- Botão voltar (`←`) top-left: `isModal ? router.back() : router.push('/')`
- `<StatusBadge/>` top-right

### Info principal

```
Nome (27px/800, tracking-tight)        [★ 4.8] pill amarelo (se rating)
─────────────────────────────────────────────────────────
[Labrador] [2 anos] [Macho] [Calhau]   ← chips scroll-x
```
Chips: `bg-blue-soft text-blue text-[12px] font-semibold rounded-chip px-3 py-1`.  
Renderizados apenas se o campo não for nulo/vazio.

### Responsável

```
[Avatar coral]  Nome do autor
                papel (text-muted)          [Mensagem 💬] [Ligar 📞]
```
- Avatar: iniciais, gradiente coral (mesmo padrão do PostCard)
- **Mensagem**: `window.open(helpUrl(pet.name, pet.neighborhood), '_blank')`
- **Ligar**: `<a href="tel:NEXT_PUBLIC_OBSERVAPET_WHATSAPP">` — número da ObservaPet sempre
- Se `pet.ong_id`: exibe a ONG em vez do criador individual

### Seções de conteúdo (condicionais)

Cada seção só renderiza se o campo tiver valor:

| Campo | Título | Renderização |
|-------|--------|--------------|
| `pet.traits[]` | Características | Chips azuis (`bg-blue-soft`) |
| `pet.overview` | Sobre | Parágrafo de texto |
| `pet.personality` | Personalidade | Parágrafo de texto |

Título de seção: `text-[16px] font-extrabold text-ink mb-3`.

### `<CommentList/>`

- Título "Comentários" + contagem
- Lista: avatar iniciais + nome + tempo relativo + texto
- Estado vazio: "Seja o primeiro a comentar 🐾"
- Input no fundo da lista (acima da bottom bar):
  - `<textarea>` max 500 chars, placeholder "Deixe um comentário…"
  - Botão **Enviar**
  - Otimista: adiciona localmente → chama `postComment()` → reverte se erro
  - Sem login: mostra input mas ao clicar em Enviar → `router.push('/login')`

### Barra fixa inferior

```
[Mensagem  →  WhatsApp]     [Quero ajudar  (primário)]
```
- **Mensagem**: outline azul, `helpUrl()`, `window.open`
- **Quero ajudar**: `bg-blue shadow-btn`, mesmo comportamento do PostCard (upsert `post_helps` + toast)
- `fixed bottom-0`, `bg-card`, border-top, `pb-safe`
- Padding-bottom suficiente para não sobrepor a barra do celular

---

## Tipos adicionais

```ts
// types/index.ts (adicionar)
export type Comment = {
  id: string
  text: string
  created_at: string
  author: Pick<Profile, 'name' | 'avatar_url'>
}

export type PetWithPosts = Pet & {
  creator: Pick<Profile, 'id' | 'name' | 'role' | 'avatar_url' | 'verified'> | null
  ong: Pick<Ong, 'id' | 'name' | 'avatar_url' | 'verified'> | null
  posts: (FeedPost & { photos: PostPhoto[] })[]
}
```

---

## Comportamentos de borda

- **Pet sem posts**: carrossel mostra placeholder, barra inferior ainda funciona (usa `pet.id` para helps)
- **Pet não encontrado**: `notFound()` do Next.js
- **Comentário vazio**: botão Enviar desabilitado se `text.trim() === ''`
- **Erro ao comentar**: reverte estado otimista + toast de erro
