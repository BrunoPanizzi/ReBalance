import { Outlet } from '@remix-run/react'
import { BackpackIcon } from '@radix-ui/react-icons'

import Wrapper from '~/components/Wrapper'

export default function Shop() {
  return (
    <>
      <Outlet />
      <Wrapper className="pointer-events-none fixed left-1/2 top-0 block min-h-screen w-full -translate-x-1/2">
        <div className="pointer-events-auto absolute bottom-6 right-3 flex size-12 items-center justify-center rounded-xl border-4 border-primary-800 bg-primary-300 shadow sm:right-0">
          <BackpackIcon className="size-7 stroke-primary-800" />
        </div>
      </Wrapper>
    </>
  )
}
