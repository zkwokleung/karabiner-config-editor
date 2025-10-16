"use client"

import { useState, useMemo } from "react"
import { Plus, Trash2, ChevronDown, ChevronRight, Settings, Search, GripVertical, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Rule, Manipulator, Modifiers } from "@/types/karabiner"
import { useToast } from "@/hooks/use-toast"
import { ConditionEditor } from "@/components/condition-editor"
import { ToEventEditor } from "@/components/to-event-editor"
import { ModifierSelector } from "@/components/modifier-selector"
import { KeyInput } from "@/components/key-input"
import { RuleTemplates } from "@/components/rule-templates"
import { findConflictingManipulators } from "@/lib/validation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface ComplexModificationsEditorProps {
  rules: Rule[]
  onRulesChange: (rules: Rule[]) => void
}

export function ComplexModificationsEditor({ rules, onRulesChange }: ComplexModificationsEditorProps) {
  const { toast } = useToast()
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set([0]))
  const [searchQuery, setSearchQuery] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) return rules.map((rule, index) => ({ rule, originalIndex: index }))

    const query = searchQuery.toLowerCase()
    return rules
      .map((rule, index) => ({ rule, originalIndex: index }))
      .filter(({ rule }) => {
        if (rule.description.toLowerCase().includes(query)) return true

        return rule.manipulators.some((m) => {
          const fromKey = m.from.key_code || m.from.consumer_key_code || ""
          return fromKey.toLowerCase().includes(query)
        })
      })
  }, [rules, searchQuery])

  const conflicts = useMemo(() => findConflictingManipulators(rules), [rules])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = rules.findIndex((_, i) => i === active.id)
      const newIndex = rules.findIndex((_, i) => i === over.id)

      const newRules = arrayMove(rules, oldIndex, newIndex)
      onRulesChange(newRules)
      toast({
        title: "Rule reordered",
        description: "Rule order has been updated",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Complex Modifications</h3>
          <p className="text-sm text-muted-foreground">Advanced key remapping with conditions and modifiers</p>
        </div>
        <div className="flex items-center gap-2">
          <RuleTemplates
            onAddRule={(rule) => {
              onRulesChange([...rules, rule])
              setExpandedRules(new Set([...expandedRules, rules.length]))
            }}
          />
          <Button
            onClick={() => {
              const newRule: Rule = {
                description: "New Rule",
                manipulators: [],
              }
              onRulesChange([...rules, newRule])
              setExpandedRules(new Set([...expandedRules, rules.length]))
              toast({
                title: "Rule added",
                description: "New complex modification rule created",
              })
            }}
            size="sm"
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search rules by description or key..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Conflicting key mappings detected:</p>
              <ul className="list-disc list-inside text-sm">
                {conflicts.map((conflict, i) => (
                  <li key={i}>{conflict}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {filteredRules.length === 0 && !searchQuery && (
            <Card className="p-8">
              <p className="text-sm text-muted-foreground text-center">
                No complex modification rules yet. Add one to create advanced key mappings.
              </p>
            </Card>
          )}

          {filteredRules.length === 0 && searchQuery && (
            <Card className="p-8">
              <p className="text-sm text-muted-foreground text-center">No rules match your search query.</p>
            </Card>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rules.map((_, i) => i)} strategy={verticalListSortingStrategy}>
              {filteredRules.map(({ rule, originalIndex }) => (
                <SortableRuleCard
                  key={originalIndex}
                  rule={rule}
                  ruleIndex={originalIndex}
                  isExpanded={expandedRules.has(originalIndex)}
                  onToggle={() =>
                    setExpandedRules((prev) => {
                      const newSet = new Set(prev)
                      if (newSet.has(originalIndex)) {
                        newSet.delete(originalIndex)
                      } else {
                        newSet.add(originalIndex)
                      }
                      return newSet
                    })
                  }
                  onDelete={() => {
                    const newRules = rules.filter((_, i) => i !== originalIndex)
                    onRulesChange(newRules)
                    toast({
                      title: "Rule deleted",
                      description: "Complex modification rule removed",
                    })
                  }}
                  onUpdateDescription={(desc) => {
                    const newRules = [...rules]
                    newRules[originalIndex].description = desc
                    onRulesChange(newRules)
                  }}
                  onAddManipulator={() => {
                    const newManipulator: Manipulator = {
                      type: "basic",
                      from: {
                        key_code: "caps_lock",
                      },
                      to: [
                        {
                          key_code: "left_control",
                        },
                      ],
                    }
                    const newRules = [...rules]
                    newRules[originalIndex].manipulators.push(newManipulator)
                    onRulesChange(newRules)
                    toast({
                      title: "Manipulator added",
                      description: "New key manipulator created",
                    })
                  }}
                  onDeleteManipulator={(mIndex) => {
                    const newRules = [...rules]
                    newRules[originalIndex].manipulators.splice(mIndex, 1)
                    onRulesChange(newRules)
                    toast({
                      title: "Manipulator deleted",
                      description: "Key manipulator removed",
                    })
                  }}
                  onUpdateManipulator={(mIndex, m) => {
                    const newRules = [...rules]
                    newRules[originalIndex].manipulators[mIndex] = m
                    onRulesChange(newRules)
                  }}
                  onReorderManipulators={(newManipulators) => {
                    const newRules = [...rules]
                    newRules[originalIndex].manipulators = newManipulators
                    onRulesChange(newRules)
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  )
}

function SortableRuleCard({
  rule,
  ruleIndex,
  isExpanded,
  onToggle,
  onDelete,
  onUpdateDescription,
  onAddManipulator,
  onDeleteManipulator,
  onUpdateManipulator,
  onReorderManipulators,
}: {
  rule: Rule
  ruleIndex: number
  isExpanded: boolean
  onToggle: () => void
  onDelete: () => void
  onUpdateDescription: (desc: string) => void
  onAddManipulator: () => void
  onDeleteManipulator: (index: number) => void
  onUpdateManipulator: (index: number, m: Manipulator) => void
  onReorderManipulators: (manipulators: Manipulator[]) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ruleIndex })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const manipulatorSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleManipulatorDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = rule.manipulators.findIndex((_, i) => i === active.id)
      const newIndex = rule.manipulators.findIndex((_, i) => i === over.id)

      const newManipulators = arrayMove(rule.manipulators, oldIndex, newIndex)
      onReorderManipulators(newManipulators)
    }
  }

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <div className="flex items-center justify-between gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          <CollapsibleTrigger className="flex items-center gap-2 flex-1 cursor-pointer">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <div className="flex items-center gap-3 flex-1">
              <span className="font-medium">{rule.description}</span>
              <Badge variant="secondary">
                {rule.manipulators.length} manipulator{rule.manipulators.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CollapsibleTrigger>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CollapsibleContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Rule Description</Label>
            <Input
              value={rule.description}
              onChange={(e) => onUpdateDescription(e.target.value)}
              placeholder="Describe what this rule does"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Manipulators</Label>
              <Button size="sm" variant="outline" onClick={onAddManipulator} className="cursor-pointer bg-transparent">
                <Plus className="mr-2 h-3 w-3" />
                Add Manipulator
              </Button>
            </div>

            <DndContext
              sensors={manipulatorSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleManipulatorDragEnd}
            >
              <SortableContext items={rule.manipulators.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                {rule.manipulators.map((manipulator, manipulatorIndex) => (
                  <SortableManipulatorEditor
                    key={manipulatorIndex}
                    manipulator={manipulator}
                    manipulatorIndex={manipulatorIndex}
                    onUpdate={(updated) => onUpdateManipulator(manipulatorIndex, updated)}
                    onDelete={() => onDeleteManipulator(manipulatorIndex)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function SortableManipulatorEditor({
  manipulator,
  manipulatorIndex,
  onUpdate,
  onDelete,
}: {
  manipulator: Manipulator
  manipulatorIndex: number
  onUpdate: (manipulator: Manipulator) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: manipulatorIndex,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ManipulatorEditor
        manipulator={manipulator}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  )
}

function ManipulatorEditor({
  manipulator,
  onUpdate,
  onDelete,
  dragHandleProps,
}: {
  manipulator: Manipulator
  onUpdate: (manipulator: Manipulator) => void
  onDelete: () => void
  dragHandleProps?: any
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFromKey = (key: string) => {
    onUpdate({
      ...manipulator,
      from: { ...manipulator.from, key_code: key },
    })
  }

  const updateFromModifiers = (type: "mandatory" | "optional", modifiers: string[]) => {
    const newModifiers: Modifiers = { ...manipulator.from.modifiers }
    newModifiers[type] = modifiers
    onUpdate({
      ...manipulator,
      from: { ...manipulator.from, modifiers: newModifiers },
    })
  }

  const updateToKey = (key: string) => {
    const newTo = [...(manipulator.to || [])]
    if (newTo.length === 0) {
      newTo.push({ key_code: key })
    } else {
      newTo[0] = { ...newTo[0], key_code: key }
    }
    onUpdate({ ...manipulator, to: newTo })
  }

  const addToEvent = () => {
    const newTo = [...(manipulator.to || []), { key_code: "a" }]
    onUpdate({ ...manipulator, to: newTo })
  }

  const deleteToEvent = (index: number) => {
    const newTo = (manipulator.to || []).filter((_, i) => i !== index)
    onUpdate({ ...manipulator, to: newTo })
  }

  const updateToIfAlone = (key: string) => {
    onUpdate({
      ...manipulator,
      to_if_alone: [{ key_code: key }],
    })
  }

  const updateToIfHeldDown = (key: string) => {
    onUpdate({
      ...manipulator,
      to_if_held_down: [{ key_code: key }],
    })
  }

  const clearField = (field: "to_if_alone" | "to_if_held_down" | "to_after_key_up") => {
    const updated = { ...manipulator }
    delete updated[field]
    onUpdate(updated)
  }

  const updateToAfterKeyUp = (events: any[]) => {
    if (events.length === 0) {
      const updated = { ...manipulator }
      delete updated.to_after_key_up
      onUpdate(updated)
    } else {
      onUpdate({ ...manipulator, to_after_key_up: events })
    }
  }

  const updateConditions = (conditions: any[]) => {
    if (conditions.length === 0) {
      const updated = { ...manipulator }
      delete updated.conditions
      onUpdate(updated)
    } else {
      onUpdate({ ...manipulator, conditions })
    }
  }

  return (
    <Card className="p-4 bg-muted/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {dragHandleProps && (
            <div
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <Badge variant="outline">Type: {manipulator.type}</Badge>
          <Button size="icon" variant="ghost" onClick={onDelete} className="cursor-pointer">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold">From Key</Label>
          <KeyInput
            value={manipulator.from.key_code || ""}
            onChange={updateFromKey}
            placeholder="Select or type key to remap"
          />

          <div className="grid grid-cols-2 gap-3">
            <ModifierSelector
              selected={manipulator.from.modifiers?.mandatory || []}
              onChange={(mods) => updateFromModifiers("mandatory", mods)}
              label="Mandatory Modifiers"
            />
            <ModifierSelector
              selected={manipulator.from.modifiers?.optional || []}
              onChange={(mods) => updateFromModifiers("optional", mods)}
              label="Optional Modifiers"
            />
          </div>
        </div>

        <Separator />

        <ToEventEditor
          events={manipulator.to || []}
          onChange={(events) => onUpdate({ ...manipulator, to: events })}
          label="To Events"
        />

        <Separator />

        <ConditionEditor conditions={manipulator.conditions || []} onChange={updateConditions} />

        <Separator />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </Button>

        {showAdvanced && (
          <div className="space-y-3 pt-2">
            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">To If Alone (when pressed alone)</Label>
                {manipulator.to_if_alone && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => clearField("to_if_alone")}
                    className="cursor-pointer"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <ToEventEditor
                events={manipulator.to_if_alone || []}
                onChange={(events) => {
                  if (events.length === 0) {
                    const updated = { ...manipulator }
                    delete updated.to_if_alone
                    onUpdate(updated)
                  } else {
                    onUpdate({ ...manipulator, to_if_alone: events })
                  }
                }}
                label=""
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">To If Held Down (when held)</Label>
                {manipulator.to_if_held_down && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => clearField("to_if_held_down")}
                    className="cursor-pointer"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <ToEventEditor
                events={manipulator.to_if_held_down || []}
                onChange={(events) => {
                  if (events.length === 0) {
                    const updated = { ...manipulator }
                    delete updated.to_if_held_down
                    onUpdate(updated)
                  } else {
                    onUpdate({ ...manipulator, to_if_held_down: events })
                  }
                }}
                label=""
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">To After Key Up (after key released)</Label>
              <ToEventEditor events={manipulator.to_after_key_up || []} onChange={updateToAfterKeyUp} label="" />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
