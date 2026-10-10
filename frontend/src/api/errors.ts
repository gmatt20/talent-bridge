/** An error response from the API, with its HTTP status. */
export class ApiError extends Error {
  // Not a parameter property: tsconfig's `erasableSyntaxOnly` forbids them.
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
