import {useState, type FormEvent, type ReactNode} from 'react';
import {Link, useNavigate, useParams} from 'react-router';
import {ArrowLeft, CheckCircle2, Compass, Loader2, Send} from 'lucide-react';
import {toast} from 'sonner';
import * as api from '../../api';
import {useAuth} from '../../auth/AuthContext';
import {EmptyState} from '../../components/EmptyState';
import {ErrorState} from '../../components/ErrorState';
import {FormError} from '../../components/FormError';
import {ProjectOverview} from '../../components/project/ProjectOverview';
import {ProposalStatusBadge} from '../../components/proposals/ProposalStatusBadge';
import {Button} from '../../components/ui/button';
import {Label} from '../../components/ui/label';
import {Skeleton} from '../../components/ui/skeleton';
import {Textarea} from '../../components/ui/textarea';
import {useApi} from '../../hooks/useApi';
import {errorMessage} from '../../lib/errors';
import type {Project, Proposal} from '../../types/api';

const PROMPTS = [
  'What interests you about this challenge?',
  'What classes, projects, or experience could you draw on?',
  'How much time can you contribute each week?',
];

/** A student application workspace with the project and form side by side. */
export function ApplyProject() {
  const id = Number(useParams().id);
  const project = useApi(() => api.projects.get(id), [id]);

  let content: ReactNode;
  if (project.loading && !project.data) {
    content = (
      <div className="grid gap-8 lg:grid-cols-2" role="status" aria-label="Loading project">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  } else if (project.error instanceof api.ApiError && project.error.status === 404) {
    content = (
      <EmptyState
        icon={Compass}
        title="We couldn’t find that project"
        description="It may have been removed, or the link is wrong."
        action={<Button asChild><Link to="/projects">Browse projects</Link></Button>}
      />
    );
  } else if (project.error) {
    content = <ErrorState error={project.error} onRetry={project.reload} />;
  } else {
    content = (
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <ProjectOverview project={project.data!} />
        <section
          aria-labelledby="application-heading"
          className="min-w-0 rounded-2xl border-2 border-line-strong bg-card lg:sticky lg:top-24"
        >
          <div className="border-b p-6 sm:p-8">
            <p className="eyebrow text-primary">Your application</p>
            <h2 id="application-heading" className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
              Make your introduction.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Tell the organization what you’d bring to the project. They’ll
              read your application alongside your profile.
            </p>
          </div>
          <ApplicationPanel key={id} project={project.data!} />
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <Button variant="ghost" asChild className="-ml-3 text-muted-foreground">
        <Link to={`/projects/${id}`}><ArrowLeft aria-hidden /> Back to project</Link>
      </Button>
      {content}
    </div>
  );
}

interface ApplicationPanelProps {
  project: Project;
}

function ApplicationPanel({project}: ApplicationPanelProps) {
  const {user} = useAuth();
  const proposals = useApi(() => api.students.myProposals(), [user?.id]);
  const [submitted, setSubmitted] = useState<Proposal>();
  const existing = submitted ?? proposals.data?.items.find(
    proposal => proposal.project.id === project.id,
  );

  if (proposals.loading && !proposals.data) {
    return (
      <div className="space-y-4 p-6 sm:p-8" role="status" aria-label="Checking application status">
        <Skeleton className="h-12" />
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (proposals.error && !submitted) {
    return <div className="p-6"><ErrorState error={proposals.error} onRetry={proposals.reload} /></div>;
  }
  if (existing) {
    return (
      <div className="space-y-5 p-6 sm:p-8" role="status">
        <CheckCircle2 className="size-10 text-primary" aria-hidden />
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold">{submitted ? 'Application sent' : 'You’ve already applied'}</h3>
          <ProposalStatusBadge status={existing.status} />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Follow your application’s status from your student dashboard.
        </p>
        <Button asChild className="rounded-full">
          <Link to="/student">View my applications</Link>
        </Button>
      </div>
    );
  }
  if (project.status !== 'open') {
    return (
      <p className="p-6 text-sm text-muted-foreground sm:p-8">
        This project is no longer accepting applications.
      </p>
    );
  }
  return <ApplicationForm project={project} onApplied={setSubmitted} />;
}

interface ApplicationFormProps {
  project: Project;
  onApplied: (proposal: Proposal) => void;
}

function ApplicationForm({project, onApplied}: ApplicationFormProps) {
  const {user} = useAuth();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    if (!coverLetter.trim()) {
      setError('Write a short note about why you want to join.');
      return;
    }
    setError(undefined);
    setPending(true);
    try {
      const proposal = await api.proposals.create(project.id, coverLetter.trim());
      toast.success('Application sent');
      onApplied(proposal);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={pending} aria-busy={pending} className="min-w-0">
        <div className="space-y-6 p-6 sm:p-8">
          <p className="text-sm text-muted-foreground">
            Applying as <span className="font-semibold text-foreground">{user?.name}</span>
          </p>
          <div className="rounded-xl bg-accent/50 p-4">
            <h3 className="text-sm font-semibold">A few honest sentences are plenty.</h3>
            <ul id="application-prompts" className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              {PROMPTS.map(prompt => <li key={prompt}>{prompt}</li>)}
            </ul>
          </div>
          <div className="space-y-3">
            <Label htmlFor="application-letter">Cover letter</Label>
            <Textarea
              id="application-letter"
              rows={12}
              required
              className="min-h-72 resize-y text-base leading-relaxed"
              aria-describedby={error ? 'application-prompts application-error' : 'application-prompts'}
              placeholder="I’m interested in this project because…"
              value={coverLetter}
              onChange={event => setCoverLetter(event.target.value)}
            />
            <div id="application-error"><FormError message={error} /></div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Button type="button" variant="ghost" onClick={() => navigate(`/projects/${project.id}`)}>
            Cancel
          </Button>
          <Button type="submit" className="h-11 rounded-full px-6" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
            {pending ? 'Sending…' : 'Send application'}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
