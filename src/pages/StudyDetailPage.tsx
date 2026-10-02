import { Button } from '@/components/ui/Button'

import { Badge, Card, ProgressBar } from '@/components/ui/Card'

import { Input, Select } from '@/components/ui/Input'

import { Modal } from '@/components/ui/Modal'

import { formatNumber } from '@/utils/cn'

import { useEffect, useMemo, useState } from 'react'

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



const API_BASE = 'http://127.0.0.1:8000'



type Study = {

  id: string

  study_id: string

  title: string

  description?: string | null

  principal_investigator: string

  pi_id?: string | null

  coordinator_id?: string | null

  coordinator_name?: string | null

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

  start_date?: string | null

  therapeutic_area?: string | null

}



type Site = {

  id: string

  study_id: string

  name: string

  location?: string | null

  target: number

  enrolled: number

  status: string

  progress: number

}



type Recruitment = {

  id: string

  study_id: string

  month: string

  planned: number

  actual: number

}



type Milestone = {

  id: string

  study_id: string

  name: string

  description?: string | null

  status: string

  date?: string | null

  due_date?: string | null

  completed_date?: string | null

  responsible?: string | null

}



type AuditLog = {

  id: string

  timestamp: string

  user: string

  role: string

  action: string

  study_id: string

  record: string

  status: string

  module: string

}



type EditForm = {

  title: string

  description: string

  status: string

  target: string

  enrolled: string

  screened: string

  randomized: string

  withdrawn: string

  iecStatus: string

  ctriStatus: string

  startDate: string

  therapeuticArea: string

}



type MilestoneForm = {

  name: string

  description: string

  status: string

  dueDate: string

  completedDate: string

  responsible: string

}



async function apiFetch<T>(

  path: string,

  options?: RequestInit,

): Promise<T> {

  const token = localStorage.getItem('ctms_token')



  const response = await fetch(`${API_BASE}${path}`, {

    ...options,

    headers: {

      'Content-Type': 'application/json',

      Authorization: `Bearer ${token}`,

      ...(options?.headers ?? {}),

    },

  })



  if (!response.ok) {

    let message = `Request failed: ${response.status}`



    try {

      const body = await response.json()



      if (body?.detail) {

        message = body.detail

      }

    } catch {

      // Keep default error message.

    }



    throw new Error(message)

  }



  return response.json()

}



const tone: Record<string, string> = {

  completed: 'border-success bg-emerald-50',

  current: 'border-info bg-sky-50',

  upcoming: 'border-amber-400 bg-amber-50',

  overdue: 'border-danger bg-red-50',

}



