import {Link} from 'react-router';
import {CalendarDays, Tag, Users} from 'lucide-react';
import {formatDate} from '../../lib/format';
import {cn} from '../../lib/utils';
import type {ProjectSummary} from '../../types/api';
import {ProjectStatusBadge} from './ProjectStatusBadge';

/** Props for {@link ProjectCard}. */
export interface ProjectCardProps {
  project: ProjectSummary;
  /** Where the card links to. */
  to: string;
  /** Hide on an organization's own dashboard, where it's redundant. */
  showOrganization?: boolean;
  /**
   * `card` (default) for a boxed cell in a grid; `row` for a full-width entry
   * in a stacked list, with the facts beside the text on wider screens.
   */
  orientation?: 'card' | 'row';
}

/** A clickable summary of one project: status, description and key facts. */
export function ProjectCard({
  project,
  to,
  showOrganization = true,
  orientation = 'card',
}: ProjectCardProps) {
  const deadline = formatDate(project.deadline);
  const row = orientation === 'row';
  return (
    <Link
      to={to}
      className={cn(
        'group lift flex rounded-2xl border-2 border-line-strong bg-card p-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
        row
          ? 'flex-col gap-4 sm:flex-row sm:items-center sm:gap-6'
          : 'h-full flex-col',
      )}
    >
      <div className={cn('min-w-0', row && 'flex-1')}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg leading-snug font-semibold text-balance">
            {project.title}
          </h3>
          {!row && <ProjectStatusBadge status={project.status} />}
        </div>
        {showOrganization && (
          <p className="mt-1 text-sm text-muted-foreground">
            {project.organization.companyName}
          </p>
        )}
        <p
          className={cn(
            'mt-3 text-sm text-muted-foreground',
            row ? 'line-clamp-2' : 'mb-4 line-clamp-3',
          )}
        >
          {project.description}
        </p>
      </div>

      <div
        className={cn(
          row
            ? 'flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 sm:flex-col sm:items-end sm:gap-3'
            : 'mt-auto',
        )}
      >
        {row && <ProjectStatusBadge status={project.status} />}
        <dl
          className={cn(
            'flex flex-wrap gap-x-4 gap-y-1 font-mono text-[13px] text-muted-foreground tabular-nums',
            row ? 'sm:justify-end' : 'border-t pt-3',
          )}
        >
          {project.category && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Category</dt>
              <Tag className="size-4" aria-hidden />
              <dd>{project.category}</dd>
            </div>
          )}
          {deadline && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Deadline</dt>
              <CalendarDays className="size-4" aria-hidden />
              <dd>{deadline}</dd>
            </div>
          )}
          {project.proposalCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Applications</dt>
              <Users className="size-4" aria-hidden />
              <dd>
                {project.proposalCount}{' '}
                {project.proposalCount === 1 ? 'application' : 'applications'}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </Link>
  );
}
