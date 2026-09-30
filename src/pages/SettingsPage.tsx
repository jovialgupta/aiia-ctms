import { Card } from '@/components/ui/Card'
import { Check } from 'lucide-react'

const future = [
  'Pharmacovigilance',
  'MedDRA / WHO Drug',
  'FHIR R4',
  'ABDM',
  'EDC Integration',
  'CDISC SDTM',
  'CDISC ADaM',
  'Define-XML',
  'Advanced Safety Analytics',
]

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Settings</h1>
        <p className="mt-1 text-sm text-muted">Organization profile and Phase 1 platform configuration.</p>
      </div>
      <Card>
        <h2 className="text-base font-semibold text-navy">Organization</h2>
        <p className="mt-3 text-sm font-semibold text-ink">AIIA</p>
        <p className="text-sm text-muted">All India Institute of Ayurveda</p>
      </Card>
      <Card>
        <h2 className="text-base font-semibold text-navy">Security</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" /> Role-Based Access Control — Enabled
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" /> Audit Trail — Enabled
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          Prototype controls only. Designed to support future GCP, CTRI, DPDP and regulatory workflows.
        </p>
      </Card>
      <Card>
        <h2 className="text-base font-semibold text-navy">Phase 2 / Future Integrations</h2>
        <p className="mt-2 text-sm text-muted">Coming Soon:</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {future.map((item) => (
            <li key={item} className="rounded-lg border border-dashed border-line bg-slate-50 px-3 py-2 text-sm text-muted">
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
