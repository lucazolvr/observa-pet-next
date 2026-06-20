# ObservaPet — Fase 1: Foundation + Feed

**Data**: 2026-06-20  
**Stack**: Next.js 14+ (App Router) · Supabase · Tailwind CSS · lucide-react · @supabase/ssr  
**Abordagem**: Server Components para o feed + Server Actions para mutações. Toggles de like/save otimistas no cliente.

---

## Escopo

Esta fase entrega:
- Scaffold do projeto Next.js com design tokens completos
- Shell mobile com bottom nav de 5 abas
- Auth email + senha (login, signup, confirmação, middleware)
- Feed funcional com dados reais do Supabase
- PostCard com interações otimistas (like, save, ajudar → WhatsApp)
- Toast global
- Setup do schema Supabase (aplicado manualmente antes do primeiro run)

Fora do escopo desta fase: perfil do animal, ONGs, adicionar animal, heatmap, artigos, perfil do usuário, notificações, Supabase Storage (fotos reais), paginação do feed.

---

## Estrutura de arquivos

```
observa-pet-next/
  app/
    layout.tsx                  # root: Plus Jakarta Sans, metadata, ToastProvider
    (app)/
      layout.tsx                # shell mobile: max-w-[430px] centrado + <BottomNav/>
      page.tsx                  # Início / Feed (Server Component)
      perfil/page.tsx           # placeholder
      ongs/page.tsx             # placeholder
      adicionar/page.tsx        # placeholder
      info/page.tsx             # placeholder
    login/page.tsx              # Login + Signup toggle (Client Component)
    auth/callback/route.ts      # troca code por sessão (@supabase/ssr)
  components/
    BottomNav.tsx               # nav fixa 5 abas (Client Component)
    PostCard.tsx                # card do feed (Client Component, toggles otimistas)
    FeedFilters.tsx             # chips de filtro horizontal (Client Component)
    StatusBadge.tsx             # badge colorido por status do pet
    PawMark.tsx                 # SVG logo pata (componente puro)
    Toast.tsx                   # toast + ToastContext
  lib/
    supabase/server.ts          # createServerClient (@supabase/ssr)
    supabase/client.ts          # createBrowserClient (@supabase/ssr)
    whatsapp.ts                 # helpUrl(petName, bairro)
  middleware.ts                 # proteção de rotas
  tailwind.config.ts            # tokens completos
  .env.local                    # variáveis de ambiente
```

---

## Design System

### Tailwind config — tokens

```ts
colors: {
  blue:        '#2a6af0',
  'blue-2':    '#5b8cff',
  'blue-soft': '#e8f0ff',
  ink:         '#16233f',
  body:        '#36425a',
  muted:       '#8b97a8',
  coral:       '#ff6a55',
  green:       '#1faa67',
  amber:       '#d98a00',
  purple:      '#7c5cff',
  bg:          '#f5f7fb',
  card:        '#ffffff',
  border:      '#e2e8f2',
},
borderRadius: {
  card:   '22px',
  sheet:  '28px',
  btn:    '14px',
  chip:   '11px',
  avatar: '13px',
},
boxShadow: {
  card: '0 8px 22px rgba(20,40,80,.06)',
  soft: '0 4px 12px rgba(20,40,80,.05)',
  btn:  '0 8px 16px -6px rgba(42,106,240,.6)',
},
```

### Keyframes (tailwind.config — `theme.extend.keyframes`)

```ts
opLive: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.4' } },         // pulse AO VIVO
opRing: { '0%': { transform: 'scale(.5)', opacity: '1' }, '100%': { transform: 'scale(2.1)', opacity: '0' } },
opPop:  { '0%': { transform: 'scale(.8)', opacity: '0' }, '60%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
```

### Fonte

`next/font/google` — Plus Jakarta Sans, pesos `[400,500,600,700,800]`, subset `['latin']`, CSS variable `--font-jakarta`. Aplicada no `html` do `app/layout.tsx`.

### StatusBadge — mapeamento status → cor

| Status      | bg       | fg       |
|-------------|----------|----------|
| avistado    | #fff1ee  | #ff6a55  |
| urgente     | #fff1ee  | #ff6a55  |
| adocao      | #e8f0ff  | #2a6af0  |
| tratamento  | #fff6e6  | #d98a00  |
| resgatado   | #e6f6ee  | #1faa67  |

---

## Auth

### Fluxo

1. `/login` — Client Component com toggle Login / Cadastro
2. **Cadastro**: `supabase.auth.signUp({ email, password, options: { data: { name } } })` → email de confirmação → banner "Confirme seu email para continuar"
3. **Login**: `supabase.auth.signInWithPassword()` → se email não confirmado, banner de reenvio → se ok, `router.push('/')`
4. **Callback**: `app/auth/callback/route.ts` chama `supabase.auth.exchangeCodeForSession(code)` → redireciona para `/`
5. **Middleware** (`middleware.ts`): rotas `(app)` exigem sessão → redireciona para `/login`; `/login` com sessão ativa → redireciona para `/`

### Trigger Supabase (rodar no SQL editor)

