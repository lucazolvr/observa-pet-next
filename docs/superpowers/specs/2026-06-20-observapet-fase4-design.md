# ObservaPet — Fase 4: Heatmap ao Vivo + Artigos

**Data**: 2026-06-20  
**Depende de**: Fase 1 (Foundation + Feed), banco com `neighborhood_heat` view e Realtime em `posts`  
**Abordagem**: SVG inline dos bairros de São Luís + Supabase Realtime (INSERT em posts → refetch da view) + artigos com expansão inline.

---

## Escopo

Esta fase entrega:
- Página `/info` com duas abas: Mapa ao vivo · Artigos
- SVG dos ~30 principais bairros de São Luís coloridos por intensidade de avistamentos (últimas 72h)
- Realtime: novo post → refetch `neighborhood_heat` → recolore SVG instantaneamente
- Badge "● ao vivo" pulsando com contagem total de avistamentos
- Lista de artigos do banco com filtro de categoria client-side
- Expansão de artigo inline (sem nova rota)

Fora do escopo: mapa geográfico preciso, editor de artigos, notificações push, paginação de artigos.

---

## Estrutura de arquivos

```
app/
  (app)/
    info/
      page.tsx              # Server Component: busca heatData + articles
components/
  InfoTabs.tsx              # Client: controla aba ativa (Mapa | Artigos)
  HeatmapLive.tsx           # Client: Realtime + estado heatData + MapaSaoLuis
  MapaSaoLuis.tsx           # Client: SVG dos bairros com fill por intensidade
  ArticleList.tsx           # Client: filtro + lista + expansão inline
lib/
  heatColor.ts              # heatColor(count): string — escala de cor
```

---

## Seção 1: Página e dados iniciais

### `app/(app)/info/page.tsx`

Server Component. Busca em paralelo:

```ts
const [{ data: heatData }, { data: articles }] = await Promise.all([
  supabase.from('neighborhood_heat').select('neighborhood, count'),
  supabase.from('articles').select('id, title, body, category, created_at').order('created_at', { ascending: false }),
])
```

Renderiza `<InfoTabs>` passando os dois como props:

```tsx
<InfoTabs
  initialHeat={heatData ?? []}
  articles={articles ?? []}
/>
```

### Layout

```
Header: "Mapa & Info" (text-ink font-extrabold)
<InfoTabs>
  [Mapa ao vivo]  [Artigos]   ← abas fixas no topo
  ─────────────────────────────
  Conteúdo da aba ativa
```

---

## Seção 2: SVG + escala de calor

### `lib/heatColor.ts`

```ts
export function heatColor(count: number): string {
  if (count === 0)  return '#f5f7fb'   // bg
  if (count <= 2)   return '#e8f0ff'   // blue-soft
  if (count <= 5)   return '#5b8cff'   // blue-2
  if (count <= 9)   return '#2a6af0'   // blue
  return '#ff6a55'                     // coral — 10+
}
```

### `components/MapaSaoLuis.tsx`

SVG `viewBox="0 0 400 480"` com paths simplificados dos ~30 bairros principais. Cada bairro é representado por um polígono aproximado — visualmente reconhecível para moradores de São Luís, não geográfico-preciso.

```tsx
type HeatEntry = { neighborhood: string; count: number }

export default function MapaSaoLuis({ heatData }: { heatData: HeatEntry[] }) {
  const countMap = Object.fromEntries(heatData.map(h => [h.neighborhood, Number(h.count)]))

  return (
    <svg viewBox="0 0 400 480" className="w-full max-h-[340px]">
      {BAIRROS_SVG.map(({ name, path }) => (
        <path
          key={name}
          d={path}
          fill={heatColor(countMap[name] ?? 0)}
          stroke="#e2e8f2"
          strokeWidth="1.5"
          className="transition-colors duration-500 cursor-pointer"
        >
          <title>{name}: {countMap[name] ?? 0} avistamento(s)</title>
        </path>
      ))}
    </svg>
  )
}
```

`BAIRROS_SVG` é um array `{ name: string; path: string }[]` com os paths SVG de cada bairro. Os paths são desenhados manualmente com precisão suficiente para reconhecimento visual (ilha de São Luís dividida em zonas aproximadas dos bairros).

### Legenda