export function StudyDetailPage() {

  const { id = '' } = useParams()



  const [study, setStudy] = useState<Study | null>(null)

  const [sites, setSites] = useState<Site[]>([])

  const [recruitment, setRecruitment] = useState<Recruitment[]>([])

  const [milestones, setMilestones] = useState<Milestone[]>([])

  const [history, setHistory] = useState<AuditLog[]>([])



  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')



  const [modal, setModal] = useState<

    'edit' | 'milestone' | 'audit' | null

  >(null)



  const [saving, setSaving] = useState(false)



  const [editForm, setEditForm] = useState<EditForm>({

    title: '',

    description: '',

    status: '',

    target: '',

    enrolled: '',

    screened: '',

    randomized: '',

    withdrawn: '',

    iecStatus: '',

    ctriStatus: '',

    startDate: '',

    therapeuticArea: '',

  })



  const [milestoneForm, setMilestoneForm] =

    useState<MilestoneForm>({

      name: '',

      description: '',

      status: 'upcoming',

      dueDate: '',

      completedDate: '',

      responsible: '',

    })



  async function loadStudyData() {
    if (!id) return

    try {
      setLoading(true)
      setError('')

      // Get the study from the working studies list first.
      // This avoids failing the whole page when the single-study endpoint has an issue.
      const allStudies = await apiFetch<Study[]>('/api/studies')
      const studyData = allStudies.find(
        (item) => item.id === id || item.study_id === id,
      )

      if (!studyData) {
        throw new Error('Study not found.')
      }

      setStudy(studyData)

      setEditForm({
        title: studyData.title ?? '',
        description: studyData.description ?? '',
        status: studyData.status ?? '',
        target: String(studyData.target ?? 0),
        enrolled: String(studyData.enrolled ?? 0),
        screened: String(studyData.screened ?? 0),
        randomized: String(studyData.randomized ?? 0),
        withdrawn: String(studyData.withdrawn ?? 0),
        iecStatus: studyData.iec_status ?? '',
        ctriStatus: studyData.ctri_status ?? '',
        startDate: studyData.start_date ?? '',
        therapeuticArea: studyData.therapeutic_area ?? '',
      })

      const results = await Promise.allSettled([
        apiFetch<Site[]>(`/api/studies/${id}/sites`),
        apiFetch<Recruitment[]>(`/api/studies/${id}/recruitment`),
        apiFetch<Milestone[]>(`/api/studies/${id}/milestones`),
        apiFetch<AuditLog[]>(`/api/audit?limit=100`),
      ])

      setSites(results[0].status === 'fulfilled' ? results[0].value : [])
      setRecruitment(
        results[1].status === 'fulfilled' ? results[1].value : [],
      )
      setMilestones(
        results[2].status === 'fulfilled' ? results[2].value : [],
      )

      const auditData =
        results[3].status === 'fulfilled' ? results[3].value : []

      setHistory(
        auditData.filter(
          (log) => log.study_id === studyData.study_id,
        ),
      )

      // Secondary sections are optional; don't block the study page if one fails.
      console.warn(
        'Study detail section results:',
        results.map((result) => result.status),
      )
    } catch (err) {
      console.error(err)
      setError(
        err instanceof Error ? err.message : 'Unable to load study.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {

    loadStudyData()

  }, [id])



  const chart = useMemo(

    () =>

      recruitment.map((item) => ({

        month: item.month,

        planned: item.planned,

        actual: item.actual,

      })),

    [recruitment],

  )



  if (loading) {

    return (

      <Card>

        <div className="py-12 text-center text-sm text-muted">

          Loading study...

        </div>

      </Card>

    )

  }



  if (error || !study) {

    return (

      <Card>

        <p className="text-red-600">

          {error || 'Study not found.'}

        </p>



        <Link

          to="/studies"

          className="mt-3 inline-block text-sm font-semibold text-teal"

        >

          Back to studies

        </Link>

      </Card>

    )

  }



  const pct =

    study.target > 0

      ? Math.round(

        (study.enrolled / study.target) * 1000,

      ) / 10

      : 0



  async function saveStudy() {

    if (!study) return



    const target = Number(editForm.target)

    const enrolled = Number(editForm.enrolled)

    const screened = Number(editForm.screened)

    const randomized = Number(editForm.randomized)

    const withdrawn = Number(editForm.withdrawn)



    if (

      [target, enrolled, screened, randomized, withdrawn].some(

        (value) => Number.isNaN(value) || value < 0,

      )

    ) {

      toast.error(

        'Participant values must be valid non-negative numbers.',

      )

      return

    }



    if (screened < enrolled) {

      toast.error(

        'Screened participants cannot be lower than enrolled participants.',

      )

      return

    }



    if (target < enrolled) {

      toast.error(

        'Target participants cannot be lower than enrolled participants.',

      )

      return

    }



    try {

      setSaving(true)



      await apiFetch<Study>(

        `/api/studies/${study.study_id}`,

        {

          method: 'PATCH',

          body: JSON.stringify({

            title: editForm.title,

            description: editForm.description || null,

            status: editForm.status,

            target_participants: target,

            enrolled_participants: enrolled,

            screened_participants: screened,

            randomized_participants: randomized,

            withdrawn_participants: withdrawn,

            iec_status: editForm.iecStatus,

            ctri_status: editForm.ctriStatus,

            start_date: editForm.startDate || null,

            therapeutic_area:

              editForm.therapeuticArea || null,

          }),

        },

      )



      toast.success('Study updated successfully.')

      setModal(null)



      await loadStudyData()

    } catch (err) {

      console.error(err)



      toast.error(

        err instanceof Error

          ? err.message

          : 'Unable to update study.',

      )

    } finally {

      setSaving(false)

    }

  }



  async function addMilestone() {

    if (!study) return



    if (!milestoneForm.name.trim()) {

      toast.error('Milestone name is required.')

      return

    }



    try {

      setSaving(true)



      await apiFetch<Milestone>(

        `/api/studies/${study.study_id}/milestones`,

        {

          method: 'POST',

          body: JSON.stringify({

            name: milestoneForm.name.trim(),

            description:

              milestoneForm.description || null,

            status: milestoneForm.status,

            due_date:

              milestoneForm.dueDate || null,

            completed_date:

              milestoneForm.completedDate || null,

            responsible_person:

              milestoneForm.responsible || null,

          }),

        },

      )



      toast.success('Milestone added successfully.')



      setMilestoneForm({

        name: '',

        description: '',

        status: 'upcoming',

        dueDate: '',

        completedDate: '',

        responsible: '',

      })



      setModal(null)



      await loadStudyData()

    } catch (err) {

      console.error(err)



      toast.error(

        err instanceof Error

          ? err.message

          : 'Unable to add milestone.',

      )

    } finally {

      setSaving(false)

    }

  }



  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-5 lg:flex-row lg:items-start lg:justify-between">

        <div>

          <p className="text-xs font-semibold tracking-wide text-teal">

            {study.study_id}

          </p>



          <h1 className="mt-1 text-2xl font-semibold text-navy">

            {study.title}

          </h1>



          <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted">

            <span>

              PI: {study.principal_investigator}

            </span>



            {study.coordinator_name && (

              <span>

                · Coordinator: {study.coordinator_name}

              </span>

            )}



            <span>· {study.type}</span>

            <span>· {study.phase}</span>

            <span>· {study.sites} sites</span>



            <span>

              · Target {formatNumber(study.target)}

            </span>



            <span>

              · Current {formatNumber(study.enrolled)}

            </span>

          </div>



          <div className="mt-3 flex flex-wrap gap-2">

            <Badge>{study.status}</Badge>

            <Badge>{study.iec_status}</Badge>

            <Badge>{study.ctri_status}</Badge>

          </div>

        </div>



        <div className="flex flex-wrap gap-2">

          <Button

            variant="outline"

            onClick={() => setModal('edit')}

          >

            Edit Study

          </Button>



          <Button

            variant="secondary"

            onClick={() => setModal('milestone')}

          >

            Add Milestone

          </Button>



          <Button

            onClick={() => setModal('audit')}

          >

            View Audit History

          </Button>

        </div>

      </div>



      {/* LIFECYCLE */}

      <Card>

        <h2 className="text-base font-semibold text-navy">

          Study lifecycle

        </h2>



        <ol className="mt-5 grid gap-3 md:grid-cols-3">

          {milestones.map((item) => (

            <li

              key={item.id}

              className={`rounded-lg border-l-4 p-3 ${tone[item.status] ??

                'border-slate-300 bg-slate-50'

                }`}

            >

              <p className="text-sm font-semibold text-ink">

                {item.name}

              </p>



              <p className="mt-1 text-xs text-muted">

                {item.due_date ??

                  item.date ??

                  'No due date'}

              </p>



              {item.responsible && (

                <p className="text-xs text-muted">

                  {item.responsible}

                </p>

              )}



              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide">

                {item.status}

              </p>

            </li>

          ))}



          {milestones.length === 0 && (

            <li className="col-span-full py-8 text-center text-sm text-muted">

              No milestones have been recorded for this study.

            </li>

          )}

        </ol>

      </Card>



      {/* RECRUITMENT */}

      <div className="grid gap-4 xl:grid-cols-2">

        <Card>

          <h2 className="text-base font-semibold text-navy">

            Recruitment Progress

          </h2>



          <p className="mt-2 text-2xl font-semibold text-teal">

            {pct}% recruited

          </p>



          <ProgressBar value={pct} />



          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">

            <div>

              <dt className="text-muted">Target</dt>

              <dd className="font-semibold">

                {formatNumber(study.target)}

              </dd>

            </div>



            <div>

              <dt className="text-muted">Screened</dt>

              <dd className="font-semibold">

                {formatNumber(study.screened)}

              </dd>

            </div>



            <div>

              <dt className="text-muted">Enrolled</dt>

              <dd className="font-semibold">

                {formatNumber(study.enrolled)}

              </dd>

            </div>



            <div>

              <dt className="text-muted">Randomized</dt>

              <dd className="font-semibold">

                {formatNumber(study.randomized)}

              </dd>

            </div>



            <div>

              <dt className="text-muted">Withdrawn</dt>

              <dd className="font-semibold">

                {formatNumber(study.withdrawn)}

              </dd>

            </div>

          </dl>

        </Card>



        <Card>

          <h2 className="text-base font-semibold text-navy">

            Planned vs Actual Recruitment

          </h2>



          <div className="mt-3 h-64">

            {chart.length > 0 ? (

              <ResponsiveContainer

                width="100%"

                height="100%"

              >

                <LineChart data={chart}>

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

                  />



                  <Line

                    type="monotone"

                    dataKey="actual"

                    stroke="#0d9488"

                    strokeWidth={2}

                  />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-full items-center justify-center text-sm text-muted">

                No recruitment history recorded.

              </div>

            )}

          </div>

        </Card>

      </div>



      {/* SITES */}

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

              {sites.map((site) => (

                <tr

                  key={site.id}

                  className="border-t border-slate-100"

                >

                  <td className="py-3 font-medium">

                    {site.name}

                  </td>



                  <td>

                    {formatNumber(site.target)}

                  </td>



                  <td>

                    {formatNumber(site.enrolled)}

                  </td>



                  <td>

                    {site.progress}%

                  </td>



                  <td>

                    <Badge>{site.status}</Badge>

                  </td>

                </tr>

              ))}



              {sites.length === 0 && (

                <tr>

                  <td

                    colSpan={5}

                    className="py-10 text-center text-sm text-muted"

                  >

                    No sites have been recorded for this study.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </Card>



      {/* EDIT STUDY */}

      <Modal

        open={modal === 'edit'}

        title="Edit study"

        onClose={() => setModal(null)}

      >

        <div className="space-y-4">

          <div>

            <label className="mb-1 block text-xs font-semibold text-muted">

              Study title

            </label>



            <Input

              value={editForm.title}

              onChange={(e) =>

                setEditForm({

                  ...editForm,

                  title: e.target.value,

                })

              }

            />

          </div>



          <div>

            <label className="mb-1 block text-xs font-semibold text-muted">

              Description

            </label>



            <Input

              value={editForm.description}

              onChange={(e) =>

                setEditForm({

                  ...editForm,

                  description: e.target.value,

                })

              }

            />

          </div>



          <div>

            <label className="mb-1 block text-xs font-semibold text-muted">

              Status

            </label>



            <Select

              value={editForm.status}

              onChange={(e) =>

                setEditForm({

                  ...editForm,

                  status: e.target.value,

                })

              }

            >

              <option>Planning</option>

              <option>Ethics Pending</option>

              <option>CTRI Pending</option>

              <option>Recruiting</option>

              <option>Active</option>

              <option>Follow-up</option>

              <option>Completed</option>

              <option>Closed</option>

            </Select>

          </div>



          <div className="grid gap-3 md:grid-cols-2">

            <div>

              <label className="mb-1 block text-xs font-semibold text-muted">

                Target participants

              </label>



              <Input

                type="number"

                min="0"

                value={editForm.target}

                onChange={(e) =>

                  setEditForm({

                    ...editForm,

                    target: e.target.value,

                  })

                }

              />

            </div>



            <div>

              <label className="mb-1 block text-xs font-semibold text-muted">

                Screened participants

              </label>



              <Input

                type="number"

                min="0"

                value={editForm.screened}

                onChange={(e) =>

                  setEditForm({

                    ...editForm,

                    screened: e.target.value,

                  })

                }

              />

            </div>



            <div>

              <label className="mb-1 block text-xs font-semibold text-muted">

                Enrolled participants

              </label>



              <Input

                type="number"

                min="0"

                value={editForm.enrolled}

                onChange={(e) =>

                  setEditForm({

                    ...editForm,

                    enrolled: e.target.value,

                  })

                }

              />

            </div>



            <div>

              <label className="mb-1 block text-xs font-semibold text-muted">

                Randomized participants

              </label>



              <Input

                type="number"

                min="0"

                value={editForm.randomized}

                onChange={(e) =>

                  setEditForm({

                    ...editForm,

                    randomized: e.target.value,

                  })

                }

              />

            </div>



            <div>

              <label className="mb-1 block text-xs font-semibold text-muted">

                Withdrawn participants

              </label>



              <Input

                type="number"

                min="0"

                value={editForm.withdrawn}

                onChange={(e) =>

                  setEditForm({

                    ...editForm,

                    withdrawn: e.target.value,

                  })

                }

              />

            </div>



            <div>

              <label className="mb-1 block text-xs font-semibold text-muted">

                Start date

              </label>



              <Input

                type="date"

                value={editForm.startDate}

                onChange={(e) =>

                  setEditForm({

                    ...editForm,

                    startDate: e.target.value,

                  })

                }

              />

            </div>

          </div>



          <div className="grid gap-3 md:grid-cols-2">

            <div>

              <label className="mb-1 block text-xs font-semibold text-muted">

                IEC status

              </label>



              <Input

                value={editForm.iecStatus}

                onChange={(e) =>

                  setEditForm({

                    ...editForm,

                    iecStatus: e.target.value,

                  })

                }

              />

            </div>



            <div>

              <label className="mb-1 block text-xs font-semibold text-muted">

                CTRI status

              </label>



              <Input

                value={editForm.ctriStatus}

                onChange={(e) =>

                  setEditForm({

                    ...editForm,

                    ctriStatus: e.target.value,

                  })

                }

              />

            </div>

          </div>



          <div>

            <label className="mb-1 block text-xs font-semibold text-muted">

              Therapeutic area

            </label>



            <Input

              value={editForm.therapeuticArea}

              onChange={(e) =>

                setEditForm({

                  ...editForm,

                  therapeuticArea: e.target.value,

                })

              }

            />

          </div>



          <div className="flex justify-end gap-2">

            <Button

              variant="outline"

              onClick={() => setModal(null)}

              disabled={saving}

            >

              Cancel

            </Button>



            <Button

              onClick={saveStudy}

              disabled={saving}

            >

              {saving ? 'Saving...' : 'Save changes'}

            </Button>

          </div>

        </div>

      </Modal>



      {/* ADD MILESTONE */}

      <Modal

        open={modal === 'milestone'}

        title="Add milestone"

        onClose={() => setModal(null)}

      >

        <div className="space-y-4">

          <div>

            <label className="mb-1 block text-xs font-semibold text-muted">

              Milestone name

            </label>



            <Input

              placeholder="e.g. Site Activation"

              value={milestoneForm.name}

              onChange={(e) =>

                setMilestoneForm({

                  ...milestoneForm,

                  name: e.target.value,

                })

              }

            />

          </div>



          <div>

            <label className="mb-1 block text-xs font-semibold text-muted">

              Description

            </label>



            <Input

              placeholder="Milestone details"

              value={milestoneForm.description}

              onChange={(e) =>

                setMilestoneForm({

                  ...milestoneForm,

                  description: e.target.value,

                })

              }

            />

          </div>



          <div>

            <label className="mb-1 block text-xs font-semibold text-muted">

              Status

            </label>



            <Select

              value={milestoneForm.status}

              onChange={(e) =>

                setMilestoneForm({

                  ...milestoneForm,

                  status: e.target.value,

                })

              }

            >

              <option value="upcoming">

                Upcoming

              </option>



              <option value="current">

                Current

              </option>



              <option value="completed">

                Completed

              </option>



              <option value="overdue">

                Overdue

              </option>

            </Select>

          </div>



          <div className="grid gap-3 md:grid-cols-2">

            <div>

              <label className="mb-1 block text-xs font-semibold text-muted">

                Due date

              </label>



              <Input

                type="date"

                value={milestoneForm.dueDate}

                onChange={(e) =>

                  setMilestoneForm({

                    ...milestoneForm,

                    dueDate: e.target.value,

                  })

                }

              />

            </div>



            <div>

              <label className="mb-1 block text-xs font-semibold text-muted">

                Completed date

              </label>



              <Input

                type="date"

                value={milestoneForm.completedDate}

                onChange={(e) =>

                  setMilestoneForm({

                    ...milestoneForm,

                    completedDate: e.target.value,

                  })

                }

              />

            </div>

          </div>



          <div>

            <label className="mb-1 block text-xs font-semibold text-muted">

              Responsible person

            </label>



            <Input

              placeholder="Name"

              value={milestoneForm.responsible}

              onChange={(e) =>

                setMilestoneForm({

                  ...milestoneForm,

                  responsible: e.target.value,

                })

              }

            />

          </div>



          <div className="flex justify-end gap-2">

            <Button

              variant="outline"

              onClick={() => setModal(null)}

              disabled={saving}

            >

              Cancel

            </Button>



            <Button

              onClick={addMilestone}

              disabled={saving}

            >

              {saving ? 'Adding...' : 'Add milestone'}

            </Button>

          </div>

        </div>

      </Modal>



      {/* AUDIT HISTORY */}

      <Modal

        open={modal === 'audit'}

        title="Study audit history"

        onClose={() => setModal(null)}

      >

        <ul className="space-y-3">

          {history.length === 0 && (

            <li className="text-sm text-muted">

              No study-specific audit records found.

            </li>

          )}



          {history.map((log) => (

            <li

              key={log.id}

              className="border-b border-slate-100 pb-3 last:border-0"

            >

              <p className="font-medium text-ink">

                {log.action}

              </p>



              <p className="text-xs text-muted">

                {log.timestamp} · {log.user}

              </p>



              <p className="text-xs text-muted">

                {log.module} · {log.record}

              </p>

            </li>

          ))}

        </ul>

      </Modal>

    </div>

  )

}