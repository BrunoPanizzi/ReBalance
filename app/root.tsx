import type { LinksFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

import stylesheet from '~/tailwind.css'

import { ColorsProvider } from './context/ColorsContext'

import NavigationIndicator from './components/NavigationIndicator'

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
  return (
    <html lang="en" className="min-h-screen">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-gray-800 text-gray-100">
        <ColorsProvider>
          <NavigationIndicator />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
          <div id="modal-root"></div>
        </ColorsProvider>
      </body>
    </html>
  )
}
