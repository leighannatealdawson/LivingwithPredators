import { forwardRef, type InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { error, className = "", ...rest },
  ref,
) {
  const borderCls = error ? "border-red-500 focus:ring-red-500" : "border-stone-300 focus:ring-forest-600";
  return (
    <input
      ref={ref}
      aria-invalid={error ? "true" : undefined}
      className={`w-full rounded-xl border bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-offset-0 ${borderCls} ${className}`}
      {...rest}
    />
  );
});
