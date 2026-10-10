import {useState, type FormEvent, type ReactNode} from 'react';
import {Loader2} from 'lucide-react';
import {toast} from 'sonner';
import * as api from '../../api';
import {useAuth} from '../../auth/AuthContext';
import {ErrorState} from '../../components/ErrorState';
import {FormError} from '../../components/FormError';
import {PageHeader} from '../../components/PageHeader';
import {SkillPicker} from '../../components/skills/SkillPicker';
import {Button} from '../../components/ui/button';
import {Input} from '../../components/ui/input';
import {Label} from '../../components/ui/label';
import {Skeleton} from '../../components/ui/skeleton';
import {Textarea} from '../../components/ui/textarea';
import {useApi} from '../../hooks/useApi';
import {errorMessage} from '../../lib/errors';
import type {Organization, Role, StudentProfile} from '../../types/api';

const ROLE_LABEL: Record<Role, string> = {
  organization: 'Organization',
  student: 'Student',
  mentor: 'Mentor',
};

/** The signed-in user's account details and editable profile. */
export function Settings() {
  const {user} = useAuth();
  if (!user) return null;
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Settings"
        title="Profile settings"
        description="Update your profile and review your account details."
      />
      <AccountSection name={user.name} email={user.email} role={user.role} />
      {user.role === 'student' && <StudentSettings key={user.id} userId={user.id} />}
      {user.role === 'organization' && <OrgSettings key={user.id} userId={user.id} />}
      {user.role === 'mentor' && <MentorSettingsNotice />}
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** A titled card that groups one area of settings. */
function SettingsSection({title, description, children}: SettingsSectionProps) {
  return (
    <section className="space-y-5 rounded-2xl border-2 border-line-strong bg-card p-5 sm:p-6">
      <div>
        <h2 className="font-display text-lg font-extrabold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

interface AccountSectionProps {
  name: string;
  email: string;
  role: Role;
}

/** Read-only account identity; name and email aren't editable yet. */
function AccountSection({name, email, role}: AccountSectionProps) {
  return (
    <SettingsSection
      title="Account"
      description="Name and email can’t be changed yet."
    >
      <dl className="grid gap-4 sm:grid-cols-3">
        <ReadOnlyField label="Name" value={name} />
        <ReadOnlyField label="Email" value={email} />
        <ReadOnlyField label="Account type" value={ROLE_LABEL[role]} />
      </dl>
    </SettingsSection>
  );
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

function ReadOnlyField({label, value}: ReadOnlyFieldProps) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm">{value}</dd>
    </div>
  );
}

interface RoleSettingsProps {
  userId: number;
}

/** Loads the student's profile and renders its editable form. */
function StudentSettings({userId}: RoleSettingsProps) {
  const profile = useApi(
    () =>
      api.students.get(userId).catch((err: unknown) => {
        if (err instanceof api.ApiError && err.status === 404) {
          const blank: StudentProfile = {id: userId, name: '', skills: []};
          return blank;
        }
        throw err;
      }),
    [userId],
  );

  if (profile.loading && !profile.data) {
    return <ProfileSkeleton title="Student profile" />;
  }
  if (profile.error) {
    return (
      <SettingsSection title="Student profile">
        <ErrorState error={profile.error} onRetry={profile.reload} />
      </SettingsSection>
    );
  }
  return <StudentProfileForm initial={profile.data!} />;
}

interface StudentProfileFormProps {
  initial: StudentProfile;
}

function StudentProfileForm({initial}: StudentProfileFormProps) {
  const [headline, setHeadline] = useState(initial.headline ?? '');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [availability, setAvailability] = useState(initial.availability ?? '');
  const [skills, setSkills] = useState(initial.skills);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(undefined);
    setPending(true);
    try {
      const saved = await api.students.updateMe({
        headline: headline.trim(),
        bio: bio.trim(),
        availability: availability.trim(),
        skillIds: skills.map(s => s.id),
      });
      setHeadline(saved.headline ?? '');
      setBio(saved.bio ?? '');
      setAvailability(saved.availability ?? '');
      setSkills(saved.skills);
      toast.success('Profile saved');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <SettingsSection
      title="Student profile"
      description="Your skills and availability drive the projects we recommend."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <fieldset disabled={pending} aria-busy={pending} className="space-y-5">
          <FormError message={error} />
          <div className="space-y-2">
            <Label htmlFor="profile-headline">Headline</Label>
            <Input
              id="profile-headline"
              placeholder="CS student at UCI"
              className="h-10"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-bio">About you</Label>
            <Textarea
              id="profile-bio"
              rows={4}
              placeholder="What do you enjoy building? What community impact do you care about?"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-availability">Availability</Label>
            <Input
              id="profile-availability"
              placeholder="10 hrs/week"
              className="h-10"
              value={availability}
              onChange={e => setAvailability(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-skills">Skills</Label>
            <SkillPicker id="profile-skills" value={skills} onChange={setSkills} />
          </div>
          <SaveRow pending={pending} />
        </fieldset>
      </form>
    </SettingsSection>
  );
}

/** Loads the organization's profile and renders its editable form. */
function OrgSettings({userId}: RoleSettingsProps) {
  const org = useApi(() => api.organizations.get(userId), [userId]);

  if (org.loading && !org.data) {
    return <ProfileSkeleton title="Organization profile" />;
  }
  if (org.error) {
    return (
      <SettingsSection title="Organization profile">
        <ErrorState error={org.error} onRetry={org.reload} />
      </SettingsSection>
    );
  }
  return <OrgProfileForm initial={org.data!} />;
}

interface OrgProfileFormProps {
  initial: Organization;
}

function OrgProfileForm({initial}: OrgProfileFormProps) {
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [description, setDescription] = useState(initial.description ?? '');
  const [website, setWebsite] = useState(initial.website ?? '');
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    if (!companyName.trim()) {
      setError('Organization name is required.');
      return;
    }
    setError(undefined);
    setPending(true);
    try {
      const saved = await api.organizations.updateMe({
        companyName: companyName.trim(),
        description: description.trim() || undefined,
        website: normalizeUrl(website),
      });
      setCompanyName(saved.companyName);
      setDescription(saved.description ?? '');
      setWebsite(saved.website ?? '');
      toast.success('Profile saved');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <SettingsSection
      title="Organization profile"
      description="This is what students see when they view your projects."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <fieldset disabled={pending} aria-busy={pending} className="space-y-5">
          <FormError message={error} />
          <div className="space-y-2">
            <Label htmlFor="profile-company-name">Organization name</Label>
            <Input
              id="profile-company-name"
              autoComplete="organization"
              required
              className="h-10"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-description">
              What does your organization do?
            </Label>
            <Textarea
              id="profile-description"
              rows={4}
              placeholder="We build affordable housing across Orange County."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-website">
              Website{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="profile-website"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="habitatoc.org"
              className="h-10"
              value={website}
              onChange={e => setWebsite(e.target.value)}
            />
          </div>
          <SaveRow pending={pending} />
        </fieldset>
      </form>
    </SettingsSection>
  );
}

/** Mentors have no editable profile endpoint yet. */
function MentorSettingsNotice() {
  return (
    <SettingsSection title="Mentor profile">
      <p className="text-sm text-muted-foreground">
        Editing your mentor profile isn’t available yet.
      </p>
    </SettingsSection>
  );
}

interface SaveRowProps {
  pending: boolean;
}

function SaveRow({pending}: SaveRowProps) {
  return (
    <div className="flex justify-end pt-2">
      <Button
        type="submit"
        className="h-10 rounded-full px-6"
        disabled={pending}
      >
        {pending && <Loader2 className="animate-spin" aria-hidden />}
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </div>
  );
}

interface ProfileSkeletonProps {
  title: string;
}

function ProfileSkeleton({title}: ProfileSkeletonProps) {
  return (
    <SettingsSection title={title}>
      <div className="space-y-4" role="status" aria-label="Loading your profile">
        <Skeleton className="h-10" />
        <Skeleton className="h-24" />
        <Skeleton className="h-10" />
      </div>
    </SettingsSection>
  );
}

function normalizeUrl(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
