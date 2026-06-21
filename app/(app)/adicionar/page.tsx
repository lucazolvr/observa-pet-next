'use client'

import { useReducer, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, X } from 'lucide-react'
import { createPet } from '@/actions/createPet'
import ProgressBar from '@/components/adicionar/ProgressBar'
import Step1Aviso from '@/components/adicionar/Step1Aviso'
import Step2Animal from '@/components/adicionar/Step2Animal'
import Step4Localizacao from '@/components/adicionar/Step4Localizacao'

export type FormState = {
  step: 1 | 2 | 3
  errors: Record<string, string>

  // Etapa 1
  tipo: string
  photos: File[]

  // Etapa 2
  species: string
  name: string
  breed: string
  age_text: string
  gender: string
  status: string
  overview: string

  // Etapa 3
  neighborhood: string
  location_text: string
  caption: string
  lat: number | null
  lng: number | null
}

export type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: unknown }
  | { type: 'ADD_PHOTO'; payload: File }
  | { type: 'REMOVE_PHOTO'; payload: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }

const initial: FormState = {
  step: 1,
  errors: {},
  tipo: '', photos: [],
  species: '', name: '', breed: '', age_text: '', gender: '', status: '', overview: '',
  neighborhood: '', location_text: '', caption: '', lat: null, lng: null,
}

function validate(state: FormState): Record<string, string> {
  const e: Record<string, string> = {}
  if (state.step === 1 && !state.tipo) e.tipo = 'Selecione o tipo de aviso'
  if (state.step === 2) {
    if (!state.species) e.species = 'Selecione a espécie'
    if (!state.status)  e.status  = 'Selecione o status'
  }
  return e
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
      return { ...state, step: Math.min(3, state.step + 1) as FormState['step'], errors: {} }
    }
    case 'PREV':
      return { ...state, step: Math.max(1, state.step - 1) as FormState['step'], errors: {} }
    case 'SET_ERRORS':
      return { ...state, errors: action.payload }
    default:
      return state
  }
}

const STEP_TITLES = ['Aviso', 'Animal', 'Localização']

export default function AdicionarPage() {
  const router = useRouter()
  const [state, dispatch] = useReducer(reducer, initial)
  const [isPending, startTransition] = useTransition()

  const steps = [Step1Aviso, Step2Animal, Step4Localizacao]
  const StepComponent = steps[state.step - 1]
  const isLast = state.step === 3

  async function handleSubmit() {
    const fd = new FormData()
    fd.set('tipo',          state.tipo)
    fd.set('species',       state.species)
    fd.set('name',          state.name)
    fd.set('breed',         state.breed)
    fd.set('age_text',      state.age_text)
    fd.set('gender',        state.gender)
    fd.set('status',        state.status)
    fd.set('overview',      state.overview)
    fd.set('personality',   '')
    fd.set('neighborhood',  state.neighborhood)
    fd.set('location_text', state.location_text)
    if (state.lat != null) fd.set('lat', String(state.lat))
    if (state.lng != null) fd.set('lng', String(state.lng))
    fd.set('caption',       state.caption)
    fd.set('traits',        '[]')
    state.photos.forEach(f => fd.append('photos', f))

    startTransition(async () => {
      const result = await createPet(fd)
      if (result?.error) {
        dispatch({ type: 'SET_ERRORS', payload: { submit: result.error } })
      }
    })
  }

  return (
    <div className="flex flex-col min-h-dvh bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-2">
        <button
          onClick={() => state.step > 1 ? dispatch({ type: 'PREV' }) : router.back()}
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
            Etapa {state.step} de 3
          </p>
          <h1 className="text-[20px] font-extrabold text-ink leading-tight">
            {STEP_TITLES[state.step - 1]}
          </h1>
        </div>
      </div>

      <ProgressBar step={state.step} total={3} />

      {/* Conteúdo da etapa */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">
        <StepComponent state={state} dispatch={dispatch} />
      </div>

      {/* Controles fixos */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-[430px] px-5 py-3 bg-card border-t border-border pb-safe">
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
