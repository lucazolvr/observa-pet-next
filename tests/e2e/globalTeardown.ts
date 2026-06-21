import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://shzrfrvgmsicvylqpmwm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoenJmcnZnbXNpY3Z5bHFwbXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDk2MDYsImV4cCI6MjA5MDEyNTYwNn0.hcYSUcerPsXT54Hp0dg-f2ZKpq7mPx8BC815pHszoTU'

export default async function globalTeardown() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

  const { error } = await supabase.rpc('cleanup_e2e_data')
  if (error) {
    console.warn('[globalTeardown] Aviso: falha ao limpar dados de E2E:', error.message)
  } else {
    console.log('[globalTeardown] Dados de E2E removidos após os testes.')
  }
}
