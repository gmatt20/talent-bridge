import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Lightbulb, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import * as api from '@/api'
import { AnalyzingState } from '@/components/project/BriefView'
import { FormError } from '@/components/layout/AuthCard'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { todayIso } from '@/lib/format'

const CATEGORIES = ['Web App', 'Mobile App', 'Marketing', 'Data', 'Design', 'Other']

const PROMPTS = [
  'What’s the problem today, and who does it affect?',
  'How do you handle it right now?',
  'What would success look like in a few months?',
]

// Short descriptions give the AI too little to work with.
const MIN_DESCRIPTION = 60

export default function NewProject() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState<string>()
  const [step, setStep] = useState<'form' | 'creating' | 'analyzing'>('form')

  const descriptionShort = description.trim().length < MIN_DESCRIPTION

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setError('Give your challenge a short title.')
    if (descriptionShort)
      return setError(`Add a little more detail (at least ${MIN_DESCRIPTION} characters) so the AI can help.`)
    setError(undefined)
    setStep('creating')

    let projectId: number
    try {
      const project = await api.projects.create({
        title: title.trim(),
        description: description.trim(),
        deadline: deadline || undefined,
        category: category || undefined,
      })
      projectId = project.id
    } catch (err) {
      setError((err as Error).message)
      setStep('form')
      return
    }

    setStep('analyzing')
    try {
      await api.projects.analyze(projectId)
    } catch {
      // The challenge is saved; the brief can be generated again from the project page.
      toast.error('Your challenge was saved, but we couldn’t generate the brief. You can try again.')
    }
    navigate(`/org/projects/${projectId}`, { replace: true })
  }

  if (step === 'analyzing') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <AnalyzingState />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <Button variant="ghost" asChild className="-ml-3 rounded-full text-muted-foreground">
          <Link to="/org">
            <ArrowLeft aria-hidden /> My projects
          </Link>
        </Button>
        <PageHeader
          eyebrow="New challenge"
          title="Describe your challenge"
          description="Explain it the way you’d tell a friend. No technical terms needed: our AI turns it into a clear project brief."
        />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-xl border bg-card p-5 sm:p-8">
        <FormError message={error} />

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            required
            maxLength={120}
            placeholder="Volunteer scheduling app"
            className="h-10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">What do you need help with?</Label>
          <div className="rounded-lg bg-accent/50 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium text-primary">
              <Lightbulb className="size-4" aria-hidden /> Helpful things to mention
            </p>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-6 text-muted-foreground">
              {PROMPTS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <Textarea
            id="description"
            required
            rows={7}
            aria-describedby="description-count"
            placeholder="We coordinate volunteers by phone, which takes hours every week. We’d love a simple way for volunteers to see open build days and sign up themselves."
            className="min-h-40"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p id="description-count" className="text-sm text-muted-foreground">
            {descriptionShort
              ? `${Math.max(0, MIN_DESCRIPTION - description.trim().length)} more characters for a useful brief`
              : 'Looks good. More detail gives a better brief.'}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deadline">
              Deadline <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="deadline"
              type="date"
              min={todayIso()}
              className="h-10"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="w-full data-[size=default]:h-10">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="ghost" asChild className="rounded-full">
            <Link to="/org">Cancel</Link>
          </Button>
          <Button type="submit" className="h-10 rounded-full px-6" disabled={step === 'creating'}>
            {step === 'creating' && <Loader2 className="animate-spin" aria-hidden />}
            Submit challenge
          </Button>
        </div>
      </form>
    </div>
  )
}
