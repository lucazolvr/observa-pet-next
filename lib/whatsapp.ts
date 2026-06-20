export function ongSupportUrl(ongName: string, whatsapp: string): string {
  const msg = `Olá! Vi a ${ongName} no ObservaPet e gostaria de saber como apoiar. 🐾`
  return `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

export function helpUrl(petName: string | null, bairro: string | null): string {
  const num = process.env.NEXT_PUBLIC_OBSERVAPET_WHATSAPP
  const name = petName ?? 'o animal'
  const local = bairro ? `${bairro}, São Luís - MA` : 'São Luís - MA'
  const msg = `Olá, equipe ObservaPet! 🐾 Quero ajudar ${name} (${local}). Como posso colaborar?`
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
}
