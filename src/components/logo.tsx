import { cn } from "@/lib/utils";
import { Layers3 } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Layers3 className="h-6 w-6 text-primary" />
      <span className="font-headline text-lg font-bold text-sidebar-foreground">
        PortfolioForge
      </span>
    </div>
  );
}
