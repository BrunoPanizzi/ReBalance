import { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { sessionStorage } from '~/services/cookies/session.server'

import { NavBar } from '~/components/Header'
import Wrapper from '~/components/Wrapper'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userSession = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  )
  return {
    isAuthenticated: !!userSession.data.user,
  }
}

export default function Blog() {
  const { isAuthenticated } = useLoaderData<typeof loader>()

  return (
    <div>
      <NavBar isAuthenticated={isAuthenticated} />
      <Wrapper className="relative mt-10 md:grid-cols-[2fr_1fr]">
        <MainArticles />

        <div className="sticky top-10 flex h-fit flex-col gap-6">
          <SuggestedArticles />
          <NewsletterForm />
        </div>
      </Wrapper>
      <footer className="mt-6 bg-emerald-900 p-16">
        <Wrapper>this is the footer</Wrapper>
      </footer>
    </div>
  )
}

function MainArticles() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[...Array(10)].map((_, i) => (
        <Article />
      ))}
    </div>
  )
}

function Article() {
  return (
    <div className="rounded-2xl first:col-span-2 first:row-span-2">
      <img
        src="https://unsplash.it/800/600?random"
        alt="Article cover"
        className="w-full rounded-lg"
      />
      <h2>HLKJFLKJDFKLJD</h2>
    </div>
  )
}

function SuggestedArticles() {
  return (
    <div className="rounded-md bg-gray-700/50 p-2">
      <h3 className="px-3 font-display text-2xl font-bold text-emerald-100">
        Artigos sugeridos
      </h3>
      <ul className="text-lg">
        <Link to="artigo1">
          <li className="my-2 rounded px-3 py-2 transition hover:bg-gray-700">
            Article 1
          </li>
        </Link>
        <hr className="border-gray-500" />
        <Link to="artigo2">
          <li className="my-2 rounded px-3 py-2 transition hover:bg-gray-700">
            Article 2
          </li>
        </Link>
        <hr className="border-gray-500" />
        <Link to="artigo3">
          <li className="my-2 rounded px-3 py-2 transition hover:bg-gray-700">
            Article 3
          </li>
        </Link>
        <hr className="border-gray-500" />
        <Link to="artigo4">
          <li className="my-2 rounded px-3 py-2 transition last:mb-0 hover:bg-gray-700">
            Article 4
          </li>
        </Link>
      </ul>
    </div>
  )
}

function NewsletterForm() {
  return (
    <div>
      <h3 className="font-display text-2xl font-bold text-emerald-100">
        Se inscreva para receber notícias
      </h3>
      <p className="text-gray-300">
        Seja o primeiro a receber atualizações e ficar por dentro do que está
        acontecendo.
      </p>
      <form className="mt-4 flex gap-2">
        <Input
          className="w-full"
          placeholder="seuemail@exemplo.com"
          type="email"
        />
        <Button className="">Inscrever</Button>
      </form>
    </div>
  )
}
