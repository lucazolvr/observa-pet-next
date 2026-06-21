import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://shzrfrvgmsicvylqpmwm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoenJmcnZnbXNpY3Z5bHFwbXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDk2MDYsImV4cCI6MjA5MDEyNTYwNn0.hcYSUcerPsXT54Hp0dg-f2ZKpq7mPx8BC815pHszoTU'

// IDs dos usuários de teste (rate_limits tem sem RLS + anon tem DELETE)
const TEST_USER_IDS = [
  'c25c6b3a-11a8-4c4a-8f05-36948328affe', // e2e-user
  '8cee7e30-b6c5-4038-9438-f1a440701b3f', // e2e-admin
]

export default async function globalSetup() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

  for (const userId of TEST_USER_IDS) {
    const { error } = await supabase
      .from('rate_limits')
      .delete()
      .or(`key.like.%${userId}%`)

    if (error) {
      console.warn(`[globalSetup] Aviso: falha ao limpar rate_limits para ${userId}:`, error.message)
    }
  }

  console.log('[globalSetup] Rate limits dos usuários de teste limpos.')
}
