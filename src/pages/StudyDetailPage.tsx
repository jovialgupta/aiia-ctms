import { Button } from '@/components/ui/Button'
import { Badge, Card, ProgressBar } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { auditLogs } from '@/data/auditLogs'
import { defaultLifecycle } from '@/data/milestones'
import { defaultSites, sitesByStudy, studyMonthlyRecruitment, portfolioMonthlyRecruitment } from '@/data/recruitment'
import { getStudy, recruitmentPercent } from '@/data/studies'
import { formatNumber } from '@/utils/cn'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
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

const tone: Record<string, string> = {
  completed: 'border-success bg-emerald-50',
  current: 'border-info bg-sky-50',
  upcoming: 'border-amber-400 bg-amber-50',
  overdue: 'border-danger bg-red-50',
}

export function StudyDetailPage() {
  const { id = '' } = useParams()
  const study = getStudy(id)
  const [modal, setModal] = useState<'edit' | 'milestone' | 'audit' | null>(null)

  if (!study) {
    return (
      <Card>
        <p>Study not found.</p>
        <Link to="/studies" className="mt-3 inline-block text-sm font-semibold text-teal">
          Back to studies
        </Link>
      </Card>
    )
  }

  const pct = recruitmentPercent(study)
  const milestones = defaultLifecycle(study.id)
  const sites = sitesByStudy[study.id] ?? defaultSites
  const chart = studyMonthlyRecruitment[study.id] ?? portfolioMonthlyRecruitment
  const history = auditLogs.filter((log) => log.studyId === study.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-teal">{study.id}</p>
          <h1 className="mt-1 text-2xl font-semibold text-navy">{study.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
            <span>PI: {study.principalInvestigator}</span>
            <span>· {study.type}</span>
            <span>· {study.phase}</span>
            <span>· {study.sites} sites</span>
            <span>· Target {formatNumber(study.target)}</span>
            <span>· Current {formatNumber(study.enrolled)}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{study.status}</Badge>
            <Badge>{study.iecStatus}</Badge>
            <Badge>{study.ctriStatus}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setModal('edit')}>Edit Study</Button>
          <Button variant="secondary" onClick={() => setModal('milestone')}>Add Milestone</Button>
          <Button onClick={() => setModal('audit')}>View Audit History</Button>
        </div>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-navy">Study lifecycle</h2>
        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {milestones.map((item) => (
            <li key={item.id} className={`rounded-lg border-l-4 p-3 ${tone[item.status]}`}>
              <p className="text-sm font-semibold text-ink">{item.name}</p>
              <p className="mt-1 text-xs text-muted">{item.date}</p>
              <p className="text-xs text-muted">{item.responsible}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide">{item.status}</p>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-navy">Recruitment Progress</h2>
          <p className="mt-2 text-2xl font-semibold text-teal">{pct}% recruited</p>
          <ProgressBar value={pct} />
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-muted">Target</dt><dd className="font-semibold">{study.target}</dd></div>
            <div><dt className="text-muted">Screened</dt><dd className="font-semibold">{study.screened}</dd></div>
            <div><dt className="text-muted">Enrolled</dt><dd className="font-semibold">{study.enrolled}</dd></div>
            <div><dt className="text-muted">Randomized</dt><dd className="font-semibold">{study.randomized}</dd></div>
            <div><dt className="text-muted">Withdrawn</dt><dd className="font-semibold">{study.withdrawn}</dd></div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-navy">Planned vs Actual Recruitment</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
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
              {sites.map((site) => {
                const progress = Math.round((site.enrolled / site.target) * 100)
                return (
                  <tr key={site.site} className="border-t border-slate-100">
                    <td className="py-3 font-medium">{site.site}</td>
                    <td>{site.target}</td>
                    <td>{site.enrolled}</td>
                    <td>{progress}%</td>
                    <td><Badge>{site.status}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal === 'edit'} title="Edit study" onClose={() => setModal(null)}>
        <p>Study master-data editing is simulated in Phase 1. No live registry write-back is performed.</p>
        <Button className="mt-4" onClick={() => { toast.success('Study update recorded in local session'); setModal(null) }}>
          Save draft
        </Button>
      </Modal>
      <Modal open={modal === 'milestone'} title="Add milestone" onClose={() => setModal(null)}>
        <p>Milestones in this prototype are operational markers. Adding a milestone writes to the simulated audit trail only.</p>
        <Button className="mt-4" onClick={() => { toast.success('Milestone added to local workspace'); setModal(null) }}>
          Add milestone
        </Button>
      </Modal>
      <Modal open={modal === 'audit'} title="Study audit history" onClose={() => setModal(null)}>
        <ul className="space-y-3">
          {history.length === 0 && <li>No study-specific audit rows in the mock trail.</li>}
          {history.map((log) => (
            <li key={log.id}>
              <p className="font-medium text-ink">{log.action}</p>
              <p className="text-xs">{log.timestamp} · {log.user}</p>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  )
}
