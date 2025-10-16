"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { MODIFIERS } from "@/lib/constants"

interface ModifierSelectorProps {
  selected: string[]
  onChange: (modifiers: string[]) => void
  label: string
}

export function ModifierSelector({ selected, onChange, label }: ModifierSelectorProps) {
  const toggleModifier = (modifier: string) => {
    if (selected.includes(modifier)) {
      onChange(selected.filter((m) => m !== modifier))
    } else {
      onChange([...selected, modifier])
    }
  }

  const removeModifier = (modifier: string) => {
    onChange(selected.filter((m) => m !== modifier))
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-2 items-center">
        {selected.map((modifier) => (
          <Badge key={modifier} variant="secondary" className="gap-1">
            {modifier}
            <X className="h-3 w-3 cursor-pointer" onClick={() => removeModifier(modifier)} />
          </Badge>
        ))}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="cursor-pointer bg-transparent">
              {selected.length === 0 ? "Add Modifiers" : "Edit"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{label}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {MODIFIERS.map((modifier) => (
                <div key={modifier} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${label}-${modifier}`}
                    checked={selected.includes(modifier)}
                    onCheckedChange={() => toggleModifier(modifier)}
                  />
                  <Label htmlFor={`${label}-${modifier}`} className="text-sm cursor-pointer">
                    {modifier}
                  </Label>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
