import {
  fetchAllOngs, fetchAllReports, fetchAdminStats,
  fetchAdminArticles, fetchAdminUsers, fetchAdminPosts, fetchAdminEvents
} from '@/lib/admin'
import { fetchOfficialProfile, fetchOfficialPosts } from '@/actions/admin/officialProfile'
import StatsCards from '@/components/admin/StatsCards'
import AdminTabs from '@/components/admin/AdminTabs'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin · ObservaPet' }

export default async function AdminPage() {
  const [stats, ongs, reports, posts, articles, users, events, officialProfile, officialPosts] = await Promise.all([
    fetchAdminStats(),
    fetchAllOngs(),
    fetchAllReports(),
    fetchAdminPosts(),
    fetchAdminArticles(),
    fetchAdminUsers(),
    fetchAdminEvents(),
    fetchOfficialProfile(),
    fetchOfficialPosts(),
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
        posts={posts}
        articles={articles}
        users={users}
        events={events}
        ongsPending={stats.ongsPending}
        reportsPending={stats.reports}
        officialProfile={officialProfile}
        officialPosts={officialPosts}
      />
    </div>
  )
}
