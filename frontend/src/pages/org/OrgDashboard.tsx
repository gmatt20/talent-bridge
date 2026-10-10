import { Link } from 'react-router'
import { FileText, Plus } from 'lucide-react'
import * as api from '@/api'
import { useAuth } from '@/auth/AuthContext'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { PageHeader } from '@/components/PageHeader'
import { PillButton } from '@/components/PillButton'
import { ProjectCard } from '@/components/project/ProjectCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useApi } from '@/hooks/useApi'

export default function OrgDashboard() {
  const { user } = useAuth()
  const projects = useApi(() => api.organizations.myProjects(), [])
  // GET /api/organizations/me/projects is a proposed endpoint; the backend may not have it yet.
  const unsupported = projects.error instanceof api.ApiError && [404, 405].includes(projects.error.status)

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Organization dashboard"
        title={user!.name}
        description="Your submitted challenges and their AI briefs."
        actions={
          <>
            <Button variant="outline" asChild className="rounded-full">
              <Link to="/onboarding/org">Edit profile</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link to="/org/projects/new">
                <Plus aria-hidden /> New challenge
              </Link>
            </Button>
          </>
        }
      />

      {projects.loading && !projects.data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading your projects">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : unsupported ? (
        <EmptyState
          icon={FileText}
          title="Your project list isn’t available yet"
          description="The backend doesn’t list an organization’s projects yet. You can still submit a challenge."
          action={<SubmitButton />}
        />
      ) : projects.error ? (
        <ErrorState error={projects.error} onRetry={projects.reload} />
      ) : projects.data!.items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No challenges yet"
          description="Describe a problem in plain language and we’ll help shape it into a project students can take on."
          action={<SubmitButton />}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.data!.items.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} to={`/org/projects/${p.id}`} showOrganization={false} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SubmitButton() {
  return (
    <PillButton asChild size="sm">
      <Link to="/org/projects/new">Submit a challenge</Link>
    </PillButton>
  )
}
