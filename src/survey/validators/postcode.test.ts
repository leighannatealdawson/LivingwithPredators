import { describe, it, expect } from "vitest";
import { validateIrishOrNIPostcode } from "./postcode";

describe("validateIrishOrNIPostcode", () => {
  it("accepts NI postcodes in various formats", () => {
    for (const input of ["BT12 5AB", "bt12 5ab", "bt125ab", "  BT12  5AB  "]) {
      const r = validateIrishOrNIPostcode(input);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.kind).toBe("ni");
        expect(r.normalised).toBe("BT12 5AB");
      }
    }
  });

  it("accepts Eircodes in various formats", () => {
    for (const input of ["D02 X285", "d02x285", "D02X285", " d02 X285 "]) {
      const r = validateIrishOrNIPostcode(input);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.kind).toBe("eircode");
        expect(r.normalised).toBe("D02 X285");
      }
    }
  });

  it("rejects empty input", () => {
    const r = validateIrishOrNIPostcode("");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("empty");
  });

  it("flags GB postcodes distinctly", () => {
    for (const input of ["SW1A 1AA", "W1A 0AX", "M1 1AE"]) {
      const r = validateIrishOrNIPostcode(input);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe("looks-like-gb-postcode");
    }
  });

  it("rejects obviously unrecognised input", () => {
    for (const input of ["12345", "HELLO", "NOT A CODE"]) {
      const r = validateIrishOrNIPostcode(input);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe("unrecognised");
    }
  });
});
