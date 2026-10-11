import {CalendarDays, Sparkles, Tag} from 'lucide-react';
import {EmptyState} from '../EmptyState';
import {formatDate} from '../../lib/format';
import type {Project} from '../../types/api';
import {BriefView} from './BriefView';
import {ProjectStatusBadge} from './ProjectStatusBadge';

interface ProjectOverviewProps {
  project: Project;
}

/** Shows the project description and brief on detail and application pages. */
export function ProjectOverview({project}: ProjectOverviewProps) {
  const deadline = formatDate(project.deadline);
  return (
    <div className="min-w-0 space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[28px] leading-[1.05] font-extrabold text-balance sm:text-[34px]">
            {project.title}
          </h1>
          <ProjectStatusBadge status={project.status} />
        </div>
        <p className="mt-2 text-muted-foreground">
          {project.organization.companyName}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[13px] text-muted-foreground tabular-nums">
          {project.category && (
            <span className="flex items-center gap-1.5">
              <Tag className="size-4" aria-hidden /> {project.category}
            </span>
          )}
          {deadline && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden /> Due {deadline}
            </span>
          )}
        </div>
      </header>
      <section
        aria-labelledby="about-heading"
        className="rounded-2xl border bg-card p-5 sm:p-6"
      >
        <h2 id="about-heading" className="eyebrow text-primary">
          In the organization’s words
        </h2>
        <p className="mt-2 whitespace-pre-line text-muted-foreground">
          {project.description}
        </p>
      </section>
      {project.brief ? (
        <BriefView brief={project.brief} />
      ) : (
        <EmptyState
          icon={Sparkles}
          title="Brief coming soon"
          description="The organization hasn’t generated this project’s brief yet."
        />
      )}
    </div>
  );
}
