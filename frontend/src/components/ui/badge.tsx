type BadgeProps = {
  children: React.ReactNode;
  tone?: "lime" | "violet" | "red" | "dark";
  className?: string;
};

const tones = {
  lime: "bg-lime text-ink",
  violet: "bg-violet text-white",
  red: "bg-red text-white",
  dark: "bg-ink text-white",
};

export function Badge({ children, tone = "violet", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
