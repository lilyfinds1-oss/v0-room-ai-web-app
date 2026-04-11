import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background-dark",
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-dark active:scale-95 shadow-elevation-2 glow-primary',
        secondary: 'bg-secondary text-white hover:bg-secondary-dark active:scale-95 shadow-elevation-2',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10 active:scale-95',
        ghost: 'text-primary hover:bg-primary/10 active:scale-95',
        danger: 'bg-error text-white hover:bg-error/90 active:scale-95 shadow-elevation-2',
        success: 'bg-success text-white hover:bg-success/90 active:scale-95 shadow-elevation-2',
      },
      size: {
        xs: 'h-8 px-3 text-tiny',
        sm: 'h-9 px-4 text-small',
        md: 'h-10 px-6 text-body',
        lg: 'h-12 px-8 text-body',
        xl: 'h-14 px-10 text-body',
        icon: 'size-10',
        'icon-sm': 'size-8',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || isLoading

    return (
      <Comp
        ref={ref}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-rotate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }

