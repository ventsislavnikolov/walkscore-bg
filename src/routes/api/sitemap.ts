import { createFileRoute } from '@tanstack/react-router'

const NEIGHBORHOODS = [
  'lozenets',
  'mladost-1',
  'mladost-2',
  'mladost-3',
  'mladost-4',
  'lyulin',
  'vitosha',
  'oborishte',
  'sredets',
  'slatina',
  'poduyane',
  'nadejda',
  'krasno-selo',
  'ovcha-kupel',
  'bankya',
  'studentski-grad',
  'manastirski-livadi',
  'boyana',
  'dragalevtsi',
  'geo-milev',
  'iztok',
  'yavorov',
  'reduta',
  'hladilnika',
  'strelbishte',
  'borovo',
  'knyajevo',
  'zapaden-park',
  'hipodruma',
] as const

const BASE_URL = 'https://walkscore.bg'

function createSitemapXml() {
  const pages = [
    '',
    '/map',
    '/compare',
    '/embed',
    '/about',
    '/sofia',
    '/en',
    '/en/map',
    '/en/compare',
    '/en/embed',
    '/en/about',
    '/en/sofia',
  ]

  const neighborhoodPages = NEIGHBORHOODS.flatMap((slug) => [
    `/sofia/${slug}`,
    `/en/sofia/${slug}`,
  ])

  const allPages = [...pages, ...neighborhoodPages]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((path) => `  <url><loc>${BASE_URL}${path}</loc></url>`).join('\n')}
</urlset>`
}

export const Route = createFileRoute('/api/sitemap')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(createSitemapXml(), {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
          },
        })
      },
      HEAD: async () => {
        return new Response(null, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
          },
        })
      },
    },
  },
})
