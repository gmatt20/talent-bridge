import type * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

type PillButtonProps = React.ComponentProps<'button'> & {
  asChild?: boolean
  tone?: 'solid' | 'outline'
  size?: 'default' | 'sm'
}

// CIF-style call to action: rounded pill with a circular arrow chip on the right.
export function PillButton({
  asChild = false,
  tone = 'solid',
  size = 'default',
  className,
  children,
  ...props
}: PillButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      className={cn(
        buttonVariants({
          variant: tone === 'solid' ? 'pill' : 'pill-outline',
          size: size === 'sm' ? 'pill-sm' : 'pill',
        }),
        'group',
        className,
      )}
      {...props}
    >
      <Slot.Slottable>{children}</Slot.Slottable>
      <span
        aria-hidden
        className={cn(
          'flex items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5',
          size === 'sm' ? 'size-7' : 'size-8',
          tone === 'solid' ? 'bg-card text-primary' : 'bg-primary text-primary-foreground',
        )}
      >
        <ArrowRight className="size-4" />
      </span>
    </Comp>
  )
}
