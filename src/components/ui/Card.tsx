import { cn, statusTone } from '@/utils/cn'
import type { ReactNode } from 'react'

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn('rounded-xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(12,30,48,0.04)]', className)}>
      {children}
    </section>
  )
}

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
        statusTone(tone ?? String(children)),
      )}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value))
  const color = width >= 80 ? 'bg-success' : width >= 65 ? 'bg-teal' : 'bg-warning'
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${width}%` }} />
    </div>
  )
}
