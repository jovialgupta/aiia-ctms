import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/types'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'

const roles: Role[] = ['Principal Investigator', 'Study Coordinator', 'Administrator']

export function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('ananya.sharma@aiia.gov.in')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('Principal Investigator')

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden bg-navy px-14 py-12 text-white lg:flex lg:flex-col">
        <p className="text-sm font-semibold tracking-[0.28em] text-teal-600">AIIA</p>
        <h1 className="mt-6 max-w-lg text-4xl font-semibold leading-tight">
          Clinical Research Management Platform
        </h1>
        <p className="mt-4 text-sm tracking-wide text-slate-300">
          Clinical Trials • Compliance • Research Analytics
        </p>
        <div className="mt-12 max-w-md space-y-6 text-sm leading-relaxed text-slate-300">
          <p>
            Phase 1 replaces fragmented spreadsheets and disconnected trackers with a centralized view of AIIA’s
            clinical research portfolio.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Before</p>
            <p className="mt-1">Spreadsheets + disconnected tools + delayed visibility</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Phase 1 CTMS</p>
            <p className="mt-1">Centralized dashboard + real-time KPIs + milestones + alerts + audit history</p>
          </div>
          <p className="text-xs text-slate-400">
            Designed to support future GCP, CTRI, DPDP and regulatory workflows. This prototype is not a claim of
            legal or clinical certification.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.24em] text-teal">AIIA</p>
          <h2 className="mt-2 text-2xl font-semibold text-navy">Sign in to the research workspace</h2>
          <p className="mt-2 text-sm text-muted">Institute staff prototype access — no live authentication.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              login(role)
              toast.success(`Signed in as ${role}`)
            }}
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Any value — prototype only"
              />
            </div>
            <div>
              <Label htmlFor="role">Demo role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm"
              >
                {roles.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <Button className="w-full" type="submit">
              Sign In
            </Button>
            <Button
              className="w-full"
              type="button"
              variant="secondary"
              onClick={() => {
                login(role)
                toast.success('Demo session started')
              }}
            >
              Demo Login
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
