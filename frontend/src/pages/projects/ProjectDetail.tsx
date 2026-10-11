import type {ReactNode} from 'react';
import {Link, useLocation, useParams} from 'react-router';
import {ArrowLeft, Compass, PartyPopper} from 'lucide-react';
import * as api from '../../api';
import {useAuth} from '../../auth/AuthContext';
import {EmptyState} from '../../components/EmptyState';
import {ErrorState} from '../../components/ErrorState';
import {ProjectOverview} from '../../components/project/ProjectOverview';
import {PillButton} from '../../components/PillButton';
import {ProposalStatusBadge} from '../../components/proposals/ProposalStatusBadge';
import {Button} from '../../components/ui/button';
import {Skeleton} from '../../components/ui/skeleton';
import {useApi} from '../../hooks/useApi';
import type {Project} from '../../types/api';

/** A project's public page: its brief, and a way for students to apply. */
export function ProjectDetail() {
  const id = Number(useParams().id);
  const project = useApi(() => api.projects.get(id), [id]);

  let content: ReactNode;
  if (project.loading && !project.data) {
    content = (
      <div className="space-y-4" role="status" aria-label="Loading project">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    );
  } else if (
    project.error instanceof api.ApiError &&
    project.error.status === 404
  ) {
    content = (
      <EmptyState
        icon={Compass}
        title="We couldn’t find that project"
        description="It may have been removed, or the link is wrong."
      />
    );
  } else if (project.error) {
    content = <ErrorState error={project.error} onRetry={project.reload} />;
  } else {
    content = <ProjectBody project={project.data!} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <Button variant="ghost" asChild className="-ml-3 text-muted-foreground">
        <Link to="/projects">
          <ArrowLeft aria-hidden /> All projects
        </Link>
      </Button>
      {content}
    </div>
  );
}

interface ProjectBodyProps {
  project: Project;
}

function ProjectBody({project}: ProjectBodyProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <ProjectOverview project={project} />
      <aside className="lg:sticky lg:top-24">
        <ApplyPanel project={project} />
      </aside>
    </div>
  );
}

interface ApplyPanelProps {
  project: Project;
}

/** What the viewer can do next, depending on who they are. */
function ApplyPanel({project}: ApplyPanelProps) {
  const {user} = useAuth();
  const location = useLocation();
  const isStudent = user?.role === 'student';
  const proposals = useApi(
    () =>
      isStudent ? api.students.myProposals() : Promise.resolve({items: []}),
    [user?.id],
  );
  const existing = proposals.data?.items.find(p => p.project.id === project.id);
  const status = existing?.status;

  let body: ReactNode;
  if (!user) {
    body = (
      <>
        <p className="text-sm text-muted-foreground">
          Log in as a student to apply to this project.
        </p>
        <Button asChild className="w-full">
          <Link to="/login" state={{from: location.pathname}}>
            Log in to apply
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link to="/register?role=student">Create a student account</Link>
        </Button>
      </>
    );
  } else if (user.role === 'organization') {
    body =
      project.organization.id === user.id ? (
        <Button asChild className="w-full">
          <Link to={`/org/projects/${project.id}`}>Manage this project</Link>
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          Only students can apply to projects.
        </p>
      );
  } else if (!isStudent) {
    body = (
      <p className="text-sm text-muted-foreground">
        Only students can apply to projects.
      </p>
    );
  } else if (proposals.loading && !proposals.data) {
    body = <Skeleton className="h-12 rounded-full" />;
  } else if (proposals.error) {
    body = <ErrorState error={proposals.error} onRetry={proposals.reload} />;
  } else if (status === 'accepted') {
    body = (
      <div className="space-y-2 rounded-xl bg-success-surface p-4">
        <p className="flex items-center gap-2 font-semibold text-success">
          <PartyPopper className="size-5" aria-hidden />
          You’re on the team
        </p>
        <p className="text-sm text-muted-foreground">
          {project.organization.companyName} picked you for this project.
        </p>
      </div>
    );
  } else if (status) {
    body = (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">You applied</span>
        <ProposalStatusBadge status={status} />
      </div>
    );
  } else if (project.status !== 'open') {
    body = (
      <p className="text-sm text-muted-foreground">
        This project is no longer accepting applications.
      </p>
    );
  } else {
    body = (
      <PillButton asChild className="w-full">
        <Link to={`/projects/${project.id}/apply`}>Apply to this project</Link>
      </PillButton>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border-2 border-line-strong bg-card p-5">
      <h2 className="font-display text-lg font-extrabold">Interested?</h2>
      {body}
    </div>
  );
}
