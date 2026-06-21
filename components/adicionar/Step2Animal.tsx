import type { FormState, FormAction } from '@/app/(app)/adicionar/page'

const ESPECIES = [
  { value: 'cachorro', icon: '🐕', label: 'Cachorro' },
  { value: 'gato',     icon: '🐈', label: 'Gato' },
  { value: 'outro',    icon: '🐾', label: 'Outro' },
] as const

const SEXOS  = ['Macho', 'Fêmea', 'Não identificado']
const PORTES = ['Pequeno', 'Médio', 'Grande']

type Props = { state: FormState; dispatch: React.Dispatch<FormAction> }

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-bold text-ink mb-2">{children}</p>
}

const inputClass = "w-full rounded-[14px] border border-border bg-bg px-3 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:border-blue transition-colors"

function FieldInput({ label, field, placeholder, state, dispatch }: {
  label: string
  field: keyof FormState
  placeholder?: string
  state: FormState
  dispatch: React.Dispatch<FormAction>
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        value={state[field] as string}
        onChange={e => dispatch({ type: 'SET_FIELD', field, value: e.target.value })}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  )
}

export default function Step2Animal({ state, dispatch }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[18px] font-extrabold text-ink mb-1">Dados do animal</h2>
        <p className="text-sm text-muted mb-4">Preencha o que souber</p>
      </div>

      {/* Espécie */}
      <div>
        <Label>Espécie *</Label>
        {state.errors.species && <p className="text-coral text-xs mb-1">{state.errors.species}</p>}
        <div className="grid grid-cols-3 gap-2">
          {ESPECIES.map(e => (
            <button
              key={e.value}
              type="button"
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'species', value: e.value })}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-card border-2 transition-colors ${
                state.species === e.value ? 'border-blue bg-blue-soft' : 'border-border bg-card'
              }`}
            >
              <span className="text-2xl">{e.icon}</span>
              <span className={`text-xs font-semibold ${state.species === e.value ? 'text-blue' : 'text-ink'}`}>
                {e.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <FieldInput label="Nome (opcional)" field="name" placeholder="Sem nome" state={state} dispatch={dispatch} />
      <FieldInput label="Raça" field="breed" placeholder="Ex: Vira-lata" state={state} dispatch={dispatch} />
      <FieldInput label="Idade" field="age_text" placeholder="Ex: 2 anos, filhote" state={state} dispatch={dispatch} />

      {/* Sexo */}
      <div>
        <Label>Sexo</Label>
        <div className="flex flex-wrap gap-2">
          {SEXOS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'gender', value: s })}
              className={`px-4 py-2 rounded-chip text-sm font-semibold transition-colors ${
                state.gender === s ? 'bg-blue text-white' : 'bg-blue-soft text-blue'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Porte */}
      <div>
        <Label>Porte</Label>
        <div className="flex gap-2">
          {PORTES.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'porte', value: p })}
              className={`flex-1 py-2 rounded-chip text-sm font-semibold transition-colors ${
                state.porte === p ? 'bg-blue text-white' : 'bg-blue-soft text-blue'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
