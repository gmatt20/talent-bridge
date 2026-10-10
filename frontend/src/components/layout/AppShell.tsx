import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import { homePath, useAuth } from '@/auth/AuthContext'
import { PillButton } from '@/components/PillButton'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/api'
import { Logo } from './Logo'

const NAV: Record<Role | 'guest', { to: string; label: string }[]> = {
  guest: [{ to: '/projects', label: 'Browse projects' }],
  organization: [
    { to: '/org', label: 'My projects' },
    { to: '/org/projects/new', label: 'Submit a challenge' },
  ],
  student: [
    { to: '/student', label: 'Recommended' },
    { to: '/projects', label: 'Browse projects' },
  ],
  mentor: [{ to: '/projects', label: 'Browse projects' }],
}

const ROLE_LABEL: Record<Role, string> = {
  organization: 'Organization',
  student: 'Student',
  mentor: 'Mentor',
}

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const links = NAV[user?.role ?? 'guest']

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:text-primary',
      isActive ? 'bg-accent text-primary' : 'text-muted-foreground',
    )

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo />
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end className={navLinkClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 rounded-full pr-2 pl-1">
                    <span
                      aria-hidden
                      className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary"
                    >
                      {initials(user.name)}
                    </span>
                    <span className="max-w-40 truncate">{user.name}</span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="truncate">{user.name}</div>
                    <div className="text-xs font-normal text-muted-foreground">{ROLE_LABEL[user.role]}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate(homePath(user.role))}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="rounded-full">
                  <Link to="/login">Log in</Link>
                </Button>
                <PillButton asChild size="sm">
                  <Link to="/register">Get started</Link>
                </PillButton>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {menuOpen && (
          <nav id="mobile-menu" aria-label="Mobile" className="border-t bg-background px-4 pt-2 pb-4 md:hidden">
            <ul className="flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn('block rounded-lg px-3 py-2.5 font-medium', isActive ? 'bg-accent text-primary' : 'hover:bg-muted')
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t pt-3">
              {user ? (
                <div className="flex items-center justify-between gap-3 px-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{ROLE_LABEL[user.role]}</div>
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={handleLogout}>
                    <LogOut /> Log out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" asChild className="h-10 flex-1 rounded-full">
                    <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
                  </Button>
                  <Button asChild className="h-10 flex-1 rounded-full">
                    <Link to="/register" onClick={() => setMenuOpen(false)}>Get started</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Built for OCC Hacks · Inspired by the Community Innovations Foundation</p>
          {useMocks && <ResetDemoData />}
        </div>
      </footer>

      <Toaster position="top-center" richColors />
    </div>
  )
}

function ResetDemoData() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="self-start rounded underline-offset-4 hover:text-foreground hover:underline"
      onClick={async () => {
        const { resetMockDb } = await import('@/api/mocks/handlers')
        resetMockDb()
        logout()
        navigate('/')
      }}
    >
      Demo mode · Reset demo data
    </button>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}
