"use client"
import { Plus, Trash2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Condition } from "@/types/karabiner"
import { CONDITION_TYPES, KEYBOARD_TYPES } from "@/lib/constants"

interface ConditionEditorProps {
  conditions: Condition[]
  onChange: (conditions: Condition[]) => void
}

export function ConditionEditor({ conditions, onChange }: ConditionEditorProps) {
  const addCondition = () => {
    const newCondition: Condition = {
      type: "frontmost_application_if",
      bundle_identifiers: ["^com\\.example\\.app$"],
    }
    onChange([...conditions, newCondition])
  }

  const deleteCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (index: number, updated: Condition) => {
    const newConditions = [...conditions]
    newConditions[index] = updated
    onChange(newConditions)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Conditions</Label>
        <Button size="sm" variant="outline" onClick={addCondition} className="bg-transparent">
          <Plus className="mr-2 h-3 w-3" />
          Add Condition
        </Button>
      </div>

      {conditions.length === 0 && (
        <p className="text-xs text-muted-foreground">No conditions. This manipulator will apply in all contexts.</p>
      )}

      <div className="space-y-2">
        {conditions.map((condition, index) => (
          <ConditionItem
            key={index}
            condition={condition}
            onUpdate={(updated) => updateCondition(index, updated)}
            onDelete={() => deleteCondition(index)}
          />
        ))}
      </div>
    </div>
  )
}

function ConditionItem({
  condition,
  onUpdate,
  onDelete,
}: {
  condition: Condition
  onUpdate: (condition: Condition) => void
  onDelete: () => void
}) {
  const updateType = (type: string) => {
    // Reset condition fields when type changes
    const newCondition: Condition = { type }

    // Set default values based on type
    if (type.includes("frontmost_application")) {
      newCondition.bundle_identifiers = ["^com\\.example\\.app$"]
    } else if (type.includes("device")) {
      newCondition.identifiers = [{ vendor_id: 1452, product_id: 0 }]
    } else if (type.includes("keyboard_type")) {
      newCondition.keyboard_types = ["ansi"]
    } else if (type.includes("input_source")) {
      newCondition.input_source_id = ["^com\\.apple\\.keylayout\\.US$"]
    } else if (type.includes("variable")) {
      newCondition.name = "variable_name"
      newCondition.value = 1
    }

    onUpdate(newCondition)
  }

  const addBundleIdentifier = () => {
    const identifiers = condition.bundle_identifiers || []
    onUpdate({ ...condition, bundle_identifiers: [...identifiers, "^com\\.example\\.app$"] })
  }

  const updateBundleIdentifier = (index: number, value: string) => {
    const identifiers = [...(condition.bundle_identifiers || [])]
    identifiers[index] = value
    onUpdate({ ...condition, bundle_identifiers: identifiers })
  }

  const deleteBundleIdentifier = (index: number) => {
    const identifiers = (condition.bundle_identifiers || []).filter((_, i) => i !== index)
    onUpdate({ ...condition, bundle_identifiers: identifiers })
  }

  return (
    <Card className="p-3 bg-muted/30">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Select value={condition.type} onValueChange={updateType}>
            <SelectTrigger className="w-[250px] cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5}>
              <ScrollArea className="h-[200px]">
                {CONDITION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
          <Button size="icon" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Frontmost Application Condition */}
        {condition.type.includes("frontmost_application") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Bundle Identifiers (regex)</Label>
              <Button size="sm" variant="ghost" onClick={addBundleIdentifier}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {condition.bundle_identifiers?.map((identifier, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={identifier}
                  onChange={(e) => updateBundleIdentifier(index, e.target.value)}
                  placeholder="^com\.example\.app$"
                  className="font-mono text-xs"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteBundleIdentifier(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Example: ^com\.google\.Chrome$ for Chrome browser</p>
          </div>
        )}

        {/* Variable Condition */}
        {condition.type.includes("variable") && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Variable Name</Label>
              <Input
                value={condition.name || ""}
                onChange={(e) => onUpdate({ ...condition, name: e.target.value })}
                placeholder="variable_name"
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input
                type="number"
                value={condition.value || 0}
                onChange={(e) => onUpdate({ ...condition, value: Number.parseInt(e.target.value) || 0 })}
                className="text-xs"
              />
            </div>
          </div>
        )}

        {/* Keyboard Type Condition */}
        {condition.type.includes("keyboard_type") && (
          <div className="space-y-1">
            <Label className="text-xs">Keyboard Type</Label>
            <Select
              value={condition.keyboard_types?.[0] || "ansi"}
              onValueChange={(value) => onUpdate({ ...condition, keyboard_types: [value] })}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KEYBOARD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Input Source Condition */}
        {condition.type.includes("input_source") && (
          <div className="space-y-1">
            <Label className="text-xs">Input Source ID (regex)</Label>
            <Input
              value={condition.input_source_id?.[0] || ""}
              onChange={(e) => onUpdate({ ...condition, input_source_id: [e.target.value] })}
              placeholder="^com\.apple\.keylayout\.US$"
              className="font-mono text-xs"
            />
          </div>
        )}

        {/* Device Condition */}
        {condition.type.includes("device") && (
          <div className="space-y-2">
            <Label className="text-xs">Device Identifiers</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Vendor ID</Label>
                <Input
                  type="number"
                  value={condition.identifiers?.[0]?.vendor_id || 0}
                  onChange={(e) =>
                    onUpdate({
                      ...condition,
                      identifiers: [
                        {
                          ...(condition.identifiers?.[0] || {}),
                          vendor_id: Number.parseInt(e.target.value) || 0,
                        },
                      ],
                    })
                  }
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Product ID</Label>
                <Input
                  type="number"
                  value={condition.identifiers?.[0]?.product_id || 0}
                  onChange={(e) =>
                    onUpdate({
                      ...condition,
                      identifiers: [
                        {
                          ...(condition.identifiers?.[0] || {}),
                          product_id: Number.parseInt(e.target.value) || 0,
                        },
                      ],
                    })
                  }
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
