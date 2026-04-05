import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  LocaleProvider,
  localeFromPath,
  useLocale,
  useTranslation,
} from "../i18n";

function withLocale(locale: "bg" | "en") {
  return function LocaleWrapper({ children }: { children: ReactNode }) {
    return createElement(LocaleProvider, { locale }, children);
  };
}

describe("localeFromPath", () => {
  it("derives the locale from the pathname", () => {
    expect(localeFromPath("/")).toBe("bg");
    expect(localeFromPath("/score")).toBe("bg");
    expect(localeFromPath("/en")).toBe("en");
    expect(localeFromPath("/en/score")).toBe("en");
  });

  it("exposes the current locale through useLocale", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: withLocale("en"),
    });

    expect(result.current).toBe("en");
  });
});

describe("useTranslation", () => {
  it("returns localized strings", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: withLocale("bg"),
    });

    expect(result.current.t("hero.button")).toBe("Провери");
  });

  it("returns English strings when the provider locale is English", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: withLocale("en"),
    });

    expect(result.current.t("hero.button")).toBe("Check");
  });

  it("falls back to the translation key when a string is missing", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: withLocale("bg"),
    });

    expect(result.current.t("missing.key")).toBe("missing.key");
  });

  it("interpolates parameters into translated strings", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: withLocale("bg"),
    });

    expect(result.current.t("city.title", { city: "София" })).toBe(
      "Walk Score на София"
    );
  });

  it("supports interpolation in English", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: withLocale("en"),
    });

    expect(result.current.t("compare.average", { score: "82" })).toBe(
      "82/100 average composite score"
    );
  });
});
