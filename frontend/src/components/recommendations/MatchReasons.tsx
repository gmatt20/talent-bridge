import {CircleCheck} from 'lucide-react';

/** Props for {@link MatchReasons}. */
export interface MatchReasonsProps {
  reasons: string[];
}

/** The AI's plain-English reasons for a match, as a checklist. */
export function MatchReasons({reasons}: MatchReasonsProps) {
  if (reasons.length === 0) return null;
  return (
    <ul aria-label="Why it's a match" className="space-y-1.5">
      {reasons.map(reason => (
        <li key={reason} className="flex gap-2 text-sm">
          <CircleCheck
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden
          />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}
