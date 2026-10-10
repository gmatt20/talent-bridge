import {Sparkles} from 'lucide-react';

/** Shown while the AI turns a challenge description into a brief. */
export function AnalyzingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center rounded-2xl border bg-card px-6 py-14 text-center"
    >
      <span className="relative flex size-14 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full bg-primary/25 motion-reduce:hidden"
        />
        <span className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles
            className="size-6 animate-pulse motion-reduce:animate-none"
            aria-hidden
          />
        </span>
      </span>
      <h2 className="font-display mt-5 text-xl font-extrabold">
        AI is structuring your challenge…
      </h2>
      <p className="mt-1 max-w-sm text-muted-foreground text-pretty">
        We’re turning your description into objectives, deliverables, skills and
        milestones. This takes a few seconds.
      </p>
    </div>
  );
}
