import { GlobalSearch } from '@/components/layout/GlobalSearch'
import { alerts } from '@/data/alerts'
import { useAuth } from '@/hooks/useAuth'
import { Bell, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Header({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth()
  const [openAlerts, setOpenAlerts] = useState(false)
  const openCount = alerts.filter((a) => a.status === 'Open').length

  return (
    <header className="flex items-center gap-4 border-b border-line bg-white px-4 py-3 lg:px-6">
      <button className="rounded-lg p-2 text-navy lg:hidden" onClick={onMenu} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </button>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-3">
        <div className="relative">
          <button
            className="relative rounded-lg border border-line p-2 text-muted hover:bg-slate-50"
            onClick={() => setOpenAlerts((v) => !v)}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] text-white">
              {openCount}
            </span>
          </button>
          {openAlerts && (
            <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-lg border border-line bg-white shadow-lg">
              <p className="border-b border-line px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Open alerts
              </p>
              {alerts
                .filter((a) => a.status === 'Open')
                .slice(0, 4)
                .map((a) => (
                  <Link
                    key={a.id}
                    to="/alerts"
                    onClick={() => setOpenAlerts(false)}
                    className="block border-b border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <span className="font-medium text-ink">{a.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">{a.studyId}</span>
                  </Link>
                ))}
            </div>
          )}
        </div>
        <div className="hidden h-10 items-center rounded-lg border border-line bg-white px-3 text-xs font-medium text-ink md:flex">
          {user?.role
            ?.replaceAll('_', ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
            {user?.initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight text-ink">{user?.name}</p>
            <p className="text-xs text-muted">{user?.role}</p>
          </div>
        </div>
        <button className="rounded-lg p-2 text-muted hover:bg-slate-50" onClick={logout} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
