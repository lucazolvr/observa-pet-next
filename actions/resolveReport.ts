'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/security'
import { revalidatePath } from 'next/cache'

export async function resolveReport(
  reportId: string,
  action: 'resolved' | 'dismissed',
  deletePost?: boolean,
  adminNote?: string
) {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  // Operação atômica via RPC — read + update (+ optional delete) em uma única transação
  // Elimina TOCTTOU entre verificar post_id e deletar o post
  await supabase.rpc('resolve_report_atomic', {
    p_report_id:   reportId,
    p_status:      action,
    p_admin_note:  adminNote?.trim().slice(0, 500) ?? null,
    p_delete_post: deletePost ?? false,
  })

  revalidatePath('/admin')
}
