import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { Form, Link, useNavigate } from '@remix-run/react'
import { ReactNode } from 'react'

import { Button } from '../ui/button'

export type HeaderProps = {
  backArrow?: boolean
  logo?: boolean
  title: string
  leftSide?: ReactNode
  rightSide?: ReactNode
}

export default function FloatingHeader({
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

export type NavBarProps = {
  isAuthenticated: boolean
}

export function NavBar({ isAuthenticated }: NavBarProps) {
  return (
    <div className="bg-gray-700/50 p-2 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 ">
        <img
          src="/logo.svg"
          alt="Stock shop logo"
          className="h-8 w-8 sm:h-10 sm:w-10"
        />
        <h1 className="flex-1 font-display text-3xl font-semibold text-emerald-100">
          <p className="hidden xs:inline">ReBalance</p>
        </h1>

        <ul className="flex gap-6 px-6">
          <li>
            <Link
              className="transition hover:text-emerald-100 hover:underline"
              to="/sobre"
            >
              Sobre
            </Link>
          </li>
          <li>
            <Link
              className="transition hover:text-emerald-100 hover:underline"
              to="/faq"
            >
              FAQ
            </Link>
          </li>
          <li>
            <Link
              className="transition hover:text-emerald-100 hover:underline"
              to="/blog"
            >
              Blog
            </Link>
          </li>
        </ul>

        {isAuthenticated ? (
          <Button asChild className="py-1.5" variant="default">
            <Link to="/app">Dashboard</Link>
          </Button>
        ) : (
          <>
            <Form replace>
              <Button
                className="text-sm sm:text-base"
                size="sm"
                variant="ghost"
                name="mode"
                value="login"
              >
                Entrar
              </Button>
            </Form>
            <Form replace>
              <Button
                className="text-sm sm:text-base"
                size="sm"
                name="mode"
                value="signup"
              >
                Criar conta
              </Button>
            </Form>
          </>
        )}
      </nav>
    </div>
  )
}