Abaixo do mapa, uma legenda horizontal compacta:

```
● 0    ● 1–2   ● 3–5   ● 6–9   ● 10+
                                  ↑
  bg   soft    blue-2   blue    coral
```

---

## Seção 3: Realtime

### `components/HeatmapLive.tsx`

```tsx
'use client'
export default function HeatmapLive({ initialHeat }: { initialHeat: HeatEntry[] }) {
  const [heatData, setHeatData] = useState(initialHeat)
  const supabase = supaBrowser()

  useEffect(() => {
    const channel = supabase
      .channel('posts-heatmap')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async () => {
        const { data } = await supabase.from('neighborhood_heat').select('neighborhood, count')
        if (data) setHeatData(data)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const total = heatData.reduce((s, h) => s + Number(h.count), 0)

  return (
    <div>
      {/* Cabeçalho com contagem + badge ao vivo */}
      <div className="flex items-center justify-between px-5 py-3">
        <p className="text-sm text-body">
          <span className="font-bold text-ink">{total}</span> avistamentos nas últimas 72h
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-green text-xs animate-op-live">●</span>
          <span className="text-xs font-semibold text-green">ao vivo</span>
        </div>
      </div>

      <MapaSaoLuis heatData={heatData} />
      <HeatLegend />
    </div>
  )
}
```

**Nota:** `neighborhood_heat` não pode ser assinada via Realtime diretamente (é uma view). A estratégia de ouvir `INSERT` em `posts` e refazer a query é correta e leve (~30 linhas agregadas).

---

## Seção 4: Artigos

### `components/ArticleList.tsx`

```tsx
'use client'
const CATEGORIES = ['todos', 'legislacao', 'cuidados', 'campanhas', 'eventos']
const CAT_LABEL: Record<string, string> = {
  todos: 'Todos', legislacao: 'Legislação', cuidados: 'Cuidados',
  campanhas: 'Campanhas', eventos: 'Eventos',
}

export default function ArticleList({ articles }: { articles: Article[] }) {
  const [cat, setCat] = useState('todos')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = cat === 'todos' ? articles : articles.filter(a => a.category === cat)

  return (
    <div>
      {/* Chips de categoria */}
      <div className="flex gap-2 overflow-x-auto px-5 py-3 scrollbar-none">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-chip text-xs font-semibold whitespace-nowrap transition-colors ${
              cat === c ? 'bg-blue text-white' : 'bg-blue-soft text-blue'
            }`}>
            {CAT_LABEL[c]}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="px-5 flex flex-col gap-3 pb-6">
        {filtered.length === 0 && (
          <p className="text-muted text-sm text-center py-8">Nenhum artigo nesta categoria</p>
        )}
        {filtered.map(a => (
          <ArticleCard key={a.id} article={a}
            expanded={expandedId === a.id}
            onToggle={() => setExpandedId(expandedId === a.id ? null : a.id)} />
        ))}
      </div>
    </div>
  )
}
```

### `ArticleCard` (inline no mesmo arquivo)

```
[badge categoria]                           data relativa
Título (2 linhas max, font-bold)
Resumo: primeiros 120 chars do body…

— quando expandido —
body completo (whitespace-pre-wrap)
[Fechar ×]
```

Badge por categoria: mesmas cores dos chips de filtro. Card colapsado: `rounded-card shadow-card`. Expandido: sem shadow, `bg-blue-soft/30`.

---

## Tipos adicionais

```ts
// types/index.ts
export type ArticleCategory = 'legislacao' | 'cuidados' | 'campanhas' | 'eventos'

export type Article = {
  id: string
  title: string
  body: string
  category: ArticleCategory
  created_at: string
}

export type HeatEntry = {
  neighborhood: string
  count: number
}
```

---

## Comportamentos de borda

- **Nenhum avistamento**: todos os bairros cinza (`bg`), total = 0, badge "ao vivo" ainda pulsa
- **Bairro sem correspondência no SVG**: ignorado silenciosamente (sem crash)
- **Realtime falha / sem conexão**: heatData mantém o último estado válido (initialHeat do SSR)
- **Sem artigos**: mensagem "Nenhum artigo ainda" na aba Artigos
- **Artigo com body longo**: scroll dentro do card expandido (`max-h-[60vh] overflow-y-auto`)
