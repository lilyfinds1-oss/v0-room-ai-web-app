import { Loader2Icon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva('animate-rotate-spin', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-6',
      lg: 'size-8',
      xl: 'size-12',
    },
    color: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      white: 'text-white',
      muted: 'text-text-muted',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
})

interface SpinnerProps extends React.ComponentProps<'svg'>, VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, color, ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size, color }), className)}
      {...props}
    />
  )
}

export { Spinner, spinnerVariants }
