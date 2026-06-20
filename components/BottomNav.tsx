'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, Info, User } from 'lucide-react'
import PawMark from './PawMark'

const TABS = [
  { href: '/',        icon: Home,      label: 'Início' },
  { href: '/ongs',    icon: Building2, label: 'ONGs' },
  { href: '/adicionar', icon: null,    label: 'Adicionar' },
  { href: '/info',    icon: Info,      label: 'Informações' },
  { href: '/perfil',  icon: User,      label: 'Perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
      <div className="w-full max-w-[430px] bg-card border-t border-border pb-safe flex items-center px-2">
        {TABS.map((tab, i) => {
          if (tab.icon === null) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex justify-center"
                aria-label="Adicionar animal"
              >
                <span
                  className="
                    -mt-5 w-14 h-14 rounded-full
                    flex items-center justify-center
                    shadow-btn
                  "
                  style={{ background: 'linear-gradient(135deg, #2a6af0, #5b8cff)' }}
                >
                  <PawMark size={26} className="text-white" />
                </span>
              </Link>
            )
          }

          const Icon = tab.icon
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-blue' : 'text-muted'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
