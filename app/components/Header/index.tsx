import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@remix-run/react'
import { ReactNode } from 'react'

export type HeaderProps = {
  backArrow?: boolean
  logo?: boolean
  title: string
  leftSide?: ReactNode
  rightSide?: ReactNode
}

export default function Header({
  backArrow,
  logo,
  title,
  leftSide,
  rightSide,
}: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="mb-8 flex items-center justify-between gap-10 border-0 border-b border-primary-300/10 bg-gray-700 p-3 shadow-xl shadow-primary-950/10 backdrop-blur sm:mx-auto sm:mt-4 sm:w-[min(80rem,calc(100%-2rem))] sm:rounded-xl sm:border sm:p-4">
      <div className="flex items-center justify-center gap-3">
        {backArrow && (
          <button onClick={() => navigate('/app')} title="Voltar">
            <ArrowLeftIcon className="size-6 text-primary-100 sm:size-8" />
          </button>
        )}

        {logo && (
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
        )}
        <h1 className="text-xl font-bold text-primary-200 sm:text-2xl ">
          {title}
        </h1>
        {leftSide}
      </div>

      <div className="flex items-center gap-6">{rightSide}</div>
    </header>
  )
}
