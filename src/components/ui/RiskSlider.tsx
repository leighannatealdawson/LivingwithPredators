import { useCallback, useId, useMemo } from "react";

export interface RiskSliderProps {
  value: number | null;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
  anchors?: string[];
  itemLabel?: string;
  ariaLabel?: string;
  showHeaderLabels?: boolean;
  /** Show the 0-100 numeric percentage in the readout. Defaults to true. */
  showPercent?: boolean;
  /** Initial visual position when value is null (e.g. 50 for a neutral-centered
   *  bipolar scale). The slider still reads as "not answered" until the user
   *  interacts, so required validation still applies. */
  defaultValue?: number;
}

/**
 * Map the current 0-100 value to its nearest anchor index using Math.round
 * buckets. With 5 anchors: index = round(value / 25), so regions are
 * [0,12.5), [12.5,37.5), [37.5,62.5), [62.5,87.5), [87.5,100].
 */
function valueToAnchor(value: number, anchors: string[] | undefined): string | null {
  if (!anchors || anchors.length < 2) return null;
  const step = 100 / (anchors.length - 1);
  const index = Math.round(value / step);
  const clamped = Math.min(anchors.length - 1, Math.max(0, index));
  return anchors[clamped];
}

/**
 * Boundary positions between answer regions (Math.round bucket boundaries).
 * For 5 anchors: [12.5, 37.5, 62.5, 87.5] — these are the places the answer
 * "changes" as the thumb slides, which matches user expectation when they
 * see tick marks on the track.
 */
function boundaryPositions(anchors: string[] | undefined): number[] {
  if (!anchors || anchors.length < 2) return [];
  const step = 100 / (anchors.length - 1);
  const out: number[] = [];
  for (let i = 1; i < anchors.length; i++) {
    out.push(i * step - step / 2);
  }
  return out;
}

/**
 * A 0-100 continuous slider. The track fill and thumb are rendered by the
 * native input (via runnable-track + slider-thumb pseudo-elements) so they
 * are always perfectly aligned — no layered divs. Answer-region boundary
 * ticks sit over the track as pointer-events:none overlays.
 */
export function RiskSlider({
  value,
  onChange,
  leftLabel,
  rightLabel,
  anchors,
  itemLabel,
  ariaLabel,
  showHeaderLabels = false,
  showPercent = true,
  defaultValue,
}: RiskSliderProps) {
  const inputId = useId();
  const touched = value !== null;
  const displayValue = touched
    ? value
    : typeof defaultValue === "number"
      ? defaultValue
      : 0;

  const boundaries = useMemo(() => boundaryPositions(anchors), [anchors]);
  const currentAnchor = useMemo(
    () => (touched && anchors && anchors.length >= 2 ? valueToAnchor(value, anchors) : null),
    [touched, value, anchors],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(e.target.value);
      if (Number.isFinite(next)) {
        onChange(Math.min(100, Math.max(0, Math.round(next))));
      }
    },
    [onChange],
  );

  // The fill width is a CSS variable so the gradient on the runnable-track
  // stays in sync with the thumb for every frame. A small offset (half the
  // thumb width) keeps the fill aligned with the thumb centre at both ends.
  const fillPercent = displayValue;
  const cssVars: React.CSSProperties & Record<string, string | number> = {
    "--fill": `${fillPercent}%`,
    "--fill-color": touched ? "#446440" : "#e5e1d8",
    "--thumb-color": touched ? "#446440" : "#cfc9bb",
  };

  return (
    <div className="w-full select-none">
      {showHeaderLabels && (
        <div className="flex items-start justify-between gap-3 pb-2 text-[10px] font-medium uppercase tracking-wide text-stone-500 md:text-xs">
          <span className="max-w-[45%] leading-tight">{leftLabel}</span>
          <span className="max-w-[45%] text-right leading-tight">{rightLabel}</span>
        </div>
      )}

      <div className="relative" style={cssVars}>
        <input
          id={inputId}
          type="range"
          min={0}
          max={100}
          step={1}
          value={displayValue}
          onChange={handleChange}
          aria-label={ariaLabel ?? itemLabel ?? `Scale from ${leftLabel} to ${rightLabel}`}
          aria-valuetext={
            touched
              ? currentAnchor
                ? showPercent
                  ? `${currentAnchor} (${displayValue} out of 100)`
                  : currentAnchor
                : `${displayValue} out of 100, between ${leftLabel} and ${rightLabel}`
              : `Not answered. Move slider to respond, between ${leftLabel} and ${rightLabel}.`
          }
          className="risk-slider block h-10 w-full cursor-pointer appearance-none bg-transparent focus:outline-none"
        />

        {/* Boundary tick marks — overlay on the track, ignore pointer events */}
        {boundaries.length > 0 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-0"
          >
            {boundaries.map((pct) => (
              <span
                key={pct}
                className="absolute h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-stone-400"
                style={{ left: `${pct}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Current-position readout */}
      <div
        className={`mt-1 text-sm ${touched ? "font-medium text-forest-800" : "text-stone-500"}`}
        aria-live="polite"
      >
        {touched ? (
          currentAnchor ? (
            showPercent ? (
              <>
                <span className="font-semibold">{displayValue}% </span>
                <span className="font-semibold">({currentAnchor})</span>
              </>
            ) : (
              <span className="font-semibold">{currentAnchor}</span>
            )
          ) : (
            <>
              <span className="font-semibold">{displayValue}</span>
              <span className="ml-1 font-normal text-stone-500">/ 100</span>
            </>
          )
        ) : (
          <>Tap or drag to answer.</>
        )}
      </div>

      <style>{`
        .risk-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 9999px;
          background: linear-gradient(
            to right,
            var(--fill-color) 0,
            var(--fill-color) var(--fill),
            #e5e1d8 var(--fill),
            #e5e1d8 100%
          );
        }
        .risk-slider::-moz-range-track {
          height: 8px;
          border-radius: 9999px;
          background: #e5e1d8;
        }
        .risk-slider::-moz-range-progress {
          height: 8px;
          border-radius: 9999px;
          background: var(--fill-color);
        }
        .risk-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -10px; /* centre 28px thumb on 8px track: -(28-8)/2 = -10 */
          height: 28px;
          width: 28px;
          border-radius: 9999px;
          background: var(--thumb-color);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .risk-slider::-moz-range-thumb {
          height: 28px;
          width: 28px;
          border-radius: 9999px;
          background: var(--thumb-color);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        .risk-slider:focus-visible::-webkit-slider-thumb {
          outline: 3px solid #446440;
          outline-offset: 3px;
        }
        .risk-slider:focus-visible::-moz-range-thumb {
          outline: 3px solid #446440;
          outline-offset: 3px;
        }
      `}</style>
    </div>
  );
}
