import {useState, type FormEvent} from 'react';
import {Loader2} from 'lucide-react';
import {toast} from 'sonner';
import * as api from '../../api';
import {errorMessage} from '../../lib/errors';
import type {Proposal} from '../../types/api';
import {FormError} from '../FormError';
import {PillButton} from '../PillButton';
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
import {Label} from '../ui/label';
import {Textarea} from '../ui/textarea';

const PROMPTS = [
  'Why this project interests you',
  'Relevant classes, projects or experience',
  'How many hours a week you can give it',
];

/** Props for {@link ApplyDialog}. */
export interface ApplyDialogProps {
  projectId: number;
  projectTitle: string;
  /** Called with the new application once it's submitted. */
  onApplied: (proposal: Proposal) => void;
}

/** The Apply button and the cover-letter dialog it opens. */
export function ApplyDialog({
  projectId,
  projectTitle,
  onApplied,
}: ApplyDialogProps) {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!coverLetter.trim()) {
      setError('Write a short note about why you want to join.');
      return;
    }
    setError(undefined);
    setPending(true);
    try {
      const proposal = await api.proposals.create(
        projectId,
        coverLetter.trim(),
      );
      toast.success('Application sent');
      setOpen(false);
      onApplied(proposal);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={next => setOpen(next)}>
      <DialogTrigger asChild>
        <PillButton className="w-full">Apply to this project</PillButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-extrabold">
              Apply to {projectTitle}
            </DialogTitle>
            <DialogDescription>
              The organization reads this with your profile. A few honest
              sentences are plenty.
            </DialogDescription>
          </DialogHeader>
          <FormError message={error} />
          <div className="grid gap-2">
            <Label htmlFor="cover-letter">Cover letter</Label>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {PROMPTS.map(prompt => (
                <li key={prompt}>{prompt}</li>
              ))}
            </ul>
            <Textarea
              id="cover-letter"
              rows={6}
              className="min-h-36"
              placeholder="I've built similar sign-up flows in class and would love to help your volunteers save time."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden />}
              Send application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
