type SurfaceCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className = "" }: SurfaceCardProps) {
  return (
    <div
      className={`rounded-[28px] border border-line bg-surface-dark backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
