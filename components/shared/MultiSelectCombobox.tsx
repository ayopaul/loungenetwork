"use client";

import * as React from "react";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  selectedValues?: string[]; // ✅ now optional
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export function MultiSelectCombobox({
  options,
  selectedValues = [], // ✅ default to empty array
  onChange,
  placeholder = "Select options",
}: Props) {
  const [open, setOpen] = React.useState(false);

  function toggleSelection(value: string) {
    const exists = selectedValues.includes(value);
    const next = exists
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(next);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {Array.isArray(selectedValues) && selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => toggleSelection(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValues.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
