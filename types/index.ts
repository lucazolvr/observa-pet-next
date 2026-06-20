export type UserRole = 'tutor' | 'protetor' | 'voluntario' | 'ong'
export type PostType = 'avistado' | 'resgate' | 'adocao' | 'perdido' | 'tratamento'
export type PetStatus = 'avistado' | 'urgente' | 'adocao' | 'tratamento' | 'resgatado'
export type PetSpecies = 'cachorro' | 'gato' | 'outro'

export type Profile = {
  id: string
  name: string
  role: UserRole
  avatar_url: string | null
  city: string
  bio: string | null
  verified: boolean
  created_at: string
}

export type Pet = {
  id: string
  created_by: string | null
  ong_id: string | null
  name: string | null
  species: PetSpecies
  breed: string | null
  age_text: string | null
  gender: string | null
  status: PetStatus
  rating: number | null
  overview: string | null
  personality: string | null
  traits: string[]
  neighborhood: string | null
  lat: number | null
  lng: number | null
  created_at: string
}

export type PostPhoto = {
  id: string
  post_id: string
  url: string
  position: number
}

export type Ong = {
  id: string
  owner_id: string | null
  name: string
  city: string
  mission: string | null
  avatar_url: string | null
  cover_url: string | null
  verified: boolean
  goal_cents: number
  raised_cents: number
  created_at: string
}

export type FeedPost = {
  id: string
  pet_id: string
  author_id: string
  type: PostType
  caption: string | null
  location_text: string | null
  neighborhood: string | null
  distance_text: string | null
  created_at: string
  pet: Pet
  photos: PostPhoto[]
  author: Profile
  likes_count: { count: number }[]
  helps_count: { count: number }[]
  saves_count: { count: number }[]
  comments_count: { count: number }[]
}
