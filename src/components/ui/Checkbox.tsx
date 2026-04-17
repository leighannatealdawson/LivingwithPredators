import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className = "", ...rest },
  ref,
) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        ref={ref}
        type="checkbox"
        className={`mt-1 h-5 w-5 flex-shrink-0 rounded border-stone-400 text-forest-700 focus:ring-forest-600 ${className}`}
        {...rest}
      />
      <span className="text-stone-900 leading-snug">{label}</span>
    </label>
  );
});
