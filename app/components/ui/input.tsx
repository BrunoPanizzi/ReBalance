import * as React from 'react'

import { cn } from 'app/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 rounded-md border border-gray-800 bg-gray-500/25 px-3 py-2 text-sm transition-colors placeholder:text-gray-400 sm:text-base',
          'hover:border-primary-500/25 focus-visible:border-primary-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'data-[error=true]:border-red-400/75 hover:data-[error=true]:border-red-400',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
