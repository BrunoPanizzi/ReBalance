import { ArrowLeftIcon, HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Link, useNavigate } from '@remix-run/react'
import { ReactNode } from 'react'

import { Button } from '../ui/button'
import {
  Popover,
  PopoverContent,
  PopoverItem,
  PopoverTrigger,
} from '../ui/popover'
import Wrapper from '../Wrapper'

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
    <div className="bg-gray-700/50 py-2 backdrop-blur-sm">
      <Wrapper className="flex items-center justify-between gap-4 ">
        <Link to="/" className="flex items-center gap-4">
          <img
            src="/logo.svg"
            alt="Rebalance logo"
            className="h-8 w-8 sm:h-10 sm:w-10"
          />
          <h1 className="font-display text-lg font-semibold text-emerald-100 sm:text-2xl md:text-3xl">
            ReBalance
          </h1>
        </Link>
        <div className="flex-1" />

        <ul className="hidden items-center gap-6 px-3 text-sm sm:flex sm:text-base">
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
        <div className="hidden self-stretch border-l-[1px] border-gray-500 sm:block" />
        {isAuthenticated ? (
          <Button asChild className="hidden py-1.5 xs:block" variant="default">
            <Link to="/app">Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button
              className="hidden text-sm xs:block sm:text-base"
              size="sm"
              variant="ghost"
              asChild
            >
              <Link to="/?mode=login">Entrar</Link>
            </Button>
            <Button
              asChild
              className="hidden text-sm xs:block sm:text-base"
              size="sm"
            >
              <Link to="/?mode=signup">Criar conta</Link>
            </Button>
          </>
        )}

        <HamburguerMenu isAuthenticated={isAuthenticated} />
      </Wrapper>
    </div>
  )
}

type HamburguerMenuProps = {
  isAuthenticated: boolean
}

function HamburguerMenu({ isAuthenticated }: HamburguerMenuProps) {
  return (
    <Popover>
      <PopoverTrigger className="sm:hidden">
        <Button variant="ghost" className="p-1" size="icon">
          <HamburgerMenuIcon className="size-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-fit min-w-48 flex-col gap-2 ">
        {isAuthenticated ? (
          <PopoverItem
            className="block xs:hidden"
            title="Dashboard"
            to="/app"
            icon={<></>}
            colorful
          />
        ) : (
          <>
            <PopoverItem
              className="block xs:hidden"
              title="Criar conta"
              to="/?mode=signup"
              icon={<></>}
              colorful
            />
            <PopoverItem
              className="block xs:hidden"
              title="Entrar"
              to="/?mode=login"
              icon={<></>}
            />
          </>
        )}

        <hr className="block border-gray-500 xs:hidden" />

        <PopoverItem title="Sobre" to="/sobre" icon={<></>} />
        <PopoverItem title="FAQ" to="/faq" icon={<></>} />
        <PopoverItem title="Blog" to="/blog" icon={<></>} />
      </PopoverContent>
    </Popover>
  )
}
