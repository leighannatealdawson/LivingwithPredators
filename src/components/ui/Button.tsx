import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-forest-700 text-white hover:bg-forest-800 disabled:bg-stone-300 disabled:text-stone-500",
  secondary:
    "bg-white text-forest-800 border border-stone-300 hover:bg-stone-100 disabled:text-stone-400 disabled:bg-stone-50",
  ghost: "bg-transparent text-forest-800 hover:bg-stone-100 disabled:text-stone-400",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", type = "button", ...rest },
  ref,
) {
  const cls = [
    "inline-flex items-center justify-center rounded-xl font-medium",
    "transition-colors disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className,
  ].join(" ");
  return <button ref={ref} type={type} className={cls} {...rest} />;
});
