'use client'

import { useReducer, useTransition } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { createPetAdmin } from '@/actions/admin/createPetAdmin'
import ProgressBar from '@/components/adicionar/ProgressBar'
import Step1Aviso from '@/components/adicionar/Step1Aviso'
import Step2Animal from '@/components/adicionar/Step2Animal'
import Step3Ficha from '@/components/adicionar/Step3Ficha'
import Step4Localizacao from '@/components/adicionar/Step4Localizacao'
import type { FormState, FormAction } from '@/app/(app)/adicionar/page'
import type { FeedPost } from '@/types'

const TIPO_TO_STATUS: Record<string, string> = {
  avistado:   'avistado',
  resgate:    'urgente',
  adocao:     'adocao',
  perdido:    'avistado',
  tratamento: 'tratamento',
}

const STEP_TITLES = ['Aviso', 'Animal', 'Ficha clínica', 'Localização']

const initial: FormState = {
  step: 1, errors: {},
  tipo: '', photos: [],
  species: '', name: '', breed: '', age_text: '', gender: '', porte: '',
  condicao_corporal: null, feridas: false, feridas_desc: '', comportamento: [], descricao: '',
  neighborhood: '', location_text: '', lat: null, lng: null,
}

function validate(state: FormState): Record<string, string> {
  const e: Record<string, string> = {}
  if (state.step === 1 && !state.tipo) e.tipo = 'Selecione o tipo de aviso'
  if (state.step === 2 && !state.species) e.species = 'Selecione a espécie'
  return e
}

function buildTraits(state: FormState): string[] {
  const traits: string[] = [...state.comportamento]
  if (state.porte) traits.push(`Porte ${state.porte.toLowerCase()}`)
  if (state.condicao_corporal) {
    const labels: Record<number, string> = { 1: 'Muito magro', 2: 'Magro', 3: 'Ideal', 4: 'Sobrepeso', 5: 'Obeso' }
    traits.push(`Condição corporal: ${labels[state.condicao_corporal]}`)
  }
  if (state.feridas && state.feridas_desc) traits.push(`Feridas: ${state.feridas_desc}`)
  else if (state.feridas) traits.push('Feridas visíveis')
  return traits
}

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value, errors: {} }
    case 'ADD_PHOTO':
      return { ...state, photos: [...state.photos, action.payload] }
    case 'REMOVE_PHOTO':
      return { ...state, photos: state.photos.filter((_, i) => i !== action.payload) }
    case 'NEXT': {
      const errors = validate(state)
      if (Object.keys(errors).length > 0) return { ...state, errors }
      return { ...state, step: Math.min(4, state.step + 1) as FormState['step'], errors: {} }
    }
    case 'PREV':
      return { ...state, step: Math.max(1, state.step - 1) as FormState['step'], errors: {} }
    case 'SET_ERRORS':
      return { ...state, errors: action.payload }
    default:
      return state
  }
}

type Props = {
  onClose: () => void
  onCreated: (post: FeedPost) => void
}

export default function AdminCreatePostModal({ onClose, onCreated }: Props) {
  const [state, dispatch] = useReducer(reducer, initial)
  const [isPending, startTransition] = useTransition()

  const steps = [Step1Aviso, Step2Animal, Step3Ficha, Step4Localizacao]
  const StepComponent = steps[state.step - 1]
  const isLast = state.step === 4

  async function handleSubmit() {
    const fd = new FormData()
    fd.set('tipo',               state.tipo)
    fd.set('species',            state.species)
    fd.set('name',               state.name)
    fd.set('breed',              state.breed)
    fd.set('age_text',           state.age_text)
    fd.set('gender',             state.gender)
    fd.set('status',             TIPO_TO_STATUS[state.tipo] ?? 'avistado')
    fd.set('porte',              state.porte)
    if (state.condicao_corporal != null)
      fd.set('condicao_corporal', String(state.condicao_corporal))
    fd.set('feridas',            String(state.feridas))
    fd.set('feridas_desc',       state.feridas_desc)
    fd.set('overview',           state.descricao)
    fd.set('personality',        state.comportamento.join(', '))
    fd.set('neighborhood',       state.neighborhood)
    fd.set('location_text',      state.location_text)
    if (state.lat != null) fd.set('lat', String(state.lat))
    if (state.lng != null) fd.set('lng', String(state.lng))
    fd.set('caption',            state.descricao)
    fd.set('traits',             JSON.stringify(buildTraits(state)))
    state.photos.forEach(f => fd.append('photos', f))

    startTransition(async () => {
      const result = await createPetAdmin(fd)
      if (result.error || !result.post) {
        dispatch({ type: 'SET_ERRORS', payload: { submit: result.error ?? 'Erro desconhecido' } })
      } else {
        onCreated(result.post)
        onClose()
      }
    })
  }

  return (
    /* Overlay */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Painel */}
      <div className="relative w-full max-w-[430px] h-[92dvh] sm:h-[88dvh] bg-card rounded-t-[24px] sm:rounded-[24px] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-2 shrink-0">
          <button
            onClick={() => state.step > 1 ? dispatch({ type: 'PREV' }) : onClose()}
            className="w-9 h-9 rounded-full bg-bg flex items-center justify-center shrink-0"
            aria-label="Voltar"
          >
            {state.step > 1
              ? <ChevronLeft size={20} className="text-ink" />
              : <X size={20} className="text-ink" />
            }
          </button>
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
              Etapa {state.step} de 4
            </p>
            <h1 className="text-[18px] font-extrabold text-ink leading-tight">
              {STEP_TITLES[state.step - 1]}
            </h1>
          </div>
        </div>

        <ProgressBar step={state.step} total={4} />

        {/* Conteúdo da etapa */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <StepComponent state={state} dispatch={dispatch} />
        </div>

        {/* Rodapé fixo */}
        <div className="px-5 py-4 border-t border-border bg-card shrink-0">
          {state.errors.submit && (
            <p className="text-coral text-xs text-center mb-2">{state.errors.submit}</p>
          )}
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full py-3.5 rounded-btn bg-blue text-white text-sm font-bold shadow-btn disabled:opacity-50 active:scale-[.98] transition-transform"
            >
              {isPending ? 'Salvando…' : 'Salvar animal 🐾'}
            </button>
          ) : (
            <button
              onClick={() => dispatch({ type: 'NEXT' })}
              className="w-full py-3.5 rounded-btn bg-blue text-white text-sm font-bold shadow-btn active:scale-[.98] transition-transform"
            >
              Próximo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
