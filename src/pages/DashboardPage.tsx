import { Card } from '@/components/ui/Card'
import { kpiByRange, portfolioMonthlyRecruitment, portfolioRecruitment, statusPortfolio } from '@/data/recruitment'
import { studies } from '@/data/studies'
import { useAuth } from '@/hooks/useAuth'
import type { DateRangeKey } from '@/types'
import { formatNumber } from '@/utils/cn'
import {
  Activity,
  AlertTriangle,
  Building2,
  ClipboardCheck,
  FileWarning,
  FlaskConical,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { useMemo, useState, type ElementType } from 'react'
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const ranges: { key: DateRangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
  { key: 'quarter', label: 'This Quarter' },
]

const colors = ['#94a3b8', '#f59e0b', '#fb7185', '#0d9488', '#0b3c5d', '#6366f1', '#157347', '#64748b']

export function DashboardPage() {
  const { role, user } = useAuth()
  const [range, setRange] = useState<DateRangeKey>('today')
  const kpis = kpiByRange[range]

  const cards: { label: string; value: string; trend: string; icon: ElementType }[] = [
    { label: 'Active Studies', value: String(kpis.activeStudies), trend: kpis.trends.activeStudies, icon: FlaskConical },
    { label: 'Total Participants', value: formatNumber(kpis.totalParticipants), trend: kpis.trends.totalParticipants, icon: Users },
    { label: 'Recruitment Progress', value: `${kpis.recruitmentProgress}%`, trend: kpis.trends.recruitmentProgress, icon: Activity },
    { label: 'Active Sites', value: String(kpis.activeSites), trend: kpis.trends.activeSites, icon: Building2 },
    { label: 'Pending IEC Actions', value: String(kpis.pendingIec), trend: kpis.trends.pendingIec, icon: ClipboardCheck },
    { label: 'CTRI Actions Due', value: String(kpis.ctriDue), trend: kpis.trends.ctriDue, icon: ShieldAlert },
    { label: 'Open Protocol Deviations', value: String(kpis.protocolDeviations), trend: kpis.trends.protocolDeviations, icon: AlertTriangle },
    { label: 'Open Data Queries', value: String(kpis.dataQueries), trend: kpis.trends.dataQueries, icon: FileWarning },
  ]

  const assigned = useMemo(
    () => (role === 'Administrator' ? studies : studies.filter((s) => user?.studies.includes(s.id) || s.piId === user?.id || s.coordinatorId === user?.id)),
    [role, user],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Clinical Research Portfolio</h1>
          <p className="mt-1 text-sm text-muted">
            Real-time overview of AIIA clinical studies, recruitment and compliance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ranges.map((item) => (
            <button
              key={item.key}
              onClick={() => setRange(item.key)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                range === item.key ? 'border-navy bg-navy text-white' : 'border-line bg-white text-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {role !== 'Administrator' && (
        <p className="rounded-lg border border-line bg-white px-4 py-2 text-sm text-muted">
          Showing portfolio KPIs with emphasis on {assigned.length} assigned studies for {user?.name}.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-50 p-2 text-navy">
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{card.value}</p>
              <p className="mt-1 text-xs text-teal">{card.trend}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-base font-semibold text-navy">Study Portfolio by Status</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPortfolio} dataKey="value" nameKey="name" innerRadius={68} outerRadius={100} paddingAngle={2}>
                  {statusPortfolio.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-navy">Overall Recruitment</h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Target</dt>
              <dd className="font-semibold">{formatNumber(portfolioRecruitment.target)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Enrolled</dt>
              <dd className="font-semibold">{formatNumber(portfolioRecruitment.enrolled)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Progress</dt>
              <dd className="font-semibold text-teal">{portfolioRecruitment.progress}%</dd>
            </div>
          </dl>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-teal" style={{ width: `${portfolioRecruitment.progress}%` }} />
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted">
            Centralized enrolment view for the AIIA portfolio. Site EDC feeds are not connected in Phase 1; figures are
            curated operational snapshots.
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-navy">Planned vs Actual Recruitment</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioMonthlyRecruitment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="planned" stroke="#0b3c5d" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="#0d9488" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
