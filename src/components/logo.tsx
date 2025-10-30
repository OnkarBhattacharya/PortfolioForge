import { cn } from "@/lib/utils";
import { Layers3 } from "lucide-react";

export function Logo({ className, textClassName }: { className?: string, textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Layers3 className="h-6 w-6 text-primary" />
      <span className={cn("font-headline text-lg font-bold", textClassName)}>
        PortfolioForge
      </span>
    </div>
  );
}

    