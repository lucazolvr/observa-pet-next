# ObservaPet — Fase 3: Adicionar Animal

**Data**: 2026-06-20  
**Depende de**: Fase 1 (Foundation + Feed), Fase 2 (Perfil do Animal)  
**Abordagem**: Multi-step wizard com estado cliente (`useReducer`) + único Server Action no submit final.

---

## Escopo

Esta fase entrega:
- Wizard de 4 etapas para cadastrar um animal em situação de rua
- Upload real de até 3 fotos para Supabase Storage (bucket `pets`)
- Criação de `pets` + `posts` + `post_photos` em uma única Server Action
- Bairros de São Luís como select pré-definido
- Após submit bem-sucedido: redirect para `/pet/[id]` do animal criado

Fora do escopo: geolocalização GPS, mapa interativo, rascunhos parciais, edição de animal existente.

---

## Estrutura de arquivos

```
app/
  (app)/
    adicionar/
      page.tsx            # Client Component raiz — useReducer + wizard
components/
  adicionar/
    ProgressBar.tsx       # 4 segmentos de progresso
    Step1Aviso.tsx        # Tipo de post + fotos
    Step2Animal.tsx       # Dados do animal
    Step3Ficha.tsx        # Ficha clínica
    Step4Localizacao.tsx  # Localização + submit
actions/
  createPet.ts            # Server Action: Storage + insert pets/posts/post_photos
lib/
  bairros.ts              # Lista dos ~30 principais bairros de São Luís
```

---

## Seção 1: Estado e navegação do wizard

### Tipo `FormState`

```ts
type FormState = {
  step: 1 | 2 | 3 | 4

  // Etapa 1
  tipo: PostType | ''
  photos: File[]

  // Etapa 2
  species: PetSpecies | ''
  name: string
  breed: string
  age_text: string
  gender: string
  porte: string
  status: PetStatus | ''

  // Etapa 3
  condicao_corporal: 1 | 2 | 3 | 4 | 5 | null
  feridas: boolean
  feridas_desc: string
  comportamento: string[]   // chips multisseleção
  overview: string

  // Etapa 4
  neighborhood: string
  location_text: string
  caption: string           // situação observada → posts.caption
  personality: string
}
```

### `useReducer`

Actions: `SET_FIELD`, `NEXT`, `PREV`, `ADD_PHOTO`, `REMOVE_PHOTO`.

`NEXT` valida a etapa atual antes de avançar:
- Etapa 1: `tipo` obrigatório
- Etapa 2: `species` e `status` obrigatórios
- Etapas 3 e 4: sem campos obrigatórios

Erros de validação ficam em `errors: Record<string, string>` no estado do reducer.

### Layout da página

`AdicionarForm` substitui o BottomNav padrão — a página `adicionar` não usa a barra de navegação inferior durante o preenchimento. Barra fixa no fundo com dois botões: "Anterior" (outline) e "Próximo" / "Salvar animal" (primário).

```tsx
// app/(app)/adicionar/page.tsx
'use client'
export default function AdicionarPage() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const steps = [Step1Aviso, Step2Animal, Step3Ficha, Step4Localizacao]
  const StepComponent = steps[state.step - 1]
  return (
    <div className="flex flex-col min-h-dvh">
      <ProgressBar step={state.step} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28">
        <StepComponent state={state} dispatch={dispatch} />
      </div>
      <BottomControls state={state} dispatch={dispatch} />
    </div>
  )
}
```

---

## Seção 2: Server Action

### `actions/createPet.ts`

