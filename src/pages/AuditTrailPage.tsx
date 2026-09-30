import { Badge, Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { auditLogs } from '@/data/auditLogs'
import type { Role } from '@/types'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const roles: Array<'All' | Role> = ['All', 'Principal Investigator', 'Study Coordinator', 'Administrator']

export function AuditTrailPage() {
  const [user, setUser] = useState('All')
  const [role, setRole] = useState<(typeof roles)[number]>('All')
  const [study, setStudy] = useState('')
  const [action, setAction] = useState('')
  const [date, setDate] = useState('')

  const users = ['All', ...Array.from(new Set(auditLogs.map((l) => l.user)))]

  const rows = useMemo(
    () =>
      auditLogs.filter((log) => {
        const u = user === 'All' || log.user === user
        const r = role === 'All' || log.role === role
        const s = !study || log.studyId.toLowerCase().includes(study.toLowerCase())
        const a = !action || log.action.toLowerCase().includes(action.toLowerCase())
        const d = !date || log.timestamp.toLowerCase().includes(date.toLowerCase())
        return u && r && s && a && d
      }),
    [user, role, study, action, date],
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Audit Trail</h1>
        <p className="mt-1 text-sm text-muted">Time-stamped activity history</p>
        <p className="mt-2 max-w-3xl text-xs text-muted">
          Phase 1 uses a simulated audit trail for demonstration. It is designed to support future GCP, CTRI, DPDP and
          regulatory workflows and is not a certified logging system.
        </p>
      </div>
      <div className="grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-5">
        <Select value={user} onChange={(e) => setUser(e.target.value)}>
          {users.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
          {roles.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Input placeholder="Study" value={study} onChange={(e) => setStudy(e.target.value)} />
        <Input placeholder="Action" value={action} onChange={(e) => setAction(e.target.value)} />
        <Input placeholder="Date text" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="min-w-[960px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-muted">
            <tr>
              {['Timestamp', 'User', 'Role', 'Action', 'Study', 'Record', 'Status'].map((col) => (
                <th key={col} className="px-4 py-3">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((log) => (
              <tr key={log.id} className="border-t border-slate-100">
                <td className="px-4 py-3 whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-3">{log.user}</td>
                <td className="px-4 py-3">{log.role}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">
                  {log.studyId.startsWith('AIIA') ? (
                    <Link className="font-semibold text-navy hover:underline" to={`/studies/${log.studyId}`}>
                      {log.studyId}
                    </Link>
                  ) : (
                    log.studyId
                  )}
                </td>
                <td className="px-4 py-3">{log.record}</td>
                <td className="px-4 py-3"><Badge>{log.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
