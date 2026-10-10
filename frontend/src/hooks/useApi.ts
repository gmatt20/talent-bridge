import {useEffect, useState, type DependencyList} from 'react';

interface ApiState<T> {
  data?: T;
  error?: Error;
  loading: boolean;
}

/**
 * Loads data with `fn` and tracks its loading and error state. Reloads when
 * `deps` change or `reload()` is called; a stale response is ignored.
 */
export function useApi<T>(fn: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<ApiState<T>>({loading: true});
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState(s => ({data: s.data, loading: true}));
    fn().then(
      data => {
        if (!cancelled) setState({data, loading: false});
      },
      (error: Error) => {
        if (!cancelled) setState({error, loading: false});
      },
    );
    return () => {
      cancelled = true;
    };
    // `fn` is recreated every render; callers list what it depends on in `deps`.
  }, [...deps, nonce]);

  return {...state, reload: () => setNonce(n => n + 1)};
}
