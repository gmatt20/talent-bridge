import type {LucideIcon} from 'lucide-react';
import {Building2, GraduationCap, UserRound} from 'lucide-react';
import {cn} from '../../lib/utils';
import type {Team} from '../../types/api';
import {ProjectStatusBadge} from '../project/ProjectStatusBadge';

/** Props for {@link TeamCard}. */
export interface TeamCardProps {
  team: Team;
}

/** The people working on a project: organization, student and mentor. */
export function TeamCard({team}: TeamCardProps) {
  return (
    <section
      aria-labelledby="team-heading"
      className="rounded-2xl border-2 border-line-strong bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="team-heading" className="font-display text-xl font-extrabold">
          Your team
        </h2>
        <ProjectStatusBadge status={team.project.status} />
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        <TeamSlot
          icon={Building2}
          role="Organization"
          name={team.organization.companyName}
        />
        <TeamSlot
          icon={GraduationCap}
          role="Student"
          name={team.student?.name}
          detail={team.student?.headline}
        />
        <TeamSlot
          icon={UserRound}
          role="Mentor"
          name={team.mentor?.name}
          detail={team.mentor?.headline}
          emptyText="Open. A mentor can join from the project page."
        />
      </ul>
    </section>
  );
}

interface TeamSlotProps {
  icon: LucideIcon;
  role: string;
  name?: string;
  detail?: string;
  emptyText?: string;
}

function TeamSlot({
  icon: Icon,
  role,
  name,
  detail,
  emptyText = 'Not filled yet.',
}: TeamSlotProps) {
  return (
    <li
      className={cn(
        'flex gap-3 rounded-xl p-4',
        name ? 'bg-accent' : 'border-2 border-dashed',
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          name ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="eyebrow text-muted-foreground">{role}</p>
        {name ? (
          <>
            <p className="mt-1 font-semibold">{name}</p>
            {detail && (
              <p className="text-sm text-muted-foreground">{detail}</p>
            )}
          </>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">{emptyText}</p>
        )}
      </div>
    </li>
  );
}
