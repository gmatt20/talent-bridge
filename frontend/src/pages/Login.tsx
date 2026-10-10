import {useState, type FormEvent} from 'react';
import {Link, Navigate, useLocation, useNavigate} from 'react-router';
import {Loader2} from 'lucide-react';
import {homePath, useAuth} from '../auth/AuthContext';
import {AuthCard} from '../components/layout/AuthCard';
import {FormError} from '../components/FormError';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {errorMessage} from '../lib/errors';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/** Email and password sign-in, returning to the page that required it. */
export function Login() {
  const {user, login} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // RequireRole sets `from` when it redirects here; any other state is ignored.
  const from = (location.state as {from?: string} | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  if (user && !pending) {
    return <Navigate to={from ?? homePath(user.role)} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    try {
      const u = await login({email: email.trim(), password});
      navigate(from ?? homePath(u.role), {replace: true});
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to pick up where you left off."
      footer={
        <>
          New to Talent Bridge?{' '}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormError message={error} />
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
            autoComplete="current-password"
            required
            className="h-10"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          className="h-10 w-full rounded-full"
          disabled={pending || !email || !password}
        >
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          Log in
        </Button>
      </form>

      {USE_MOCKS && (
        <div className="mt-6 rounded-xl bg-accent p-3 text-sm">
          <p className="eyebrow text-accent-foreground">Demo accounts</p>
          <p className="mt-1 text-muted-foreground">
            Student <code className="text-foreground">ana@uci.edu</code> ·
            Organization{' '}
            <code className="text-foreground">info@habitatoc.org</code> ·
            password <code className="text-foreground">pass1234</code>
          </p>
        </div>
      )}
    </AuthCard>
  );
}
