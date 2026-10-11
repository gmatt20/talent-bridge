import {cn} from '../../lib/utils';
import {Skeleton} from '../ui/skeleton';

/** Props for {@link MatchCardSkeleton}. */
export interface MatchCardSkeletonProps {
  /** Match the orientation of the real card it stands in for. */
  orientation?: 'card' | 'row';
}

/**
 * A placeholder shaped like a match card, shown while AI matchmaking runs.
 * Mirrors the name, match meter and reasons of {@link PersonMatchCard} and
 * {@link RecommendationCard} so the layout doesn't jump when results arrive.
 * The matchmaking call can take several seconds, so this stands in for it.
 */
export function MatchCardSkeleton({
  orientation = 'card',
}: MatchCardSkeletonProps) {
  const row = orientation === 'row';
  return (
    <div
      aria-hidden
      className={cn(
        'flex gap-4 rounded-2xl border-2 border-line-strong bg-card p-5',
        row ? 'flex-col sm:flex-row sm:gap-8' : 'h-full flex-col',
      )}
    >
      <div className={cn('flex flex-col gap-4', row && 'min-w-0 sm:flex-1')}>
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        {!row && <MeterSkeleton />}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      {row && (
        <div className="sm:w-60 sm:shrink-0">
          <MeterSkeleton />
        </div>
      )}
    </div>
  );
}

/** The label-plus-bar block that mirrors {@link MatchMeter}. */
function MeterSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-12" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
    </div>
  );
}
