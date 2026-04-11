import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-md border border-white/10 bg-surface/50 px-4 py-2 text-text-primary placeholder:text-text-muted transition-all duration-300 backdrop-blur-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background-dark focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'aria-invalid:border-error aria-invalid:ring-error/20',
        className,
      )}
      {...props}
    />
  )
}

export { Input }

