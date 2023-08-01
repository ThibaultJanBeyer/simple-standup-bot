"use client";

import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "../utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:scale-105 hover:underline hover:box-shadow",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
        destructive:
          "border bg-red-600 bg-opacity-10 border-input border-red-500 hover:bg-opacity-80 rounded-md",
        outline:
          "border bg-white bg-opacity-10 border-input hover:bg-accent hover:text-accent-foreground rounded-md",
        outlinePrimary: "border-gradient box-glow text-blue",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md",
        ghost: "",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      onClick,
      variant,
      loading,
      size,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const [isLoading, setIsLoading] = React.useState(loading);

    const handleClick = (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
      if (!isLoading && loading !== undefined) {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 10000);
      }
      if (onClick) onClick(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <>
            <span className="absolute left-4 animate-spin">⟲</span>
            <span className="mr-4" />
          </>
        )}
        <Slottable>{children}</Slottable>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
