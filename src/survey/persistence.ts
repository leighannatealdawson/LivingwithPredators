import { STORAGE_KEY, SURVEY_VERSION } from "./wizard-state";
import type { WizardState } from "./wizard-state";

interface Envelope {
  version: number;
  state: WizardState;
}

function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function loadState(): WizardState | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Envelope;
    if (!parsed || parsed.version !== SURVEY_VERSION || !parsed.state) {
      s.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.state;
  } catch {
    try {
      s.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}

export function saveState(state: WizardState): void {
  const s = storage();
  if (!s) return;
  try {
    const envelope: Envelope = { version: SURVEY_VERSION, state };
    s.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // sessionStorage can throw in private mode / quota overflow; silently ignore.
  }
}

export function clearState(): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
