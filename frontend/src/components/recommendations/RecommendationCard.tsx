import {Link} from 'react-router';
import {ArrowRight} from 'lucide-react';
import type {StudentRecommendation} from '../../types/api';
import {MatchMeter} from './MatchMeter';
import {MatchReasons} from './MatchReasons';

/** Props for {@link RecommendationCard}. */
export interface RecommendationCardProps {
  recommendation: StudentRecommendation;
}

/**
 * A project the AI recommends to a student: how well it matches and why.
 * The whole card links to the project.
 */
export function RecommendationCard({recommendation}: RecommendationCardProps) {
  const {project, matchScore, reasons} = recommendation;
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group lift flex h-full flex-col gap-4 rounded-2xl border-2 border-line-strong bg-card p-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring"
    >
      <div>
        <h3 className="text-lg leading-snug font-semibold text-balance">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {project.organization.companyName}
        </p>
      </div>
      <MatchMeter score={matchScore} />
      <MatchReasons reasons={reasons} />
      <span className="mt-auto flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary">
        View project
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden
        />
      </span>
    </Link>
  );
}
