import {Badge} from '../ui/badge';
import {cn} from '../../lib/utils';
import type {ProjectStatus} from '../../types/api';

const STATUS: Record<ProjectStatus, {label: string; className: string}> = {
  open: {label: 'Open', className: 'bg-success-surface text-success'},
  in_progress: {label: 'In progress', className: 'bg-accent text-primary'},
  completed: {label: 'Completed', className: 'bg-muted text-muted-foreground'},
};

/** Props for {@link ProjectStatusBadge}. */
export interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

/** A small uppercase badge for a project's status. */
export function ProjectStatusBadge({status}: ProjectStatusBadgeProps) {
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
