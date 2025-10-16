"use client"

import { useState } from "react"
import { Plus, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { Rule } from "@/types/karabiner"
import { useToast } from "@/hooks/use-toast"

interface RuleTemplatesProps {
  onAddRule: (rule: Rule) => void
}

/**
 * Common Karabiner rule templates for quick setup
 */
const RULE_TEMPLATES: Array<{ name: string; description: string; rule: Rule; category: string }> = [
  {
    name: "Caps Lock → Escape",
    description: "Remap Caps Lock to Escape when pressed alone, Control when held",
    category: "Basic",
    rule: {
      description: "Caps Lock to Escape/Control",
      manipulators: [
        {
          type: "basic",
          from: { key_code: "caps_lock" },
          to: [{ key_code: "left_control" }],
          to_if_alone: [{ key_code: "escape" }],
        },
      ],
    },
  },
  {
    name: "Hyper Key",
    description: "Convert Caps Lock to Hyper key (Cmd+Ctrl+Opt+Shift)",
    category: "Advanced",
    rule: {
      description: "Caps Lock to Hyper Key",
      manipulators: [
        {
          type: "basic",
          from: { key_code: "caps_lock" },
          to: [
            {
              key_code: "left_shift",
              modifiers: ["left_command", "left_control", "left_option"],
            },
          ],
        },
      ],
    },
  },
  {
    name: "Vim Navigation (HJKL)",
    description: "Use Caps Lock + HJKL for arrow keys",
    category: "Navigation",
    rule: {
      description: "Vim-style navigation with Caps Lock",
      manipulators: [
        {
          type: "basic",
          from: { key_code: "h", modifiers: { mandatory: ["caps_lock"] } },
          to: [{ key_code: "left_arrow" }],
        },
        {
          type: "basic",
          from: { key_code: "j", modifiers: { mandatory: ["caps_lock"] } },
          to: [{ key_code: "down_arrow" }],
        },
        {
          type: "basic",
          from: { key_code: "k", modifiers: { mandatory: ["caps_lock"] } },
          to: [{ key_code: "up_arrow" }],
        },
        {
          type: "basic",
          from: { key_code: "l", modifiers: { mandatory: ["caps_lock"] } },
          to: [{ key_code: "right_arrow" }],
        },
      ],
    },
  },
  {
    name: "Right Command → Language Switch",
    description: "Switch input source with right command key",
    category: "Input Source",
    rule: {
      description: "Right Command to switch input source",
      manipulators: [
        {
          type: "basic",
          from: { key_code: "right_command" },
          to: [{ key_code: "right_command" }],
          to_if_alone: [
            {
              select_input_source: {
                language: "en",
              },
            },
          ],
        },
      ],
    },
  },
  {
    name: "Spacebar → Shift (when held)",
    description: "Use spacebar as shift when held down",
    category: "Advanced",
    rule: {
      description: "Spacebar to Shift when held",
      manipulators: [
        {
          type: "basic",
          from: { key_code: "spacebar" },
          to: [{ key_code: "spacebar" }],
          to_if_held_down: [{ key_code: "left_shift" }],
        },
      ],
    },
  },
  {
    name: "Disable Caps Lock",
    description: "Completely disable Caps Lock key",
    category: "Basic",
    rule: {
      description: "Disable Caps Lock",
      manipulators: [
        {
          type: "basic",
          from: { key_code: "caps_lock" },
          to: [],
        },
      ],
    },
  },
]

export function RuleTemplates({ onAddRule }: RuleTemplatesProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleAddTemplate = (template: (typeof RULE_TEMPLATES)[0]) => {
    onAddRule(template.rule)
    setOpen(false)
    toast({
      title: "Template added",
      description: `${template.name} has been added to your profile`,
    })
  }

  const categories = Array.from(new Set(RULE_TEMPLATES.map((t) => t.category)))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Copy className="mr-2 h-4 w-4" />
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Rule Templates</DialogTitle>
          <DialogDescription>Choose from common Karabiner configurations to get started quickly</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">{category}</h3>
                <div className="grid gap-3">
                  {RULE_TEMPLATES.filter((t) => t.category === category).map((template, index) => (
                    <Card key={index} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{template.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {template.rule.manipulators.length} manipulator
                              {template.rule.manipulators.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAddTemplate(template)}>
                          <Plus className="mr-2 h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
