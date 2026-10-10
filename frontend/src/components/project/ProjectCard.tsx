import { Link } from 'react-router'
import { CalendarDays, Tag, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProjectStatus, ProjectSummary } from '@/types/api'

const STATUS: Record<ProjectStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-success-surface text-success' },
  in_progress: { label: 'In progress', className: 'bg-accent text-primary' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground' },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS[status]
  return (
    <Badge
      className={cn(
        'h-6 gap-1.5 px-2.5 font-mono text-xs font-semibold tracking-[0.04em] uppercase before:size-1.5 before:rounded-full before:bg-current',
        s.className,
      )}
    >
      {s.label}
    </Badge>
  )
}

export function ProjectCard({
  project,
  to,
  showOrganization = true,
}: {
  project: ProjectSummary
  to: string
  showOrganization?: boolean
}) {
  const deadline = formatDate(project.deadline)
  return (
    <Link
      to={to}
      className="group lift flex h-full flex-col rounded-2xl border-2 border-line-strong bg-card p-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg leading-snug font-semibold text-balance">{project.title}</h3>
        <ProjectStatusBadge status={project.status} />
      </div>
      {showOrganization && (
        <p className="mt-1 text-sm text-muted-foreground">{project.organization.companyName}</p>
      )}
      <p className="mt-3 mb-4 line-clamp-3 text-sm text-muted-foreground">{project.description}</p>

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
              {project.proposalCount} {project.proposalCount === 1 ? 'application' : 'applications'}
            </dd>
          </div>
        )}
      </dl>
    </Link>
  )
}
