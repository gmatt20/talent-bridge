import { Link } from 'react-router'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { PillButton } from '@/components/PillButton'
import { Button } from '@/components/ui/button'

// Placeholder until Phase 3 adds AI recommendations here.
export default function StudentDashboard() {
  const { user } = useAuth()
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Student dashboard"
        title={`Welcome, ${user!.name.split(' ')[0]}`}
        description="Projects matched to your skills will show up here."
        actions={
          <Button variant="outline" asChild className="rounded-full">
            <Link to="/onboarding/student">Edit profile</Link>
          </Button>
        }
      />
      <EmptyState
        icon={Sparkles}
        title="Recommendations are coming soon"
        description="In the meantime, browse open projects from local businesses and nonprofits."
        action={
          <PillButton asChild size="sm">
            <Link to="/projects">Browse projects</Link>
          </PillButton>
        }
      />
    </div>
  )
}
