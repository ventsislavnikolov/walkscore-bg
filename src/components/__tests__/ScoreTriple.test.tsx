import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LocaleProvider } from "../../lib/i18n";
import { ScoreTriple } from "../ScoreTriple";

describe("ScoreTriple", () => {
  it("renders three score gauges together", () => {
    render(
      <LocaleProvider locale="en">
        <ScoreTriple
          bikeScore={45}
          size="sm"
          transitScore={72}
          walkScore={87}
        />
      </LocaleProvider>
    );

    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("Walk Score")).toBeInTheDocument();
    expect(screen.getByText("Transit Score")).toBeInTheDocument();
    expect(screen.getByText("Bike Score")).toBeInTheDocument();
  });
});
