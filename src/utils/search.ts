import { alerts } from '@/data/alerts'
import { allMilestones } from '@/data/milestones'
import { studies } from '@/data/studies'
import { users } from '@/data/users'
import type { SearchResult } from '@/types'

export function searchCatalog(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []

  const studyHits: SearchResult[] = studies
    .filter((s) => `${s.id} ${s.title} ${s.principalInvestigator}`.toLowerCase().includes(q))
    .map((s) => ({
      id: s.id,
      type: 'Study',
      title: s.id,
      subtitle: s.title,
      href: `/studies/${s.id}`,
    }))

  const userHits: SearchResult[] = users
    .filter((u) => `${u.name} ${u.role} ${u.email}`.toLowerCase().includes(q))
    .map((u) => ({
      id: u.id,
      type: 'User',
      title: u.name,
      subtitle: u.role,
      href: '/users',
    }))

  const alertHits: SearchResult[] = alerts
    .filter((a) => `${a.title} ${a.studyId}`.toLowerCase().includes(q))
    .map((a) => ({
      id: a.id,
      type: 'Alert',
      title: a.title,
      subtitle: a.studyId,
      href: '/alerts',
    }))

  const milestoneHits: SearchResult[] = allMilestones
    .filter((m) => `${m.name} ${m.studyId} ${m.responsible}`.toLowerCase().includes(q))
    .slice(0, 6)
    .map((m) => ({
      id: m.id,
      type: 'Milestone',
      title: m.name,
      subtitle: m.studyId,
      href: `/studies/${m.studyId}`,
    }))

  return [...studyHits, ...userHits, ...alertHits, ...milestoneHits].slice(0, 10)
}
