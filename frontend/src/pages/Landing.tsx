import { Link, Navigate } from 'react-router'
import { FileText, Handshake, Sparkles, Users } from 'lucide-react'
import { homePath, useAuth } from '@/auth/AuthContext'
import { PillButton } from '@/components/PillButton'

const STEPS = [
  {
    icon: FileText,
    title: 'Describe your challenge',
    body: 'Businesses and nonprofits explain what they need in plain language. No technical jargon required.',
  },
  {
    icon: Sparkles,
    title: 'AI shapes the brief',
    body: 'We turn your description into clear objectives, deliverables, skills and milestones you can edit.',
  },
  {
    icon: Users,
    title: 'Meet matched students',
    body: 'Students see projects that fit their skills and goals, and every match comes with the reasons why.',
  },
  {
    icon: Handshake,
    title: 'Build it together',
    body: 'You choose who joins. The team forms and gets to work on a real community project.',
  },
]

export default function Landing() {
  const { user } = useAuth()
  if (user) return <Navigate to={homePath(user.role)} replace />

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24">
        <p className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-primary">
          <Sparkles className="size-4" aria-hidden />
          Community-powered, AI-assisted
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Local challenges, meet local talent.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
          Talent Bridge connects Orange County businesses and nonprofits with students ready to solve real
          problems, so good ideas don't stall for lack of hands.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PillButton asChild>
            <Link to="/register?role=organization">I'm a business or nonprofit</Link>
          </PillButton>
          <PillButton asChild tone="outline">
            <Link to="/register?role=student">I'm a student</Link>
          </PillButton>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="how-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="rounded-2xl border bg-background p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-accent text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-6 rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">AI recommends. People decide.</h2>
            <p className="mt-2 text-primary-foreground/80">
              Our AI helps with the busywork of writing briefs and finding good fits. Every decision about who
              works on what stays with you.
            </p>
          </div>
          <PillButton asChild tone="outline" className="self-start border-transparent md:self-auto">
            <Link to="/projects">Browse open projects</Link>
          </PillButton>
        </div>
      </section>
    </>
  )
}
