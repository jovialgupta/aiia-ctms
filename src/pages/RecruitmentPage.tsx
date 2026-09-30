import { Badge, Card, ProgressBar } from '@/components/ui/Card'
import { defaultSites, portfolioMonthlyRecruitment } from '@/data/recruitment'
import { recruitmentPercent, studies } from '@/data/studies'
import { useAuth } from '@/hooks/useAuth'
import { formatNumber } from '@/utils/cn'
import { Link } from 'react-router-dom'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function RecruitmentPage() {
  const { role, user } = useAuth()
  const rows = role === 'Administrator'
    ? studies
    : studies.filter((s) => user?.studies.includes(s.id) || s.coordinatorId === user?.id || s.piId === user?.id)

  const enrolled = rows.reduce((sum, s) => sum + s.enrolled, 0)
  const target = rows.reduce((sum, s) => sum + s.target, 0)
  const screened = rows.reduce((sum, s) => sum + s.screened, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Recruitment</h1>
        <p className="mt-1 text-sm text-muted">
          {role === 'Study Coordinator'
            ? 'Site-level enrolment, screening and participant tracking for assigned studies.'
            : 'Portfolio and study-level enrolment against planned targets.'}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs font-semibold uppercase text-muted">Target</p>
          <p className="mt-2 text-2xl font-semibold">{formatNumber(target)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-muted">Screened</p>
          <p className="mt-2 text-2xl font-semibold">{formatNumber(screened)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-muted">Enrolled</p>
          <p className="mt-2 text-2xl font-semibold">{formatNumber(enrolled)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase text-muted">Progress</p>
          <p className="mt-2 text-2xl font-semibold text-teal">
            {target ? Math.round((enrolled / target) * 1000) / 10 : 0}%
          </p>
        </Card>
      </div>
      <Card>
        <h2 className="text-base font-semibold text-navy">Planned vs Actual Recruitment</h2>
        <div className="mt-4 h-72">
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
      <Card>
        <h2 className="text-base font-semibold text-navy">Study enrolment</h2>
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
              {rows.map((study) => (
                <tr key={study.id} className="border-t border-slate-100">
                  <td className="py-3">
                    <Link to={`/studies/${study.id}`} className="font-semibold text-navy hover:underline">
                      {study.id}
                    </Link>
                    <p className="text-xs text-muted">{study.title}</p>
                  </td>
                  <td>{study.target}</td>
                  <td>{study.enrolled}</td>
                  <td className="w-48">
                    <ProgressBar value={recruitmentPercent(study)} />
                    <span className="text-xs">{recruitmentPercent(study)}%</span>
                  </td>
                  <td><Badge>{study.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h2 className="text-base font-semibold text-navy">Recruitment by Site</h2>
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
              {defaultSites.map((site) => (
                <tr key={site.site} className="border-t border-slate-100">
                  <td className="py-3 font-medium">{site.site}</td>
                  <td>{site.target}</td>
                  <td>{site.enrolled}</td>
                  <td>{Math.round((site.enrolled / site.target) * 100)}%</td>
                  <td><Badge>{site.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
