'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/security'
import { fetchAdminUserEmail } from '@/lib/admin'

export async function getUserEmail(userId: string): Promise<string | null> {
  const supabase = await supaServer()
  await requireAdmin(supabase)
  return fetchAdminUserEmail(userId)
}
