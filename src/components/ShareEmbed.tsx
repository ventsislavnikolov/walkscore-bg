import { useState } from "react";

import { useTranslation } from "../lib/i18n";

interface ShareEmbedProps {
  lat: number;
  lng: number;
}

export function ShareEmbed({ lat, lng }: ShareEmbedProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);

  const shareUrl = `https://walkscore.bg/score?lat=${lat}&lng=${lng}`;
  const embedCode = `<iframe src="https://walkscore.bg/embed?lat=${lat}&lng=${lng}" width="350" height="200" frameborder="0" style="border-radius: 12px; border: 1px solid #e5e5e5;"></iframe>`;

  async function copy(text: string, type: "link" | "embed") {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      <h3 className="mb-3 font-semibold text-lg text-stone-900">
        {t("score.share")}
      </h3>
      <div className="flex gap-2">
        <button
          className="flex-1 rounded-xl bg-stone-100 px-4 py-2 text-sm transition-colors hover:bg-stone-200"
          onClick={() => copy(shareUrl, "link")}
          type="button"
        >
          {copied === "link" ? t("score.copied") : t("score.copyLink")}
        </button>
        <button
          className="flex-1 rounded-xl bg-stone-100 px-4 py-2 text-sm transition-colors hover:bg-stone-200"
          onClick={() => copy(embedCode, "embed")}
          type="button"
        >
          {copied === "embed" ? t("score.copied") : t("score.embedCode")}
        </button>
      </div>
    </div>
  );
}
