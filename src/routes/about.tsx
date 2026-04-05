import { createFileRoute } from "@tanstack/react-router";

import { useLocale } from "../lib/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

export function AboutPage() {
  const locale = useLocale();

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-stone-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_60px_-40px_rgba(68,64,60,0.45)]">
          <div className="border-stone-200 border-b bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_65%)] px-8 py-8">
            <p className="mb-2 font-semibold text-[0.65rem] text-emerald-700 uppercase tracking-[0.28em]">
              Methodology
            </p>
            <h1 className="font-bold text-3xl text-stone-900">
              {locale === "bg"
                ? "Как работи WalkScore.bg?"
                : "How WalkScore.bg Works"}
            </h1>
          </div>

          <div className="space-y-6 px-8 py-8">
            <Section
              content={
                locale === "bg"
                  ? "Walk Score измерва колко лесно можеш да свършиш ежедневните си задачи пеш. Анализираме разстоянието до 6 категории: хранителни магазини, ресторанти, магазини, ежедневни нужди, паркове и образование. По-близо означава по-висок резултат."
                  : "Walk Score measures how easy it is to run daily errands on foot. We analyze distance to six categories: grocery stores, restaurants, shops, errands, parks, and education. Closer means a higher score."
              }
              title="Walk Score (0-100)"
            />
            <Section
              content={
                locale === "bg"
                  ? "Transit Score измерва достъпа до градски транспорт. Даваме най-голяма тежест на метрото, след това на трамваите и автобусите, плюс бонус за гъстота на спирките."
                  : "Transit Score measures access to public transit. Metro carries the highest weight, followed by trams and buses, with a density bonus for stop-rich areas."
              }
              title="Transit Score (0-100)"
            />
            <Section
              content={
                locale === "bg"
                  ? "Bike Score оценява велосипедната среда чрез инфраструктура, велосипедни удобства и свързаност на уличната мрежа."
                  : "Bike Score evaluates bike-friendliness through infrastructure, cycling amenities, and street-network connectivity."
              }
              title="Bike Score (0-100)"
            />
            <Section
              content={
                locale === "bg"
                  ? "Всички данни идват от OpenStreetMap. Геокодирането използва Nominatim, а данните се обновяват периодично с нашия pipeline."
                  : "All core data comes from OpenStreetMap. Geocoding uses Nominatim, and the dataset is refreshed periodically by the project pipeline."
              }
              title={locale === "bg" ? "Данни" : "Data Sources"}
            />
            <Section
              content=""
              title={locale === "bg" ? "Скала на оценките" : "Score Scale"}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-stone-200 border-b">
                    <th className="py-2 text-left">Score</th>
                    <th className="py-2 text-left">
                      {locale === "bg" ? "Описание" : "Description"}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-stone-600">
                  <tr className="border-stone-100 border-b">
                    <td className="py-2 font-medium text-emerald-600">
                      90-100
                    </td>
                    <td>
                      {locale === "bg" ? "Ежедневен рай" : "Walker's Paradise"}
                    </td>
                  </tr>
                  <tr className="border-stone-100 border-b">
                    <td className="py-2 font-medium text-emerald-500">70-89</td>
                    <td>
                      {locale === "bg" ? "Много пешеходен" : "Very Walkable"}
                    </td>
                  </tr>
                  <tr className="border-stone-100 border-b">
                    <td className="py-2 font-medium text-amber-500">50-69</td>
                    <td>
                      {locale === "bg"
                        ? "Донякъде пешеходен"
                        : "Somewhat Walkable"}
                    </td>
                  </tr>
                  <tr className="border-stone-100 border-b">
                    <td className="py-2 font-medium text-orange-500">25-49</td>
                    <td>
                      {locale === "bg" ? "Зависим от кола" : "Car-Dependent"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-red-600">0-24</td>
                    <td>
                      {locale === "bg"
                        ? "Почти непешеходен"
                        : "Almost all errands require a car"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
          </div>
        </section>
      </div>
    </main>
  );
}

interface SectionProps {
  children?: React.ReactNode;
  content: string;
  title: string;
}

function Section({ title, content, children }: SectionProps) {
  return (
    <section className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-6">
      <h2 className="mb-3 font-semibold text-stone-900 text-xl">{title}</h2>
      {content ? <p className="text-stone-600 leading-7">{content}</p> : null}
      {children}
    </section>
  );
}
