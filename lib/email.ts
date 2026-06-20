import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'ObservaPet <noreply@observapet.com.br>'

export async function sendOngApprovedEmail(to: string, ongName: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: `🎉 Sua ONG "${ongName}" foi aprovada!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#2a6af0">Parabéns! Sua ONG foi aprovada 🐾</h1>
        <p>A ONG <strong>${ongName}</strong> agora está visível para todos os usuários do ObservaPet.</p>
        <p>Você pode editar o perfil, adicionar uma foto de capa, missão e link de doação diretamente no app.</p>
        <a href="https://observapet.com.br/ongs" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2a6af0;color:white;border-radius:12px;text-decoration:none;font-weight:bold">
          Ver minha ONG
        </a>
        <p style="margin-top:32px;color:#888;font-size:12px">ObservaPet · São Luís, MA</p>
      </div>
    `,
  })
}

export async function sendOngRejectedEmail(to: string, ongName: string, reason: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Sobre o cadastro da ONG "${ongName}" no ObservaPet`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#ff6a55">Cadastro não aprovado</h1>
        <p>Infelizmente o cadastro da ONG <strong>${ongName}</strong> não foi aprovado desta vez.</p>
        <div style="background:#fff1ee;border-radius:12px;padding:16px;margin:16px 0">
          <strong>Motivo:</strong> ${reason}
        </div>
        <p>Você pode corrigir as informações e submeter novamente através do app.</p>
        <a href="https://observapet.com.br/cadastro-ong" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2a6af0;color:white;border-radius:12px;text-decoration:none;font-weight:bold">
          Tentar novamente
        </a>
        <p style="margin-top:32px;color:#888;font-size:12px">ObservaPet · São Luís, MA</p>
      </div>
    `,
  })
}
