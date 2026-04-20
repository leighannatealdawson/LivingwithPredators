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

function PostcodeField({
  question: q,
  value,
  onChange,
  labelId,
}: {
  question: Extract<Question, { kind: "text" }>;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  labelId: string;
}) {
  const [touched, setTouched] = useState(false);
  const raw = typeof value === "string" ? value : "";
  const result = useMemo(() => (raw ? validateIrishOrNIPostcode(raw) : null), [raw]);
  const errorMessage =
    touched && result && !result.ok ? postcodeErrorMessage(result.reason) : null;

  return (
    <section aria-labelledby={labelId} className="space-y-3">
      <FieldLabel id={labelId} required={q.required}>
        {q.prompt}
      </FieldLabel>
      {q.hint && <HelperText>{q.hint}</HelperText>}
      <TextInput
        id={q.id}
        value={raw}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        aria-labelledby={labelId}
        error={errorMessage}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        placeholder="e.g. BT12 5AB or D02 X285"
      />
      {errorMessage && <HelperText tone="error">{errorMessage}</HelperText>}
      {result && result.ok && (
        <HelperText>{result.kind === "ni" ? "Northern Ireland postcode" : "Irish Eircode"} — thanks.</HelperText>
      )}
    </section>
  );
}