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
        <p className="eyebrow inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-accent-foreground">
          <Sparkles className="size-3.5" aria-hidden />
          Community-powered, AI-assisted
        </p>
        <h1 className="font-display mt-6 max-w-4xl text-[44px] leading-[0.95] font-black tracking-[-0.01em] text-balance sm:text-[72px]">
          Local challenges, meet local talent.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
          Talent Bridge connects Orange County businesses and nonprofits with students ready to solve real
          problems, so good ideas don't stall for lack of hands.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PillButton asChild tone="flare">
            <Link to="/register?role=organization">I'm a business or nonprofit</Link>
          </PillButton>
          <PillButton asChild tone="outline">
            <Link to="/register?role=student">I'm a student</Link>
          </PillButton>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="border-y-2 border-line-strong bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="how-heading" className="font-display text-[28px] leading-[1.05] font-extrabold sm:text-[34px]">
            How it works
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="rounded-2xl border-2 border-line-strong bg-background p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="eyebrow text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-primary p-8 pb-16 text-primary-foreground sm:p-12 sm:pb-20 md:flex-row md:items-center md:justify-between">
          <BridgeArches />
          <div className="relative max-w-xl">
            <h2 className="font-display text-[28px] leading-[1.05] font-extrabold sm:text-[34px]">AI recommends. People decide.</h2>
            <p className="mt-2 text-primary-foreground/80">
              Our AI helps with the busywork of writing briefs and finding good fits. Every decision about who
              works on what stays with you.
            </p>
          </div>
          <PillButton asChild tone="outline" className="relative self-start md:self-auto">
            <Link to="/projects">Browse open projects</Link>
          </PillButton>
        </div>
      </section>
    </>
  )
}

// The brand motif: half-circle spans cut along the bottom edge, like a viaduct.
function BridgeArches() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-[radial-gradient(circle_at_50%_100%,var(--background)_26px,transparent_27px)] bg-[length:72px_32px] bg-bottom bg-repeat-x"
    />
  )
}
