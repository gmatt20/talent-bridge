import {useEffect, useRef, useState} from 'react';
import {loadGoogleIdentity, renderGoogleButton} from '../lib/googleIdentity';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/** Props for {@link GoogleSignIn}. */
export interface GoogleSignInProps {
  /** Called with Google's ID token once the person picks an account. */
  onCredential: (credential: string) => void;
  /** The wording on Google's button. */
  text?: GoogleButtonConfiguration['text'];
}

/**
 * An "or" divider followed by Google's sign-in button, for the bottom of the
 * login and register forms. Renders nothing when `VITE_GOOGLE_CLIENT_ID` is
 * not set.
 */
export function GoogleSignIn({
  onCredential,
  text = 'continue_with',
}: GoogleSignInProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Google keeps the callback it was given at render time, so it calls through
  // this ref to reach the latest handler (and the latest form state).
  const onCredentialRef = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  });

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadGoogleIdentity(CLIENT_ID)
      .then(() => {
        const container = containerRef.current;
        if (cancelled || !container) return;
        renderGoogleButton(container, text, credential =>
          onCredentialRef.current(credential),
        );
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!CLIENT_ID) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden />
        or
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>
      <div ref={containerRef} className="mt-4 flex min-h-11 justify-center" />
      {failed && (
        <p role="alert" className="text-center text-sm text-destructive">
          Google sign-in couldn’t load. Check your connection and reload the
          page.
        </p>
      )}
    </div>
  );
}
