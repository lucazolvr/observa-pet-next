'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PawMark from '@/components/PawMark'
import StatusBadge from '@/components/StatusBadge'
import type { PetStatus, PostPhoto } from '@/types'

type Props = {
  photos: PostPhoto[]
  status: PetStatus
  isModal: boolean
}

export default function PetCarousel({ photos, status, isModal }: Props) {
  const router = useRouter()
  const [idx, setIdx] = useState(0)

  const total = photos.length
  const sorted = [...photos].sort((a, b) => a.position - b.position)

  function prev() { setIdx(i => Math.max(0, i - 1)) }
  function next() { setIdx(i => Math.min(total - 1, i + 1)) }

  function handleBack() {
    if (isModal) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="relative h-[316px] w-full overflow-hidden bg-blue-soft">
      {total === 0 ? (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #e8f0ff 0%, #dce8ff 100%)' }}
        >
          <PawMark size={72} className="text-blue/20" />
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sorted[idx].url}
            alt=""
            className="w-full h-full object-cover"
          />

          {total > 1 && (
            <>
              <button
                onClick={prev}
                disabled={idx === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink/50 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                disabled={idx === total - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink/50 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30"
                aria-label="Próxima foto"
              >
                <ChevronRight size={18} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
                {sorted.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/40'}`}
                    aria-label={`Ir para foto ${i + 1}`}
                  />
                ))}
              </div>

              {/* Index */}
              <div className="absolute bottom-3 right-3 bg-ink/60 backdrop-blur-sm rounded-[8px] px-2 py-0.5">
                <span className="text-white text-[11px] font-medium">{idx + 1} / {total}</span>
              </div>
            </>
          )}
        </>
      )}

      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 w-9 h-9 rounded-full bg-ink/50 backdrop-blur-sm flex items-center justify-center text-white"
        aria-label="Voltar"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Status badge */}
      <div className="absolute top-4 right-4">
        <StatusBadge status={status} />
      </div>
    </div>
  )
}
