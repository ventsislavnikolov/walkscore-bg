import { createFileRoute } from '@tanstack/react-router'

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function buildOgSvg(requestUrl: string) {
  const url = new URL(requestUrl)
  const walkScore = escapeXml(url.searchParams.get('walk') || '0')
  const transitScore = escapeXml(url.searchParams.get('transit') || '0')
  const bikeScore = escapeXml(url.searchParams.get('bike') || '0')
  const address = escapeXml(url.searchParams.get('address') || 'Sofia')

  return `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#fafaf9"/>
  <text x="60" y="80" font-size="28" font-weight="700" fill="#1c1917" font-family="system-ui, sans-serif">
    Walk Score<tspan fill="#059669">.bg</tspan>
  </text>
  <text x="60" y="190" font-size="44" font-weight="700" fill="#1c1917" font-family="system-ui, sans-serif">
    ${address}
  </text>
  <text x="220" y="390" font-size="124" font-weight="700" fill="#059669" font-family="system-ui, sans-serif" text-anchor="middle">
    ${walkScore}
  </text>
  <text x="220" y="438" font-size="20" fill="#57534e" font-family="system-ui, sans-serif" text-anchor="middle">Walk Score</text>
  <text x="540" y="390" font-size="124" font-weight="700" fill="#34d399" font-family="system-ui, sans-serif" text-anchor="middle">
    ${transitScore}
  </text>
  <text x="540" y="438" font-size="20" fill="#57534e" font-family="system-ui, sans-serif" text-anchor="middle">Transit Score</text>
  <text x="860" y="390" font-size="124" font-weight="700" fill="#fbbf24" font-family="system-ui, sans-serif" text-anchor="middle">
    ${bikeScore}
  </text>
  <text x="860" y="438" font-size="20" fill="#57534e" font-family="system-ui, sans-serif" text-anchor="middle">Bike Score</text>
  <text x="60" y="586" font-size="20" fill="#a8a29e" font-family="system-ui, sans-serif">walkscore.bg</text>
</svg>`.trim()
}

export const Route = createFileRoute('/api/og')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return new Response(buildOgSvg(request.url), {
          headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
          },
        })
      },
      HEAD: async () => {
        return new Response(null, {
          headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
          },
        })
      },
    },
  },
})
