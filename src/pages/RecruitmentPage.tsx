import { Badge, Card, ProgressBar } from '@/components/ui/Card'
import { formatNumber } from '@/utils/cn'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const API_BASE = 'http://127.0.0.1:8000'

type Study = {
  id: string
  title: string
  target: number
  enrolled: number
  screened: number
  status: string
}

type RecruitmentPoint = {
  month: string
  planned: number
  actual: number
}

type PortfolioRecruitment = {
  target: number
  enrolled: number
  progress: number
  monthly: RecruitmentPoint[]
}

type Site = {
  id: string
  site: string
  target: number
  enrolled: number
  status: string
}

async function apiFetch<T>(path: string): Promise<T> {
  const token = localStorage.getItem('ctms_token')

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`)
  }

  return response.json()
}

export function RecruitmentPage() {
  const [studies, setStudies] = useState<Study[]>([])
  const [portfolio, setPortfolio] =
    useState<PortfolioRecruitment | null>(null)
  const [sites, setSites] = useState<Site[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRecruitment() {
      try {
        setLoading(true)
        setError('')

        const [studyData, portfolioData] = await Promise.all([
          apiFetch<Study[]>('/api/studies'),
          apiFetch<PortfolioRecruitment>('/api/dashboard/recruitment'),
        ])

        setStudies(studyData)
        setPortfolio(portfolioData)

        const siteResults = await Promise.all(
          studyData.map(async (study) => {
            try {
              return await apiFetch<Site[]>(
                `/api/studies/${study.id}/sites`,
              )
            } catch (err) {
              console.error(
                `Failed to load sites for ${study.id}`,
                err,
              )
              return []
            }
          }),
        )

        setSites(siteResults.flat())
      } catch (err) {
        console.error(err)
        setError('Unable to load recruitment data.')
      } finally {
        setLoading(false)
      }
    }

    loadRecruitment()
  }, [])

  const target = portfolio?.target ?? 0
  const enrolled = portfolio?.enrolled ?? 0

  const screened = useMemo(
    () =>
      studies.reduce(
        (sum, study) => sum + (study.screened ?? 0),
        0,
      ),
    [studies],
  )

  const progress =
    target > 0
      ? Math.round((enrolled / target) * 1000) / 10
      : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-navy">
            Recruitment
          </h1>
          <p className="mt-1 text-sm text-muted">
            Portfolio and study-level enrolment against planned targets.
          </p>
        </div>

        <Card>
          <div className="py-12 text-center text-sm text-muted">
            Loading recruitment data...
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-navy">
            Recruitment
          </h1>
          <p className="mt-1 text-sm text-muted">
            Portfolio and study-level enrolment against planned targets.
          </p>
        </div>

        <Card>
          <div className="py-12 text-center text-sm text-red-600">
            {error}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">
          Recruitment
        </h1>

        <p className="mt-1 text-sm text-muted">
          Portfolio and study-level enrolment against planned targets.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase text-muted">
            Target
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {formatNumber(target)}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase text-muted">
            Screened
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {formatNumber(screened)}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase text-muted">
            Enrolled
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {formatNumber(enrolled)}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase text-muted">
            Progress
          </p>

          <p className="mt-2 text-2xl font-semibold text-teal">
            {progress}%
          </p>
        </Card>
      </div>

      {/* PLANNED VS ACTUAL */}
      <Card>
        <h2 className="text-base font-semibold text-navy">
          Planned vs Actual Recruitment
        </h2>

        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={portfolio?.monthly ?? []}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
              />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="planned"
                stroke="#0b3c5d"
                strokeWidth={2}
                name="Planned"
              />

              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0d9488"
                strokeWidth={2}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* STUDY ENROLMENT */}
      <Card>
        <h2 className="text-base font-semibold text-navy">
          Study enrolment
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-2">Study</th>
                <th>Target</th>
                <th>Enrolled</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {studies.map((study) => {
                const studyProgress =
                  study.target > 0
                    ? Math.round(
                      (study.enrolled / study.target) * 100,
                    )
                    : 0

                return (
                  <tr
                    key={study.id}
                    className="border-t border-slate-100"
                  >
                    <td className="py-3">
                      <Link
                        to={`/studies/${study.id}`}
                        className="font-semibold text-navy hover:underline"
                      >
                        {study.id}
                      </Link>

                      <p className="text-xs text-muted">
                        {study.title}
                      </p>
                    </td>

                    <td>
                      {formatNumber(study.target)}
                    </td>

                    <td>
                      {formatNumber(study.enrolled)}
                    </td>

                    <td className="w-48">
                      <ProgressBar value={studyProgress} />

                      <span className="text-xs">
                        {studyProgress}%
                      </span>
                    </td>

                    <td>
                      <Badge>{study.status}</Badge>
                    </td>
                  </tr>
                )
              })}

              {studies.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted"
                  >
                    No recruitment studies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RECRUITMENT BY SITE */}
      <Card>
        <h2 className="text-base font-semibold text-navy">
          Recruitment by Site
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="py-2">Site</th>
                <th>Target</th>
                <th>Enrolled</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {sites.map((site) => {
                const siteProgress =
                  site.target > 0
                    ? Math.round(
                      (site.enrolled / site.target) * 100,
                    )
                    : 0

                return (
                  <tr
                    key={site.id}
                    className="border-t border-slate-100"
                  >
                    <td className="py-3 font-medium">
                      {site.site}
                    </td>

                    <td>
                      {formatNumber(site.target)}
                    </td>

                    <td>
                      {formatNumber(site.enrolled)}
                    </td>

                    <td>
                      {siteProgress}%
                    </td>

                    <td>
                      <Badge>{site.status}</Badge>
                    </td>
                  </tr>
                )
              })}

              {sites.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted"
                  >
                    No recruitment site data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}