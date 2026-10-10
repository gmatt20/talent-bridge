import {Badge} from '../ui/badge';
import {cn} from '../../lib/utils';
import type {ProposalStatus} from '../../types/api';

const STATUS: Record<ProposalStatus, {label: string; className: string}> = {
  pending: {label: 'Pending', className: 'bg-accent text-primary'},
  accepted: {label: 'Accepted', className: 'bg-success-surface text-success'},
  rejected: {
    label: 'Not selected',
    className: 'bg-muted text-muted-foreground',
  },
};

/** Props for {@link ProposalStatusBadge}. */
export interface ProposalStatusBadgeProps {
  status: ProposalStatus;
}

/** A small uppercase badge for where an application stands. */
export function ProposalStatusBadge({status}: ProposalStatusBadgeProps) {
  const s = STATUS[status];
  return (
    <Badge
      className={cn(
        'h-6 gap-1.5 px-2.5 font-mono text-xs font-semibold tracking-[0.04em] uppercase before:size-1.5 before:rounded-full before:bg-current',
        s.className,
      )}
    >
      {s.label}
    </Badge>
  );
}
