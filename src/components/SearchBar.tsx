import { MapPin } from "lucide-react";
import { useState } from "react";

import { useLocale, useTranslation } from "../lib/i18n";

interface SearchBarProps {
  defaultValue?: string;
  onSearch?: (address: string) => void;
  size?: "lg" | "md";
}

export function SearchBar({
  size = "lg",
  defaultValue = "",
  onSearch,
}: SearchBarProps) {
  const [address, setAddress] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const locale = useLocale();
  const prefix = locale === "en" ? "/en" : "";
  const isLarge = size === "lg";

  function navigateToScore(nextAddress: string) {
    const params = new URLSearchParams({ address: nextAddress });
    window.location.assign(`${prefix}/score?${params.toString()}`);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextAddress = address.trim();

    if (!nextAddress) return;

    if (onSearch) {
      onSearch(nextAddress);
      return;
    }

    if (typeof window === "undefined") return;

    setLoading(true);
    navigateToScore(nextAddress);
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <div className="relative">
        <MapPin
          className={`absolute top-1/2 left-4 -translate-y-1/2 text-stone-400 ${isLarge ? "" : "h-4 w-4"}`}
          size={isLarge ? 20 : 16}
        />
        <input
          className={`w-full rounded-2xl border-2 border-stone-200 bg-white outline-none transition-colors focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${
            isLarge
              ? "py-5 pr-32 pl-12 text-lg shadow-lg shadow-stone-200/50"
              : "py-3 pr-24 pl-10 text-sm shadow-sm"
          }`}
          data-testid="search-input"
          onChange={(event) => setAddress(event.target.value)}
          placeholder={t("hero.placeholder")}
          type="text"
          value={address}
        />
        <button
          className={`absolute top-1/2 right-2 -translate-y-1/2 rounded-xl bg-emerald-600 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 ${
            isLarge ? "px-6 py-3" : "px-4 py-2 text-sm"
          }`}
          data-testid="search-submit"
          disabled={loading}
          type="submit"
        >
          {loading ? t("hero.buttonLoading") : t("hero.button")}
        </button>
      </div>
    </form>
  );
}
