import type * as React from 'react';
import {ArrowRight} from 'lucide-react';
import {Slot} from 'radix-ui';
import {cn} from '../lib/utils';
import {buttonVariants} from './ui/button';

/** Props for {@link PillButton}. */
export interface PillButtonProps extends React.ComponentProps<'button'> {
  /** Render the child element (usually a router `Link`) instead of a button. */
  asChild?: boolean;
  /** Use the light tones on dark or photographic backgrounds. */
  tone?: 'solid' | 'outline' | 'light' | 'light-outline';
  size?: 'default' | 'sm';
}

const PILL_VARIANT = {
  solid: 'pill',
  outline: 'pill-outline',
  light: 'pill-light',
  'light-outline': 'pill-light-outline',
} as const;

const CHIP_TONE = {
  solid: 'bg-card text-foreground',
  outline: 'bg-primary text-primary-foreground',
  light: 'bg-indigo text-white',
  'light-outline': 'bg-white text-indigo',
};

/** The signature call to action: a pill with a circular arrow chip. */
export function PillButton({
  asChild = false,
  tone = 'solid',
  size = 'default',
  className,
  children,
  ...props
}: PillButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      className={cn(
        buttonVariants({
          variant: PILL_VARIANT[tone],
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
          'flex items-center justify-center rounded-full transition-transform group-hover:translate-x-[3px] motion-reduce:transition-none',
          size === 'sm' ? 'size-7' : 'size-9',
          CHIP_TONE[tone],
        )}
      >
        <ArrowRight className="size-4" />
      </span>
    </Comp>
  );
}
