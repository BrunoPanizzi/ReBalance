import { ReactNode } from 'react'

export default function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto px-3 sm:w-[min(80rem,calc(100%-2rem))] sm:p-0">
      {children}
    </div>
  )
}
