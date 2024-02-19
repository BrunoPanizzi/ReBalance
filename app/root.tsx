import type { LinksFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from '@remix-run/react'

import stylesheet from '~/tailwind.css'

import NavigationIndicator from './components/NavigationIndicator'
import { Toaster } from './components/ui/toaster'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    href: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap',
    rel: 'stylesheet',
  },
]

export default function App() {
  const matches = useMatches()

  // sets the app color if we are in a wallet page
  const walletId = matches.find((m) => m.id === 'routes/app_.$walletId')

  let color = 'emerald'

  // why is js like this
  if (walletId && walletId.data) {
    const data = walletId.data as any

    if (data.color) color = data.color
  }

  return (
    <html lang="en" data-color={color} className="min-h-screen">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-gray-800 text-gray-100">
        <NavigationIndicator />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <Toaster />
        <div id="modal-root"></div>
      </body>
    </html>
  )
}
