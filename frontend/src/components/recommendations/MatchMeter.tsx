import {cn} from '../../lib/utils';

/** Props for {@link MatchMeter}. */
export interface MatchMeterProps {
  /** The AI's match score, from 0 to 1. */
  score: number;
}

function matchLabel(score: number): string {
  if (score >= 0.8) return 'Strong match';
  if (score >= 0.5) return 'Good fit';
  return 'Possible fit';
}

/** Shows a match score as a big percentage over a thick bar, with a label. */
export function MatchMeter({score}: MatchMeterProps) {
  const percent = Math.round(Math.min(Math.max(score, 0), 1) * 100);
  const label = matchLabel(score);
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow text-primary">{label}</span>
        <span className="font-display text-2xl leading-none font-black tabular-nums">
          {percent}%
        </span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`Match score: ${label}, ${percent}%`}
        className="h-3 overflow-hidden rounded-full border-2 border-line-strong bg-muted"
      >
        <div
          className={cn(
            'h-full rounded-full',
            score >= 0.8 ? 'bg-primary' : 'bg-periwinkle',
          )}
          style={{width: `${percent}%`}}
        />
      </div>
    </div>
  );
}
