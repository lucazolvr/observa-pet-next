import { fetchPendingOngs, fetchPendingReports, fetchAdminStats, fetchAdminArticles } from '@/lib/admin'
import StatsCards from '@/components/admin/StatsCards'
import AdminTabs from '@/components/admin/AdminTabs'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [stats, ongs, reports, articles] = await Promise.all([
    fetchAdminStats(),
    fetchPendingOngs(),
    fetchPendingReports(),
    fetchAdminArticles(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-extrabold text-ink mb-3">Visão geral</h2>
        <StatsCards stats={stats} />
      </div>

      <AdminTabs
        ongs={ongs}
        reports={reports}
        articles={articles}
        ongsPending={stats.ongsPending}
        reportsPending={stats.reports}
      />
    </div>
  )
}
