interface Choice {
  value: string;
  label: string;
}

export interface ChoiceMatrixProps {
  prompt: string;
  hint?: string;
  items: Array<{ id: string; label: string }>;
  choices: Choice[];
  values: Record<string, string | null>;
  onChange: (itemId: string, value: string) => void;
}

/**
 * A grouped single-choice question where every row shares the same set of
 * choices — e.g. "Have you ever seen...?" with rows "Pine Marten" / "Fox" and
 * choices Yes / No / Not sure.
 *
 * Rendered as stacked cards on mobile and as a compact table on desktop, so
 * the header-and-options pairing stays clear on a phone while still feeling
 * compact on a larger screen.
 */
export function ChoiceMatrix({
  prompt,
  hint,
  items,
  choices,
  values,
  onChange,
}: ChoiceMatrixProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="!font-sans !text-base font-semibold !text-stone-900 leading-snug">
          {prompt}
          <span aria-hidden="true" className="ml-1 text-forest-700">
            *
          </span>
        </h3>
        {hint && <p className="mt-1 text-sm text-stone-600">{hint}</p>}
      </div>

      <ul className="divide-y divide-stone-200 md:overflow-hidden md:rounded-xl md:border md:border-stone-200 md:bg-white">
        {items.map((item) => {
          const current = values[item.id] ?? null;
          return (
            <li key={item.id} className="py-4 md:p-4">
              <div className="mb-3 text-sm font-semibold text-stone-900">{item.label}</div>
              <div
                className="grid gap-2"
                role="radiogroup"
                aria-label={item.label}
                style={{ gridTemplateColumns: `repeat(${Math.min(choices.length, 4)}, minmax(0, 1fr))` }}
              >
                {choices.map((choice) => {
                  const checked = current === choice.value;
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
                        type="radio"
                        name={`matrix-${item.id}`}
                        value={choice.value}
                        checked={checked}
                        onChange={() => onChange(item.id, choice.value)}
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
