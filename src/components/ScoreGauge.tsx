import { scoreColor } from "../lib/colors";
import { useLocale } from "../lib/i18n";
import { getScoreLabel } from "../lib/labels";
import type { ScoreType } from "../lib/types";

interface ScoreGaugeProps {
  score: number;
  size?: "lg" | "md" | "sm";
  type: ScoreType;
}

const SIZE_MAP = {
  lg: 140,
  md: 104,
  sm: 76,
} as const;

const TYPE_LABELS: Record<ScoreType, { bg: string; en: string }> = {
  walk: { bg: "Walk Score", en: "Walk Score" },
  transit: { bg: "Transit Score", en: "Transit Score" },
  bike: { bg: "Bike Score", en: "Bike Score" },
};

export function ScoreGauge({ score, type, size = "lg" }: ScoreGaugeProps) {
  const locale = useLocale();
  const label = getScoreLabel(score, type, locale);
  const color = scoreColor(score);
  const roundedScore = Math.round(score);

  const dimension = SIZE_MAP[size];
  const strokeWidth = size === "lg" ? 10 : size === "md" ? 8 : 6;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const dashOffset = arcLength - (arcLength * roundedScore) / 100;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative rounded-full bg-white/80 shadow-[0_18px_50px_-30px_rgba(68,64,60,0.45)] ring-1 ring-stone-200/70"
        style={{ width: dimension, height: dimension }}
      >
        <svg className="-rotate-[135deg]" height={dimension} width={dimension}>
          <defs>
            <filter id={`gauge-shadow-${type}-${size}`}>
              <feDropShadow
                dx="0"
                dy="3"
                floodOpacity="0.14"
                stdDeviation="3"
              />
            </filter>
          </defs>
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            fill="none"
            r={radius}
            stroke="#e7e5e4"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
          <circle
            className="transition-all duration-1000 ease-out"
            cx={dimension / 2}
            cy={dimension / 2}
            fill="none"
            filter={`url(#gauge-shadow-${type}-${size})`}
            r={radius}
            stroke={color}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold tracking-tight ${size === "lg" ? "text-4xl" : size === "md" ? "text-3xl" : "text-xl"}`}
            style={{ color }}
          >
            {roundedScore}
          </span>
          {size === "sm" ? null : (
            <span className="mt-1 text-[11px] text-stone-400 uppercase tracking-[0.22em]">
              {type}
            </span>
          )}
        </div>
      </div>

      <span
        className={`font-medium text-stone-700 ${size === "sm" ? "text-xs" : "text-sm"}`}
      >
        {TYPE_LABELS[type][locale]}
      </span>

      {size === "sm" ? null : (
        <span className="text-center text-stone-500 text-xs">{label}</span>
      )}
    </div>
  );
}
