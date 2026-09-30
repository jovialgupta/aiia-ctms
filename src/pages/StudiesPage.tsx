import { Badge } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { studies, recruitmentPercent } from '@/data/studies'
import { useAuth } from '@/hooks/useAuth'
import type { Study, StudyStatus, StudyType } from '@/types'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const statuses: Array<'All' | StudyStatus> = [
  'All',
  'Planning',
  'Ethics Pending',
  'CTRI Pending',
  'Recruiting',
  'Active',
  'Follow-up',
  'Completed',
  'Closed',
]
const types: Array<'All' | StudyType> = ['All', 'Interventional', 'Observational', 'Multi-Centre', 'Pilot']
const pageSize = 5

type SortKey = 'id' | 'enrolled' | 'recruitment' | 'status'

export function StudiesPage() {
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<(typeof statuses)[number]>('All')
  const [type, setType] = useState<(typeof types)[number]>('All')
  const [pi, setPi] = useState('All')
  const [sort, setSort] = useState<SortKey>('id')
  const [page, setPage] = useState(1)

  const scoped = useMemo(() => {
    if (role === 'Administrator') return studies
    return studies.filter(
      (s) => user?.studies.includes(s.id) || s.piId === user?.id || s.coordinatorId === user?.id,
    )
  }, [role, user])

  const pis = ['All', ...Array.from(new Set(scoped.map((s) => s.principalInvestigator)))]

  const filtered = useMemo(() => {
    const rows = scoped.filter((s) => {
      const matchesQ = `${s.id} ${s.title} ${s.principalInvestigator}`.toLowerCase().includes(q.toLowerCase())
      const matchesStatus = status === 'All' || s.status === status
      const matchesType = type === 'All' || s.type === type
      const matchesPi = pi === 'All' || s.principalInvestigator === pi
      return matchesQ && matchesStatus && matchesType && matchesPi
    })
    rows.sort((a, b) => compareStudies(a, b, sort))
    return rows
  }, [scoped, q, status, type, pi, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Clinical Studies</h1>
        <p className="mt-1 text-sm text-muted">Institutional portfolio register with IEC, CTRI and recruitment status.</p>
      </div>
      <div className="grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-2 xl:grid-cols-5">
        <Input placeholder="Search studies" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        <Select value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1) }}>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select value={type} onChange={(e) => { setType(e.target.value as typeof type); setPage(1) }}>
          {types.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select value={pi} onChange={(e) => { setPi(e.target.value); setPage(1) }}>
          {pis.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="id">Sort: Study ID</option>
          <option value="enrolled">Sort: Enrolled</option>
          <option value="recruitment">Sort: Recruitment %</option>
          <option value="status">Sort: Status</option>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
            <tr>
              {['Study ID', 'Study Title', 'Principal Investigator', 'Type', 'Sites', 'Target', 'Enrolled', 'Recruitment %', 'IEC Status', 'CTRI Status', 'Overall Status'].map((col) => (
                <th key={col} className="px-3 py-3 font-semibold">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {current.map((study) => (
              <tr
                key={study.id}
                className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                onClick={() => navigate(`/studies/${study.id}`)}
              >
                <td className="px-3 py-3 font-semibold text-navy">{study.id}</td>
                <td className="px-3 py-3 max-w-xs">{study.title}</td>
                <td className="px-3 py-3">{study.principalInvestigator}</td>
                <td className="px-3 py-3">{study.type}</td>
                <td className="px-3 py-3">{study.sites}</td>
                <td className="px-3 py-3">{study.target}</td>
                <td className="px-3 py-3">{study.enrolled}</td>
                <td className="px-3 py-3">{recruitmentPercent(study)}%</td>
                <td className="px-3 py-3"><Badge>{study.iecStatus}</Badge></td>
                <td className="px-3 py-3"><Badge>{study.ctriStatus}</Badge></td>
                <td className="px-3 py-3"><Badge>{study.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted">
        <p>
          {filtered.length} studies · page {page} of {pages}
        </p>
        <div className="flex gap-2">
          <button className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <button className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

function compareStudies(a: Study, b: Study, sort: SortKey) {
  if (sort === 'enrolled') return b.enrolled - a.enrolled
  if (sort === 'recruitment') return recruitmentPercent(b) - recruitmentPercent(a)
  if (sort === 'status') return a.status.localeCompare(b.status)
  return a.id.localeCompare(b.id)
}
