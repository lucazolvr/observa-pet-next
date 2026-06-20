import Image from 'next/image'
import Link from 'next/link'
import { PawPrint } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import type { UserPostItem } from '@/types'

export default function UserPostGrid({ posts }: { posts: UserPostItem[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
        <PawPrint size={36} strokeWidth={1.5} />
        <p className="text-sm">Nenhuma publicação ainda</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 px-4 pb-24">
      {posts.map(post => {
        const photo = [...post.photos].sort((a, b) => a.position - b.position)[0]
        const petName = post.pet?.name ?? (post.pet?.species ?? 'Animal')

        return (
          <Link
            key={post.id}
            href={`/pet/${post.pet?.id}`}
            className="relative rounded-card overflow-hidden bg-card aspect-square shadow-card"
          >
            {photo ? (
              <Image
                src={photo.url}
                alt={petName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 200px"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-blue-soft">
                <PawPrint size={32} className="text-blue opacity-50" />
              </div>
            )}
            {/* Overlay info */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 pt-6 pb-2">
              <p className="text-white text-xs font-semibold line-clamp-1">{petName}</p>
              {post.pet?.status && (
                <div className="mt-0.5">
                  <StatusBadge status={post.pet.status} />
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
