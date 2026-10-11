import {Link} from 'react-router';
import {FileText, Plus} from 'lucide-react';
import * as api from '../../api';
import {useAuth} from '../../auth/AuthContext';
import {EmptyState} from '../../components/EmptyState';
import {ErrorState} from '../../components/ErrorState';
import {PageHeader} from '../../components/PageHeader';
import {PillButton} from '../../components/PillButton';
import {ProjectCard} from '../../components/project/ProjectCard';
import {Button} from '../../components/ui/button';
import {Skeleton} from '../../components/ui/skeleton';
import {useApi} from '../../hooks/useApi';

/** The organization's home: its submitted challenges and a way to add one. */
export function OrgDashboard() {
  const {user} = useAuth();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Organization dashboard"
        title={user!.name}
        description="Your submitted challenges and their AI briefs."
        actions={
          <Button asChild className="rounded-full">
            <Link to="/org/projects/new">
              <Plus aria-hidden /> New challenge
            </Link>
          </Button>
        }
      />

      <ProjectList />
    </div>
  );
}

function ProjectList() {
  const projects = useApi(() => api.organizations.myProjects(), []);

  if (projects.loading && !projects.data) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-label="Loading your projects"
      >
        {[0, 1, 2].map(i => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    );
  }
  // GET /api/organizations/me/projects is a proposed endpoint; the backend may not have it yet.
  if (
    projects.error instanceof api.ApiError &&
    [404, 405].includes(projects.error.status)
  ) {
    return (
      <EmptyState
        icon={FileText}
        title="Your project list isn’t available yet"
        description="The backend doesn’t list an organization’s projects yet. You can still submit a challenge."
        action={<SubmitButton />}
      />
    );
  }
  if (projects.error) {
    return <ErrorState error={projects.error} onRetry={projects.reload} />;
  }
  if (projects.data!.items.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No challenges yet"
        description="Describe a problem in plain language and we’ll help shape it into a project students can take on."
        action={<SubmitButton />}
      />
    );
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.data!.items.map(p => (
        <li key={p.id}>
          <ProjectCard
            project={p}
            to={`/org/projects/${p.id}`}
            showOrganization={false}
          />
        </li>
      ))}
    </ul>
  );
}

function SubmitButton() {
  return (
    <PillButton asChild size="sm">
      <Link to="/org/projects/new">Submit a challenge</Link>
    </PillButton>
  );
}
