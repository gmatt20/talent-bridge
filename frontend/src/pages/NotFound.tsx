import {Link} from 'react-router';
import {Compass} from 'lucide-react';
import {EmptyState} from '../components/EmptyState';
import {PillButton} from '../components/PillButton';

/** Shown for any URL that doesn't match a route. */
export function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <EmptyState
        icon={Compass}
        title="We couldn't find that page"
        description="It may have moved, or it's still being built."
        action={
          <PillButton asChild size="sm">
            <Link to="/">Back to home</Link>
          </PillButton>
        }
      />
    </div>
  );
}