```ts
'use server'
export async function createPet(formData: FormData): Promise<never> {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Criar o pet
  const { data: pet } = await supabase.from('pets').insert({
    created_by: user.id,
    species:    formData.get('species'),
    name:       formData.get('name') || null,
    breed:      formData.get('breed') || null,
    age_text:   formData.get('age_text') || null,
    gender:     formData.get('gender') || null,
    status:     formData.get('status'),
    overview:   formData.get('overview') || null,
    personality: formData.get('personality') || null,
    traits:     JSON.parse(formData.get('traits') as string ?? '[]'),
    neighborhood: formData.get('neighborhood') || null,
  }).select('id').single()

  // 2. Criar o post
  const { data: post } = await supabase.from('posts').insert({
    pet_id:        pet!.id,
    author_id:     user.id,
    type:          formData.get('tipo'),
    caption:       formData.get('caption') || null,
    location_text: formData.get('location_text') || null,
    neighborhood:  formData.get('neighborhood') || null,
  }).select('id').single()

  // 3. Upload das fotos + inserir post_photos
  const photos = formData.getAll('photos') as File[]
  for (let i = 0; i < photos.length; i++) {
    const file = photos[i]
    if (!file.size) continue
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${pet!.id}/${i}.${ext}`
    await supabase.storage.from('pets').upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('pets').getPublicUrl(path)
    await supabase.from('post_photos').insert({ post_id: post!.id, url: publicUrl, position: i })
  }

  redirect(`/pet/${pet!.id}`)
}
```

**`traits`** é serializado como JSON string no FormData porque `File[]` e strings coexistem no mesmo FormData, e arrays não são suportados nativamente.

---

## Seção 3: Componentes das etapas

### `ProgressBar`

4 segmentos `flex-1 h-1 rounded-full`, separados por `gap-1.5`. Segmentos ≤ step atual = `bg-blue`, demais = `bg-border`. Transição `transition-colors`.

### `Step1Aviso`

**Tipo de aviso** — 5 cards em grid 2×3 (último fica centralizado):

| Tipo | Ícone | Label |
|---|---|---|
| avistado | 👁 | Avistado |
| resgate | 🚨 | Resgate urgente |
| adocao | 🏠 | Para adoção |
| perdido | 🔍 | Perdido |
| tratamento | 🏥 | Em tratamento |

Card selecionado: `border-2 border-blue bg-blue-soft`. Não selecionado: `border-2 border-border bg-card`.

**Upload de fotos** — grid 3 colunas fixas (`w-full grid grid-cols-3 gap-2`):
- Slots 1–3: se tiver foto → preview `object-cover` + botão X no canto; se vazio → card `+` com `border-dashed border-2 border-border`
- Input `type="file" accept="image/*"` hidden, triggerado por ref
- Máximo 3 fotos; slots extras desaparecem após 3 fotos adicionadas

### `Step2Animal`

- **Espécie**: 3 cards horizontais com emoji grande (🐕 / 🐈 / 🐾) + label
- **Nome**: input texto, placeholder "Sem nome (opcional)"
- **Raça**: input texto, placeholder "Ex: Vira-lata"
- **Idade**: input texto, placeholder "Ex: 2 anos, filhote"
- **Sexo**: 3 chips (Macho / Fêmea / Não identificado)
- **Porte**: 3 chips (Pequeno / Médio / Grande) — serializado em `pets.traits[]` como "Porte pequeno" etc. (sem coluna dedicada na tabela)
- **Status**: chips de seleção única em wrap, mesmas cores do `StatusBadge`

### `Step3Ficha`

**Condição corporal** — escala 1–5, botões numerados em row:
- 1 = Muito magro, 2 = Magro, 3 = Ideal, 4 = Sobrepeso, 5 = Obeso
- Label descritivo muda dinamicamente abaixo dos botões
- Botão selecionado: `bg-blue text-white`

**Feridas** — toggle Sim/Não (2 chips). Se "Sim": textarea "Descreva as feridas" aparece com `animate-slide-up`.

**Comportamento** — chips multisseleção em wrap:
`Dócil · Assustado · Agressivo · Brincalhão · Tímido · Sociável · Independente · Carente`

Chip selecionado: `bg-blue text-white`. Não selecionado: `bg-blue-soft text-blue`.

**Sobre o animal** — textarea livre, placeholder "Descreva a situação do animal…", max 500 chars.

### `Step4Localizacao`

- **Bairro**: `<select>` com lista de bairros de São Luís (de `lib/bairros.ts`)
- **Endereço**: input texto livre, placeholder "Ex: Rua das Flores, 123"
- **Situação observada**: textarea → `posts.caption`, max 500 chars
- **Personalidade**: textarea → `pets.personality`, max 300 chars

Botão final: "Salvar animal 🐾" — monta FormData com todos os campos do state + photos, chama `createPet(formData)`.

---

## `lib/bairros.ts`

Array exportado com os principais bairros de São Luís, MA. Inclui: Anil, Calhau, Cohab, Coroadinho, Coroado, Fátima, Filipinho, Forquilha, Fumacê, Ilhoinha, Jaracaty, João Paulo, Maracanã, Monte Castelo, Olho d'Água, Outeiro da Cruz, Pão de Açúcar, Parque Vitória, Pedrinhas, Ponta d'Areia, Porto Grande, Renascença, São Cristóvão, São Francisco, São Marcos, Santa Cruz, Tirirical, Vinhais e outros (~30 no total).

---

## Comportamentos de borda

- **Upload falha**: toast de erro, pet e post já criados ficam sem foto (não bloqueia o redirect)
- **Usuário não autenticado**: Server Action redireciona para `/login`
- **Voltar do browser**: estado do reducer se perde (sem persistência em localStorage para o MVP)
- **Foto > 5MB**: validação client-side antes do upload com mensagem de erro inline
- **Submit duplo**: botão "Salvar animal" fica `disabled` + spinner enquanto a Action processa (via `useTransition`)
