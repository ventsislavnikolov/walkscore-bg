import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LayerSwitcher } from "../LayerSwitcher";

describe("LayerSwitcher", () => {
  it("renders three layer buttons and notifies on change", () => {
    const onChange = vi.fn();
    render(<LayerSwitcher active="walk" onChange={onChange} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);

    fireEvent.click(screen.getByText("Транспорт"));
    expect(onChange).toHaveBeenCalledWith("transit");
  });
});
