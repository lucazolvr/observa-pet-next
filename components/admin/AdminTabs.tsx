'use client'

import { useState } from 'react'
import OngQueue from '@/components/admin/OngQueue'
import ReportsQueue from '@/components/admin/ReportsQueue'
import ArticleEditorPanel from '@/components/admin/ArticleEditor'
import UsersPanel from '@/components/admin/UsersPanel'
import PostsPanel from '@/components/admin/PostsPanel'
import EventsLog from '@/components/admin/EventsLog'
import OfficialProfilePanel from '@/components/admin/OfficialProfilePanel'
import type { Ong, Report, Article, AdminUserRow, FeedPost, AppEvent, Profile } from '@/types'

type Tab = 'ongs' | 'reports' | 'posts' | 'artigos' | 'usuarios' | 'logs' | 'oficial'

type Props = {
  ongs: Ong[]
  reports: Report[]
  posts: FeedPost[]
  articles: Article[]
  users: AdminUserRow[]
  events: AppEvent[]
  ongsPending: number
  reportsPending: number
  officialProfile: Profile | null
  officialPosts: FeedPost[]
}

function TabBtn({ active, badge, onClick, children }: {
  active: boolean; badge?: number; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
        active ? 'border-blue text-blue' : 'border-transparent text-muted hover:text-body'
      }`}
    >
      {children}
      {!!badge && (
        <span className="min-w-[18px] h-[18px] rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center px-1">
          {badge}
        </span>
      )}
    </button>
  )
}

export default function AdminTabs({
  ongs, reports, posts, articles, users, events,
  ongsPending, reportsPending, officialProfile, officialPosts,
}: Props) {
  const [tab, setTab] = useState<Tab>('ongs')

  return (
    <div>
      <div className="flex border-b border-border mb-4 overflow-x-auto scrollbar-hide">
        <TabBtn active={tab === 'ongs'}     badge={ongsPending}    onClick={() => setTab('ongs')}>ONGs</TabBtn>
        <TabBtn active={tab === 'reports'}  badge={reportsPending} onClick={() => setTab('reports')}>Denúncias</TabBtn>
        <TabBtn active={tab === 'posts'}    onClick={() => setTab('posts')}>Posts</TabBtn>
        <TabBtn active={tab === 'artigos'}  onClick={() => setTab('artigos')}>Artigos</TabBtn>
        <TabBtn active={tab === 'usuarios'} onClick={() => setTab('usuarios')}>Usuários</TabBtn>
        <TabBtn active={tab === 'logs'}     onClick={() => setTab('logs')}>Logs</TabBtn>
        <TabBtn active={tab === 'oficial'}  onClick={() => setTab('oficial')}>⭐ Oficial</TabBtn>
      </div>

      {tab === 'ongs'      && <OngQueue ongs={ongs} />}
      {tab === 'reports'   && <ReportsQueue reports={reports} />}
      {tab === 'posts'     && <PostsPanel posts={posts} />}
      {tab === 'artigos'   && <ArticleEditorPanel articles={articles} />}
      {tab === 'usuarios'  && <UsersPanel users={users} />}
      {tab === 'logs'      && <EventsLog events={events} />}
      {tab === 'oficial'   && <OfficialProfilePanel profile={officialProfile} posts={officialPosts} />}
    </div>
  )
}
