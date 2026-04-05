import { getScoreLabel } from '../lib/labels'
import { useLocale } from '../lib/i18n'
import { scoreColor } from '../lib/colors'
import type { ScoreType } from '../lib/types'

interface ScoreGaugeProps {
  score: number
  type: ScoreType
  size?: 'lg' | 'md' | 'sm'
}

const SIZE_MAP = {
  lg: 140,
  md: 104,
  sm: 76,
} as const

const TYPE_LABELS: Record<ScoreType, { bg: string; en: string }> = {
  walk: { bg: 'Walk Score', en: 'Walk Score' },
  transit: { bg: 'Transit Score', en: 'Transit Score' },
  bike: { bg: 'Bike Score', en: 'Bike Score' },
}

export function ScoreGauge({ score, type, size = 'lg' }: ScoreGaugeProps) {
  const locale = useLocale()
  const label = getScoreLabel(score, type, locale)
  const color = scoreColor(score)
  const roundedScore = Math.round(score)

  const dimension = SIZE_MAP[size]
  const strokeWidth = size === 'lg' ? 10 : size === 'md' ? 8 : 6
  const radius = (dimension - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.75
  const dashOffset = arcLength - (arcLength * roundedScore) / 100

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative rounded-full bg-white/80 shadow-[0_18px_50px_-30px_rgba(68,64,60,0.45)] ring-1 ring-stone-200/70"
        style={{ width: dimension, height: dimension }}
      >
        <svg width={dimension} height={dimension} className="-rotate-[135deg]">
          <defs>
            <filter id={`gauge-shadow-${type}-${size}`}>
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.14" />
            </filter>
          </defs>
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            filter={`url(#gauge-shadow-${type}-${size})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold tracking-tight ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-xl'}`}
            style={{ color }}
          >
            {roundedScore}
          </span>
          {size !== 'sm' ? (
            <span className="mt-1 text-[11px] uppercase tracking-[0.22em] text-stone-400">
              {type}
            </span>
          ) : null}
        </div>
      </div>

      <span className={`font-medium text-stone-700 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {TYPE_LABELS[type][locale]}
      </span>

      {size !== 'sm' ? <span className="text-center text-xs text-stone-500">{label}</span> : null}
    </div>
  )
}
