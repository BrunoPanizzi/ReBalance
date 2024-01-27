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

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
]

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-900 text-gray-100">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <div id="modal-root"></div>
      </body>
    </html>
  )
}
