import { useId } from "react";
import { LabelText } from "./LabelText";

interface Choice {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  choices: Choice[];
  value: string | null;
  onChange: (value: string) => void;
  layout?: "horizontal" | "vertical";
  ariaLabelledby?: string;
}

export function RadioGroup({
  name,
  choices,
  value,
  onChange,
  layout = "vertical",
  ariaLabelledby,
}: RadioGroupProps) {
  const fieldsetId = useId();
  const groupName = `${name}-${fieldsetId}`;
  return (
    <div
      role="radiogroup"
      aria-labelledby={ariaLabelledby}
      className={
        layout === "horizontal"
          ? "flex flex-wrap gap-2"
          : "flex flex-col gap-2"
      }
    >
      {choices.map((choice) => {
        const checked = value === choice.value;
        const baseCls =
          "cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors";
        const stateCls = checked
          ? "border-forest-600 bg-forest-50 text-forest-900"
          : "border-stone-300 bg-white text-stone-800 hover:bg-stone-50";
        return (
          <label key={choice.value} className={`${baseCls} ${stateCls}`}>
            <input
              type="radio"
              name={groupName}
              value={choice.value}
              checked={checked}
              onChange={() => onChange(choice.value)}
              className="sr-only"
            />
            <span>
              <LabelText text={choice.label} />
            </span>
          </label>
        );
      })}
    </div>
  );
}
