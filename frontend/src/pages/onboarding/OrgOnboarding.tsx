import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import * as api from '@/api'
import { useAuth } from '@/auth/AuthContext'
import { AuthCard, FormError } from '@/components/layout/AuthCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function OrgOnboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState(user!.name)
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!companyName.trim()) return setError('Organization name is required.')
    setError(undefined)
    setPending(true)
    try {
      await api.organizations.updateMe({
        companyName: companyName.trim(),
        description: description.trim() || undefined,
        website: normalizeUrl(website),
      })
      toast.success('Profile saved')
      navigate('/org', { replace: true })
    } catch (err) {
      // PUT /api/organizations/me is a proposed endpoint the backend may not have yet.
      if (err instanceof api.ApiError && (err.status === 404 || err.status === 405)) {
        toast.info('Profile saving isn’t available yet. Your account is ready to use.')
        navigate('/org', { replace: true })
        return
      }
      setError((err as Error).message)
      setPending(false)
    }
  }

  return (
    <AuthCard
      className="max-w-xl"
      eyebrow="Step 2 of 2"
      title="Tell students about your organization"
      description="A short introduction helps students understand who they’d be working with."
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <FormError message={error} />
        <div className="space-y-2">
          <Label htmlFor="companyName">Organization name</Label>
          <Input
            id="companyName"
            autoComplete="organization"
            required
            className="h-10"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">What does your organization do?</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="We build affordable housing across Orange County."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">
            Website <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="website"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="habitatoc.org"
            className="h-10"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" asChild className="rounded-full">
            <Link to="/org">Skip for now</Link>
          </Button>
          <Button type="submit" className="h-10 rounded-full px-6" disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            Save profile
          </Button>
        </div>
      </form>
    </AuthCard>
  )
}

function normalizeUrl(raw: string): string | undefined {
  const v = raw.trim()
  if (!v) return undefined
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}
