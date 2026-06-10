import { createContext, useMemo } from 'react'
import { memo, ReactNode, useState } from 'react'

import { User } from '@/types'

import useStartup from '@/hooks/useStartup'

export const AuthContext = createContext<{
  user: User | null
  setUser: (user: User | null) => void
}>({
  user: null,
  setUser: () => {
    throw new Error('Component must be wrapped in AuthProvider')
  }
})

interface AuthProviderProps {
  children: ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AuthProvider = ({ children }: AuthProviderProps): any => {
  const [user, setUser] = useState(null as User | null)

  const startupEnded = useStartup(setUser)

  const value = useMemo(() => ({ user, setUser }), [user])

  if (!startupEnded) return <div />

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default memo(AuthProvider)
