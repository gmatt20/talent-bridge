import {useState, type ReactNode} from 'react';
import {Link, useParams, useSearchParams} from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  Compass,
  Eye,
  Inbox,
  RefreshCw,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';
import {toast} from 'sonner';
import * as api from '../../api';
import {EmptyState} from '../../components/EmptyState';
import {ErrorState} from '../../components/ErrorState';
import {AnalyzingState} from '../../components/project/AnalyzingState';
import {BriefView} from '../../components/project/BriefView';
import {ProjectStatusBadge} from '../../components/project/ProjectStatusBadge';
import {ApplicationCard} from '../../components/proposals/ApplicationCard';
import {ProposalStatusBadge} from '../../components/proposals/ProposalStatusBadge';
import {MatchCardSkeleton} from '../../components/recommendations/MatchCardSkeleton';
import {PersonMatchCard} from '../../components/recommendations/PersonMatchCard';
import {TeamCard} from '../../components/team/TeamCard';
import {PillButton} from '../../components/PillButton';
import {Button} from '../../components/ui/button';
import {Skeleton} from '../../components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {useApi, type ApiState} from '../../hooks/useApi';
import {formatDate} from '../../lib/format';
import type {Project, Proposal} from '../../types/api';
import {errorMessage} from '../../lib/errors';

/**
 * An organization's view of one of its projects: the brief, recommended
 * students, applications, and the team once a student is accepted.
 */
export function OrgProjectDetail() {
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
    content = <ProjectBody project={project.data!} onChange={project.reload} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <Button
        variant="ghost"
        asChild
        className="-ml-3 rounded-full text-muted-foreground"
      >
        <Link to="/org">
          <ArrowLeft aria-hidden /> My projects
        </Link>
      </Button>

      {content}
    </div>
  );
}

const TABS = ['brief', 'recommended', 'applications'] as const;
type TabId = (typeof TABS)[number];

function isTabId(value: string | null): value is TabId {
  return TABS.some(tab => tab === value);
}

interface ProjectBodyProps {
  project: Project;
  /** Reloads the project after its brief or status changes. */
  onChange: () => void;
}

