import { LabelText } from "./LabelText";

interface Choice {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  name: string;
  choices: Choice[];
  value: string[];
  onChange: (value: string[]) => void;
  ariaLabelledby?: string;
}

export function CheckboxGroup({
  name,
  choices,
  value,
  onChange,
  ariaLabelledby,
}: CheckboxGroupProps) {
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };
  return (
    <div role="group" aria-labelledby={ariaLabelledby} className="flex flex-col gap-2">
      {choices.map((choice) => {
        const checked = value.includes(choice.value);
        const baseCls =
          "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors";
        const stateCls = checked
          ? "border-forest-600 bg-forest-50 text-forest-900"
          : "border-stone-300 bg-white text-stone-800 hover:bg-stone-50";
        return (
          <label key={choice.value} className={`${baseCls} ${stateCls}`}>
            <input
              type="checkbox"
              name={name}
              checked={checked}
              onChange={() => toggle(choice.value)}
              className="h-5 w-5 flex-shrink-0 rounded border-stone-400 text-forest-700 focus:ring-forest-600"
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
