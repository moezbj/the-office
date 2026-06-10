import { useContext } from 'react'

import { AuthContext } from '@/providers/AuthProvider'
import { User } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useUser(): User | null {
  return useContext(AuthContext).user
}
