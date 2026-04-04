import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

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
  return (
    <html lang="bg">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
