import { Badge, Card } from '@/components/ui/Card'
import { users } from '@/data/users'

export function UsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Users &amp; Roles</h1>
        <p className="mt-1 text-sm text-muted">
          Directory of prototype workspace accounts. Role-based access is simulated in the client.
        </p>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-muted">
            <tr>
              {['Name', 'Role', 'Studies', 'Status', 'Last Active'].map((col) => (
                <th key={col} className="px-4 py-3">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">{user.studies.length ? user.studies.join(', ') : 'All studies'}</td>
                <td className="px-4 py-3"><Badge>{user.status}</Badge></td>
                <td className="px-4 py-3">{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
