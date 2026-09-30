export type Role =
  | 'Principal Investigator'
  | 'Study Coordinator'
  | 'Administrator'

export type StudyStatus =
  | 'Planning'
  | 'Ethics Pending'
  | 'CTRI Pending'
  | 'Recruiting'
  | 'Active'
  | 'Follow-up'
  | 'Completed'
  | 'Closed'

export type IecStatus =
  | 'Not Submitted'
  | 'Submitted'
  | 'Query Raised'
  | 'Approved'
  | 'Renewal Due'
  | 'Expired'

export type CtriStatus =
  | 'Not Registered'
  | 'Submitted'
  | 'Registered'
  | 'Update Due'
  | 'Overdue'

export type StudyType =
  | 'Interventional'
  | 'Observational'
  | 'Multi-Centre'
  | 'Pilot'

export type StudyPhase = 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV' | 'N/A'

export type MilestoneStatus = 'completed' | 'current' | 'upcoming' | 'overdue'

export type AlertSeverity = 'Critical' | 'Warning' | 'Information' | 'Completed'
export type AlertStatus = 'Open' | 'Acknowledged' | 'Resolved'

export type SiteRecruitmentStatus = 'On Track' | 'Behind' | 'At Risk' | 'Complete'

export type DateRangeKey = 'today' | '7d' | '30d' | 'quarter'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  studies: string[]
  status: 'Active' | 'Inactive'
  lastActive: string
  initials: string
}

export interface Study {
  id: string
  title: string
  principalInvestigator: string
  piId: string
  coordinatorId: string
  type: StudyType
  phase: StudyPhase
  sites: number
  target: number
  enrolled: number
  screened: number
  randomized: number
  withdrawn: number
  iecStatus: IecStatus
  ctriStatus: CtriStatus
  status: StudyStatus
  startDate: string
  therapeuticArea: string
}

export interface LifecycleMilestone {
  id: string
  studyId: string
  name: string
  date: string
  status: MilestoneStatus
  responsible: string
}

export interface ComplianceItem {
  id: string
  studyId: string
  title: string
  category: 'IEC' | 'CTRI' | 'Monitoring' | 'Protocol'
  dueDate: string
  severity: AlertSeverity
  description: string
}

export interface AlertItem {
  id: string
  severity: AlertSeverity
  title: string
  description: string
  studyId: string
  date: string
  status: AlertStatus
}

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  role: Role
  action: string
  studyId: string
  record: string
  status: 'Success' | 'Pending Review'
}

export interface SiteRecruitment {
  site: string
  target: number
  enrolled: number
  status: SiteRecruitmentStatus
}

export interface MonthlyRecruitment {
  month: string
  planned: number
  actual: number
}

export interface PortfolioKpis {
  activeStudies: number
  totalParticipants: number
  recruitmentProgress: number
  activeSites: number
  pendingIec: number
  ctriDue: number
  protocolDeviations: number
  dataQueries: number
  trends: Record<string, string>
}

export interface SearchResult {
  id: string
  type: 'Study' | 'User' | 'Alert' | 'Milestone'
  title: string
  subtitle: string
  href: string
}
