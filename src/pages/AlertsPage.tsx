import { Badge, Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import type { AlertSeverity, AlertStatus } from '@/types'
import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL

type AlertRow = {
  id: string
  study_id: string | null
  study_code: string | null
  title: string
  description: string | null
  severity: AlertSeverity
  status: AlertStatus
  due_date: string | null
  date: string | null
  category: string | null
}

async function fetchAlerts(): Promise<AlertRow[]> {
  const token = localStorage.getItem('ctms_token')

  const response = await fetch(`${API_BASE}/api/alerts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load alerts')
  }

  return response.json()
}

const severities: Array<'All' | AlertSeverity> = [
  'All',
  'Critical',
  'Warning',
  'Information',
  'Completed',
]

const statuses: Array<'All' | AlertStatus> = [
  'All',
  'Open',
  'Acknowledged',
  'Resolved',
]

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([])
  const [severity, setSeverity] =
    useState<(typeof severities)[number]>('All')
  const [study, setStudy] = useState('All')
  const [status, setStatus] =
    useState<(typeof statuses)[number]>('All')
  const [date, setDate] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAlerts()
      .then(setAlerts)
      .catch((err) => {
        console.error(err)
        setError('Unable to load alerts.')
      })
      .finally(() => setLoading(false))
  }, [])

  const studyOptions = useMemo(() => {
    return [
      'All',
      ...Array.from(
        new Set(
          alerts
            .map((alert) => alert.study_code)
            .filter(
              (studyCode): studyCode is string =>
                Boolean(studyCode),
            ),
        ),
      ),
    ]
  }, [alerts])

  const rows = useMemo(() => {
    return alerts.filter((item) => {
      const matchesSeverity =
        severity === 'All' ||
        item.severity === severity

      const matchesStudy =
        study === 'All' ||
        item.study_code === study

      const matchesStatus =
        status === 'All' ||
        item.status === status

      const itemDate =
        item.date ?? item.due_date ?? ''

      const matchesDate =
        !date || itemDate === date

      return (
        matchesSeverity &&
        matchesStudy &&
        matchesStatus &&
        matchesDate
      )
    })
  }, [alerts, severity, study, status, date])

  const counts = {
    Critical: alerts.filter(
      (a) => a.severity === 'Critical',
    ).length,

    Warning: alerts.filter(
      (a) => a.severity === 'Warning',
    ).length,

    Information: alerts.filter(
      (a) => a.severity === 'Information',
    ).length,

    Completed: alerts.filter(
      (a) => a.severity === 'Completed',
    ).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">
          Alert Center
        </h1>

        <p className="mt-1 text-sm text-muted">
          Operational exceptions requiring coordinator or investigator action.
        </p>
      </div>

      {loading && (
        <Card>
          <div className="py-10 text-center text-sm text-muted">
            Loading alerts...
          </div>
        </Card>
      )}

      {error && (
        <Card>
          <div className="py-10 text-center text-sm text-red-600">
            {error}
          </div>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* ALERT COUNTS */}
          <div className="grid gap-4 md:grid-cols-4">
            {(Object.keys(counts) as AlertSeverity[]).map(
              (key) => (
                <Card key={key}>
                  <p className="text-xs font-semibold uppercase text-muted">
                    {key}
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {counts[key]}
                  </p>
                </Card>
              ),
            )}
          </div>

          {/* FILTERS */}
          <div className="grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-4">
            <Select
              value={severity}
              onChange={(e) =>
                setSeverity(
                  e.target.value as typeof severity,
                )
              }
            >
              {severities.map((item) => (
                <option key={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select
              value={study}
              onChange={(e) =>
                setStudy(e.target.value)
              }
            >
              {studyOptions.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </Select>

            <Input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

            <Select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as typeof status,
                )
              }
            >
              {statuses.map((item) => (
                <option key={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          {/* ALERT LIST */}
          <Card className="p-0">
            <ul className="divide-y divide-slate-100">
              {rows.map((item) => (
                <li
                  key={item.id}
                  className="px-5 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge>
                        {item.severity}
                      </Badge>

                      <Badge>
                        {item.status}
                      </Badge>

                      <span className="text-xs text-muted">
                        {item.date ??
                          item.due_date ??
                          '—'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}

              {rows.length === 0 && (
                <li className="px-5 py-10 text-center text-sm text-muted">
                  No alerts found.
                </li>
              )}
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}