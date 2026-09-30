import { demoUserByRole } from '@/data/users'
import type { Role, User } from '@/types'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface AuthState {
  user: User | null
  role: Role
  login: (role: Role) => void
  logout: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthState | null>(null)
const STORAGE_KEY = 'aiia-ctms-session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  })

  const value = useMemo<AuthState>(() => {
    const persist = (next: User | null) => {
      setUser(next)
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    }

    return {
      user,
      role: user?.role ?? 'Principal Investigator',
      login: (role) => persist(demoUserByRole[role]),
      logout: () => persist(null),
      switchRole: (role) => persist(demoUserByRole[role]),
    }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
