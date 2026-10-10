import type {ReactNode} from 'react';
import {MatchMeter} from './MatchMeter';
import {MatchReasons} from './MatchReasons';

/** Props for {@link PersonMatchCard}. */
export interface PersonMatchCardProps {
  name: string;
  headline?: string;
  /** The AI's match score, from 0 to 1. */
  matchScore: number;
  reasons: string[];
  /** Shown beside the name, such as an application status. */
  badge?: ReactNode;
}

/** A student or mentor the AI recommends for a project, with reasons. */
export function PersonMatchCard({
  name,
  headline,
  matchScore,
  reasons,
  badge,
}: PersonMatchCardProps) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-2xl border-2 border-line-strong bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg leading-snug font-semibold">{name}</h3>
          {headline && (
            <p className="mt-0.5 text-sm text-muted-foreground">{headline}</p>
          )}
        </div>
        {badge}
      </div>
      <MatchMeter score={matchScore} />
      <MatchReasons reasons={reasons} />
    </article>
  );
}
