import {Skeleton} from '../ui/skeleton';

/**
 * A placeholder shaped like a match card, shown while AI matchmaking runs.
 * Mirrors the name, match meter and reasons of {@link PersonMatchCard} and
 * {@link RecommendationCard} so the layout doesn't jump when results arrive.
 * The matchmaking call can take several seconds, so this stands in for it.
 */
export function MatchCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full flex-col gap-4 rounded-2xl border-2 border-line-strong bg-card p-5"
    >
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-12" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
