import type { AnswerValue } from "./schema-types";
import type { StepId } from "./pages";
import { wizardPages } from "./pages";
import { questionsById } from "./schema.generated";
import { validateIrishOrNIPostcode } from "./validators/postcode";

export const STORAGE_KEY = "wildlife-survey:v1";
export const SURVEY_VERSION = 1;

export interface WizardState {
  currentStepId: StepId;
  answers: Record<string, AnswerValue>;
  submissionId: string;
  startedAt: string; // ISO
}

export const stepIds: StepId[] = wizardPages.map((p) => p.id);

/** RFC-4122-ish uuid (not cryptographically strong; fine for a dedupe key). */
export function makeSubmissionId(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function initialState(): WizardState {
  return {
    currentStepId: "welcome",
    answers: {},
    submissionId: makeSubmissionId(),
    startedAt: new Date().toISOString(),
  };
}

export function stepIndex(id: StepId): number {
  return stepIds.indexOf(id);
}

export function nextStepId(current: StepId): StepId {
  const i = stepIndex(current);
  return stepIds[Math.min(i + 1, stepIds.length - 1)];
}

export function prevStepId(current: StepId): StepId {
  const i = stepIndex(current);
  return stepIds[Math.max(i - 1, 0)];
}

/**
 * Resolve a scalar answer value for completeness checks.
 * Group-shaped answers (slider-group, choice-matrix) are checked by walking
 * each item's top-level key in canProceedFrom below.
 */
function isAnswered(value: AnswerValue | undefined): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;
  return false;
}

export function isQuestionVisible(
  questionId: string,
  answers: Record<string, AnswerValue>,
): boolean {
  const q = questionsById[questionId];
  if (!q) return true;
  if (!q.visibleIf) return true;
  try {
    return q.visibleIf(answers);
  } catch {
    return true;
  }
}

export function canProceedFrom(
  stepId: StepId,
  answers: Record<string, AnswerValue>,
): boolean {
  const page = wizardPages.find((p) => p.id === stepId);
  if (!page) return true;
  // Welcome consent is handled separately inside the welcome page.
  if (stepId === "welcome") return answers.__consent === true;
  for (const q of page.questions) {
    if (q.kind === "note") continue;
    if (!q.required) continue;
    if (q.visibleIf && !q.visibleIf(answers)) continue;

    if (q.kind === "slider-group" || q.kind === "choice-matrix") {
      for (const item of q.items) {
        if (!isAnswered(answers[item.id])) return false;
      }
      continue;
    }

    const value = answers[q.id];
    if (!isAnswered(value)) return false;
    if (q.kind === "text" && q.validate === "postcode-ie-ni") {
      const result = validateIrishOrNIPostcode(String(value ?? ""));
      if (!result.ok) return false;
    }
  }
  return true;
}

/** Remove answers for questions that are hidden under the current answers. */
export function pruneHiddenAnswers(
  answers: Record<string, AnswerValue>,
): Record<string, AnswerValue> {
  const out = { ...answers };
  let changed = true;
  // Iterate because hiding one answer can cascade into more.
  while (changed) {
    changed = false;
    for (const id of Object.keys(out)) {
      if (id === "__consent") continue;
      const q = questionsById[id];
      if (!q) continue;
      if (q.visibleIf && !q.visibleIf(out)) {
        delete out[id];
        changed = true;
      }
    }
  }
  return out;
}
