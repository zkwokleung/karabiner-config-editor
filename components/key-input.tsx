"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { COMMON_KEYS } from "@/lib/constants"

interface KeyInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

/**
 * Combobox component for key selection with search/filter capability
 * Allows both dropdown selection and direct typing of key names
 */
export function KeyInput({ value, onChange, placeholder = "Select or type key..." }: KeyInputProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-mono bg-transparent"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search or type key name..." value={searchValue} onValueChange={setSearchValue} />
          <CommandList>
            <CommandEmpty>
              <div className="p-2 text-sm">
                <p className="text-muted-foreground mb-2">No matching key found.</p>
                {searchValue && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      onChange(searchValue)
                      setOpen(false)
                      setSearchValue("")
                    }}
                  >
                    Use &quot;{searchValue}&quot;
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[300px]">
                {COMMON_KEYS.filter((key) => key.toLowerCase().includes(searchValue.toLowerCase())).map((key) => (
                  <CommandItem
                    key={key}
                    value={key}
                    onSelect={(currentValue) => {
                      onChange(currentValue)
                      setOpen(false)
                      setSearchValue("")
                    }}
                    className="cursor-pointer"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === key ? "opacity-100" : "opacity-0")} />
                    <span className="font-mono">{key}</span>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
