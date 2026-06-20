import type { FormState, FormAction } from '@/app/(app)/adicionar/page'

const CONDICAO_LABELS: Record<number, string> = {
  1: 'Muito magro',
  2: 'Magro',
  3: 'Ideal',
  4: 'Sobrepeso',
  5: 'Obeso',
}

const COMPORTAMENTOS = [
  'Dócil', 'Assustado', 'Agressivo', 'Brincalhão',
  'Tímido', 'Sociável', 'Independente', 'Carente',
]

type Props = { state: FormState; dispatch: React.Dispatch<FormAction> }

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-bold text-ink mb-2">{children}</p>
}

export default function Step3Ficha({ state, dispatch }: Props) {
  function toggleComportamento(c: string) {
    const current = state.comportamento
    const next = current.includes(c)
      ? current.filter(x => x !== c)
      : [...current, c]
    dispatch({ type: 'SET_FIELD', field: 'comportamento', value: next })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[18px] font-extrabold text-ink mb-1">Ficha clínica</h2>
        <p className="text-sm text-muted mb-4">Avaliação do estado do animal</p>
      </div>

      {/* Condição corporal */}
      <div>
        <Label>Condição corporal</Label>
        <div className="flex gap-2 mb-2">
          {([1, 2, 3, 4, 5] as const).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'condicao_corporal', value: n })}
              className={`flex-1 py-2.5 rounded-chip text-sm font-bold transition-colors ${
                state.condicao_corporal === n
                  ? 'bg-blue text-white'
                  : 'bg-blue-soft text-blue'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {state.condicao_corporal && (
          <p className="text-xs text-muted text-center animate-op-pop">
            {state.condicao_corporal} — {CONDICAO_LABELS[state.condicao_corporal]}
          </p>
        )}
      </div>

      {/* Feridas */}
      <div>
        <Label>Feridas visíveis?</Label>
        <div className="flex gap-2 mb-3">
          {(['Sim', 'Não'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'feridas', value: v === 'Sim' })}
              className={`px-5 py-2 rounded-chip text-sm font-semibold transition-colors ${
                state.feridas === (v === 'Sim')
                  ? 'bg-blue text-white'
                  : 'bg-blue-soft text-blue'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {state.feridas && (
          <textarea
            value={state.feridas_desc}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'feridas_desc', value: e.target.value })}
            placeholder="Descreva as feridas…"
            rows={3}
            className="w-full resize-none rounded-[14px] border border-border bg-bg px-3 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:border-blue transition-colors animate-slide-up"
          />
        )}
      </div>

      {/* Comportamento */}
      <div>
        <Label>Comportamento</Label>
        <div className="flex flex-wrap gap-2">
          {COMPORTAMENTOS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => toggleComportamento(c)}
              className={`px-3 py-1.5 rounded-chip text-sm font-semibold transition-colors ${
                state.comportamento.includes(c)
                  ? 'bg-blue text-white'
                  : 'bg-blue-soft text-blue'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Sobre */}
      <div>
        <Label>Sobre o animal</Label>
        <textarea
          value={state.overview}
          onChange={e => dispatch({ type: 'SET_FIELD', field: 'overview', value: e.target.value })}
          placeholder="Descreva a situação do animal…"
          rows={4}
          maxLength={500}
          className="w-full resize-none rounded-[14px] border border-border bg-bg px-3 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:border-blue transition-colors"
        />
        <p className="text-[11px] text-muted text-right mt-1">{state.overview.length}/500</p>
      </div>
    </div>
  )
}
