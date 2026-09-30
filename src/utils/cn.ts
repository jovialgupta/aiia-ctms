import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

export function statusTone(status: string): string {
  const value = status.toLowerCase()
  if (['completed', 'closed', 'approved', 'registered', 'on track', 'success', 'resolved', 'active'].includes(value)) {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200'
  }
  if (['warning', 'renewal due', 'update due', 'behind', 'acknowledged', 'recruiting', 'ethics pending', 'ctri pending'].includes(value)) {
    return 'bg-amber-50 text-amber-800 border-amber-200'
  }
  if (['critical', 'overdue', 'expired', 'at risk', 'query raised'].includes(value)) {
    return 'bg-red-50 text-red-800 border-red-200'
  }
  if (['current', 'information', 'open', 'submitted'].includes(value)) {
    return 'bg-sky-50 text-sky-800 border-sky-200'
  }
  return 'bg-slate-50 text-slate-700 border-slate-200'
}
