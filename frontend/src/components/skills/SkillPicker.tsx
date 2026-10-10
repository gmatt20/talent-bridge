import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Loader2, Search } from 'lucide-react'
import * as api from '@/api'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Skill } from '@/types/api'
import { SkillBadge } from './SkillBadge'

// Debounced skill search with chosen skills shown as removable badges.
export function SkillPicker({
  id,
  value,
  onChange,
}: {
  id?: string
  value: Skill[]
  onChange: (skills: Skill[]) => void
}) {
  const fallbackId = useId()
  const inputId = id ?? fallbackId
  const listId = `${inputId}-list`
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const latest = useRef(0)

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const call = ++latest.current
    const timer = setTimeout(() => {
      api.skills
        .search(q)
        .then((skills) => call === latest.current && setResults(skills))
        .catch(() => call === latest.current && setResults([]))
        .finally(() => call === latest.current && setLoading(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const chosen = new Set(value.map((s) => s.id))
  const options = results.filter((s) => !chosen.has(s.id))
  const showList = open && query.trim() !== ''

  const add = (skill: Skill) => {
    onChange([...value, skill])
    setQuery('')
    setActive(0)
  }

  const remove = (id: number) => onChange(value.filter((s) => s.id !== id))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && options.length) {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp' && options.length) {
      e.preventDefault()
      setActive((i) => (i - 1 + options.length) % options.length)
    } else if (e.key === 'Enter') {
      // Never submit the surrounding form from the search box.
      e.preventDefault()
      const pick = options[active]
      if (showList && pick) add(pick)
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Backspace' && query === '' && value.length) {
      remove(value[value.length - 1]!.id)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          id={inputId}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && options[active] ? `${listId}-${options[active].id}` : undefined}
          autoComplete="off"
          placeholder="Search skills, e.g. React, Figma, Python"
          className="h-10 pl-9"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
        )}

        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-popover p-1 shadow-md"
          >
            {options.map((s, i) => (
              <li
                key={s.id}
                id={`${listId}-${s.id}`}
                role="option"
                aria-selected={i === active}
                // mousedown fires before the input's blur closes the list
                onMouseDown={(e) => {
                  e.preventDefault()
                  add(s)
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'cursor-pointer rounded-md px-3 py-2 text-sm',
                  i === active && 'bg-accent text-primary',
                )}
              >
                {s.name}
              </li>
            ))}
            {!loading && options.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No matching skills</li>
            )}
          </ul>
        )}
      </div>

      {value.length > 0 ? (
        <ul aria-label="Selected skills" className="flex flex-wrap gap-2">
          {value.map((s) => (
            <li key={s.id}>
              <SkillBadge skill={s} onRemove={() => remove(s.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No skills added yet.</p>
      )}
    </div>
  )
}
