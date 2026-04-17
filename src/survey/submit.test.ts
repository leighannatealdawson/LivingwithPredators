import { describe, it, expect } from "vitest";
import { buildPayload } from "./submit";

describe("buildPayload", () => {
  it("emits flat top-level keys for slider-group items and choice-matrix items", () => {
    const answers = {
      // Slider-group items (top-level keys, not nested)
      pm_pet: 20,
      pm_poultry: 60,
      pm_livestock: null,
      pm_protected: 10,
      pm_humans: 5,
      // Scalar single-choice
      species_f: "fox",
      // Slider
      confidence_f: 75,
      // Multi-select
      hobbies: ["sport", "outdoor"],
      // Choice-matrix items (top-level keys)
      seen_pm: "yes",
      seen_fox: "no",
    };
    const p = buildPayload("abc", "2026-04-17T10:00:00Z", answers);
    expect(p.answers.pm_pet).toBe(20);
    expect(p.answers.pm_poultry).toBe(60);
    expect(p.answers.pm_livestock).toBe(null);
    expect(p.answers.species_f).toBe("fox");
    expect(p.answers.confidence_f).toBe(75);
    expect(p.answers.hobbies).toBe("sport, outdoor");
    expect(p.answers.seen_pm).toBe("yes");
    expect(p.answers.seen_fox).toBe("no");
    expect(p.surveyVersion).toBe(1);
    expect(p.submissionId).toBe("abc");
    expect(p.startedAt).toBe("2026-04-17T10:00:00Z");
  });

  it("sets unanswered slots to null", () => {
    const p = buildPayload("xyz", "2026-04-17T10:00:00Z", {});
    expect(p.answers.pm_pet).toBe(null);
    expect(p.answers.fox_benefits).toBe(null);
    expect(p.answers.seen_pm).toBe(null);
    expect(p.answers.postcode).toBe(null);
  });
});
