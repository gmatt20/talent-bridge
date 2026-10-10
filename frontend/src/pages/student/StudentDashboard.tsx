import type {ReactNode} from 'react';
import {Link} from 'react-router';
import {FileText, RefreshCw, Sparkles} from 'lucide-react';
import * as api from '../../api';
import {useAuth} from '../../auth/AuthContext';
import {EmptyState} from '../../components/EmptyState';
import {ErrorState} from '../../components/ErrorState';
import {PageHeader} from '../../components/PageHeader';
import {PillButton} from '../../components/PillButton';
import {ProposalStatusBadge} from '../../components/proposals/ProposalStatusBadge';
import {MatchCardSkeleton} from '../../components/recommendations/MatchCardSkeleton';
import {RecommendationCard} from '../../components/recommendations/RecommendationCard';
import {Button} from '../../components/ui/button';
import {Skeleton} from '../../components/ui/skeleton';
import {useApi, type ApiState} from '../../hooks/useApi';
import {formatDate} from '../../lib/format';
import type {Paginated, StudentRecommendation} from '../../types/api';

/** The student's home: AI-recommended projects and their applications. */
export function StudentDashboard() {
  const {user} = useAuth();
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome, ${user!.name.split(' ')[0]}`}
        description="Projects matched to your skills, and where your applications stand."
        actions={
          <Button asChild>
            <Link to="/projects">Browse projects</Link>
          </Button>
        }
      />
      <section aria-labelledby="recommended-heading" className="space-y-5">
        <Recommendations />
      </section>
      <section aria-labelledby="applications-heading" className="space-y-5">
        <h2
          id="applications-heading"
          className="font-display text-xl font-extrabold"
        >
          Your applications
        </h2>
        <Applications />
      </section>
    </div>
  );
}

function Recommendations() {
  const recs = useApi(() => api.students.recommendations(), []);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="recommended-heading"
          className="font-display text-xl font-extrabold"
        >
          Recommended for you
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={recs.reload}
          disabled={recs.loading}
          aria-label="Refresh recommendations"
        >
          <RefreshCw className="size-4" aria-hidden />
          {recs.loading ? 'Loading…' : 'Refresh'}
        </Button>
      </div>
      <RecommendationResults recs={recs} />
    </>
  );
}

interface RecommendationResultsProps {
  recs: ApiState<Paginated<StudentRecommendation>>;
}

function RecommendationResults({recs}: RecommendationResultsProps) {

  if (recs.loading && !recs.data) {
    return (
      <div
        className="space-y-4"
        role="status"
        aria-label="Finding projects for you"
      >
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="size-4 animate-pulse text-primary" aria-hidden />
          Matching projects to your skills…
        </p>
        <ul className="space-y-4">
          {[0, 1, 2].map(i => (
            <li key={i}>
              <MatchCardSkeleton orientation="row" />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (recs.error) {
    return <ErrorState error={recs.error} onRetry={recs.reload} />;
  }
  if (recs.data!.items.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No matches yet"
        description="Add skills to your profile so we can match you with projects, or browse everything that's open."
        action={
          <PillButton asChild size="sm">
            <Link to="/settings">Add skills</Link>
          </PillButton>
        }
      />
    );
  }
  return (
    <ul className="space-y-4">
      {recs.data!.items.map(rec => (
        <li key={rec.project.id}>
          <RecommendationCard recommendation={rec} orientation="row" />
        </li>
      ))}
    </ul>
  );
}

function Applications() {
  const proposals = useApi(() => api.students.myProposals(), []);

  let content: ReactNode;
  if (proposals.loading && !proposals.data) {
    content = (
      <div
        className="space-y-2"
        role="status"
        aria-label="Loading applications"
      >
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    );
  } else if (proposals.error) {
    content = <ErrorState error={proposals.error} onRetry={proposals.reload} />;
  } else if (proposals.data!.items.length === 0) {
    content = (
      <EmptyState
        icon={FileText}
        title="You haven't applied yet"
        description="When you apply to a project, you'll see whether the organization picked you here."
      />
    );
  } else {
    content = (
      <ul className="divide-y rounded-2xl border bg-card">
        {proposals.data!.items.map(proposal => (
          <li
            key={proposal.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          >
            <div className="min-w-0">
              <Link
                to={`/projects/${proposal.project.id}`}
                className="font-semibold underline-offset-4 hover:text-primary hover:underline"
              >
                {proposal.project.title}
              </Link>
              <p className="font-mono text-[13px] text-muted-foreground tabular-nums">
                Applied {formatDate(proposal.createdAt.slice(0, 10))}
              </p>
            </div>
            <ProposalStatusBadge status={proposal.status} />
          </li>
        ))}
      </ul>
    );
  }
  return content;
}
