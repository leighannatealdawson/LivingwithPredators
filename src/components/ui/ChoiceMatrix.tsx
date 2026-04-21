import { LabelText } from "./LabelText";

interface Choice {
  value: string;
  label: string;
}

export interface ChoiceMatrixProps {
  prompt: string;
  hint?: string;
  items: Array<{ id: string; label: string }>;
  choices: Choice[];
  /** When false/omitted: per-row single choice (values are `string | null`).
   *  When true: per-row multi choice (values are `string[] | null`). */
  multi?: boolean;
  /** Only used when multi=true. Selecting this value clears any others in the
   *  row; selecting any other value removes this one. */
  exclusive?: string;
  values: Record<string, string | string[] | null>;
  onChange: (itemId: string, value: string | string[]) => void;
  required?: boolean;
}

/**
 * A grouped choice question where every row shares the same set of choices.
 * Each row is either single-select (radios) or, when `multi` is true,
 * multi-select (checkboxes) with an optional mutually-exclusive value
 * (e.g. "Neither").
 */
export function ChoiceMatrix({
  prompt,
  hint,
  items,
  choices,
  multi = false,
  exclusive,
  values,
  onChange,
  required = false,
}: ChoiceMatrixProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="!font-sans !text-base font-semibold !text-stone-900 leading-snug">
          <LabelText text={prompt} />
          {required && (
            <span aria-hidden="true" className="ml-1 text-forest-700">
              *
            </span>
          )}
        </h3>
        {hint && <p className="mt-1 text-sm text-stone-600">{hint}</p>}
      </div>

      <ul className="divide-y divide-stone-200 md:overflow-hidden md:rounded-xl md:border md:border-stone-200 md:bg-white">
        {items.map((item) => {
          const raw = values[item.id] ?? null;
          const selected: string[] = multi
            ? Array.isArray(raw)
              ? raw
              : []
            : typeof raw === "string"
              ? [raw]
              : [];

          const toggle = (value: string) => {
            if (multi) {
              let next: string[];
              if (selected.includes(value)) {
                next = selected.filter((v) => v !== value);
              } else if (exclusive && value === exclusive) {
                next = [exclusive];
              } else if (exclusive) {
                next = [...selected.filter((v) => v !== exclusive), value];
              } else {
                next = [...selected, value];
              }
              onChange(item.id, next);
            } else {
              onChange(item.id, value);
            }
          };

          return (
            <li key={item.id} className="py-4 md:p-4">
              <div className="mb-3 text-sm font-semibold text-stone-900">
                <LabelText text={item.label} />
              </div>
              <div
                className="grid gap-2"
                role={multi ? "group" : "radiogroup"}
                aria-label={item.label}
                style={{
                  gridTemplateColumns: `repeat(${Math.min(choices.length, 4)}, minmax(0, 1fr))`,
                }}
              >
                {choices.map((choice) => {
                  const checked = selected.includes(choice.value);
                  return (
                    <label
                      key={choice.value}
                      className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                        checked
                          ? "border-forest-600 bg-forest-50 text-forest-900 shadow-sm"
                          : "border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
                      }`}
                    >
                      <input
                        type={multi ? "checkbox" : "radio"}
                        name={`matrix-${item.id}`}
                        value={choice.value}
                        checked={checked}
                        onChange={() => toggle(choice.value)}
                        className="sr-only"
                      />
                      {choice.label}
                    </label>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
