import {Link, Navigate} from 'react-router';
import {
  ArrowRight, Check, FileText, Handshake, MessageCircle,
  Search, Sparkles, UserRound, Users, type LucideIcon,
} from 'lucide-react';
import {homePath, useAuth} from '../auth/AuthContext';
import {HeroVideo} from '../components/HeroVideo';
import {PillButton} from '../components/PillButton';

interface JourneyStep {
  icon: LucideIcon;
  title: string;
  body: string;
  outcome: string;
  featured?: boolean;
}

const BUSINESS_STEPS: JourneyStep[] = [
  {
    icon: MessageCircle,
    featured: true,
    title: 'Contact us for a partnership',
    body: 'Start with a conversation with our team. Tell us about your organization and how you’d like to work with students before submitting a challenge.',
    outcome: 'Start with a conversation',
  },
  {
    icon: FileText,
    title: 'Describe your challenge',
    body: 'Tell us what your business or nonprofit needs help with. Explain it like you would to a friend.',
    outcome: 'A real community challenge',
  },
  {
    icon: Sparkles,
    title: 'AI shapes the brief',
    body: 'AI turns your idea into clear objectives, deliverables, skills, and milestones so everyone knows where to start.',
    outcome: 'A clear plan to get started',
  },
  {
    icon: Users,
    title: 'Meet matched students',
    body: 'Students discover projects that fit their skills. Every recommendation explains what makes it a good match.',
    outcome: 'Matches with reasons why',
  },
  {
    icon: Handshake,
    title: 'Build it together',
    body: 'Students apply, organizations choose their collaborators, and a team forms around the challenge.',
    outcome: 'Your team, ready to begin',
  },
];

const STUDENT_STEPS: JourneyStep[] = [
  {
    icon: UserRound,
    title: 'Introduce yourself',
    body: 'Create your profile, add your skills, and share your availability so we can help you find a project that fits.',
    outcome: 'A profile that shows your strengths',
  },
  {
    icon: Search,
    title: 'Find your next project',
    body: 'Explore local challenges or discover recommendations matched to your skills, with clear reasons for every match.',
    outcome: 'Real projects, relevant to you',
  },
  {
    icon: FileText,
    title: 'Make your introduction',
    body: 'Apply to a project that interests you. Tell the organization why you’re excited and what you can contribute.',
    outcome: 'An application in your own words',
  },
  {
    icon: Handshake,
    title: 'Join in. Make an impact.',
    body: 'When an organization accepts your application, you join the team and put your skills toward a real community challenge.',
    outcome: 'Hands-on experience with purpose',
  },
];

