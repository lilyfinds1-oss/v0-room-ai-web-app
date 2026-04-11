import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-tiny font-semibold transition-all border',
  {
    variants: {
      variant: {
        primary: 'bg-primary/15 text-primary border-primary/30 hover:bg-primary/25',
        secondary: 'bg-secondary/15 text-secondary border-secondary/30 hover:bg-secondary/25',
        success: 'bg-success/15 text-success border-success/30 hover:bg-success/25',
        warning: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/25',
        error: 'bg-error/15 text-error border-error/30 hover:bg-error/25',
        info: 'bg-info/15 text-info border-info/30 hover:bg-info/25',
        outline: 'bg-transparent text-text-primary border-white/10 hover:bg-white/5',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
