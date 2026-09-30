import type { User } from '@/types'

export const users: User[] = [
  {
    id: 'u-ananya',
    name: 'Dr. Ananya Sharma',
    email: 'ananya.sharma@aiia.gov.in',
    role: 'Principal Investigator',
    studies: ['AIIA-AYU-2026-001', 'AIIA-AYU-2026-005', 'AIIA-AYU-2026-007'],
    status: 'Active',
    lastActive: '30 Sep 2026, 08:12',
    initials: 'AS',
  },
  {
    id: 'u-rahul',
    name: 'Rahul Mehta',
    email: 'rahul.mehta@aiia.gov.in',
    role: 'Study Coordinator',
    studies: ['AIIA-AYU-2026-001', 'AIIA-AYU-2026-003'],
    status: 'Active',
    lastActive: '29 Sep 2026, 17:21',
    initials: 'RM',
  },
  {
    id: 'u-priya',
    name: 'Dr. Priya Kapoor',
    email: 'priya.kapoor@aiia.gov.in',
    role: 'Principal Investigator',
    studies: ['AIIA-AYU-2026-002', 'AIIA-AYU-2026-006', 'AIIA-AYU-2026-008'],
    status: 'Active',
    lastActive: '29 Sep 2026, 19:04',
    initials: 'PK',
  },
  {
    id: 'u-arjun',
    name: 'Arjun Singh',
    email: 'arjun.singh@aiia.gov.in',
    role: 'Study Coordinator',
    studies: ['AIIA-AYU-2026-002', 'AIIA-AYU-2026-004', 'AIIA-AYU-2026-008'],
    status: 'Active',
    lastActive: '30 Sep 2026, 07:40',
    initials: 'AJ',
  },
  {
    id: 'u-admin',
    name: 'Admin User',
    email: 'ctms.admin@aiia.gov.in',
    role: 'Administrator',
    studies: [],
    status: 'Active',
    lastActive: '30 Sep 2026, 09:01',
    initials: 'AU',
  },
]

export const demoUserByRole: Record<User['role'], User> = {
  'Principal Investigator': users[0],
  'Study Coordinator': users[1],
  Administrator: users[4],
}
