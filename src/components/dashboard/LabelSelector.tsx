import { useState } from "react";
import { Check, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface LabelSelectorProps {
  selectedLabels: string[];
  allLabels: string[];
  onLabelsChange: (labels: string[]) => void;
}

export function LabelSelector({ selectedLabels, allLabels, onLabelsChange }: LabelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSelectLabel = (label: string) => {
    if (selectedLabels.includes(label)) {
      onLabelsChange(selectedLabels.filter((l) => l !== label));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  };

  const handleCreateLabel = () => {
    if (inputValue && !allLabels.includes(inputValue)) {
      handleSelectLabel(inputValue);
      setInputValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 border-dashed gap-1">
          <Tag className="h-4 w-4" />
          {selectedLabels.length > 0 ? (
            <>
              <span className="hidden sm:inline">Labels</span>
              <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal lg:hidden">
                {selectedLabels.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedLabels.length > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedLabels.length} selected
                  </Badge>
                ) : (
                  selectedLabels.map((label) => (
                    <Badge variant="secondary" key={label} className="rounded-sm px-1 font-normal">
                      {label}
                    </Badge>
                  ))
                )}
              </div>
            </>
          ) : (
            "Add Label"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Label..." 
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-2">
                {inputValue ? (
                    <button 
                        className="w-full text-left text-sm text-primary flex items-center gap-2 p-1 rounded hover:bg-muted"
                        onClick={handleCreateLabel}
                    >
                        <Plus className="h-3 w-3" /> Create "{inputValue}"
                    </button>
                ) : "No labels found."}
            </CommandEmpty>
            <CommandGroup heading="Labels">
              {allLabels.map((label) => (
                <CommandItem
                  key={label}
                  value={label}
                  onSelect={() => handleSelectLabel(label)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedLabels.includes(label)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className={cn("h-4 w-4")} />
                  </div>
                  <span>{label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {selectedLabels.length > 0 && (
                <>
                <CommandSeparator />
                <CommandGroup>
                    <CommandItem
                    onSelect={() => onLabelsChange([])}
                    className="justify-center text-center"
                    >
                    Clear filters
                    </CommandItem>
                </CommandGroup>
                </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
