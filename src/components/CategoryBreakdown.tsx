import { scoreColor } from "../lib/colors";
import { useLocale } from "../lib/i18n";
import { CATEGORY_META } from "../lib/labels";

interface CategoryBreakdownProps {
  components: Record<string, number>;
}

export function CategoryBreakdown({ components }: CategoryBreakdownProps) {
  const locale = useLocale();

  return (
    <div className="space-y-3 rounded-3xl bg-white p-5 shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)] ring-1 ring-stone-200/70">
      {Object.entries(components).map(([key, score]) => {
        const meta = CATEGORY_META[key];
        if (!meta) return null;

        const roundedScore = Math.round(score);

        return (
          <div
            className="grid grid-cols-[2rem_1fr_5.5rem_2rem] items-center gap-3"
            key={key}
          >
            <span className="text-center text-lg">{meta.icon}</span>
            <span className="text-sm text-stone-700">
              {locale === "bg" ? meta.bg : meta.en}
            </span>
            <div className="h-2.5 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${roundedScore}%`,
                  backgroundColor: scoreColor(score),
                }}
              />
            </div>
            <span className="text-right font-semibold text-sm text-stone-600">
              {roundedScore}
            </span>
          </div>
        );
      })}
    </div>
  );
}
