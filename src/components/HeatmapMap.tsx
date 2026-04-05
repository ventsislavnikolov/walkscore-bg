import { useEffect, useRef } from 'react'

import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Protocol } from 'pmtiles'

import type { ScoreType } from '../lib/types'

interface HeatmapMapProps {
  center?: [number, number]
  zoom?: number
  scoreType?: ScoreType
  markerPosition?: [number, number]
  onCellClick?: (scores: { walk: number; transit: number; bike: number }) => void
  className?: string
}

const SCORE_PROPERTY: Record<ScoreType, string> = {
  walk: 'walk_score',
  transit: 'transit_score',
  bike: 'bike_score',
}

const SCORE_COLORS = [
  'interpolate',
  ['linear'],
  ['get', 'walk_score'],
  0,
  '#dc2626',
  25,
  '#f97316',
  50,
  '#fbbf24',
  70,
  '#34d399',
  90,
  '#059669',
] as unknown[]

function colorExpression(scoreType: ScoreType) {
  return [
    'interpolate',
    ['linear'],
    ['get', SCORE_PROPERTY[scoreType]],
    0,
    '#dc2626',
    25,
    '#f97316',
    50,
    '#fbbf24',
    70,
    '#34d399',
    90,
    '#059669',
  ]
}

export function HeatmapMap({
  center = [23.3219, 42.6977],
  zoom = 12,
  scoreType = 'walk',
  markerPosition,
  onCellClick,
  className = 'h-full w-full',
}: HeatmapMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const protocolRef = useRef<Protocol | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const protocol = new Protocol()
    protocolRef.current = protocol
    maplibregl.addProtocol('pmtiles', protocol.tile)

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
          },
          scores: {
            type: 'vector',
            url: 'pmtiles:///tiles/sofia.pmtiles',
          },
        },
        layers: [{ id: 'basemap', type: 'raster', source: 'carto' }],
      },
      center,
      zoom,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', () => {
      map.addLayer({
        id: 'score-fill',
        type: 'fill',
        source: 'scores',
        'source-layer': 'sofia_scores',
        paint: {
          'fill-color': SCORE_COLORS,
          'fill-opacity': 0.58,
        },
      })

      map.addLayer({
        id: 'score-border',
        type: 'line',
        source: 'scores',
        'source-layer': 'sofia_scores',
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.35,
          'line-opacity': 0.8,
        },
      })

      map.on('click', 'score-fill', (event) => {
        if (!event.features?.length || !onCellClick) return

        const props = event.features[0].properties as Record<string, string | number | undefined>
        onCellClick({
          walk: Number(props.walk_score ?? 0),
          transit: Number(props.transit_score ?? 0),
          bike: Number(props.bike_score ?? 0),
        })
      })

      map.on('mouseenter', 'score-fill', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', 'score-fill', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    mapRef.current = map

    return () => {
      markerRef.current?.remove()
      map.remove()
      maplibregl.removeProtocol('pmtiles')
      mapRef.current = null
      protocolRef.current = null
    }
  }, [center, zoom, onCellClick])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const applyPaint = () => {
      if (!map.getLayer('score-fill')) return
      map.setPaintProperty('score-fill', 'fill-color', colorExpression(scoreType))
    }

    if (map.isStyleLoaded()) {
      applyPaint()
      return
    }

    map.once('load', applyPaint)
    return () => {
      map.off('load', applyPaint)
    }
  }, [scoreType])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markerRef.current?.remove()
    markerRef.current = null

    if (!markerPosition) return

    markerRef.current = new maplibregl.Marker({ color: '#059669' })
      .setLngLat(markerPosition)
      .addTo(map)

    map.flyTo({ center: markerPosition, zoom: Math.max(map.getZoom(), 15), duration: 900 })
  }, [markerPosition])

  return <div ref={containerRef} className={className} data-testid="heatmap-map" />
}
