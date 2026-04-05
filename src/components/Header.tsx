import { GitCompare, Info, Map } from "lucide-react";

import { setLocale, useTranslation } from "../lib/i18n";
import type { Locale } from "../lib/types";

function localePrefix(locale: Locale) {
  return locale === "en" ? "/en" : "";
}

export function Header() {
  const { t, locale } = useTranslation();
  const prefix = localePrefix(locale);

  function toggleLocale() {
    const nextLocale: Locale = locale === "bg" ? "en" : "bg";
    setLocale(nextLocale);
  }

  return (
    <header className="sticky top-0 z-50 border-stone-200 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a className="font-bold text-stone-900 text-xl" href={`${prefix}/`}>
          Walk Score<span className="text-emerald-600">.bg</span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            className="flex items-center gap-1.5 text-sm text-stone-600 transition-colors hover:text-stone-900"
            href={`${prefix}/map`}
          >
            <Map size={16} />
            {t("nav.map")}
          </a>
          <a
            className="flex items-center gap-1.5 text-sm text-stone-600 transition-colors hover:text-stone-900"
            href={`${prefix}/compare`}
          >
            <GitCompare size={16} />
            {t("nav.compare")}
          </a>
          <a
            className="flex items-center gap-1.5 text-sm text-stone-600 transition-colors hover:text-stone-900"
            href={`${prefix}/about`}
          >
            <Info size={16} />
            {t("nav.about")}
          </a>
        </nav>

        <button
          className="rounded-lg px-3 py-1.5 font-medium text-sm text-stone-600 transition-colors hover:bg-stone-100"
          onClick={toggleLocale}
          type="button"
        >
          {t("footer.language")}
        </button>
      </div>
    </header>
  );
}
