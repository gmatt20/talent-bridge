/** Returns the message of an error caught from the API layer or React code. */
export function errorMessage(error: unknown): string {
  // Everything this app throws is an Error (see api/client.ts), so the
  // assertion is safe.
  return (error as Error).message;
}