/** The public home page; signed-in users go straight to their dashboard. */
export function Landing() {
  const {user} = useAuth();
  if (user) return <Navigate to={homePath(user.role)} replace />;

  return (
    <>
      <section className="relative isolate flex min-h-svh items-center overflow-hidden">
        <HeroVideo />
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <p className="eyebrow inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur-sm">
            <Sparkles className="size-3.5" aria-hidden />
            Community-powered, AI-assisted
          </p>
          <h1 className="font-display mt-6 max-w-4xl text-[44px] leading-[0.95] font-black tracking-[-0.01em] text-balance text-white sm:text-[72px]">
            Local challenges, meet local talent.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90 text-pretty">
            Talent Bridge connects Orange County businesses and nonprofits with
            students ready to solve real problems, so good ideas don't stall for
            lack of hands.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PillButton asChild tone="light">
              <a href="#businesses">I'm a business or nonprofit</a>
            </PillButton>
            <PillButton asChild tone="light-outline">
              <a href="#students">I'm a student</a>
            </PillButton>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="how-heading"
        className="border-b-2 border-line-strong bg-card"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <p className="eyebrow text-primary">How it works</p>
              <h2
                id="how-heading"
                className="font-display mt-4 text-3xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl"
              >
                From a local challenge to shared impact.
              </h2>
            </div>
            <p className="max-w-sm leading-relaxed text-muted-foreground">
              You bring the idea. Students bring their skills. We help you find
              each other and take the first step together.
            </p>
          </div>

          <section
            id="businesses"
            aria-labelledby="businesses-heading"
            className="mt-14 scroll-mt-24"
          >
            <div className="mb-6 max-w-2xl">
              <p className="eyebrow text-primary">For businesses & nonprofits</p>
              <h3 id="businesses-heading" className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
                Bring a challenge. Build a partnership.
              </h3>
              <p className="mt-3 text-muted-foreground">
                Connect with our team first. Then turn your organization’s needs
                into a project students can help bring to life.
              </p>
            </div>
            <JourneySteps steps={BUSINESS_STEPS} />
          </section>

          <section
            id="students"
            aria-labelledby="students-heading"
            className="mt-14 scroll-mt-24 border-t pt-14"
          >
            <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow text-primary">For students</p>
                <h3 id="students-heading" className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
                  Your skills can make a difference.
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Find meaningful work in your community, meet collaborators,
                  and learn by building something real.
                </p>
              </div>
              <PillButton asChild size="sm" className="self-start lg:shrink-0">
                <Link to="/register?role=student">
                  Create your student profile <ArrowRight className="size-4" aria-hidden />
                </Link>
              </PillButton>
            </div>
            <JourneySteps steps={STUDENT_STEPS} />
          </section>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative flex flex-col gap-6 overflow-hidden rounded-3xl bg-primary p-8 pb-16 text-primary-foreground sm:p-12 sm:pb-20 md:flex-row md:items-center md:justify-between">
          <BridgeArches />
          <div className="relative max-w-xl">
            <h2 className="font-display text-[28px] leading-[1.05] font-extrabold sm:text-[34px]">
              AI recommends. People decide.
            </h2>
            <p className="mt-2 text-primary-foreground/80">
              Our AI helps with the busywork of writing briefs and finding good
              fits. Every decision about who works on what stays with you.
            </p>
          </div>
          <PillButton
            asChild
            tone="outline"
            className="relative self-start md:self-auto"
          >
            <Link to="/projects">Browse open projects</Link>
          </PillButton>
        </div>
      </section>
    </>
  );
}

interface JourneyStepsProps {
  steps: JourneyStep[];
}

function JourneySteps({steps}: JourneyStepsProps) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {steps.map(({icon: Icon, title, body, outcome, featured}, i) => {
        if (featured) {
          return (
            <li key={title} className="flex flex-col gap-5 rounded-2xl border-2 border-primary bg-accent p-6 sm:col-span-2 sm:flex-row sm:items-start lg:col-span-4 lg:p-8">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="size-7" aria-hidden />
              </span>
              <div className="max-w-3xl">
                <p className="eyebrow text-primary">Step 01 · Start here</p>
                <h4 className="mt-2 font-display text-xl font-extrabold sm:text-2xl">{title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </li>
          );
        }
        return (
          <li key={title} className="relative flex flex-col rounded-2xl border-2 border-line-strong bg-background p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-accent text-accent-foreground">
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="font-mono text-3xl font-medium tracking-tight text-primary/60">
                <span className="sr-only">Step </span>
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span aria-hidden className="absolute top-10 -right-4 z-10 hidden size-7 items-center justify-center rounded-full border-2 border-line-strong bg-card text-primary lg:flex">
                <ArrowRight className="size-4" />
              </span>
            )}
            <h4 className="mt-7 font-display text-xl leading-tight font-extrabold text-balance">{title}</h4>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            <div className="mt-6 flex items-start gap-2 border-t pt-4 text-xs leading-relaxed font-medium">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {outcome}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// The brand motif: half-circle spans cut along the bottom edge, like a viaduct.
function BridgeArches() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-[radial-gradient(circle_at_50%_100%,var(--background)_26px,transparent_27px)] bg-[length:72px_32px] bg-bottom bg-repeat-x"
    />
  );
}
