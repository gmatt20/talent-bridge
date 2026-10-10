import {Link} from 'react-router';
import {CalendarDays, Tag, Users} from 'lucide-react';
import {formatDate} from '../../lib/format';
import type {ProjectSummary} from '../../types/api';
import {ProjectStatusBadge} from './ProjectStatusBadge';

/** Props for {@link ProjectCard}. */
export interface ProjectCardProps {
  project: ProjectSummary;
  /** Where the card links to. */
  to: string;
  /** Hide on an organization's own dashboard, where it's redundant. */
  showOrganization?: boolean;
}

/** A clickable summary of one project: status, description and key facts. */
export function ProjectCard({
  project,
  to,
  showOrganization = true,
}: ProjectCardProps) {
  const deadline = formatDate(project.deadline);
  return (
    <Link
      to={to}
      className="group lift flex h-full flex-col rounded-2xl border-2 border-line-strong bg-card p-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg leading-snug font-semibold text-balance">
          {project.title}
        </h3>
        <ProjectStatusBadge status={project.status} />
      </div>
      {showOrganization && (
        <p className="mt-1 text-sm text-muted-foreground">
          {project.organization.companyName}
        </p>
      )}
      <p className="mt-3 mb-4 line-clamp-3 text-sm text-muted-foreground">
        {project.description}
      </p>

      <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 font-mono text-[13px] text-muted-foreground tabular-nums">
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
    </Link>
  );
}
