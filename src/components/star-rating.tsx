import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = 16,
  className,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  className?: string;
}) {
  const interactive = !!onChange;
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          className={cn(
            interactive && "hover:scale-110 transition-transform",
            !interactive && "cursor-default",
          )}
          aria-label={`${i} star`}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(i <= value ? "fill-warning text-warning" : "text-muted-foreground/40")}
          />
        </button>
      ))}
    </div>
  );
}
