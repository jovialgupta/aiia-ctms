import type { MonthlyRecruitment, SiteRecruitment } from '@/types'

export const portfolioMonthlyRecruitment: MonthlyRecruitment[] = [
  { month: 'January', planned: 200, actual: 180 },
  { month: 'February', planned: 400, actual: 350 },
  { month: 'March', planned: 600, actual: 580 },
  { month: 'April', planned: 800, actual: 710 },
  { month: 'May', planned: 1000, actual: 920 },
  { month: 'June', planned: 1200, actual: 1050 },
]

export const studyMonthlyRecruitment: Record<string, MonthlyRecruitment[]> = {
  'AIIA-AYU-2026-001': [
    { month: 'January', planned: 60, actual: 52 },
    { month: 'February', planned: 120, actual: 108 },
    { month: 'March', planned: 200, actual: 186 },
    { month: 'April', planned: 280, actual: 248 },
    { month: 'May', planned: 360, actual: 332 },
    { month: 'June', planned: 440, actual: 384 },
  ],
  'AIIA-AYU-2026-002': [
    { month: 'January', planned: 50, actual: 48 },
    { month: 'February', planned: 110, actual: 96 },
    { month: 'March', planned: 180, actual: 164 },
    { month: 'April', planned: 250, actual: 221 },
    { month: 'May', planned: 320, actual: 288 },
    { month: 'June', planned: 390, actual: 315 },
  ],
}

export const defaultSites: SiteRecruitment[] = [
  { site: 'AIIA Delhi', target: 100, enrolled: 84, status: 'On Track' },
  { site: 'AIIA Jammu', target: 100, enrolled: 71, status: 'Behind' },
  { site: 'AIIA Mumbai', target: 100, enrolled: 69, status: 'Behind' },
  { site: 'AIIA Bengaluru', target: 100, enrolled: 82, status: 'On Track' },
]

export const sitesByStudy: Record<string, SiteRecruitment[]> = {
  'AIIA-AYU-2026-001': defaultSites,
  'AIIA-AYU-2026-002': [
    { site: 'AIIA Delhi', target: 90, enrolled: 81, status: 'On Track' },
    { site: 'AIIA Jaipur', target: 90, enrolled: 62, status: 'Behind' },
    { site: 'AIIA Goa', target: 80, enrolled: 70, status: 'On Track' },
    { site: 'AIIA Bengaluru', target: 80, enrolled: 54, status: 'At Risk' },
    { site: 'AIIA Jammu', target: 80, enrolled: 48, status: 'Behind' },
  ],
  'AIIA-AYU-2026-003': [
    { site: 'AIIA Delhi', target: 90, enrolled: 74, status: 'Behind' },
    { site: 'AIIA Jammu', target: 80, enrolled: 51, status: 'At Risk' },
    { site: 'AIIA Mumbai', target: 80, enrolled: 68, status: 'Behind' },
    { site: 'AIIA Bhubaneswar', target: 80, enrolled: 72, status: 'On Track' },
  ],
}

export const portfolioRecruitment = {
  target: 5000,
  enrolled: 3842,
  progress: 76.8,
}

export const kpiByRange = {
  today: {
    activeStudies: 24,
    totalParticipants: 3842,
    recruitmentProgress: 78,
    activeSites: 47,
    pendingIec: 6,
    ctriDue: 4,
    protocolDeviations: 17,
    dataQueries: 128,
    trends: {
      activeStudies: 'Stable vs yesterday',
      totalParticipants: '+12 today',
      recruitmentProgress: '+0.2 pts',
      activeSites: 'No change',
      pendingIec: '2 due today',
      ctriDue: '1 overdue today',
      protocolDeviations: '+1 today',
      dataQueries: '+6 today',
    },
  },
  '7d': {
    activeStudies: 24,
    totalParticipants: 3798,
    recruitmentProgress: 76,
    activeSites: 47,
    pendingIec: 8,
    ctriDue: 5,
    protocolDeviations: 15,
    dataQueries: 141,
    trends: {
      activeStudies: 'No new activations',
      totalParticipants: '+86 this week',
      recruitmentProgress: '+1.4 pts',
      activeSites: '+1 site activated',
      pendingIec: 'Down from 9',
      ctriDue: '2 resolved',
      protocolDeviations: '-2 closed',
      dataQueries: '-13 resolved',
    },
  },
  '30d': {
    activeStudies: 24,
    totalParticipants: 3610,
    recruitmentProgress: 72,
    activeSites: 45,
    pendingIec: 11,
    ctriDue: 7,
    protocolDeviations: 21,
    dataQueries: 168,
    trends: {
      activeStudies: '+2 this month',
      totalParticipants: '+232 / 30 days',
      recruitmentProgress: '+4.1 pts',
      activeSites: '+3 sites',
      pendingIec: 'Cycle peak',
      ctriDue: 'Quarterly updates',
      protocolDeviations: 'Needs review',
      dataQueries: 'Monitor backlog',
    },
  },
  quarter: {
    activeStudies: 24,
    totalParticipants: 3124,
    recruitmentProgress: 62,
    activeSites: 42,
    pendingIec: 14,
    ctriDue: 9,
    protocolDeviations: 28,
    dataQueries: 204,
    trends: {
      activeStudies: 'Portfolio held',
      totalParticipants: '+718 this quarter',
      recruitmentProgress: '+14.8 pts',
      activeSites: '+6 sites',
      pendingIec: 'Seasonal submissions',
      ctriDue: 'Annual refresh',
      protocolDeviations: 'Trend declining',
      dataQueries: 'EDC not connected',
    },
  },
}

export const statusPortfolio = [
  { name: 'Planning', value: 3 },
  { name: 'Ethics Pending', value: 2 },
  { name: 'CTRI Pending', value: 2 },
  { name: 'Recruiting', value: 6 },
  { name: 'Active', value: 5 },
  { name: 'Follow-up', value: 3 },
  { name: 'Completed', value: 2 },
  { name: 'Closed', value: 1 },
]
