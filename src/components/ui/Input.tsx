import { cn } from '@/utils/cn'
import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none ring-navy/20 placeholder:text-slate-400 focus:ring-2',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none ring-navy/20 focus:ring-2',
        className,
      )}
      {...props}
    />
  )
}

export function Label({ children, htmlFor }: { children: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
      {children}
    </label>
  )
}
