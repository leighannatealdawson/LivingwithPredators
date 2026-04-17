import { useState } from "react";
import { RiskSlider } from "./RiskSlider";

export interface RiskSliderGroupProps {
  prompt: string;
  leftLabel: string;
  rightLabel: string;
  anchors?: string[];
  items: Array<{ id: string; label: string }>;
  values: Record<string, number | null>;
  onChange: (itemId: string, value: number) => void;
}

/**
 * A set of related slider questions sharing a common scale. The shared
 * "left → right" label row is shown once at the top of the group (not per
 * row), so mobile widths keep the track full-width.
 */
export function RiskSliderGroup({
  prompt,
  leftLabel,
  rightLabel,
  anchors,
  items,
  values,
  onChange,
}: RiskSliderGroupProps) {
  const [showAnchors, setShowAnchors] = useState(false);
  const hasAnchors = !!(anchors && anchors.length > 2);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="!font-sans !text-base font-semibold !text-stone-900 leading-snug">
          {prompt}
          <span aria-hidden="true" className="ml-1 text-forest-700">
            *
          </span>
        </h3>
        {hasAnchors && (
          <button
            type="button"
            onClick={() => setShowAnchors((s) => !s)}
            className="mt-2 text-xs text-forest-700 underline underline-offset-2 hover:text-forest-800"
          >
            {showAnchors ? "Hide the full scale" : "See all options on the scale"}
          </button>
        )}
        {showAnchors && hasAnchors && (
          <ul className="mt-2 space-y-1 rounded-lg bg-stone-100 p-3 text-xs text-stone-700">
            {anchors!.map((a) => (
              <li key={a}>• {a}</li>
            ))}
          </ul>
        )}
      </div>

      <ul className="divide-y divide-stone-200 md:overflow-hidden md:rounded-xl md:border md:border-stone-200 md:bg-white">
        {items.map((item) => (
          <li key={item.id} className="py-5 md:p-5">
            <div className="mb-3 text-sm font-semibold text-stone-900 leading-snug">
              {item.label}
            </div>
            <RiskSlider
              ariaLabel={`${item.label} — from ${leftLabel} to ${rightLabel}`}
              value={values[item.id] ?? null}
              onChange={(v) => onChange(item.id, v)}
              leftLabel={leftLabel}
              rightLabel={rightLabel}
              anchors={anchors}
              itemLabel={item.label}
              showHeaderLabels
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
