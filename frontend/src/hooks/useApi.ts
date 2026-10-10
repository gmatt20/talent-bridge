import {useEffect, useState, type DependencyList} from 'react';
import {invalidateRequestCache} from '../api/client';

/** The result of {@link useApi}: the latest data or error, and reload. */
export interface ApiState<T> {
  data?: T;
  error?: Error;
  loading: boolean;
  /** Fetches again, keeping the current data visible meanwhile. */
  reload: () => void;
}

type LoadState<T> = Omit<ApiState<T>, 'reload'>;

/**
 * Loads data with `fn` and tracks its loading and error state. Reloads when
 * `deps` change or `reload()` is called; a stale response is ignored.
 */
export function useApi<T>(
  fn: () => Promise<T>,
  deps: DependencyList,
): ApiState<T> {
  const [state, setState] = useState<LoadState<T>>({loading: true});
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

  return {
    ...state,
    reload: () => {
      invalidateRequestCache();
      setNonce(n => n + 1);
    },
  };
}
