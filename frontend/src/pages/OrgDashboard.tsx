import { Link } from 'react-router'
import { FileText } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { PillButton } from '@/components/PillButton'
import { Button } from '@/components/ui/button'

// Placeholder until Phase 2 lists the organization's projects here.
export default function OrgDashboard() {
  const { user } = useAuth()
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Organization dashboard"
        title={user!.name}
        description="Your submitted challenges and their AI briefs will show up here."
        actions={
          <Button variant="outline" asChild className="rounded-full">
            <Link to="/onboarding/org">Edit profile</Link>
          </Button>
        }
      />
      <EmptyState
        icon={FileText}
        title="No challenges yet"
        description="Describe a problem in plain language and we’ll help shape it into a project students can take on."
        action={
          <PillButton asChild size="sm">
            <Link to="/org/projects/new">Submit a challenge</Link>
          </PillButton>
        }
      />
    </div>
  )
}
