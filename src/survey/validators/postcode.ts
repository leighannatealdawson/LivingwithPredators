/**
 * Validates a postcode as either a Northern Ireland UK postcode (BT-prefix)
 * or a Republic of Ireland Eircode. Everything else is rejected with a
 * reason code the UI can use to tailor the error message.
 */

export type PostcodeResult =
  | { ok: true; normalised: string; kind: "ni" | "ni-partial" | "eircode" | "eircode-partial" }
  | { ok: false; reason: "empty" | "looks-like-gb-postcode" | "unrecognised" };

const NI_REGEX = /^BT\d{1,2}\s\d[A-Z]{2}$/;
const EIRCODE_REGEX = /^[ACDEFHKNPRTVWXY][0-9W][0-9W]\s[0-9ACDEFHKNPRTVWXY]{4}$/;
// Partial-entry forms: just the outward code (NI) or just the routing key
// (Eircode). These let respondents share an area without giving the full,
// precisely-locating postcode.
const NI_PARTIAL_REGEX = /^BT\d{1,2}$/;
const EIRCODE_PARTIAL_REGEX = /^[ACDEFHKNPRTVWXY][0-9W][0-9W]$/;
// Generic UK postcode (excluding BT prefix) so we can tell the user that a
// plausible GB postcode is not accepted for this survey.
const GB_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s\d[A-Z]{2}$/;
const GB_PARTIAL_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?$/;

export function validateIrishOrNIPostcode(raw: string): PostcodeResult {
  if (!raw || !raw.trim()) return { ok: false, reason: "empty" };

  const s = raw.toUpperCase().replace(/\s+/g, " ").trim();
  // Remove all spaces, then reinsert one in the expected position.
  const noSpace = s.replace(/\s/g, "");

  // Try NI first: format is BT + 1-2 digits + 1 digit + 2 letters.
  // Insert a space before the last 3 characters.
  if (noSpace.length >= 5 && noSpace.startsWith("BT")) {
    const candidate = `${noSpace.slice(0, -3)} ${noSpace.slice(-3)}`;
    if (NI_REGEX.test(candidate)) {
      return { ok: true, normalised: candidate, kind: "ni" };
    }
  }

  // Partial NI outward code only (e.g. "BT12", "BT5", "BT56").
  if (NI_PARTIAL_REGEX.test(noSpace)) {
    return { ok: true, normalised: noSpace, kind: "ni-partial" };
  }

  // Eircode: 3 + 4, insert space before the last 4.
  if (noSpace.length === 7) {
    const candidate = `${noSpace.slice(0, 3)} ${noSpace.slice(3)}`;
    if (EIRCODE_REGEX.test(candidate)) {
      return { ok: true, normalised: candidate, kind: "eircode" };
    }
  }

  // Partial Eircode routing key only (e.g. "D02", "A63").
  if (EIRCODE_PARTIAL_REGEX.test(noSpace)) {
    return { ok: true, normalised: noSpace, kind: "eircode-partial" };
  }

  // GB postcode (non-BT) — also reinsert space before last 3.
  if (noSpace.length >= 5 && noSpace.length <= 7 && !noSpace.startsWith("BT")) {
    const candidate = `${noSpace.slice(0, -3)} ${noSpace.slice(-3)}`;
    if (GB_REGEX.test(candidate)) {
      return { ok: false, reason: "looks-like-gb-postcode" };
    }
  }
  // Partial GB outward code (e.g. "SW1A", "W1A").
  if (!noSpace.startsWith("BT") && GB_PARTIAL_REGEX.test(noSpace)) {
    return { ok: false, reason: "looks-like-gb-postcode" };
  }

  return { ok: false, reason: "unrecognised" };
}

export type PostcodeReason = "empty" | "looks-like-gb-postcode" | "unrecognised";

export function postcodeErrorMessage(reason: PostcodeReason): string {
  switch (reason) {
    case "empty":
      return "Please enter your postcode.";
    case "looks-like-gb-postcode":
      return "That looks like a postcode from Great Britain. This survey is for the island of Ireland only (Northern Ireland BT postcodes or Irish Eircodes).";
    case "unrecognised":
      return "That does not look like a Northern Ireland postcode (starts with BT) or an Irish Eircode (e.g. D02 X285). Please check and try again.";
  }
}
