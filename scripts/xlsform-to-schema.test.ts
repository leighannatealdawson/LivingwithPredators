import { describe, it, expect } from "vitest";

// Test the `relevant` translator in isolation. We duplicate the function
// here for testing because the main script's main() is side-effectful;
// if the production translator changes, keep this in sync.

function translateRelevant(expr: string): string {
  const cleaned = expr.replace(/\s+/g, " ").trim();
  if (!cleaned) return "true";
  const allowedPattern = /^(?:\$\{[a-z_][a-z0-9_]*\s*\}|\s*=\s*|'[^']*'|\s+or\s+|\s+and\s+|\(|\)|\s)+$/i;
  if (!allowedPattern.test(cleaned)) {
    throw new Error(`Unsupported 'relevant' expression: ${expr}`);
  }
  return cleaned
    .replace(/\$\{\s*([a-z_][a-z0-9_]*)\s*\}/gi, (_m, name) => `answers[${JSON.stringify(name)}]`)
    .replace(/\s*=\s*/g, " === ")
    .replace(/\s+or\s+/gi, " || ")
    .replace(/\s+and\s+/gi, " && ");
}

// Evaluate the predicate with a simple `answers` scope.
function evalPredicate(body: string, answers: Record<string, unknown>): boolean {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const fn = new Function("answers", `return (${body});`);
  return Boolean(fn(answers));
}

describe("translateRelevant", () => {
  it("returns 'true' for an empty expression", () => {
    expect(translateRelevant("")).toBe("true");
    expect(evalPredicate(translateRelevant(""), {})).toBe(true);
  });

  it("translates a simple equality", () => {
    const body = translateRelevant("${sp_local} = 'pm'");
    expect(body).toBe(`answers["sp_local"] === 'pm'`);
    expect(evalPredicate(body, { sp_local: "pm" })).toBe(true);
    expect(evalPredicate(body, { sp_local: "fox" })).toBe(false);
  });

  it("translates or-chained equalities", () => {
    const body = translateRelevant("${sp_local} = 'pm' or ${sp_local} = 'both'");
    expect(evalPredicate(body, { sp_local: "pm" })).toBe(true);
    expect(evalPredicate(body, { sp_local: "both" })).toBe(true);
    expect(evalPredicate(body, { sp_local: "fox" })).toBe(false);
    expect(evalPredicate(body, {})).toBe(false);
  });

  it("translates multi-line XLSForm expressions", () => {
    const expr = "${sp_local} = 'pm' or ${sp_local} = 'fox' or\n${sp_property} = 'both'";
    const body = translateRelevant(expr);
    expect(evalPredicate(body, { sp_local: "pm" })).toBe(true);
    expect(evalPredicate(body, { sp_property: "both" })).toBe(true);
    expect(evalPredicate(body, { sp_local: "neither", sp_property: "fox" })).toBe(false);
  });

  it("throws for unsupported tokens", () => {
    expect(() => translateRelevant("${x} > 5")).toThrow(/Unsupported/);
    expect(() => translateRelevant("count(${x})")).toThrow(/Unsupported/);
  });
});