function ProjectBody({project, onChange}: ProjectBodyProps) {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab: TabId = isTabId(tabParam) ? tabParam : 'brief';
  const deadline = formatDate(project.deadline);
  const proposals = useApi(
    () => api.proposals.listForProject(project.id),
    [project.id],
  );
  const hasTeam = project.status !== 'open';
  const team = useApi(
    () =>
      hasTeam ? api.projects.team(project.id) : Promise.resolve(undefined),
    [project.id, hasTeam],
  );
  const pendingCount =
    proposals.data?.filter(p => p.status === 'pending').length ?? 0;

  const handleTabChange = (next: string) => {
    setParams(next === 'brief' ? {} : {tab: next}, {replace: true});
  };

  const handleAccept = async (proposal: Proposal) => {
    try {
      await api.proposals.accept(proposal.id);
      toast.success(`${proposal.student.name} joined the team`);
      proposals.reload();
      onChange();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <>
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[28px] leading-[1.05] font-extrabold text-balance sm:text-[34px]">
            {project.title}
          </h1>
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
          <Link
            to={`/projects/${project.id}`}
            className="flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
          >
            <Eye className="size-4" aria-hidden /> Public page
          </Link>
        </div>
      </header>

      {hasTeam && team.data && <TeamCard team={team.data} />}

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-5 border-b p-0 sm:gap-6"
        >
          <TabsTrigger value="brief" className={TAB_TRIGGER}>
            Brief
          </TabsTrigger>
          <TabsTrigger value="recommended" className={TAB_TRIGGER}>
            <span className="sm:hidden">Recommended</span>
            <span className="hidden sm:inline">Recommended students</span>
          </TabsTrigger>
          <TabsTrigger value="applications" className={TAB_TRIGGER}>
            Applications
            {pendingCount > 0 && (
              <>
                <span
                  aria-hidden
                  className="rounded-full bg-primary px-2 py-0.5 font-mono text-xs text-primary-foreground tabular-nums"
                >
                  {pendingCount}
                </span>
                <span className="sr-only">, {pendingCount} pending</span>
              </>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="brief" className="mt-8">
          <BriefTab project={project} onChange={onChange} />
        </TabsContent>
        <TabsContent value="recommended" className="mt-8">
          <RecommendedStudents
            project={project}
            proposals={proposals.data ?? []}
          />
        </TabsContent>
        <TabsContent value="applications" className="mt-8">
          <Applications
            project={project}
            proposals={proposals}
            pendingCount={pendingCount}
            onAccept={handleAccept}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}

const TAB_TRIGGER =
  'h-11 flex-none gap-2 px-0 text-[15px] font-semibold text-muted-foreground data-active:text-primary after:bg-primary group-data-horizontal/tabs:after:bottom-[-1px] group-data-horizontal/tabs:after:h-[3px] focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring';

interface BriefTabProps {
  project: Project;
  onChange: () => void;
}

function BriefTab({project, onChange}: BriefTabProps) {
  const [analyzing, setAnalyzing] = useState(false);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      await api.projects.analyze(project.id);
      toast.success(project.brief ? 'Brief regenerated' : 'Brief ready');
      onChange();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  let brief: ReactNode;
  if (analyzing) {
    brief = <AnalyzingState />;
  } else if (project.brief) {
    brief = (
      <BriefView
        brief={project.brief}
        actions={
          <Button variant="outline" onClick={runAnalysis}>
            <RefreshCw aria-hidden /> Regenerate
          </Button>
        }
      />
    );
  } else {
    brief = (
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
    );
  }

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="description-heading"
        className="rounded-2xl border bg-card p-5 sm:p-6"
      >
        <h2 id="description-heading" className="eyebrow text-primary">
          Your description
        </h2>
        <p className="mt-2 whitespace-pre-line text-muted-foreground">
          {project.description}
        </p>
      </section>
      {brief}
    </div>
  );
}

interface RecommendedStudentsProps {
  project: Project;
  proposals: Proposal[];
}

function RecommendedStudents({project, proposals}: RecommendedStudentsProps) {
  if (!project.brief) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Generate the brief first"
        description="Recommendations match students to the skills in your brief. Generate it on the Brief tab."
      />
    );
  }
  return <RecommendationList project={project} proposals={proposals} />;
}

function RecommendationList({project, proposals}: RecommendedStudentsProps) {
  const recs = useApi(
    () => api.projects.recommendations(project.id),
    [project.id],
  );
  const statusByStudent = new Map(proposals.map(p => [p.student.id, p.status]));

  if (recs.loading && !recs.data) {
    return (
      <div className="space-y-4" role="status" aria-label="Finding students">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 animate-pulse text-primary" aria-hidden />
          Matching students to your brief…
        </p>
        <ul className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map(i => (
            <li key={i}>
              <MatchCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (recs.error) {
    return <ErrorState error={recs.error} onRetry={recs.reload} />;
  }
  const {students, mentors} = recs.data!;
  return (
    <div className="space-y-10">
      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No strong matches yet"
          description="No students have the skills this brief asks for yet. New students join every week."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {students.map(rec => {
            const status = statusByStudent.get(rec.student.id);
            return (
              <li key={rec.student.id}>
                <PersonMatchCard
                  name={rec.student.name}
                  headline={rec.student.headline}
                  matchScore={rec.matchScore}
                  reasons={rec.reasons}
                  badge={status && <ProposalStatusBadge status={status} />}
                />
              </li>
            );
          })}
        </ul>
      )}
      {mentors.length > 0 && (
        <section aria-labelledby="mentors-heading" className="space-y-4">
          <h2
            id="mentors-heading"
            className="font-display text-xl font-extrabold"
          >
            Suggested mentors
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {mentors.map(rec => (
              <li key={rec.mentor.id}>
                <PersonMatchCard
                  name={rec.mentor.name}
                  headline={rec.mentor.headline}
                  matchScore={rec.matchScore}
                  reasons={rec.reasons}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

interface ApplicationsProps {
  project: Project;
  proposals: ApiState<Proposal[]>;
  pendingCount: number;
  onAccept: (proposal: Proposal) => Promise<void>;
}

function Applications({
  project,
  proposals,
  pendingCount,
  onAccept,
}: ApplicationsProps) {
  if (proposals.loading && !proposals.data) {
    return (
      <div
        className="space-y-4"
        role="status"
        aria-label="Loading applications"
      >
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }
  if (proposals.error) {
    return <ErrorState error={proposals.error} onRetry={proposals.reload} />;
  }
  if (proposals.data!.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No applications yet"
        description="Students who apply from your project's public page show up here."
        action={
          <PillButton asChild size="sm" tone="outline">
            <Link to={`/projects/${project.id}`}>View public page</Link>
          </PillButton>
        }
      />
    );
  }
  return (
    <ul className="space-y-4">
      {proposals.data!.map(proposal => (
        <li key={proposal.id}>
          <ApplicationCard
            proposal={proposal}
            otherPendingCount={Math.max(pendingCount - 1, 0)}
            canAccept={
              project.status === 'open' && proposal.status === 'pending'
            }
            onAccept={() => onAccept(proposal)}
          />
        </li>
      ))}
    </ul>
  );
}
