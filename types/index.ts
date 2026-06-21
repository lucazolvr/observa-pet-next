export type UserRole = 'tutor' | 'protetor' | 'voluntario' | 'ong' | 'admin'
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
  is_official: boolean
  banned: boolean
  ban_reason: string | null
  suspended_until: string | null
  created_at: string
}

export type AdminUserRow = {
  id: string
  name: string
  role: UserRole
  city: string | null
  verified: boolean
  banned: boolean
  ban_reason: string | null
  suspended_until: string | null
  created_at: string
  email?: string
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

export type OngStatus = 'pending' | 'approved' | 'rejected'

export type Ong = {
  id: string
  owner_id: string | null
  name: string
  city: string | null
  mission: string | null
  avatar_url: string | null
  cover_url: string | null
  verified: boolean | null
  goal_cents: number | null
  raised_cents: number | null
  whatsapp: string | null
  cnpj: string | null
  status: OngStatus | null
  rejection_reason: string | null
  created_at: string
}

export type Report = {
  id: string
  reporter_id: string | null
  post_id: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  admin_note: string | null
  created_at: string
  reporter?: Pick<Profile, 'id' | 'name'> | null
  post?: Pick<FeedPost, 'id' | 'type' | 'caption' | 'photos'> & {
    neighborhood: string | null
    pet: Pick<Pet, 'name' | 'species'>
    author: Pick<Profile, 'id' | 'name'>
  }
}

export type Notification = {
  id: string
  user_id: string
  type: string
  text: string
  read: boolean
  created_at: string
}

export type UserPostItem = {
  id: string
  type: PostType
  neighborhood: string | null
  created_at: string
  photos: PostPhoto[]
  pet: Pick<Pet, 'id' | 'name' | 'status' | 'species'>
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

export type ArticleCategory = 'legislacao' | 'cuidados' | 'campanhas' | 'eventos'

export type Article = {
  id: string
  title: string
  excerpt: string | null
  body: string
  category: ArticleCategory
  cover_url: string | null
  author: string | null
  read_minutes: number | null
  published_at: string
}

export type HeatEntry = {
  neighborhood: string
  count: number
}

export type Comment = {
  id: string
  text: string
  created_at: string
  author: Pick<Profile, 'name' | 'avatar_url'>
}

export type PetPost = {
  id: string
  type: PostType
  caption: string | null
  location_text: string | null
  neighborhood: string | null
  created_at: string
  photos: PostPhoto[]
  likes_count: { count: number }[]
  helps_count: { count: number }[]
  comments_count: { count: number }[]
}

export type PetWithPosts = Pet & {
  creator: Pick<Profile, 'id' | 'name' | 'role' | 'avatar_url' | 'verified'> | null
  ong: Pick<Ong, 'id' | 'name' | 'avatar_url' | 'verified'> | null
  posts: PetPost[]
}

export type AppEventType = 'share' | 'help' | 'message'

export type AppEvent = {
  id: string
  event_type: AppEventType
  metadata: Record<string, unknown> | null
  created_at: string
  user: Pick<Profile, 'id' | 'name'> | null
  post: {
    id: string
    type: PostType
    neighborhood: string | null
    pet: Pick<Pet, 'name' | 'species'>
  } | null
}
