import { BAIRROS_SAO_LUIS } from '@/lib/bairros'
import type { FormState, FormAction } from '@/app/(app)/adicionar/page'

type Props = { state: FormState; dispatch: React.Dispatch<FormAction> }

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-bold text-ink mb-2">{children}</p>
}

const inputClass = "w-full rounded-[14px] border border-border bg-bg px-3 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:border-blue transition-colors"
const textareaClass = `${inputClass} resize-none`

export default function Step4Localizacao({ state, dispatch }: Props) {
  function set(field: keyof FormState, value: string) {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[18px] font-extrabold text-ink mb-1">Localização</h2>
        <p className="text-sm text-muted mb-4">Onde o animal foi encontrado?</p>
      </div>

      {/* Bairro */}
      <div>
        <Label>Bairro</Label>
        <select
          value={state.neighborhood}
          onChange={e => set('neighborhood', e.target.value)}
          className={inputClass}
        >
          <option value="">Selecione o bairro</option>
          {BAIRROS_SAO_LUIS.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Endereço */}
      <div>
        <Label>Endereço</Label>
        <input
          type="text"
          value={state.location_text}
          onChange={e => set('location_text', e.target.value)}
          placeholder="Ex: Rua das Flores, próx. ao mercado"
          className={inputClass}
        />
      </div>

      {/* Situação observada */}
      <div>
        <Label>Situação observada</Label>
        <textarea
          value={state.caption}
          onChange={e => set('caption', e.target.value)}
          placeholder="Descreva o que você viu…"
          rows={4}
          maxLength={500}
          className={textareaClass}
        />
        <p className="text-[11px] text-muted text-right mt-1">{state.caption.length}/500</p>
      </div>

      {/* Personalidade */}
      <div>
        <Label>Personalidade</Label>
        <textarea
          value={state.personality}
          onChange={e => set('personality', e.target.value)}
          placeholder="Como o animal se comportou com você?"
          rows={3}
          maxLength={300}
          className={textareaClass}
        />
        <p className="text-[11px] text-muted text-right mt-1">{state.personality.length}/300</p>
      </div>
    </div>
  )
}
