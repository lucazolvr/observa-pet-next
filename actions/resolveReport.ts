'use server'

import { supaServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resolveReport(
  reportId: string,
  action: 'resolved' | 'dismissed',
  deletePost?: boolean,
  adminNote?: string
) {
  const supabase = await supaServer()

  if (deletePost) {
    const { data: report } = await supabase
      .from('reports')
      .select('post_id')
      .eq('id', reportId)
      .single()
    if (report?.post_id) {
      await supabase.from('posts').delete().eq('id', report.post_id)
    }
  }

  await supabase
    .from('reports')
    .update({ status: action, admin_note: adminNote ?? null })
    .eq('id', reportId)

  revalidatePath('/admin')
}
