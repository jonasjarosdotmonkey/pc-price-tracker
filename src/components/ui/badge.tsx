import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "blue" | "yellow" | "gray" | "purple";
  className?: string;
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  const variants = {
    green: "bg-green-500/15 text-green-400 border-green-500/20",
    red: "bg-red-500/15 text-red-400 border-red-500/20",
    blue: "bg-brand-500/15 text-brand-400 border-brand-500/20",
    yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    gray: "bg-surface-600 text-gray-400 border-surface-500",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
