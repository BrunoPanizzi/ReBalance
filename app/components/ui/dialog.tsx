import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'

import { cn } from 'app/lib/utils'

const Root = DialogPrimitive.Root

const Trigger = DialogPrimitive.Trigger

const Portal = DialogPrimitive.Portal

const Close = DialogPrimitive.Close

const Overlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-20 grid place-items-center bg-black/60 p-1 backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
))
Overlay.displayName = DialogPrimitive.Overlay.displayName

type ContentProps = {
  renderCloseButton?: boolean
} & React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>

const Content = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ContentProps
>(({ className, children, renderCloseButton = true, ...props }, ref) => (
  <Portal>
    <Overlay>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'relative grid w-full max-w-lg gap-4 border border-gray-600 bg-gray-700 p-6 shadow-lg duration-200 sm:rounded-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-90 data-[state=open]:zoom-in-90 data-[state=close]:slide-out-to-top-[10%] data-[state=open]:slide-in-from-top-[10%]',
          className,
        )}
        {...props}
      >
        {children}
        {renderCloseButton && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-gray-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-800 data-[state=open]:text-gray-400">
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </Overlay>
  </Portal>
))
Content.displayName = DialogPrimitive.Content.displayName

const Header = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
)
Header.displayName = 'DialogHeader'

const Footer = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-wrap-reverse justify-end gap-2', className)}
    {...props}
  />
)
Footer.displayName = 'DialogFooter'

const Title = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  >
    {children}
  </DialogPrimitive.Title>
))
Title.displayName = DialogPrimitive.Title.displayName

const Description = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-gray-300', className)}
    {...props}
  />
))
Description.displayName = DialogPrimitive.Description.displayName

export const Dialog = {
  Root,
  Portal,
  Overlay,
  Close,
  Trigger,
  Content,
  Header,
  Footer,
  Title,
  Description,
}
