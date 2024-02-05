import { cva } from 'class-variance-authority'
import { ReactNode } from 'react'

import { cn } from '~/lib/utils'

export type WrapperProps = {
  children: ReactNode
  cols?: 1 | 2 // for now only 1 or 2 columns are needed
}

const wrapperVariants = cva(
  'mx-auto px-3 grid gap-4 sm:w-[min(80rem,calc(100%-2rem))] sm:p-0',
  {
    variants: {
      cols: {
        1: '',
        2: 'md:grid-cols-2',
      },
    },
    defaultVariants: {
      cols: 1,
    },
  },
)

export default function Wrapper({ children, cols }: WrapperProps) {
  return <div className={cn(wrapperVariants({ cols }))}>{children}</div>
}
