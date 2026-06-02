import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-slate-100",
        "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent",
        "after:animate-shimmer after:[background-size:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
