import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RiskSlider } from "./RiskSlider";

describe("RiskSlider", () => {
  it("renders with unset indicator when value is null", () => {
    render(
      <RiskSlider
        value={null}
        onChange={() => {}}
        leftLabel="Very Low"
        rightLabel="Very High"
        ariaLabel="Risk"
      />,
    );
    const slider = screen.getByRole("slider", { name: /Risk/ });
    expect(slider.getAttribute("aria-valuetext")).toMatch(/Not answered/);
  });

  it("emits a clamped, rounded number on change", () => {
    const onChange = vi.fn();
    render(
      <RiskSlider
        value={42}
        onChange={onChange}
        leftLabel="Low"
        rightLabel="High"
        ariaLabel="Test"
      />,
    );
    const slider = screen.getByRole("slider", { name: /Test/ });
    fireEvent.change(slider, { target: { value: "43" } });
    expect(onChange).toHaveBeenCalledWith(43);
  });

  it("reflects a set value in aria-valuetext", () => {
    render(
      <RiskSlider
        value={75}
        onChange={() => {}}
        leftLabel="Low"
        rightLabel="High"
        ariaLabel="Test"
      />,
    );
    const slider = screen.getByRole("slider", { name: /Test/ });
    expect(slider.getAttribute("aria-valuetext")).toMatch(/75 out of 100/);
  });
});
