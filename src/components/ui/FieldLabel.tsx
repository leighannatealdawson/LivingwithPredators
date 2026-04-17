import type { ReactNode } from "react";

interface FieldLabelProps {
  id?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldLabel({ id, required, children }: FieldLabelProps) {
  return (
    <h3 id={id} className="!font-sans !text-base font-semibold !text-stone-900 leading-snug">
      {children}
      {required && (
        <span aria-hidden="true" className="ml-1 text-forest-700">
          *
        </span>
      )}
    </h3>
  );
}

interface HelperTextProps {
  children: ReactNode;
  tone?: "info" | "warning" | "error";
  id?: string;
}

export function HelperText({ children, tone = "info", id }: HelperTextProps) {
  const toneCls = {
    info: "text-stone-600",
    warning: "text-amber",
    error: "text-red-600",
  }[tone];
  return (
    <p id={id} className={`text-sm ${toneCls}`}>
      {children}
    </p>
  );
}
