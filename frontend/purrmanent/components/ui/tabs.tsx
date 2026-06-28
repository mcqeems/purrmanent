"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils/cn";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl bg-surface-press-light p-1",
        className,
      )}
      {...props}
    />
  );
});

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium text-on-dark-muted transition-colors data-[state=active]:bg-surface-canvas-light data-[state=active]:text-ink-deep data-[state=active]:shadow-sm",
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = TabsPrimitive.Content;
