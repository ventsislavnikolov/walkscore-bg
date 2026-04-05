const STOPS = [
  { score: 0, color: "#dc2626", label: "0" },
  { score: 25, color: "#f97316", label: "25" },
  { score: 50, color: "#fbbf24", label: "50" },
  { score: 70, color: "#34d399", label: "70" },
  { score: 90, color: "#059669", label: "90+" },
];

export function ScoreLegend() {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 shadow-lg shadow-stone-900/10 ring-1 ring-stone-200/80 backdrop-blur-sm">
      {STOPS.map(({ score, color, label }) => (
        <div className="flex flex-col items-center gap-1" key={score}>
          <div
            className="h-3 w-7 rounded-sm"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium text-[10px] text-stone-500">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
