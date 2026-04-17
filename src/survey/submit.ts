import type { AnswerValue } from "./schema-types";
import { questions } from "./schema.generated";

export const SURVEY_VERSION = 1;

export interface SubmissionPayload {
  surveyVersion: number;
  submissionId: string;
  submittedAt: string;
  startedAt: string;
  userAgent: string;
  answers: Record<string, string | number | null>;
}

/**
 * Flatten the wizard's raw answers map into the payload shape the Apps Script
 * expects. Slider-group answers (nested objects keyed by item id) are spread
 * into one top-level key per item. Multi-selects are comma-joined. Missing
 * keys are written as empty strings by Apps Script, not the client.
 */
export function buildPayload(
  submissionId: string,
  startedAt: string,
  answers: Record<string, AnswerValue>,
): SubmissionPayload {
  const flat: Record<string, string | number | null> = {};

  // Collect the flat list of ids to emit: each question's id unless it's a
  // slider-group or choice-matrix, in which case emit one key per item.
  const emitIds: string[] = [];
  for (const q of questions) {
    if (q.kind === "note") continue;
    if (q.kind === "slider-group" || q.kind === "choice-matrix") {
      for (const item of q.items) emitIds.push(item.id);
    } else {
      emitIds.push(q.id);
    }
  }

  for (const id of emitIds) {
    const v = answers[id];
    if (v == null) {
      flat[id] = null;
      continue;
    }
    if (Array.isArray(v)) {
      flat[id] = v.join(", ");
      continue;
    }
    if (typeof v === "number" || typeof v === "string") {
      flat[id] = v;
      continue;
    }
    if (typeof v === "boolean") {
      flat[id] = v ? "true" : "false";
      continue;
    }
    flat[id] = JSON.stringify(v);
  }

  return {
    surveyVersion: SURVEY_VERSION,
    submissionId,
    submittedAt: new Date().toISOString(),
    startedAt,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    answers: flat,
  };
}

export type SubmitResult =
  | { ok: true; devFallback?: boolean }
  | { ok: false; message: string };

async function postOnce(url: string, payload: SubmissionPayload): Promise<SubmitResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      // text/plain sidesteps CORS preflight against script.google.com
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { ok: false, message: `Server returned ${response.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Network error" };
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function submit(
  submissionId: string,
  startedAt: string,
  answers: Record<string, AnswerValue>,
): Promise<SubmitResult> {
  const payload = buildPayload(submissionId, startedAt, answers);
  const url = import.meta.env.VITE_SUBMIT_URL as string | undefined;

  if (!url) {
    // Dev fallback: no submit URL configured (used locally or for researcher preview)
    // eslint-disable-next-line no-console
    console.info("[dev-fallback] Submission payload:", payload);
    return { ok: true, devFallback: true };
  }

  // Three attempts with small backoff.
  const backoff = [0, 500, 1500];
  let last: SubmitResult = { ok: false, message: "No attempt made" };
  for (const delay of backoff) {
    if (delay > 0) await sleep(delay);
    last = await postOnce(url, payload);
    if (last.ok) return last;
  }
  return last;
}
