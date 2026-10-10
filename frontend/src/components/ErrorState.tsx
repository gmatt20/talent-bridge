import {TriangleAlert} from 'lucide-react';
import {Button} from './ui/button';

/** Props for {@link ErrorState}. */
export interface ErrorStateProps {
  error: Error;
  /** Shows a "Try again" button that calls this. */
  onRetry?: () => void;
}

/** Shows why a view failed to load, with an optional retry. */
export function ErrorState({error, onRetry}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5"
    >
      <div className="flex items-center gap-2 font-medium text-destructive">
        <TriangleAlert className="size-5" aria-hidden />
        Something went wrong
      </div>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      {onRetry && (
        <Button variant="outline" className="rounded-full" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
