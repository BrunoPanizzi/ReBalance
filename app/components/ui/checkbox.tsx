import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'

import { cn } from 'app/lib/utils'

type CheckBoxProps = React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> & {
  size?: 'sm' | 'md' | 'lg'
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckBoxProps
>(({ className, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer shrink-0 rounded border border-gray-400/50 bg-gray-500/25 transition hover:border-primary-500/25 focus:border-primary-500 focus-visible:border-primary-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      {
        'size-4 ': size === 'sm',
        'size-6 ': size === 'md' || !size,
        'size-7 ': size === 'lg',
      },
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center')}
    >
      <CheckIcon className="size-4 text-primary-300" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
