import {cn} from 'cn';

/** shadcn/ui `Skeleton`, styled with the Talent Bridge theme. */
function Skeleton({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export {Skeleton};
