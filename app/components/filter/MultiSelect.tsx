"use client";

import { X, ChevronDown } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import { Badge } from "../../../components/ui/badge";

type MultiSelectProps = {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  isOpen: boolean;
  setOpen: () => void;
};

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Pilih opsi...",
  isOpen,
  setOpen,
}: MultiSelectProps) {
  const handleUnselect = (option: string) => {
    onChange(selected.filter((s) => s !== option));
  };

  const selectables = options.filter((option) => !selected.includes(option));

  const toggleSelectAll = () => {
    onChange(options);
    setOpen();
  };

  return (
    <div className="relative w-full">
      <div
        className="flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white shadow-sm"
        onClick={setOpen}
      >
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selected.map((option) => (
              <Badge key={option} className="flex items-center gap-1">
                {option}
                <button
                  className="ml-1 rounded-full focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(option);
                  }}
                >
                  <X className="h-3 w-3 text-gray-500 hover:text-black" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute w-full mt-2 rounded-md border bg-white shadow-lg z-10">
          <Command>
            <CommandList>
              <CommandItem
                onSelect={toggleSelectAll}
                className="cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-md font-semibold"
              >
                Pilih Semua
              </CommandItem>
              <CommandGroup>
                {selectables.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      onChange([...selected, option]);
                      setOpen();
                    }}
                    className="cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-md"
                  >
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}