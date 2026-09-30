import type { ComplianceItem, LifecycleMilestone } from '@/types'

const stages = [
  'Protocol Created',
  'IEC Submission',
  'IEC Approval',
  'CTRI Registration',
  'Site Activation',
  'First Participant',
  'Recruitment',
  'Follow-up',
  'Close-out',
] as const

function buildLifecycle(
  studyId: string,
  statuses: LifecycleMilestone['status'][],
  dates: string[],
  owners: string[],
): LifecycleMilestone[] {
  return stages.map((name, index) => ({
    id: `${studyId}-ms-${index + 1}`,
    studyId,
    name,
    date: dates[index] ?? 'TBD',
    status: statuses[index] ?? 'upcoming',
    responsible: owners[index] ?? 'Study Coordinator',
  }))
}

export const lifecycleByStudy: Record<string, LifecycleMilestone[]> = {
  'AIIA-AYU-2026-001': buildLifecycle(
    'AIIA-AYU-2026-001',
    ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'current', 'upcoming', 'upcoming'],
    ['12 Nov 2025', '02 Dec 2025', '20 Dec 2025', '08 Jan 2026', '18 Jan 2026', '02 Feb 2026', 'Ongoing', 'Q4 2026', 'Q1 2027'],
    ['Dr. Ananya Sharma', 'Rahul Mehta', 'IEC Secretariat', 'Rahul Mehta', 'Arjun Singh', 'Rahul Mehta', 'Site teams', 'Dr. Ananya Sharma', 'Admin User'],
  ),
  'AIIA-AYU-2026-002': buildLifecycle(
    'AIIA-AYU-2026-002',
    ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'current', 'upcoming'],
    ['04 Aug 2025', '21 Aug 2025', '12 Sep 2025', '01 Oct 2025', '18 Oct 2025', '03 Nov 2025', 'Nov 2025–Sep 2026', 'Ongoing', 'Q1 2027'],
    ['Dr. Priya Kapoor', 'Arjun Singh', 'IEC Secretariat', 'Arjun Singh', 'Arjun Singh', 'Site teams', 'Site teams', 'Dr. Priya Kapoor', 'Admin User'],
  ),
  'AIIA-AYU-2026-003': buildLifecycle(
    'AIIA-AYU-2026-003',
    ['completed', 'completed', 'completed', 'overdue', 'completed', 'completed', 'current', 'upcoming', 'upcoming'],
    ['10 Dec 2025', '22 Dec 2025', '15 Jan 2026', 'Due 15 Sep 2026', '28 Feb 2026', '08 Mar 2026', 'Ongoing', 'Q4 2026', '2027'],
    ['Dr. Vikram Rao', 'Rahul Mehta', 'IEC Secretariat', 'Rahul Mehta', 'Rahul Mehta', 'Site teams', 'Site teams', 'Dr. Vikram Rao', 'Admin User'],
  ),
  'AIIA-AYU-2026-005': buildLifecycle(
    'AIIA-AYU-2026-005',
    ['completed', 'completed', 'current', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
    ['02 Mar 2026', '18 Mar 2026', 'Query 12 Sep 2026', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending'],
    ['Dr. Ananya Sharma', 'Rahul Mehta', 'IEC Secretariat', 'Rahul Mehta', 'Arjun Singh', 'Site teams', 'Site teams', 'Dr. Ananya Sharma', 'Admin User'],
  ),
  'AIIA-AYU-2026-006': buildLifecycle(
    'AIIA-AYU-2026-006',
    ['completed', 'current', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
    ['14 Aug 2026', '02 Sep 2026', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending', 'Pending'],
    ['Dr. Priya Kapoor', 'Arjun Singh', 'IEC Secretariat', 'Arjun Singh', 'Arjun Singh', 'Site teams', 'Site teams', 'Dr. Priya Kapoor', 'Admin User'],
  ),
}

export const defaultLifecycle = (studyId: string): LifecycleMilestone[] =>
  lifecycleByStudy[studyId] ??
  buildLifecycle(
    studyId,
    ['completed', 'completed', 'completed', 'completed', 'completed', 'current', 'upcoming', 'upcoming', 'upcoming'],
    ['2025', '2025', '2025', '2025', '2026', '2026', 'Ongoing', 'TBD', 'TBD'],
    ['Principal Investigator', 'Study Coordinator', 'IEC Secretariat', 'Study Coordinator', 'Study Coordinator', 'Site teams', 'Site teams', 'Principal Investigator', 'Administrator'],
  )

export const complianceItems: ComplianceItem[] = [
  {
    id: 'c-001',
    studyId: 'AIIA-AYU-2026-003',
    title: 'CTRI update overdue',
    category: 'CTRI',
    dueDate: '2026-09-15',
    severity: 'Critical',
    description: 'Amendment v1.2 not posted to CTRI.',
  },
  {
    id: 'c-002',
    studyId: 'AIIA-AYU-2026-002',
    title: 'IEC renewal due in 14 days',
    category: 'IEC',
    dueDate: '2026-10-14',
    severity: 'Warning',
    description: 'Continuing review dossier required.',
  },
  {
    id: 'c-003',
    studyId: 'AIIA-AYU-2026-003',
    title: 'Monitoring visit overdue',
    category: 'Monitoring',
    dueDate: '2026-09-20',
    severity: 'Warning',
    description: 'AIIA Mumbai monitoring window closed without visit close-out.',
  },
  {
    id: 'c-004',
    studyId: 'AIIA-AYU-2026-001',
    title: 'Protocol approval completed',
    category: 'Protocol',
    dueDate: '2026-09-20',
    severity: 'Completed',
    description: 'IEC approval recorded for protocol 1.3.',
  },
  {
    id: 'c-005',
    studyId: 'AIIA-AYU-2026-005',
    title: 'IEC query response due',
    category: 'IEC',
    dueDate: '2026-10-03',
    severity: 'Critical',
    description: 'Clarification on inclusion criteria outstanding.',
  },
  {
    id: 'c-006',
    studyId: 'AIIA-AYU-2026-006',
    title: 'CTRI registration pending',
    category: 'CTRI',
    dueDate: '2026-10-30',
    severity: 'Information',
    description: 'Registration after IEC decision.',
  },
  {
    id: 'c-007',
    studyId: 'AIIA-AYU-2026-004',
    title: 'Site activation pending — AIIA Goa',
    category: 'Monitoring',
    dueDate: '2026-10-08',
    severity: 'Warning',
    description: 'Initiation checklist 80% complete.',
  },
]

export const allMilestones: LifecycleMilestone[] = Object.values(lifecycleByStudy).flat()
