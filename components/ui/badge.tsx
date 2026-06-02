import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200",
        destructive:
          "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
        outline:
          "border-slate-200 text-slate-600 bg-transparent",
        success:
          "border-transparent bg-teal-100 text-teal-700 hover:bg-teal-200",
        warning:
          "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200",
        info:
          "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
        // Channel badges
        whatsapp:
          "border-transparent bg-green-100 text-green-700",
        voice:
          "border-transparent bg-blue-100 text-blue-700",
        dashboard:
          "border-transparent bg-slate-100 text-slate-600",
        calcom:
          "border-transparent bg-violet-100 text-violet-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
