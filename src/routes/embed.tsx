import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { useLocale } from "../lib/i18n";

export const Route = createFileRoute("/embed")({
  component: EmbedPage,
});

export function EmbedPage() {
  const locale = useLocale();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<"bg" | "en">(locale);

  const embedUrl = `https://walkscore.bg/embed?lat=42.6977&lng=23.3219&theme=${theme}&lang=${lang}`;
  const embedCode = `<iframe src="${embedUrl}" width="350" height="200" frameborder="0" style="border-radius: 12px; border: 1px solid #e5e5e5;"></iframe>`;
  const isDark = theme === "dark";

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)]">
          <div className="border-stone-200 border-b bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_65%)] px-8 py-8">
            <p className="mb-2 font-semibold text-[0.65rem] text-emerald-700 uppercase tracking-[0.28em]">
              Publisher Kit
            </p>
            <h1 className="font-bold text-3xl text-stone-900">Embed Widget</h1>
            <p className="mt-3 max-w-2xl text-stone-600">
              Add WalkScore.bg summaries to listings, neighborhood guides, and
              market reports.
            </p>
          </div>

          <div className="grid gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              <h2 className="mb-4 font-semibold text-lg text-stone-900">
                Preview
              </h2>
              <div className="rounded-[2rem] border border-stone-300 border-dashed bg-stone-50 p-6">
                <div
                  className={`mx-auto w-full max-w-[350px] rounded-[1.5rem] border px-5 py-5 ${
                    isDark
                      ? "border-stone-700 bg-stone-950 text-white"
                      : "border-stone-200 bg-white text-stone-900"
                  }`}
                >
                  <div className="mb-4 text-sm opacity-70">
                    {lang === "bg" ? "Център, София" : "Sofia Center"}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <ScoreChip
                      dark={isDark}
                      label="Walk"
                      tone="emerald"
                      value={87}
                    />
                    <ScoreChip
                      dark={isDark}
                      label="Transit"
                      tone="emerald-soft"
                      value={72}
                    />
                    <ScoreChip
                      dark={isDark}
                      label="Bike"
                      tone="amber"
                      value={45}
                    />
                  </div>
                  <div className="mt-4 text-center text-xs opacity-55">
                    Powered by WalkScore.bg
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-semibold text-lg text-stone-900">
                Options
              </h2>
              <div className="space-y-4 rounded-[2rem] border border-stone-200 bg-stone-50 p-6">
                <OptionField label="Theme">
                  <select
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                    onChange={(event) =>
                      setTheme(event.target.value as "light" | "dark")
                    }
                    value={theme}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </OptionField>

                <OptionField label="Language">
                  <select
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                    onChange={(event) =>
                      setLang(event.target.value as "bg" | "en")
                    }
                    value={lang}
                  >
                    <option value="bg">Bulgarian</option>
                    <option value="en">English</option>
                  </select>
                </OptionField>
              </div>

              <h2 className="mt-6 mb-3 font-semibold text-lg text-stone-900">
                Embed Code
              </h2>
              <pre className="overflow-x-auto rounded-[1.5rem] bg-stone-950 p-4 text-sm text-stone-100">
                {embedCode}
              </pre>
              <button
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-sm text-white transition-colors hover:bg-emerald-700"
                onClick={() => navigator.clipboard.writeText(embedCode)}
                type="button"
              >
                Copy code
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

interface OptionFieldProps {
  children: React.ReactNode;
  label: string;
}

function OptionField({ label, children }: OptionFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-medium text-sm text-stone-600">{label}</span>
      {children}
    </div>
  );
}

interface ScoreChipProps {
  dark: boolean;
  label: string;
  tone: "emerald" | "emerald-soft" | "amber";
  value: number;
}

function ScoreChip({ label, value, tone, dark }: ScoreChipProps) {
  const toneClass =
    tone === "emerald"
      ? dark
        ? "text-emerald-300"
        : "text-emerald-600"
      : tone === "emerald-soft"
        ? dark
          ? "text-emerald-200"
          : "text-emerald-500"
        : dark
          ? "text-amber-300"
          : "text-amber-500";

  return (
    <div>
      <div className={`font-bold text-3xl ${toneClass}`}>{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.18em] opacity-60">
        {label}
      </div>
    </div>
  );
}
