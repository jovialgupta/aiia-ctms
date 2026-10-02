import { visibleNav } from '@/data/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Activity,
  Bell,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  FlaskConical,
  CalendarCheck,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const icons = {
  dashboard: LayoutDashboard,
  studies: FlaskConical,
  recruitment: Activity,
  milestones: CalendarCheck,
  alerts: Bell,
  audit: ClipboardList,
  users: Users,
  settings: Settings,
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, role } = useAuth()
  const items = visibleNav(role)

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/10 bg-navy text-slate-200">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-teal-600">
          AIIA
        </p>

        <h1 className="mt-1 text-base font-semibold leading-snug text-white">
          Clinical Research Management Platform
        </h1>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
          Clinical Trial Portfolio &amp; Compliance Dashboard
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = icons[item.key]

          return (
            <NavLink
              key={item.key}
              to={item.href}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* USER */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
            {user?.initials ||
              user?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {user?.name}
            </p>

            <p className="truncate text-xs text-slate-400">
              {user?.role
                ?.replaceAll("_", " ")
                .replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300">
          <Shield className="h-3.5 w-3.5 text-teal-600" />
          Phase 1 MVP
        </div>

        <p className="mt-2 px-1 text-[10px] leading-relaxed text-slate-400">
          Designed to support future GCP, CTRI, DPDP and regulatory workflows.
        </p>
      </div>
    </aside>
  )
}