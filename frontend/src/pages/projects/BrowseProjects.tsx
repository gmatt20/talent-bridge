import {useState} from 'react';
import {Compass} from 'lucide-react';
import * as api from '../../api';
import {EmptyState} from '../../components/EmptyState';
import {ErrorState} from '../../components/ErrorState';
import {PageHeader} from '../../components/PageHeader';
import {ProjectCard} from '../../components/project/ProjectCard';
import {Skeleton} from '../../components/ui/skeleton';
import {useApi} from '../../hooks/useApi';
import {cn} from '../../lib/utils';
import type {ProjectSummary} from '../../types/api';

const ALL = 'All';

/** Every open project, filterable by category. Public. */
export function BrowseProjects() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Open projects"
        title="Find a project"
        description="Real challenges from Orange County businesses and nonprofits, each with an AI-structured brief."
      />
      <ProjectList />
    </div>
  );
}

function ProjectList() {
  const projects = useApi(() => api.projects.list(), []);
  const [category, setCategory] = useState(ALL);

  if (projects.loading && !projects.data) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-label="Loading projects"
      >
        {[0, 1, 2].map(i => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (projects.error) {
    return <ErrorState error={projects.error} onRetry={projects.reload} />;
  }
  const items = projects.data!.items;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Compass}
        title="No open projects right now"
        description="Organizations post new challenges often. Check back soon."
      />
    );
  }
  const visible =
    category === ALL ? items : items.filter(p => p.category === category);
  return (
    <div className="space-y-6">
      <CategoryFilter
        projects={items}
        selected={category}
        onSelect={next => setCategory(next)}
      />
      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'project' : 'projects'} shown
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(p => (
          <li key={p.id}>
            <ProjectCard project={p} to={`/projects/${p.id}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface CategoryFilterProps {
  projects: ProjectSummary[];
  selected: string;
  onSelect: (category: string) => void;
}

function CategoryFilter({projects, selected, onSelect}: CategoryFilterProps) {
  const categories = [
    ALL,
    ...new Set(projects.flatMap(p => (p.category ? [p.category] : []))),
  ];
  if (categories.length <= 2) return null;
  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex flex-wrap gap-2"
    >
      {categories.map(c => (
        <button
          key={c}
          type="button"
          aria-pressed={c === selected}
          onClick={() => onSelect(c)}
          className={cn(
            'h-9 rounded-full border-2 px-4 text-sm font-semibold transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
            c === selected
              ? 'border-line-strong bg-primary text-primary-foreground'
              : 'border-border bg-card hover:border-line-strong',
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
