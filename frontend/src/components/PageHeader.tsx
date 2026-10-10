import type {ReactNode} from 'react';

/** Props for {@link PageHeader}. */
export interface PageHeaderProps {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /** Buttons shown on the right (below the title on phones). */
  actions?: ReactNode;
}

/** The title block at the top of an app page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-3 text-primary">{eyebrow}</p>}
        <h1 className="font-display text-[28px] leading-[1.05] font-extrabold text-balance sm:text-[34px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
