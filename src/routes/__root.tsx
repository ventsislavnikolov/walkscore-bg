import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { LocaleProvider, localeFromPath } from '../lib/i18n'
import appCss from '../styles/globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'WalkScore.bg' },
      {
        name: 'description',
        content: 'Walk Score, Transit Score, Bike Score for Sofia, Bulgaria',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const locale = localeFromPath(pathname)
  const [queryClient] = useState(() => new QueryClient())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body
        className="min-h-screen bg-stone-50 text-stone-900 antialiased"
        data-hydrated={hydrated ? 'true' : 'false'}
      >
        <LocaleProvider locale={locale}>
          <QueryClientProvider client={queryClient}>
            <div className="flex min-h-screen flex-col">
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </QueryClientProvider>
        </LocaleProvider>
        <Scripts />
      </body>
    </html>
  )
}
