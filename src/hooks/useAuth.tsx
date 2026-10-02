import type { Role, User } from '@/types'
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface AuthState {
  user: User | null
  role: Role
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const STORAGE_KEY = 'aiia-ctms-session'
const TOKEN_KEY = 'ctms_token'

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

      if (next) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    return {
      user,

      role: user?.role ?? ('Principal Investigator' as Role),

      login: async (email: string, password: string) => {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
            }),
          },
        )

        if (!response.ok) {
          throw new Error('Invalid email or password')
        }

        const data = await response.json()

        localStorage.setItem(TOKEN_KEY, data.access_token)

        const meResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          },
        )

        if (!meResponse.ok) {
          localStorage.removeItem(TOKEN_KEY)
          throw new Error('Failed to fetch logged-in user')
        }

        const backendUser = await meResponse.json()

        const loggedInUser: User = {
          ...backendUser,
          role: formatRole(backendUser.role),
        }

        persist(loggedInUser)
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        persist(null)
      },
    }
  }, [user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

function formatRole(role: string): Role {
  const roleMap: Record<string, Role> = {
    administrator: 'Administrator' as Role,
    principal_investigator: 'Principal Investigator' as Role,
    study_coordinator: 'Study Coordinator' as Role,
  }

  return roleMap[role] ?? (role as Role)
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return ctx
}