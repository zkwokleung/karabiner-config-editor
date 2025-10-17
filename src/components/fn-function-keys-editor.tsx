"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Profile, FnFunctionKey, Device } from "@/types/karabiner"
import { useToast } from "@/hooks/use-toast"
import { COMMON_KEYS } from "@/lib/constants"

interface FnFunctionKeysEditorProps {
  profile: Profile
  onChange: (profile: Profile) => void
  deviceLabelLookup: Map<number, string>
  onAddDevice: (device: Device) => void
  onDeleteDevice: (deviceIndex: number) => void
}

// Function keys that can be remapped
const FUNCTION_KEYS = [
  "f1",
  "f2",
  "f3",
  "f4",
  "f5",
  "f6",
  "f7",
  "f8",
  "f9",
  "f10",
  "f11",
  "f12",
  "f13",
  "f14",
  "f15",
  "f16",
  "f17",
  "f18",
  "f19",
  "f20",
]

type FnTarget = { type: "profile" } | { type: "device"; deviceIndex: number }

interface FnTargetOption {
  label: string
  value: string
  target: FnTarget
}

export function FnFunctionKeysEditor({
  profile,
  onChange,
  deviceLabelLookup,
  onAddDevice,
  onDeleteDevice,
}: FnFunctionKeysEditorProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>("profile")
  const { toast } = useToast()

  const targetOptions = useMemo<FnTargetOption[]>(() => {
    const options: FnTargetOption[] = [
      {
        label: "All devices",
        value: "profile",
        target: { type: "profile" },
      },
    ]

    profile.devices?.forEach((device, index) => {
      options.push({
        label: deviceLabelLookup.get(index) || `Device ${index + 1}`,
        value: `device-${index}`,
        target: { type: "device", deviceIndex: index },
      })
    })

    return options
  }, [profile.devices, deviceLabelLookup])

  const selectedOption = useMemo(() => {
    return targetOptions.find((opt) => opt.value === selectedTarget) || targetOptions[0]
  }, [targetOptions, selectedTarget])

  const currentFnKeys = useMemo(() => {
    if (!selectedOption) return []

    if (selectedOption.target.type === "profile") {
      return profile.fn_function_keys || []
    } else {
      const deviceIndex = selectedOption.target.deviceIndex
      return profile.devices?.[deviceIndex]?.fn_function_keys || []
    }
  }, [profile, selectedOption])

  const addFnKey = () => {
    const newFnKey: FnFunctionKey = {
      from: { key_code: "f1" },
      to: [{ key_code: "display_brightness_decrement" }],
    }

    const newProfile = { ...profile }

    if (selectedOption.target.type === "profile") {
      if (!newProfile.fn_function_keys) {
        newProfile.fn_function_keys = []
      }
      newProfile.fn_function_keys.push(newFnKey)
    } else {
      const deviceIndex = selectedOption.target.deviceIndex
      if (!newProfile.devices?.[deviceIndex]) {
        toast({
          title: "Error",
          description: "Device not found",
          variant: "destructive",
        })
        return
      }
      if (!newProfile.devices[deviceIndex].fn_function_keys) {
        newProfile.devices[deviceIndex].fn_function_keys = []
      }
      newProfile.devices[deviceIndex].fn_function_keys!.push(newFnKey)
    }

    onChange(newProfile)
    toast({
      title: "Fn key mapping added",
      description: `Added to ${selectedOption.label}`,
    })
  }

  const deleteFnKey = (index: number) => {
    const newProfile = { ...profile }

    if (selectedOption.target.type === "profile") {
      newProfile.fn_function_keys?.splice(index, 1)
    } else {
      const deviceIndex = selectedOption.target.deviceIndex
      newProfile.devices?.[deviceIndex]?.fn_function_keys?.splice(index, 1)
    }

    onChange(newProfile)
    toast({
      title: "Fn key mapping deleted",
      description: "Function key mapping removed",
    })
  }

  const updateFnKey = (index: number, from: string, to: string) => {
    const newProfile = { ...profile }
    const newFnKey: FnFunctionKey = {
      from: { key_code: from },
      to: [{ key_code: to }],
    }

    if (selectedOption.target.type === "profile") {
      if (newProfile.fn_function_keys) {
        newProfile.fn_function_keys[index] = newFnKey
      }
    } else {
      const deviceIndex = selectedOption.target.deviceIndex
      if (newProfile.devices?.[deviceIndex]?.fn_function_keys) {
        newProfile.devices[deviceIndex].fn_function_keys![index] = newFnKey
      }
    }

    onChange(newProfile)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      {/* Device Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Device</h3>
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer bg-transparent h-8 w-8 p-0"
            onClick={() => {
              // Trigger add device - this will be handled by parent
              const device: Device = {
                identifiers: {
                  is_keyboard: true,
                },
                fn_function_keys: [],
              }
              onAddDevice(device)
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {targetOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTarget === option.value ? "bg-primary/10 border-primary" : "hover:bg-muted"
                }`}
                onClick={() => setSelectedTarget(option.value)}
              >
                <span className="text-sm font-medium">{option.label}</span>
                {option.target.type === "device" && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteDevice(option.target.deviceIndex)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Fn Keys for Selected Device */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{selectedOption?.label || "Fn Function Keys"}</h3>
            <p className="text-sm text-muted-foreground">Remap function keys (F1-F20) behavior</p>
          </div>
          <Button onClick={addFnKey} size="sm" className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {currentFnKeys.length === 0 && (
              <Card className="p-8">
                <p className="text-sm text-muted-foreground text-center">
                  No function key mappings yet. Add one to customize F1-F20 behavior.
                </p>
              </Card>
            )}

            {currentFnKeys.map((fnKey, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">From Key</Label>
                      <Select
                        value={fnKey.from.key_code || ""}
                        onValueChange={(key) =>
                          updateFnKey(
                            index,
                            key,
                            (Array.isArray(fnKey.to) ? fnKey.to[0]?.key_code : fnKey.to?.key_code) || "",
                          )
                        }
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select function key" />
                        </SelectTrigger>
                        <SelectContent>
                          {FUNCTION_KEYS.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">To Key</Label>
                      <Select
                        value={(Array.isArray(fnKey.to) ? fnKey.to[0]?.key_code : fnKey.to?.key_code) || ""}
                        onValueChange={(key) => updateFnKey(index, fnKey.from.key_code || "", key)}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select target key" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={5} className="max-h-[300px]">
                          <ScrollArea className="h-[200px]">
                            {COMMON_KEYS.map((key) => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button size="icon" variant="ghost" onClick={() => deleteFnKey(index)} className="cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
