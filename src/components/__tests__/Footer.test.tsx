import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "../../lib/i18n";
import { Footer } from "../Footer";

describe("Footer", () => {
  it("uses localized about links", () => {
    render(
      <LocaleProvider locale="en">
        <Footer />
      </LocaleProvider>
    );

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/en/about"
    );
    expect(screen.getByRole("link", { name: "Methodology" })).toHaveAttribute(
      "href",
      "/en/about"
    );
  });
});
