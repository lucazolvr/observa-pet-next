import { z } from 'zod'

// ─── Primitivos reutilizáveis ─────────────────────────────────────────────────

// z.preprocess garante compatibilidade com Zod v4 e trata strings vazias como null
const optText = (max = 100) => z.preprocess(
  v => (typeof v !== 'string' || v.trim() === '') ? null : v.trim(),
  z.string().max(max).nullable(),
)
const shortText  = (max = 100) => z.string().min(1).max(max).trim()
const phone      = z.string().regex(/^\d{10,15}$/, 'WhatsApp inválido').transform(s => s.replace(/\D/g, ''))
const cnpj       = z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos')

// ─── Schemas por domínio ──────────────────────────────────────────────────────

export const commentSchema = z.object({
  text: z.string().min(1, 'Comentário vazio').max(500, 'Máximo 500 caracteres').transform(s => s.trim()),
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(60, 'Nome muito longo').transform(s => s.trim()),
  bio:  optText(300),
  city: optText(80),
})

export const ongSchema = z.object({
  name:     shortText(100).pipe(z.string().min(2, 'Nome muito curto')),
  cnpj:     cnpj,
  city:     shortText(80).pipe(z.string().min(2, 'Cidade obrigatória')),
  whatsapp: phone,
  mission:  shortText(1000).pipe(z.string().min(10, 'Missão muito curta')),
})

export const reportSchema = z.object({
  reason: z.enum(['spam', 'inappropriate', 'fake', 'animal_cruelty', 'other'], { error: 'Motivo inválido' }),
})

export const articleSchema = z.object({
  title:        shortText(200).pipe(z.string().min(3, 'Título muito curto')),
  body:         z.string().min(10, 'Conteúdo muito curto').max(50_000).transform(s => s.trim()),
  category:     z.enum(['legislacao', 'cuidados', 'campanhas', 'eventos']),
  excerpt:      optText(500),
  cover_url:    z.string().url('URL inválida').optional().or(z.literal('')).transform(v => v || null),
  author:       optText(100),
  read_minutes: z.coerce.number().int().min(1).max(60).nullable().optional(),
  published_at: z.string().datetime().optional().nullable(),
})

export const banSchema = z.object({
  reason: z.string().min(5, 'Motivo muito curto').max(500).transform(s => s.trim()),
})

export const suspendSchema = z.object({
  hours:  z.number().int().min(1).max(720),
  reason: z.string().min(5, 'Motivo muito curto').max(500).transform(s => s.trim()),
})

export const emailSchema = z.object({
  email: z.string().email('Email inválido').max(254).transform(s => s.trim().toLowerCase()),
})

export const petSchema = z.object({
  species:      z.enum(['cachorro', 'gato', 'outro']),
  type:         z.enum(['avistado', 'resgate', 'adocao', 'perdido', 'tratamento']),
  name:         optText(60),
  breed:        optText(60),
  age_text:     optText(40),
  // O formulário envia 'Macho', 'Fêmea', 'Não identificado' ou '' — aceitar como string livre
  gender: z.preprocess(
    v => (!v || v === 'Não identificado') ? null : v,
    z.string().max(50).nullable(),
  ),
  status:       z.string().max(30),
  overview:     optText(500),
  personality:  optText(500),
  neighborhood: optText(100),
  caption:      optText(1000),
  location_text:optText(200),
})

export const pushSubscribeSchema = z.object({
  action: z.enum(['subscribe', 'unsubscribe']),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth:   z.string().min(1),
    }),
  }).optional(),
})
