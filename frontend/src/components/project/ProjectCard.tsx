import { Link } from 'react-router'
import { CalendarDays, Tag, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProjectStatus, ProjectSummary } from '@/types/api'

const STATUS: Record<ProjectStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-emerald-50 text-emerald-700' },
  in_progress: { label: 'In progress', className: 'bg-accent text-primary' },
  completed: { label: 'Completed', className: 'bg-muted text-muted-foreground' },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS[status]
  return <Badge className={cn('h-6 px-2.5', s.className)}>{s.label}</Badge>
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
      className="group flex h-full flex-col rounded-xl border bg-card p-5 transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-balance group-hover:text-primary">{project.title}</h3>
        <ProjectStatusBadge status={project.status} />
      </div>
      {showOrganization && (
        <p className="mt-1 text-sm text-muted-foreground">{project.organization.companyName}</p>
      )}
      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{project.description}</p>

      <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-sm text-muted-foreground">
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
