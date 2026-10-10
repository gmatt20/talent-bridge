/** Props for {@link FormError}. */
export interface FormErrorProps {
  /** Nothing renders when this is empty. */
  message?: string;
}

/** A form-level error message, announced to screen readers. */
export function FormError({message}: FormErrorProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border-2 border-destructive bg-destructive/5 px-3 py-2 text-sm font-semibold text-destructive"
    >
      {message}
    </p>
  );
}
