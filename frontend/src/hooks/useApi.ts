import { useEffect, useState, type DependencyList } from 'react'

interface ApiState<T> {
  data?: T
  error?: Error
  loading: boolean
}

export function useApi<T>(fn: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<ApiState<T>>({ loading: true })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ data: s.data, loading: true }))
    fn().then(
      (data) => !cancelled && setState({ data, loading: false }),
      (error: Error) => !cancelled && setState({ error, loading: false }),
    )
    return () => {
      cancelled = true
    }
  }, [...deps, nonce])

  return { ...state, reload: () => setNonce((n) => n + 1) }
}
