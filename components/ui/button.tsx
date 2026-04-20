"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-white text-slate-950 hover:bg-slate-200",
        secondary: "border border-white/12 bg-white/6 text-white hover:bg-white/10",
        danger: "bg-red-500 text-white hover:bg-red-400"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />;
  }
);

Button.displayName = "Button";
