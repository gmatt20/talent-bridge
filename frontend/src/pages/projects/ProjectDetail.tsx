import {useState, type ReactNode} from 'react';
import {Link, useLocation, useParams} from 'react-router';
import {ArrowLeft, CalendarDays, Compass, Sparkles, Tag} from 'lucide-react';
import * as api from '../../api';
import {useAuth} from '../../auth/AuthContext';
import {EmptyState} from '../../components/EmptyState';
import {ErrorState} from '../../components/ErrorState';
import {BriefView} from '../../components/project/BriefView';
import {ProjectStatusBadge} from '../../components/project/ProjectStatusBadge';
import {ApplyDialog} from '../../components/proposals/ApplyDialog';
import {ProposalStatusBadge} from '../../components/proposals/ProposalStatusBadge';
import {Button} from '../../components/ui/button';
import {Skeleton} from '../../components/ui/skeleton';
import {useApi} from '../../hooks/useApi';
import {formatDate} from '../../lib/format';
import type {Project, ProposalStatus} from '../../types/api';

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
  const deadline = formatDate(project.deadline);
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
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
  const [justApplied, setJustApplied] = useState<ProposalStatus>();
  const existing = proposals.data?.items.find(p => p.project.id === project.id);
  const status = justApplied ?? existing?.status;

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
      <ApplyDialog
        projectId={project.id}
        projectTitle={project.title}
        onApplied={proposal => setJustApplied(proposal.status)}
      />
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border-2 border-line-strong bg-card p-5">
      <h2 className="font-display text-lg font-extrabold">Interested?</h2>
      {body}
    </div>
  );
}
