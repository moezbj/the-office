/* import { useState, useEffect } from 'react'
import { api } from '../services/api'

export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    setLoading(true)

    api
      .get<T>(endpoint)
      .then((response) => setData(response.data))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [endpoint])

  return { data, loading, error }
}
 */