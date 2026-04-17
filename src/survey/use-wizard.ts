import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnswerValue } from "./schema-types";
import type { StepId } from "./pages";
import { stepIds } from "./wizard-state";
import {
  canProceedFrom,
  initialState,
  nextStepId,
  prevStepId,
  pruneHiddenAnswers,
  stepIndex,
} from "./wizard-state";
import type { WizardState } from "./wizard-state";
import { clearState, loadState, saveState } from "./persistence";

function readHashStep(): StepId | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#\/?/, "");
  return stepIds.includes(hash as StepId) ? (hash as StepId) : null;
}

function writeHashStep(id: StepId) {
  if (typeof window === "undefined") return;
  const newHash = `#/${id}`;
  if (window.location.hash !== newHash) {
    // Use replaceState to avoid stacking history entries that the user
    // would need to back through; natural browser back still works because
    // we push a new entry on advance() below.
    window.history.replaceState(null, "", newHash);
  }
}

export interface UseWizard {
  state: WizardState;
  currentStepId: StepId;
  currentIndex: number;
  totalSteps: number;
  canProceed: boolean;
  setAnswer: (id: string, value: AnswerValue) => void;
  advance: () => void;
  goBack: () => void;
  goTo: (id: StepId) => void;
  reset: () => void;
}

export function useWizard(): UseWizard {
  const [state, setState] = useState<WizardState>(() => {
    const restored = loadState();
    if (restored) {
      const hashStep = readHashStep();
      return hashStep ? { ...restored, currentStepId: hashStep } : restored;
    }
    const fresh = initialState();
    const hashStep = readHashStep();
    return hashStep ? { ...fresh, currentStepId: hashStep } : fresh;
  });

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 150);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  useEffect(() => {
    writeHashStep(state.currentStepId);
  }, [state.currentStepId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      const target = readHashStep();
      if (target && target !== state.currentStepId) {
        setState((s) => ({ ...s, currentStepId: target }));
      }
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [state.currentStepId]);

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    setState((s) => {
      const nextAnswers = { ...s.answers, [id]: value };
      const pruned = pruneHiddenAnswers(nextAnswers);
      return { ...s, answers: pruned };
    });
  }, []);

  const advance = useCallback(() => {
    setState((s) => {
      if (!canProceedFrom(s.currentStepId, s.answers)) return s;
      return { ...s, currentStepId: nextStepId(s.currentStepId) };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((s) => ({ ...s, currentStepId: prevStepId(s.currentStepId) }));
  }, []);

  // Scroll to top whenever the step changes (Next, Back, or jump). Runs after
  // render commits so the browser isn't racing the new page layout.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [state.currentStepId]);

  const goTo = useCallback((id: StepId) => {
    setState((s) => ({ ...s, currentStepId: id }));
  }, []);

  const reset = useCallback(() => {
    clearState();
    setState(initialState());
  }, []);

  const canProceed = useMemo(
    () => canProceedFrom(state.currentStepId, state.answers),
    [state.currentStepId, state.answers],
  );

  return {
    state,
    currentStepId: state.currentStepId,
    currentIndex: stepIndex(state.currentStepId),
    totalSteps: stepIds.length,
    canProceed,
    setAnswer,
    advance,
    goBack,
    goTo,
    reset,
  };
}
