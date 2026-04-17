import { describe, it, expect } from "vitest";
import { canProceedFrom, pruneHiddenAnswers } from "./wizard-state";

describe("canProceedFrom", () => {
  it("blocks welcome until consent is given", () => {
    expect(canProceedFrom("welcome", {})).toBe(false);
    expect(canProceedFrom("welcome", { __consent: true })).toBe(true);
  });

  it("blocks interactions if required questions unanswered", () => {
    expect(canProceedFrom("interactions", {})).toBe(false);
  });

  it("allows interactions once the gating sp_* answers are set", () => {
    const answers = {
      sp_local: "neither",
      sp_property: "neither",
      sp_denning: "neither",
      sp_bins: "neither",
      sp_damage: "neither",
      sp_losses: "neither",
    };
    expect(canProceedFrom("interactions", answers)).toBe(true);
  });
});

describe("pruneHiddenAnswers", () => {
  it("removes answers for questions hidden by current conditions", () => {
    // Put an answer on sp_local_exp_pm while sp_local is 'neither'.
    // The generator's visibleIf for sp_local_exp_pm requires sp_local == 'pm' or 'both'.
    const answers: Record<string, unknown> = {
      sp_local: "neither",
      sp_property: "neither",
      sp_denning: "neither",
      sp_bins: "neither",
      sp_damage: "neither",
      sp_losses: "neither",
      sp_local_exp_pm: 50,
    };
    const pruned = pruneHiddenAnswers(answers as never);
    expect("sp_local_exp_pm" in pruned).toBe(false);
  });

  it("preserves answers whose conditions are met", () => {
    const answers: Record<string, unknown> = {
      sp_local: "pm",
      sp_property: "neither",
      sp_denning: "neither",
      sp_bins: "neither",
      sp_damage: "neither",
      sp_losses: "neither",
      sp_local_exp_pm: 80,
    };
    const pruned = pruneHiddenAnswers(answers as never);
    expect(pruned.sp_local_exp_pm).toBe(80);
  });
});
