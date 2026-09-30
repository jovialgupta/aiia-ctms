import type { Role } from '@/types'

export type NavKey =
  | 'dashboard'
  | 'studies'
  | 'recruitment'
  | 'milestones'
  | 'alerts'
  | 'audit'
  | 'users'
  | 'settings'

export interface NavItem {
  key: NavKey
  label: string
  href: string
  roles: Role[]
}

export const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    roles: ['Principal Investigator', 'Study Coordinator', 'Administrator'],
  },
  {
    key: 'studies',
    label: 'Clinical Studies',
    href: '/studies',
    roles: ['Principal Investigator', 'Study Coordinator', 'Administrator'],
  },
  {
    key: 'recruitment',
    label: 'Recruitment',
    href: '/recruitment',
    roles: ['Principal Investigator', 'Study Coordinator', 'Administrator'],
  },
  {
    key: 'milestones',
    label: 'Milestones & Compliance',
    href: '/milestones',
    roles: ['Principal Investigator', 'Study Coordinator', 'Administrator'],
  },
  {
    key: 'alerts',
    label: 'Alerts',
    href: '/alerts',
    roles: ['Principal Investigator', 'Study Coordinator', 'Administrator'],
  },
  {
    key: 'audit',
    label: 'Audit Trail',
    href: '/audit',
    roles: ['Administrator'],
  },
  {
    key: 'users',
    label: 'Users & Roles',
    href: '/users',
    roles: ['Administrator'],
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/settings',
    roles: ['Principal Investigator', 'Study Coordinator', 'Administrator'],
  },
]

export function visibleNav(role: Role) {
  return navItems.filter((item) => item.roles.includes(role))
}
