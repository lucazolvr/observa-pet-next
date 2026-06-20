import { fetchOng } from '@/lib/ongs'
import PetProfileBackdrop from '@/components/PetProfileBackdrop'
import OngProfile from '@/components/OngProfile'

export default async function OngModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ong = await fetchOng(id)

  if (!ong) return null

  return (
    <>
      <PetProfileBackdrop />
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        <div className="w-full max-w-[430px] h-[88dvh] bg-bg rounded-t-sheet overflow-y-auto animate-slide-up pointer-events-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-bg z-10">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
          <OngProfile ong={ong} />
        </div>
      </div>
    </>
  )
}
