import {useState, type FormEvent, type KeyboardEvent} from 'react';
import {Link, Navigate, useNavigate, useSearchParams} from 'react-router';
import {
  Building2,
  Check,
  GraduationCap,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import {homePath, useAuth} from '../auth/AuthContext';
import {AuthCard} from '../components/layout/AuthCard';
import {FormError} from '../components/FormError';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {cn} from '../lib/utils';
import {errorMessage} from '../lib/errors';

// Mentor sign-up is a stretch goal, so only these two roles are offered.
type SignupRole = 'organization' | 'student';

interface RoleOption {
  value: SignupRole;
  icon: LucideIcon;
  title: string;
  body: string;
}

const ROLES: RoleOption[] = [
  {
    value: 'organization',
    icon: Building2,
    title: 'Organization',
    body: 'A business or nonprofit with a challenge to solve.',
  },
  {
    value: 'student',
    icon: GraduationCap,
    title: 'Student',
    body: 'Looking for real projects that build your skills.',
  },
];

const ONBOARDING: Record<SignupRole, string> = {
  organization: '/onboarding/org',
  student: '/onboarding/student',
};

/** Sign-up: pick a role, then name, email and password. */
export function Register() {
  const {user, register} = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = params.get('role');
  const [role, setRole] = useState<SignupRole | null>(
    initial === 'organization' || initial === 'student' ? initial : null,
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  if (user && !pending) return <Navigate to={homePath(user.role)} replace />;

  const tooShort = password.length > 0 && password.length < 8;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!role) {
      return setError('Choose whether you’re an organization or a student.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    setError(undefined);
    setPending(true);
    try {
      await register({
        role,
        name: name.trim(),
        email: email.trim(),
        password_hash: password,
      });
      navigate(ONBOARDING[role], {replace: true});
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  };

  // Arrow keys move between the role cards, like a native radio group.
  const handleRoleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) {
      return;
    }
    e.preventDefault();
    const i = ROLES.findIndex(r => r.value === role);
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const next = ROLES[(Math.max(i, 0) + step + ROLES.length) % ROLES.length]!;
    setRole(next.value);
    document.getElementById(`role-${next.value}`)?.focus();
  };

  return (
    <AuthCard
      className="max-w-lg"
      title="Create your account"
      description="Tell us who you are so we can set things up for you."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormError message={error} />

        <div className="space-y-2">
          <p id="role-label" className="text-sm font-semibold">
            I’m joining as
          </p>
          <div
            role="radiogroup"
            aria-labelledby="role-label"
            onKeyDown={handleRoleKeyDown}
            className="grid gap-3 sm:grid-cols-2"
          >
            {ROLES.map(({value, icon: Icon, title, body}, i) => {
              const checked = role === value;
              return (
                <button
                  key={value}
                  id={`role-${value}`}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked || (!role && i === 0) ? 0 : -1}
                  onClick={() => setRole(value)}
                  className={cn(
                    'relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
                    checked
                      ? 'border-line-strong bg-accent shadow-hard'
                      : 'border-border hover:border-line-strong',
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-accent text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-semibold">{title}</span>
                  <span className="text-sm text-muted-foreground">{body}</span>
                  {checked && (
                    <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">
            {role === 'organization' ? 'Organization name' : 'Full name'}
          </Label>
          <Input
            id="name"
            autoComplete={role === 'organization' ? 'organization' : 'name'}
            required
            className="h-10"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="h-10"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={tooShort || undefined}
            aria-describedby="password-hint"
            className="h-10"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <p
            id="password-hint"
            className={cn(
              'text-sm',
              tooShort ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            At least 8 characters.
          </p>
        </div>

        <Button
          type="submit"
          className="h-10 w-full rounded-full"
          disabled={
            pending || !role || !name.trim() || !email.trim() || !password
          }
        >
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
