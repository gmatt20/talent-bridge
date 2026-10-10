import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import * as api from '@/api'
import { useAuth } from '@/auth/AuthContext'
import { AuthCard, FormError } from '@/components/layout/AuthCard'
import { ErrorState } from '@/components/ErrorState'
import { SkillPicker } from '@/components/skills/SkillPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '@/hooks/useApi'
import type { StudentProfile } from '@/types/api'

export default function StudentOnboarding() {
  const { user } = useAuth()
  const profile = useApi(
    () =>
      api.students.get(user!.id).catch((err) => {
        // A brand-new student may not have a profile row yet; start from blank.
        if (err instanceof api.ApiError && err.status === 404) return emptyProfile(user!.id, user!.name)
        throw err
      }),
    [user!.id],
  )

  return (
    <AuthCard
      className="max-w-xl"
      eyebrow="Step 2 of 2"
      title="Set up your student profile"
      description="Your skills and availability drive the projects we recommend to you."
    >
      {profile.loading && !profile.data ? (
        <div className="space-y-4" role="status" aria-label="Loading your profile">
          <Skeleton className="h-10" />
          <Skeleton className="h-24" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : profile.error ? (
        <ErrorState error={profile.error} onRetry={profile.reload} />
      ) : (
        <StudentProfileForm initial={profile.data!} />
      )}
    </AuthCard>
  )
}

const emptyProfile = (id: number, name: string): StudentProfile => ({ id, name, skills: [] })

function StudentProfileForm({ initial }: { initial: StudentProfile }) {
  const navigate = useNavigate()
  const [headline, setHeadline] = useState(initial.headline ?? '')
  const [bio, setBio] = useState(initial.bio ?? '')
  const [availability, setAvailability] = useState(initial.availability ?? '')
  const [skills, setSkills] = useState(initial.skills)
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(undefined)
    setPending(true)
    try {
      await api.students.updateMe({
        headline: headline.trim(),
        bio: bio.trim(),
        availability: availability.trim(),
        skillIds: skills.map((s) => s.id),
      })
      toast.success('Profile saved')
      navigate('/student', { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormError message={error} />
      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          placeholder="CS student at UCI"
          className="h-10"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">About you</Label>
        <Textarea
          id="bio"
          rows={4}
          placeholder="What do you enjoy building? What kind of community impact do you care about?"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="availability">Availability</Label>
        <Input
          id="availability"
          placeholder="10 hrs/week"
          className="h-10"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="skills">Skills</Label>
        <SkillPicker id="skills" value={skills} onChange={setSkills} />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" asChild className="rounded-full">
          <Link to="/student">Skip for now</Link>
        </Button>
        <Button type="submit" className="h-10 rounded-full px-6" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Save profile
        </Button>
      </div>
    </form>
  )
}
