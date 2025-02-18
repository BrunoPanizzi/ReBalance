import type { Route } from './+types/route'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ClientOnly } from 'remix-utils/client-only'

import { sessionStorage } from '~/services/cookies/session.server'

import { ErrorProvider } from '~/context/ErrorContext'

import { Button } from '~/components/ui/button'

import { action } from './action'
import AuthenticationModal, { SignupTrigger } from './AuthenticationModal'
import { NavBar } from '~/components/Header'

export const meta = () => {
  return [
    { title: 'Stock shop' },
    { name: 'description', content: 'Welcome to Stock shop!' },
  ]
}
export { action }

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  return {
    isAuthenticated: !!session.data.user,
  }
}

const rand = (min: number, max: number) => Math.random() * (max - min) + min

export default function Index({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { isAuthenticated } = loaderData

  const errors = !actionData?.ok ? actionData?.error : []

  const container = {
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const children = {
    hidden: {
      opacity: 0,
      y: '-10%',
      scale: 0.9,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  }

  return (
    <ErrorProvider initialErrors={errors}>
      <AuthenticationModal>
        <div className="relative h-screen bg-opacity-10">
          <ClientOnly>{() => <CoolBg />}</ClientOnly>

          <NavBar isAuthenticated={isAuthenticated} />

          <main className="mx-auto mt-[20vh] max-w-screen-xl text-center font-display">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="mx-auto max-w-[75%]"
            >
              <motion.h2
                variants={children}
                className="mx-auto mb-4 max-w-screen-md text-balance text-[clamp(3rem,6vw,5rem)]/none font-bold text-emerald-50"
              >
                Investir não precisa ser{' '}
                <strong className="text-emerald-300 underline">difícil.</strong>
              </motion.h2>
              <motion.p
                variants={children}
                className="mb-2 text-balance text-lg text-emerald-50 md:text-xl lg:text-2xl"
              >
                Defina suas carteiras e os ativos em que deseja investir que nós
                cuidamos do resto.
              </motion.p>
              <motion.p
                variants={children}
                className="text-balance text-lg text-emerald-50 md:text-xl lg:text-2xl"
              >
                Sem contas e planilhas chatas, sempre respeitando os seus
                objetivos.
              </motion.p>

              <motion.div className="mt-8" variants={children}>
                {isAuthenticated ? (
                  <Button asChild size="lg" className="text-lg font-bold">
                    <Link to="/app">Acessar o app</Link>
                  </Button>
                ) : (
                  <SignupTrigger>
                    <Button
                      className="rounded-lg border-2 border-emerald-400 px-8 py-2 text-2xl hover:scale-105"
                      variant="outline"
                      size="lg"
                      name="mode"
                      value="signup"
                    >
                      Crie sua conta agora!
                    </Button>
                  </SignupTrigger>
                )}
              </motion.div>
            </motion.div>
          </main>
        </div>
      </AuthenticationModal>
    </ErrorProvider>
  )
}

function Circle({ className }: { className: string }) {
  const xPath = new Array(3).fill('').map((_) => rand(0, 100) + '%')
  const yPath = new Array(3).fill('').map((_) => rand(0, 100) + '%')

  return (
    <motion.circle
      initial={{ opacity: 0 }}
      animate={{
        cx: [...xPath, xPath[0]],
        cy: [...yPath, yPath[0]],
        opacity: 0.2,
      }}
      transition={{
        repeat: Infinity,
        ease: 'linear',
        duration: rand(30, 60),
        opacity: {
          delay: 0.4,
          duration: rand(5, 7),
        },
      }}
      r={rand(5, 15) + '%'}
      className={className}
    />
  )
}

function CoolBg() {
  return (
    <>
      <motion.div
        className="absolute inset-0 -z-10 bg-squares"
        initial={{
          maskImage: 'radial-gradient(rgb(255 0 0 / 0.3), transparent 0%',
        }}
        animate={{
          maskImage: 'radial-gradient(rgb(255 0 0 / 0.3), transparent 100%',
        }}
        transition={{ duration: 1 }}
      />

      <div className="absolute inset-0 -z-20 blur-[5rem]">
        <svg width="100%" height="100%">
          <Circle className="fill-yellow-700" />
          <Circle className="fill-lime-700" />
          <Circle className="fill-green-700" />
          <Circle className="fill-emerald-700" />
          <Circle className="fill-teal-700" />
          <Circle className="fill-cyan-700" />
        </svg>
      </div>
    </>
  )
}
