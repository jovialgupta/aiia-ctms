import { Badge, Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { alerts } from '@/data/alerts'
import { studies } from '@/data/studies'
import type { AlertSeverity, AlertStatus } from '@/types'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const severities: Array<'All' | AlertSeverity> = ['All', 'Critical', 'Warning', 'Information', 'Completed']
const statuses: Array<'All' | AlertStatus> = ['All', 'Open', 'Acknowledged', 'Resolved']

export function AlertsPage() {
  const [severity, setSeverity] = useState<(typeof severities)[number]>('All')
  const [study, setStudy] = useState('All')
  const [status, setStatus] = useState<(typeof statuses)[number]>('All')
  const [date, setDate] = useState('')

  const rows = useMemo(
    () =>
      alerts.filter((item) => {
        const s = severity === 'All' || item.severity === severity
        const st = study === 'All' || item.studyId === study
        const sta = status === 'All' || item.status === status
        const d = !date || item.date === date
        return s && st && sta && d
      }),
    [severity, study, status, date],
  )

  const counts = {
    Critical: alerts.filter((a) => a.severity === 'Critical').length,
    Warning: alerts.filter((a) => a.severity === 'Warning').length,
    Information: alerts.filter((a) => a.severity === 'Information').length,
    Completed: alerts.filter((a) => a.severity === 'Completed').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Alert Center</h1>
        <p className="mt-1 text-sm text-muted">Operational exceptions requiring coordinator or investigator action.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {(Object.keys(counts) as AlertSeverity[]).map((key) => (
          <Card key={key}>
            <p className="text-xs font-semibold uppercase text-muted">{key}</p>
            <p className="mt-2 text-2xl font-semibold">{counts[key]}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-4">
        <Select value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)}>
          {severities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select value={study} onChange={(e) => setStudy(e.target.value)}>
          <option>All</option>
          {studies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id}
            </option>
          ))}
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
      </div>
      <Card className="p-0">
        <ul className="divide-y divide-slate-100">
          {rows.map((item) => (
            <li key={item.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                  <Link to={`/studies/${item.studyId}`} className="mt-2 inline-block text-sm font-semibold text-teal">
                    {item.studyId}
                  </Link>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge>{item.severity}</Badge>
                  <Badge>{item.status}</Badge>
                  <span className="text-xs text-muted">{item.date}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
