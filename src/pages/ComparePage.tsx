import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { MapPin } from "lucide-react";
import { type FormEvent, useState } from "react";

import { CategoryBreakdown } from "../components/CategoryBreakdown";
import { ScoreTriple } from "../components/ScoreTriple";
import { scoreColorClass } from "../lib/colors";
import { useTranslation } from "../lib/i18n";
import { getScoreByAddress } from "../server/score";

export function ComparePage() {
  const { t } = useTranslation();
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");

  const q1 = useQuery({
    queryKey: ["compare-score", search1],
    queryFn: () => getScoreByAddress({ data: { address: search1 } }),
    enabled: !!search1,
  });

  const q2 = useQuery({
    queryKey: ["compare-score", search2],
    queryFn: () => getScoreByAddress({ data: { address: search2 } }),
    enabled: !!search2,
  });

  function handleCompare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextAddr1 = addr1.trim();
    const nextAddr2 = addr2.trim();

    if (!(nextAddr1 && nextAddr2)) return;

    setSearch1(nextAddr1);
    setSearch2(nextAddr2);
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)]">
          <div className="border-stone-200 border-b bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_65%)] px-6 py-8">
            <p className="mb-2 font-semibold text-[0.65rem] text-emerald-700 uppercase tracking-[0.28em]">
              Score Duel
            </p>
            <h1 className="font-bold text-3xl text-stone-900">
              {t("compare.title")}
            </h1>
          </div>

          <form
            className="grid gap-4 px-6 py-6 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={handleCompare}
          >
            <AddressInput
              onChange={setAddr1}
              placeholder={t("compare.address1")}
              value={addr1}
            />
            <AddressInput
              onChange={setAddr2}
              placeholder={t("compare.address2")}
              value={addr2}
            />
            <button
              className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
              type="submit"
            >
              {t("compare.button")}
            </button>
          </form>
        </section>

        {(q1.isLoading || q2.isLoading) && (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </div>
        )}

        {q1.data && q2.data ? (
          <div className="grid gap-8 lg:grid-cols-2">
            {[q1.data, q2.data].map((data, index) => {
              const other = index === 0 ? q2.data : q1.data;
              const total = data.walkScore + data.transitScore + data.bikeScore;
              const otherTotal =
                other.walkScore + other.transitScore + other.bikeScore;
              const isWinner = total >= otherTotal;

              return (
                <article
                  className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)]"
                  key={data.address}
                >
                  <div className="border-stone-200 border-b px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-stone-400 uppercase tracking-[0.24em]">
                          {index === 0 ? "A" : "B"}
                        </p>
                        <h2 className="mt-2 font-semibold text-stone-900 text-xl">
                          {data.address}
                        </h2>
                      </div>

                      <div
                        className={clsx(
                          "rounded-full px-3 py-1 font-semibold text-xs uppercase tracking-[0.2em]",
                          isWinner
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-stone-100 text-stone-500"
                        )}
                      >
                        {isWinner ? t("compare.winner") : " "}
                      </div>
                    </div>

                    <p
                      className={clsx(
                        "mt-4 font-medium text-sm",
                        scoreColorClass(total / 3)
                      )}
                    >
                      {t("compare.average", {
                        score: String(Math.round(total / 3)),
                      })}
                    </p>
                  </div>

                  <div className="space-y-6 px-6 py-6">
                    <ScoreTriple
                      bikeScore={data.bikeScore}
                      size="sm"
                      transitScore={data.transitScore}
                      walkScore={data.walkScore}
                    />
                    <CategoryBreakdown components={data.components} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}

interface AddressInputProps {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

function AddressInput({ value, placeholder, onChange }: AddressInputProps) {
  return (
    <label className="relative block">
      <MapPin
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-stone-400"
        size={16}
      />
      <input
        className="w-full rounded-2xl border-2 border-stone-200 bg-white py-3 pr-4 pl-11 text-sm text-stone-900 outline-none transition-colors focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        data-testid={placeholder}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </label>
  );
}
