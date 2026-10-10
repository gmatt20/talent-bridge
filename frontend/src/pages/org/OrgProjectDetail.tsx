import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, CalendarDays, Compass, RefreshCw, Sparkles, Tag } from 'lucide-react'
import { toast } from 'sonner'
import * as api from '@/api'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { AnalyzingState, BriefView } from '@/components/project/BriefView'
import { ProjectStatusBadge } from '@/components/project/ProjectCard'
import { PillButton } from '@/components/PillButton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useApi } from '@/hooks/useApi'
import { formatDate } from '@/lib/format'
import type { Project } from '@/types/api'

export default function OrgProjectDetail() {
  const id = Number(useParams().id)
  const project = useApi(() => api.projects.get(id), [id])

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <Button variant="ghost" asChild className="-ml-3 rounded-full text-muted-foreground">
        <Link to="/org">
          <ArrowLeft aria-hidden /> My projects
        </Link>
      </Button>

      {project.loading && !project.data ? (
        <div className="space-y-4" role="status" aria-label="Loading project">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-64" />
        </div>
      ) : project.error instanceof api.ApiError && project.error.status === 404 ? (
        <EmptyState
          icon={Compass}
          title="We couldn’t find that project"
          description="It may have been removed, or the link is wrong."
        />
      ) : project.error ? (
        <ErrorState error={project.error} onRetry={project.reload} />
      ) : (
        <ProjectBody project={project.data!} onChange={project.reload} />
      )}
    </div>
  )
}

function ProjectBody({ project, onChange }: { project: Project; onChange: () => void }) {
  const [analyzing, setAnalyzing] = useState(false)
  const deadline = formatDate(project.deadline)

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      await api.projects.analyze(project.id)
      toast.success(project.brief ? 'Brief regenerated' : 'Brief ready')
      onChange()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <>
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[28px] leading-[1.05] font-extrabold text-balance sm:text-[34px]">{project.title}</h1>
          <ProjectStatusBadge status={project.status} />
        </div>
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

      <section aria-labelledby="description-heading" className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 id="description-heading" className="eyebrow text-primary">
          Your description
        </h2>
        <p className="mt-2 whitespace-pre-line text-muted-foreground">{project.description}</p>
      </section>

      {analyzing ? (
        <AnalyzingState />
      ) : project.brief ? (
        <BriefView
          brief={project.brief}
          actions={
            <Button variant="outline" className="rounded-full" onClick={runAnalysis}>
              <RefreshCw aria-hidden /> Regenerate
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No brief yet"
          description="Let AI turn your description into objectives, deliverables, skills and milestones."
          action={
            <PillButton size="sm" onClick={runAnalysis}>
              Generate brief
            </PillButton>
          }
        />
      )}
    </>
  )
}
