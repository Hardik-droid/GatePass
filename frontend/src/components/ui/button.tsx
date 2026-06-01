import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "ghost" | "light";
  className?: string;
};

const styles = {
  solid: "bg-ink text-white hover:bg-violet",
  ghost: "border border-line bg-white/5 text-white hover:bg-white/10",
  light: "bg-ink text-white hover:bg-violet",
};

export function Button({
  children,
  href,
  variant = "solid",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] transition-colors";
  const computed = `${base} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={computed}>
        {children}
      </Link>
    );
  }

  return <button type={type} className={computed} {...props}>{children}</button>;
}
