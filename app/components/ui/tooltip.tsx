import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from 'app/lib/utils'

// const TooltipProvider = TooltipPrimitive.Provider

// const Tooltip = TooltipPrimitive.Root

type TooltipRootProps = TooltipPrimitive.TooltipProviderProps &
  TooltipPrimitive.TooltipProps

const Root = ({
  children,
  defaultOpen,
  delayDuration,
  disableHoverableContent,
  onOpenChange,
  open,
  skipDelayDuration,
}: TooltipRootProps) => {
  return (
    <TooltipPrimitive.Provider
      {...{ delayDuration, disableHoverableContent, skipDelayDuration }}
    >
      <TooltipPrimitive.Root
        {...{
          children,
          defaultOpen,
          onOpenChange,
          disableHoverableContent,
          delayDuration,
          open,
        }}
      />
    </TooltipPrimitive.Provider>
  )
}

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ children, className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 max-w-sm overflow-hidden rounded-md border border-primary-300/50 bg-gray-700 px-2 py-1 text-sm text-gray-50 shadow-md',
      'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  >
    {children}
  </TooltipPrimitive.Content>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export const Tooltip = {
  Root,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
}

type EasyTooltipProps = {
  children: React.ReactNode
  label: string | React.ReactNode
  open?: boolean
  color?: string
  delay?: number
  side?: TooltipPrimitive.TooltipContentProps['side']
}

export const EasyTooltip = ({
  children,
  label,
  delay,
  open,
  side, // = 'top',
  color = 'emerald',
}: EasyTooltipProps) => {
  return (
    <Root open={open} delayDuration={delay}>
      <TooltipTrigger data-color={color} asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} data-color={color}>
        {label}
      </TooltipContent>
    </Root>
  )
}
