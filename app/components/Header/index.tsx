import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@remix-run/react'
import { ReactNode } from 'react'

export type HeaderProps = {
  backArrow?: boolean
  logo?: boolean
  title: string
  rightSide?: ReactNode
}

export default function Header({
  backArrow,
  logo,
  title,
  rightSide,
}: HeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="mx-auto mb-8 flex items-center justify-between gap-10 border border-primary-300/10 bg-gray-700 p-3 shadow-xl sm:mt-4 sm:w-[min(80rem,calc(100%-2rem))] sm:rounded-xl sm:p-4">
      <div className="flex items-center justify-center gap-3">
        {backArrow && (
          <button onClick={() => navigate(-1)} title="Voltar">
            <ArrowLeftIcon className="h-8 w-8 text-primary-100" />
          </button>
        )}

        {logo && (
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
        )}
        <h1 className="text-xl font-bold text-primary-200 sm:text-2xl ">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-6">{rightSide}</div>
    </header>
  )
}
