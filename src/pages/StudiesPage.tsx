import { Badge } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://127.0.0.1:8000'

type StudyRow = {
  id: string
  study_id: string
  title: string
  description: string | null
  principal_investigator: string
  pi_id: string | null
  coordinator_id: string | null
  coordinator_name: string | null
  type: string
  phase: string
  status: string
  sites: number
  target: number
  enrolled: number
  screened: number
  randomized: number
  withdrawn: number
  iec_status: string
  ctri_status: string
  start_date: string | null
  therapeutic_area: string | null
}

async function fetchStudies(): Promise<StudyRow[]> {
  const token = localStorage.getItem('ctms_token')

  const response = await fetch(`${API_BASE}/api/studies`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load studies')
  }

  return response.json()
}

const statuses = [
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

const types = [
  'All',
  'Interventional',
  'Observational',
  'Multi-Centre',
  'Pilot',
]

const pageSize = 5

type SortKey = 'id' | 'enrolled' | 'recruitment' | 'status'

export function StudiesPage() {
  const navigate = useNavigate()

  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [type, setType] = useState('All')
  const [pi, setPi] = useState('All')
  const [sort, setSort] = useState<SortKey>('id')
  const [page, setPage] = useState(1)

  const [studies, setStudies] = useState<StudyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStudies()
      .then(setStudies)
      .catch((err) => {
        console.error(err)
        setError('Unable to load clinical studies.')
      })
      .finally(() => setLoading(false))
  }, [])

  const pis = [
    'All',
    ...Array.from(
      new Set(
        studies.map((study) => study.principal_investigator),
      ),
    ),
  ]

  const filtered = useMemo(() => {
    const rows = studies.filter((study) => {
      const searchText = `
        ${study.study_id}
        ${study.title}
        ${study.principal_investigator}
      `.toLowerCase()

      const matchesSearch = searchText.includes(
        q.toLowerCase(),
      )

      const matchesStatus =
        status === 'All' || study.status === status

      const matchesType =
        type === 'All' || study.type === type

      const matchesPi =
        pi === 'All' ||
        study.principal_investigator === pi

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesPi
      )
    })

    rows.sort((a, b) => compareStudies(a, b, sort))

    return rows
  }, [studies, q, status, type, pi, sort])

  const pages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize),
  )

  const current = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize,
  )

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-navy">
          Clinical Studies
        </h1>

        <p className="mt-1 text-sm text-muted">
          Institutional portfolio register with IEC, CTRI and recruitment status.
        </p>
      </div>

      {/* FILTERS */}
      <div className="grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-2 xl:grid-cols-5">
        <Input
          placeholder="Search studies"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
        />

        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Select
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            setPage(1)
          }}
        >
          {types.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Select
          value={pi}
          onChange={(e) => {
            setPi(e.target.value)
            setPage(1)
          }}
        >
          {pis.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as SortKey)
          }
        >
          <option value="id">
            Sort: Study ID
          </option>

          <option value="enrolled">
            Sort: Enrolled
          </option>

          <option value="recruitment">
            Sort: Recruitment %
          </option>

          <option value="status">
            Sort: Status
          </option>
        </Select>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="rounded-xl border border-line bg-white p-8 text-center text-sm text-muted">
          Loading clinical studies...
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* TABLE */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                {[
                  'Study ID',
                  'Study Title',
                  'Principal Investigator',
                  'Type',
                  'Sites',
                  'Target',
                  'Enrolled',
                  'Recruitment %',
                  'IEC Status',
                  'CTRI Status',
                  'Overall Status',
                ].map((column) => (
                  <th
                    key={column}
                    className="px-3 py-3 font-semibold"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {current.map((study) => {
                const recruitment =
                  study.target > 0
                    ? Math.round(
                      (study.enrolled / study.target) * 100,
                    )
                    : 0

                return (
                  <tr
                    key={study.id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    onClick={() => navigate(`/studies/${study.id}`)}
                  >
                    {/* IMPORTANT:
                        Show study_id, NOT UUID id
                    */}
                    <td className="px-3 py-3 font-semibold text-navy">
                      {(study as { study_id?: string }).study_id ?? study.id}
                    </td>

                    <td className="max-w-xs px-3 py-3">
                      {study.title}
                    </td>

                    <td className="px-3 py-3">
                      {study.principal_investigator}
                    </td>

                    <td className="px-3 py-3">
                      {study.type}
                    </td>

                    <td className="px-3 py-3">
                      {study.sites}
                    </td>

                    <td className="px-3 py-3">
                      {study.target}
                    </td>

                    <td className="px-3 py-3">
                      {study.enrolled}
                    </td>

                    <td className="px-3 py-3">
                      {recruitment}%
                    </td>

                    <td className="px-3 py-3">
                      <Badge>
                        {study.iec_status}
                      </Badge>
                    </td>

                    <td className="px-3 py-3">
                      <Badge>
                        {study.ctri_status}
                      </Badge>
                    </td>

                    <td className="px-3 py-3">
                      <Badge>
                        {study.status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}

              {current.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-3 py-10 text-center text-sm text-muted"
                  >
                    No clinical studies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex items-center justify-between text-sm text-muted">
        <p>
          {filtered.length} studies · page {page} of {pages}
        </p>

        <div className="flex gap-2">
          <button
            className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40"
            disabled={page === 1}
            onClick={() =>
              setPage((currentPage) => currentPage - 1)
            }
          >
            Previous
          </button>

          <button
            className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40"
            disabled={page === pages}
            onClick={() =>
              setPage((currentPage) => currentPage + 1)
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

function compareStudies(
  a: StudyRow,
  b: StudyRow,
  sort: SortKey,
) {
  if (sort === 'enrolled') {
    return b.enrolled - a.enrolled
  }

  if (sort === 'recruitment') {
    const recruitmentA =
      a.target > 0
        ? (a.enrolled / a.target) * 100
        : 0

    const recruitmentB =
      b.target > 0
        ? (b.enrolled / b.target) * 100
        : 0

    return recruitmentB - recruitmentA
  }

  if (sort === 'status') {
    return a.status.localeCompare(b.status)
  }

  return a.study_id.localeCompare(b.study_id)
}