import { CheckCircle2, ShieldAlert, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "pending" | "verified" | "flagged" | "rejected";

const CFG: Record<Status, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  verified: {
    label: "Verified",
    cls: "bg-success/15 text-success border-success/30",
    Icon: CheckCircle2,
  },
  pending: {
    label: "Pending review",
    cls: "bg-warning/15 text-warning-foreground border-warning/40",
    Icon: Clock,
  },
  flagged: {
    label: "Flagged",
    cls: "bg-destructive/15 text-destructive border-destructive/30",
    Icon: ShieldAlert,
  },
  rejected: {
    label: "Rejected",
    cls: "bg-muted text-muted-foreground border-border",
    Icon: XCircle,
  },
};

export function VerifiedBadge({ status, className }: { status: Status; className?: string }) {
  const { label, cls, Icon } = CFG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cls,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
  );
}
