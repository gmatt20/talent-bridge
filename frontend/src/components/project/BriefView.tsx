import type {ReactNode} from 'react';
import {CircleCheck, Clock, Package, Sparkles} from 'lucide-react';
import {SkillBadge} from '../skills/SkillBadge';
import {formatDate} from '../../lib/format';
import type {ProjectBrief} from '../../types/api';

/** Props for {@link BriefView}. */
export interface BriefViewProps {
  brief: ProjectBrief;
  /** Buttons in the header, such as Regenerate. */
  actions?: ReactNode;
}

/**
 * Shows a project's AI-structured brief, labeled as a suggestion (AI
 * recommends, people decide).
 */
export function BriefView({brief, actions}: BriefViewProps) {
  return (
    <section
      aria-labelledby="brief-heading"
      className="rounded-2xl border-2 border-line-strong bg-card"
    >
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2
              id="brief-heading"
              className="font-display text-lg font-extrabold"
            >
              Project brief
            </h2>
            <p className="text-sm text-muted-foreground">
              Suggested by AI from your description. You decide what fits.
            </p>
          </div>
        </div>
        {actions}
      </div>

      <div className="grid gap-8 p-5 sm:p-6 lg:grid-cols-2">
        <BriefList
          title="Objectives"
          icon={<CircleCheck className="size-4 text-primary" aria-hidden />}
          items={brief.objectives}
        />
        <BriefList
          title="Deliverables"
          icon={<Package className="size-4 text-primary" aria-hidden />}
          items={brief.deliverables}
        />

        <div>
          <h3 className="text-sm font-semibold">Suggested skills</h3>
          {brief.suggestedSkills.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {brief.suggestedSkills.map(s => (
                <li key={s.id}>
                  <SkillBadge skill={s} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No specific skills suggested.
            </p>
          )}
          {brief.scope && (
            <>
              <h3 className="mt-6 text-sm font-semibold">Scope</h3>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <Clock className="size-4 text-primary" aria-hidden />
                {brief.scope}
              </p>
            </>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold">Milestones</h3>
          <ol className="mt-3">
            {brief.milestones.map((m, i) => (
              <li
                key={`${m.title}-${i}`}
                className="relative flex gap-3 pb-5 last:pb-0"
              >
                {i < brief.milestones.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute top-5 bottom-0 left-[9px] w-px bg-border"
                  />
                )}
                <span
                  aria-hidden
                  className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-semibold text-primary-foreground"
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{m.title}</p>
                  {m.dueDate && (
                    <p className="font-mono text-[13px] text-muted-foreground tabular-nums">
                      Due {formatDate(m.dueDate)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

interface BriefListProps {
  title: string;
  icon: ReactNode;
  items: string[];
}

function BriefList({title, icon, items}: BriefListProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map(item => (
          <li key={item} className="flex gap-2 text-sm">
            <span className="mt-0.5 shrink-0">{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
