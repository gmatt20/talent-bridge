import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Skill } from '@/types/api'

export function SkillBadge({
  skill,
  onRemove,
  className,
}: {
  skill: Skill
  onRemove?: () => void
  className?: string
}) {
  return (
    <Badge className={cn('h-7 bg-accent px-3 text-sm text-primary', onRemove && 'pr-1', className)}>
      {skill.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${skill.name}`}
          className="ml-0.5 flex size-5 items-center justify-center rounded-full outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      )}
    </Badge>
  )
}
