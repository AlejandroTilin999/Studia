import * as React from "react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right";
}

export function SheetContent({ className, side = "left", children, ...props }: SheetContentProps) {
  return (
    <div
      className={cn(
        "fixed inset-y-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-out animate-in",
        side === "left" ? "left-0 slide-in-from-left" : "right-0 slide-in-from-right",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SheetTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold text-slate-900", className)} {...props}>
      {children}
    </h2>
  );
}
