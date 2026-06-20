'use server'

import { fetchAdminUserEmail } from '@/lib/admin'

export async function getUserEmail(userId: string): Promise<string | null> {
  return fetchAdminUserEmail(userId)
}
