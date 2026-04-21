import { Fragment } from "react";

/**
 * Renders a prompt/label with any parenthetical content — for example
 * "(e.g., dogs, cats, rabbits)" or "(i.e. woodland)" — in a smaller,
 * subdued style, so the main phrase stays emphasised and the clarifying
 * examples read as secondary detail.
 */
export function LabelText({ text }: { text: string }) {
  const parts = text.split(/(\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("(") && part.endsWith(")") ? (
          <span key={i} className="text-xs font-normal text-stone-500">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
