// The parts of Google Identity Services (https://accounts.google.com/gsi/client)
// this app uses. The script defines `window.google` once it has loaded.

interface GoogleCredentialResponse {
  /** A signed ID token (JWT) for the account the person picked. */
  credential: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonConfiguration {
  type: 'standard';
  theme: 'outline';
  size: 'large';
  shape: 'pill';
  text: 'signin_with' | 'signup_with' | 'continue_with';
  logo_alignment: 'center';
  /** Width in pixels; Google caps it at 400. */
  width: number;
}

interface GoogleAccountsId {
  initialize(config: GoogleIdConfiguration): void;
  renderButton(parent: HTMLElement, options: GoogleButtonConfiguration): void;
}

interface Window {
  google?: {accounts: {id: GoogleAccountsId}};
}
