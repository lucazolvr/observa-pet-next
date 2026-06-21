// Script de setup: cria usuários de teste via Supabase JS (hash correto)
// Executar: node scripts/create-e2e-users.mjs
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://shzrfrvgmsicvylqpmwm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoenJmcnZnbXNpY3Z5bHFwbXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDk2MDYsImV4cCI6MjA5MDEyNTYwNn0.hcYSUcerPsXT54Hp0dg-f2ZKpq7mPx8BC815pHszoTU'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

async function signup(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw new Error(`signUp ${email}: ${error.message}`)
  console.log(`✓ ${email} → id=${data.user?.id}`)
  return data.user?.id
}

const adminId = await signup('e2e-admin@observapet.test', 'E2eAdmin#2026', 'E2E Admin')
const userId  = await signup('e2e-user@observapet.test',  'E2eUser#2026',  'E2E Usuário')

console.log('\nAdmin ID:', adminId)
console.log('User  ID:', userId)
console.log('\nAgorar confirme os emails e promova o admin via SQL:')
console.log(`
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email IN ('e2e-admin@observapet.test', 'e2e-user@observapet.test');

UPDATE profiles SET role = 'admin'
WHERE id = '${adminId}';
`)
