import {Link} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {cn} from '../../lib/utils';
import type {StudentRecommendation} from '../../types/api';
import {MatchMeter} from './MatchMeter';
import {MatchReasons} from './MatchReasons';

/** Props for {@link RecommendationCard}. */
export interface RecommendationCardProps {
  recommendation: StudentRecommendation;
  /**
   * `card` (default) for a boxed cell in a grid; `row` for a full-width entry
   * in a stacked list, with the match meter beside the reasons on wider
   * screens.
   */
  orientation?: 'card' | 'row';
}

/**
 * A project the AI recommends to a student: how well it matches and why.
 * The whole card links to the project.
 */
export function RecommendationCard({
  recommendation,
  orientation = 'card',
}: RecommendationCardProps) {
  const {project, matchScore, reasons} = recommendation;
  const row = orientation === 'row';
  return (
    <Link
      to={`/projects/${project.id}`}
      className={cn(
        'group lift flex gap-4 rounded-2xl border-2 border-line-strong bg-card p-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
        row ? 'flex-col sm:flex-row sm:gap-8' : 'h-full flex-col',
      )}
    >
      <div className={cn('flex flex-col gap-4', row && 'min-w-0 sm:flex-1')}>
        <div>
          <h3 className="text-lg leading-snug font-semibold text-balance">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.organization.companyName}
          </p>
        </div>
        {!row && <MatchMeter score={matchScore} />}
        <MatchReasons reasons={reasons} />
        {!row && (
          <span className="mt-auto flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary">
            View project
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden
            />
          </span>
        )}
      </div>
      {row && (
        <div className="flex flex-col gap-4 sm:w-60 sm:shrink-0">
          <MatchMeter score={matchScore} />
          <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            View project
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden
            />
          </span>
        </div>
      )}
    </Link>
  );
}
