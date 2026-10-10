import type {ReactNode} from 'react';
import {cn} from '../../lib/utils';

/** Props for {@link AuthCard}. */
export interface AuthCardProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Text under the card, such as a link to log in instead. */
  footer?: ReactNode;
  className?: string;
}

/** The centered card used by the login, register and onboarding screens. */
export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-md px-4 py-12 sm:py-16', className)}
    >
      <div className="rounded-2xl border bg-card p-6 sm:p-8">
        {eyebrow && <p className="eyebrow mb-3 text-primary">{eyebrow}</p>}
        <h1 className="font-display text-[26px] leading-[1.05] font-extrabold text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-muted-foreground text-pretty">
            {description}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </div>
      {footer && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}
