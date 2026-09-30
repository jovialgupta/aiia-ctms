import { searchCatalog } from '@/utils/search'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const results = useMemo(() => searchCatalog(query), [query])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search studies, users, alerts, milestones"
        className="h-10 w-full rounded-lg border border-line bg-slate-50 pl-9 pr-3 text-sm outline-none ring-navy/20 focus:bg-white focus:ring-2"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-lg border border-line bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted">No matching records in the Phase 1 catalog.</p>
          ) : (
            results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                className="flex w-full flex-col items-start gap-0.5 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 hover:bg-slate-50"
                onClick={() => {
                  navigate(item.href)
                  setQuery('')
                  setOpen(false)
                }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-teal">{item.type}</span>
                <span className="text-sm font-medium text-ink">{item.title}</span>
                <span className="text-xs text-muted">{item.subtitle}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
