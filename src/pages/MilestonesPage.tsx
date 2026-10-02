import { Badge, Card } from '@/components/ui/Card'
import { complianceItems } from '@/data/milestones'
import { Link } from 'react-router-dom'

const kpis = [
  { label: 'IEC Approvals', primary: '18 Completed', secondary: '6 Pending' },
  { label: 'CTRI Registration', primary: '20 Registered', secondary: '4 Actions Due' },
  { label: 'Site Activation', primary: '42 Active', secondary: '5 Pending' },
  { label: 'Monitoring', primary: '12 Upcoming', secondary: '3 Overdue' },
]

const icon: Record<string, string> = {
  Critical: '🔴',
  Warning: '🟠',
  Information: '🔵',
  Completed: '🟢',
}

export function MilestonesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Milestones &amp; Compliance</h1>
        <p className="mt-1 text-sm text-muted">
          Upcoming IEC, CTRI, activation and monitoring actions across the AIIA portfolio.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <Card key={item.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-ink">{item.primary}</p>
            <p className="mt-1 text-sm text-warning">{item.secondary}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="text-base font-semibold text-navy">Upcoming deadlines</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {complianceItems.map((item) => {
            // Keep the existing milestone data/UI unchanged.
            // The old milestone data may contain legacy study codes such as
            // AIIA-AYU-2026-001, while the backend uses AIIA-CT-001.
            // Convert only the route identifier used for navigation.
            const studyNumber = item.studyId.match(/(\d{3})$/)?.[1]
            const studyRouteId = studyNumber ? `AIIA-CT-${studyNumber}` : item.studyId

            return (
              <li key={item.id}>
                <Link
                  to={`/studies/${studyRouteId}`}
                  className="flex items-start gap-3 py-3 hover:bg-slate-50"
                >
                  <span className="mt-0.5">{icon[item.severity]}</span>
                  <div>
                    <p className="font-medium text-ink">{item.title}</p>
                    <p className="text-sm text-muted">{item.studyId} · due {item.dueDate}</p>
                    <p className="mt-1 text-xs text-muted">{item.description}</p>
                  </div>
                  <Badge>{item.severity}</Badge>
                </Link>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
