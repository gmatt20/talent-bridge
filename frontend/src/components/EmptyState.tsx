import type {LucideIcon} from 'lucide-react';
import type {ReactNode} from 'react';

/** Props for {@link EmptyState}. */
export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Usually one PillButton that gets the person started. */
  action?: ReactNode;
}

/** Fills a view that has nothing to show yet, and says what to do next. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed bg-card px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
        <Icon className="size-6" aria-hidden />
      </span>
      <h2 className="font-display mt-4 text-xl font-extrabold text-balance">
        {title}
      </h2>
      {description && (
        <p className="mt-1 max-w-md text-muted-foreground text-pretty">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
