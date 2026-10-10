const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const MAX_BUTTON_WIDTH = 400;

type CredentialListener = (credential: string) => void;

// Google allows one `initialize` call per page, so its callback forwards to
// the button that was rendered last.
let listener: CredentialListener | undefined;
let ready: Promise<void> | undefined;

/**
 * Loads Google Identity Services and sets it up for `clientId`. Safe to call
 * repeatedly; the script is only fetched once.
 */
export function loadGoogleIdentity(clientId: string): Promise<void> {
  ready ??= new Promise<void>((resolve, reject) => {
    const fail = () => {
      // Forget the failure so a later call can retry.
      ready = undefined;
      reject(new Error('Google sign-in could not be loaded.'));
    };
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onerror = fail;
    script.onload = () => {
      if (!window.google) return fail();
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: response => listener?.(response.credential),
      });
      resolve();
    };
    document.head.append(script);
  });
  return ready;
}

/**
 * Draws Google's sign-in button inside `container` and sends the ID token of
 * the account the person picks to `onCredential`. Call after
 * `loadGoogleIdentity` has resolved.
 */
export function renderGoogleButton(
  container: HTMLElement,
  text: GoogleButtonConfiguration['text'],
  onCredential: CredentialListener,
) {
  listener = onCredential;
  window.google?.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    shape: 'pill',
    text,
    logo_alignment: 'center',
    width: Math.min(MAX_BUTTON_WIDTH, container.offsetWidth),
  });
}
