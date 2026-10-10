import {useState} from 'react';
import {Loader2, Star} from 'lucide-react';
import {formatDate} from '../../lib/format';
import type {Proposal} from '../../types/api';
import {SkillBadge} from '../skills/SkillBadge';
import {Button} from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {ProposalStatusBadge} from './ProposalStatusBadge';

/** Props for {@link ApplicationCard}. */
export interface ApplicationCardProps {
  proposal: Proposal;
  /** Other pending applicants, who are turned down if this one is accepted. */
  otherPendingCount: number;
  /** Shows the Accept button. */
  canAccept: boolean;
  /** Accepts the application; the card shows a spinner until it settles. */
  onAccept: () => Promise<void>;
}

/** One student's application: who they are, their letter, and Accept. */
export function ApplicationCard({
  proposal,
  otherPendingCount,
  canAccept,
  onAccept,
}: ApplicationCardProps) {
  const {student} = proposal;
  return (
    <article className="space-y-4 rounded-2xl border-2 border-line-strong bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg leading-snug font-semibold">{student.name}</h3>
          {student.headline && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {student.headline}
            </p>
          )}
          <p className="mt-1 flex flex-wrap gap-x-4 font-mono text-[13px] text-muted-foreground tabular-nums">
            <span>Applied {formatDate(proposal.createdAt.slice(0, 10))}</span>
            {student.rating != null && (
              <span className="flex items-center gap-1">
                <Star className="size-3.5" aria-hidden />
                {student.rating.toFixed(1)} rating
              </span>
            )}
          </p>
        </div>
        <ProposalStatusBadge status={proposal.status} />
      </div>
      {student.skills && student.skills.length > 0 && (
        <ul
          aria-label={`${student.name}'s skills`}
          className="flex flex-wrap gap-2"
        >
          {student.skills.map(skill => (
            <li key={skill.id}>
              <SkillBadge skill={skill} />
            </li>
          ))}
        </ul>
      )}
      <blockquote className="rounded-xl bg-muted px-4 py-3 text-[15px] whitespace-pre-line">
        {proposal.coverLetter}
      </blockquote>
      {canAccept && (
        <AcceptButton
          studentName={student.name}
          otherPendingCount={otherPendingCount}
          onAccept={onAccept}
        />
      )}
    </article>
  );
}

interface AcceptButtonProps {
  studentName: string;
  otherPendingCount: number;
  onAccept: () => Promise<void>;
}

function AcceptButton({
  studentName,
  otherPendingCount,
  onAccept,
}: AcceptButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onAccept();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  const others =
    otherPendingCount === 1
      ? 'The other applicant will be told they weren’t selected.'
      : `The other ${otherPendingCount} applicants will be told they weren’t selected.`;

  return (
    <Dialog open={open} onOpenChange={next => setOpen(next)}>
      <DialogTrigger asChild>
        <Button>Accept {studentName}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold">
            Accept {studentName}?
          </DialogTitle>
          <DialogDescription>
            {studentName} joins your team and the project moves to In progress.{' '}
            {otherPendingCount > 0 && others} You can’t undo this.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            Accept and form the team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
