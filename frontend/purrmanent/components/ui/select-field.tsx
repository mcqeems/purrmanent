"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Fully custom dropdown (Radix Select) — replaces the default-styled native
 * <select>. Controlled: pass value + onValueChange. Works with RHF via
 * <Controller> (render={({field}) => <SelectField value={field.value} onValueChange={field.onChange} ... />}).
 */
export function SelectField({
  value,
  onValueChange,
  options,
  placeholder = "Choose…",
  id,
  className,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
}) {
  return (
    <SelectPrimitive.Root value={value || undefined} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          "flex w-full items-center justify-between rounded-sm border border-hairline-cool bg-surface-canvas-light px-3 py-2 text-left text-ink-deep focus:border-accent-violet data-[placeholder]:text-muted/70",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown size={16} className="text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-60 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-hairline-cloud bg-surface-canvas-light shadow-[rgba(0,0,0,0.1)_0_10px_15px_-3px]"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className="flex cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-sm text-ink-deep outline-none data-[highlighted]:bg-surface-press-light data-[state=checked]:font-semibold"
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check size={14} className="text-accent-violet" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