```sql
create function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    'tutor'
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

---

## Feed

### `app/(app)/page.tsx` — Server Component

- Lê sessão do usuário via `supaServer()`
- Lê parâmetro `?filter=` da URL (todos/avistado/adocao/resgate/tratamento)
- Executa query do feed (ver abaixo)
- Renderiza `<FeedHeader/>` (inline, sem arquivo próprio) + `<FeedFilters/>` + faixa de urgência coral + lista de `<PostCard/>`

**FeedHeader** (inline no Server Component):
- Avatar com iniciais do usuário logado (bg gradiente coral)
- "Olá, {nome} 👋" + subtítulo "📍 São Luís, MA"
- Ícone sino (Bell do lucide-react) com badge coral de notificações (count fixo na Fase 1)
- Input fake "Buscar animal, bairro, ONG…" + botão filtro azul 48×48 (ícone SlidersHorizontal) — no-op na Fase 1

**Faixa de urgência** (inline, abaixo dos chips de filtro):
- Card coral claro (`bg-[#fff1ee]`), texto "3 casos urgentes perto de você" — count estático na Fase 1

### Query do feed

```ts
supabase
  .from('posts')
  .select(`
    *,
    pet:pets(*),
    photos:post_photos(url, position),
    author:profiles(name, avatar_url, verified),
    likes_count:post_likes(count),
    helps_count:post_helps(count),
    saves_count:post_saves(count),
    comments_count:comments(count)
  `)
  .order('created_at', { ascending: false })
  .limit(20)
```

Flags `liked`/`saved`/`helped` para o usuário logado: queries separadas (`select post_id from post_likes where user_id = $uid`) → convertidas em `Set` → passadas como prop para `PostCard`.

### `<FeedFilters/>` — Client Component

Chips horizontais: Todos / Avistados / Adoção / Resgates / Tratamento.  
Ativo = `bg-blue text-white`. Inativo = `bg-card border border-border`.  
Ao clicar: `router.push('/?filter=<valor>')` (o Server Component relê e refiltra).

### `<PostCard/>` — Client Component

Props: `post`, `initialLiked`, `initialSaved`, `initialHelped`.

**Layout** (de cima para baixo):
1. **Header**: avatar circular (iniciais, bg gradiente coral), nome do autor, badge verificado, tipo do post + tempo relativo (`formatDistanceToNow`), `<StatusBadge status={post.pet.status}/>`
2. **Legenda**: `<p>` clicável → `router.push('/pet/' + post.pet_id)` (placeholder na Fase 1)
3. **Foto**: `div` com gradiente placeholder (bg-gradient-to-br from-blue-soft to-blue/20, h-56); pin de localização + `post.distance_text` bottom-left; tag espécie top-right; pill "Ver perfil ›" bottom-right
4. **Contadores**: `{helps_count} apoiam · {liked_count} ajudando · comments_count comentários` — texto muted 13px
5. **Ações**: botões ❤ (like), 💬 (comentar — no-op Fase 1), 🔖 (salvar), e botão primário **Ajudar**

**Toggles otimistas**:
- `liked` / `saved` como `useState(initialLiked)` e contadores como `useState`
- Like: otimisticamente toggle → `supabase.from('post_likes').upsert(...)` ou `.delete()`
- Save: mesmo padrão em `post_saves`
- Erro: reverte o estado local

**Ajudar**:
- `window.open(helpUrl(post.pet.name, post.pet.neighborhood), '_blank')`
- `supabase.from('post_helps').upsert({ post_id, user_id })` (idempotente)
- `showToast('Redirecionando para o WhatsApp 🐾')`

### `<Toast/>` + `ToastContext`

- Context com `showToast(message)` e estado `{ visible, message }`
- Toast posicionado `fixed bottom-24 left-1/2 -translate-x-1/2`, fundo `#16233f`, texto branco, border-radius `btn`, slide/fade-in 0.3s, auto-dismiss 2,4s
- Provider no `app/layout.tsx`

---

## BottomNav

5 abas: Início (Home) / ONGs (Building2) / + (PlusCircle, elevado) / Informações (Info) / Perfil (User).

- Ícones: `lucide-react`
- Ativo: ícone + label em `text-blue`; inativo: `text-muted`
- Botão "+" central: `bg-gradient-to-br from-blue to-blue-2`, shadow-btn, ligeiramente elevado (`-mt-5`)
- Fixed bottom, `bg-card`, border-top `border-border`, `pb-safe` para safe area iOS
- `usePathname()` para detectar aba ativa

---

## Camada de dados

### `lib/supabase/server.ts`

```ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function supaServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value, set: () => {}, remove: () => {} } }
  );
}
```

### `lib/supabase/client.ts`

```ts
import { createBrowserClient } from '@supabase/ssr';

let instance: ReturnType<typeof createBrowserClient> | null = null;

export function supaBrowser() {
  if (!instance) {
    instance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return instance;
}
```

### `lib/whatsapp.ts`

```ts
export function helpUrl(petName: string | null, bairro: string | null) {
  const num = process.env.NEXT_PUBLIC_OBSERVAPET_WHATSAPP;
  const name = petName ?? 'o animal';
  const local = bairro ? `${bairro}, São Luís - MA` : 'São Luís - MA';
  const msg = `Olá, equipe ObservaPet! 🐾 Quero ajudar ${name} (${local}). Como posso colaborar?`;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}
```

---

## Setup Supabase (pré-deploy)

Executar nesta ordem no SQL Editor do Supabase:

1. `supabase_schema.sql` (tabelas, enums, RLS, view `neighborhood_heat`, Realtime)
2. Trigger `handle_new_user` (acima)
3. Criar buckets no Storage: `pets`, `avatars`, `ongs`, `articles` (policy: public read)

### `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_OBSERVAPET_WHATSAPP=5598984123456
```

---

## Packages

```
npm install @supabase/supabase-js @supabase/ssr lucide-react date-fns
```

---

## Fora do escopo desta fase

- Perfil do animal (`/pet/[id]`) — Fase 2
- ONGs + Doações — Fase 2
- Adicionar Animal (formulário da ficha de avaliação) — Fase 3
- Heatmap em tempo real — Fase 4
- Artigos / Info — Fase 4
- Perfil do usuário — Fase 5
- Notificações — Fase 5
- Supabase Storage (upload e exibição de fotos reais) — Fase 3
- Infinite scroll / paginação — Fase 2
