import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Link } from '@remix-run/react'

import { cn } from '~/lib/utils'

import { Button } from './button'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 mx-3 w-72 rounded-lg border border-gray-600 bg-gray-700 p-1 text-gray-50 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }

type PopoverItemProps = {
  title: string
  icon: React.ReactNode
  className?: string
  colorful?: boolean
} & (
  | {
      onClick: () => void
    }
  | {
      to: string
    }
)

export function PopoverItem({
  icon,
  title,
  className,
  colorful,
  ...rest
}: PopoverItemProps) {
  const styles = cn(
    'justify-start gap-2 rounded-md px-2 py-1 transition',
    className,
  )

  if (rest.hasOwnProperty('onClick')) {
    const { onClick } = rest as { onClick: () => void }
    return (
      <Button
        variant={colorful ? 'default' : 'colorful-ghost'}
        className={styles}
        onClick={onClick}
      >
        {icon}
        <span>{title}</span>
      </Button>
    )
  } else if (rest.hasOwnProperty('to')) {
    const { to } = rest as { to: string }
    return (
      <Button
        variant={colorful ? 'default' : 'colorful-ghost'}
        className={styles}
        asChild
      >
        <Link to={to}>
          {icon}
          <span>{title}</span>
        </Link>
      </Button>
    )
  }
}
