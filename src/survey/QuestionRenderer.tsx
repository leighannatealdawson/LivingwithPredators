import { useMemo, useState } from "react";
import type { AnswerValue, Question } from "./schema-types";
import { FieldLabel, HelperText } from "../components/ui/FieldLabel";
import { RadioGroup } from "../components/ui/RadioGroup";
import { CheckboxGroup } from "../components/ui/CheckboxGroup";
import { TextInput } from "../components/ui/TextInput";
import { TextArea } from "../components/ui/TextArea";
import { RiskSlider } from "../components/ui/RiskSlider";
import { RiskSliderGroup } from "../components/ui/RiskSliderGroup";
import { ChoiceMatrix } from "../components/ui/ChoiceMatrix";
import { validateIrishOrNIPostcode, postcodeErrorMessage } from "./validators/postcode";

const FREE_TEXT_NOTICE =
  "Please do not include identifying information (names, phone numbers, addresses) in your answer.";

interface Props {
  question: Question;
  answers: Record<string, AnswerValue>;
  onAnswer: (id: string, value: AnswerValue) => void;
}

export function QuestionRenderer({ question: q, answers, onAnswer }: Props) {
  const labelId = `q-${q.id}-label`;
  const value = answers[q.id];

  switch (q.kind) {
    case "note":
      return (
        <section aria-labelledby={labelId} className="rounded-xl bg-stone-100 p-4 text-sm text-stone-700">
          <p id={labelId}>{q.prompt}</p>
        </section>
      );

    case "single":
      return (
        <section aria-labelledby={labelId} className="space-y-3">
          <FieldLabel id={labelId} required={q.required}>
            {q.prompt}
          </FieldLabel>
          {q.hint && <HelperText>{q.hint}</HelperText>}
          <RadioGroup
            name={q.id}
            choices={q.choices}
            value={typeof value === "string" ? value : null}
            onChange={(v) => onAnswer(q.id, v)}
            layout={q.layout}
            ariaLabelledby={labelId}
          />
        </section>
      );

    case "multi":
      return (
        <section aria-labelledby={labelId} className="space-y-3">
          <FieldLabel id={labelId} required={q.required}>
            {q.prompt}
          </FieldLabel>
          {q.hint && <HelperText>{q.hint}</HelperText>}
          <CheckboxGroup
            name={q.id}
            choices={q.choices}
            value={Array.isArray(value) ? (value as string[]) : []}
            onChange={(v) => onAnswer(q.id, v)}
            ariaLabelledby={labelId}
          />
        </section>
      );

    case "slider":
      return (
        <section aria-labelledby={labelId} className="space-y-3">
          <FieldLabel id={labelId} required={q.required}>
            {q.prompt}
          </FieldLabel>
          {q.hint && <HelperText>{q.hint}</HelperText>}
          <RiskSlider
            value={typeof value === "number" ? value : null}
            onChange={(v) => onAnswer(q.id, v)}
            leftLabel={q.leftLabel}
            rightLabel={q.rightLabel}
            anchors={q.anchors}
            ariaLabel={`${q.prompt} — scale from ${q.leftLabel} to ${q.rightLabel}`}
            showHeaderLabels
          />
        </section>
      );

    case "slider-group": {
      // Slider-group item answers live as top-level keys in the answers map
      // so that visibleIf predicates referencing `${pm_pet}` etc. resolve.
      const values: Record<string, number | null> = {};
      for (const item of q.items) {
        const v = answers[item.id];
        values[item.id] = typeof v === "number" ? v : null;
      }
      return (
        <section aria-labelledby={labelId} className="space-y-4">
          <span id={labelId} className="sr-only">
            {q.prompt}
          </span>
          <RiskSliderGroup
            prompt={q.prompt}
            leftLabel={q.leftLabel}
            rightLabel={q.rightLabel}
            anchors={q.anchors}
            items={q.items}
            values={values}
            onChange={(itemId, v) => onAnswer(itemId, v)}
          />
        </section>
      );
    }

    case "choice-matrix": {
      // Choice-matrix item answers also live as flat top-level keys.
      const values: Record<string, string | null> = {};
      for (const item of q.items) {
        const v = answers[item.id];
        values[item.id] = typeof v === "string" ? v : null;
      }
      return (
        <section aria-labelledby={labelId} className="space-y-4">
          <span id={labelId} className="sr-only">
            {q.prompt}
          </span>
          <ChoiceMatrix
            prompt={q.prompt}
            hint={q.hint}
            items={q.items}
            choices={q.choices}
            values={values}
            onChange={(itemId, v) => onAnswer(itemId, v)}
          />
        </section>
      );
    }

    case "text": {
      if (q.validate === "postcode-ie-ni") {
        return <PostcodeField question={q} value={value} onChange={(v) => onAnswer(q.id, v)} labelId={labelId} />;
      }
      const textValue = typeof value === "string" ? value : "";
      return (
        <section aria-labelledby={labelId} className="space-y-3">
          <FieldLabel id={labelId} required={q.required}>
            {q.prompt}
          </FieldLabel>
          {q.hint && <HelperText>{q.hint}</HelperText>}
          {q.multiline ? (
            <TextArea
              id={q.id}
              value={textValue}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              aria-labelledby={labelId}
              rows={3}
            />
          ) : (
            <TextInput
              id={q.id}
              value={textValue}
              onChange={(e) => onAnswer(q.id, e.target.value)}
              aria-labelledby={labelId}
            />
          )}
          <HelperText>{FREE_TEXT_NOTICE}</HelperText>
        </section>
      );
    }
  }
}

export function validateIrishOrNIPostcode(input: string) {
  const cleaned = input
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;

  const compact = cleaned.replace(/\s/g, "");

  // 🚨 Reject obvious non-IE/NI formats (e.g. US ZIP codes)
  if (/^\d{5}(-\d{4})?$/.test(cleaned)) {
    return { ok: false, reason: "invalid_region" };
  }

  // ----------------------------
  // FULL VALIDATION (final state)
  // ----------------------------

  // Northern Ireland (BT codes)
  const niFull = /^BT\d{1,2}\s?\d{1,4}[A-Z]?$/;

  // Republic of Ireland (Eircodes)
  const ieFull = /^[A-Z]\d{2}\s?[A-Z0-9]{3,4}$/;

  // ----------------------------
  // PARTIAL VALIDATION (typing state)
  // ----------------------------

  // allow messy NI typing
  const niPartial = /^BT[0-9A-Z]{0,5}$/;

  // allow messy IE typing
  const iePartial = /^[A-Z0-9]{1,4}$/;

  // ----------------------------
  // VALID FINAL INPUTS
  // ----------------------------

  if (niFull.test(cleaned)) {
    return { ok: true, kind: "ni" as const };
  }

  if (ieFull.test(cleaned)) {
    return { ok: true, kind: "ie" as const };
  }

  // ----------------------------
  // SOFT STATE (no error shown)
  // ----------------------------

  if (niPartial.test(compact) || iePartial.test(compact)) {
    return null;
  }

  // ----------------------------
  // INVALID INPUT
  // ----------------------------

  return { ok: false, reason: "invalid_format" };
}