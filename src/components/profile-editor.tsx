"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { KarabinerConfig, Profile, Rule, Device, KeyCode } from "@/types/karabiner"
import { useToast } from "@/hooks/use-toast"
import { ComplexModificationsEditor } from "@/components/complex-modifications-editor"
import { FnFunctionKeysEditor } from "@/components/fn-function-keys-editor"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { KeyInput } from "@/components/key-input"
import { findDuplicateSimpleModifications, type SimpleModificationDuplicate } from "@/lib/validation"
import { Checkbox } from "@/components/ui/checkbox"

interface ProfileEditorProps {
  config: KarabinerConfig
  setConfig: (config: KarabinerConfig) => void
}

type ModificationTarget =
  | {
      type: "profile"
    }
  | {
      type: "device"
      deviceIndex: number
    }

type ModificationLocation = ModificationTarget & {
  modIndex: number
}

interface ModificationTargetOption {
  label: string
  value: string
  target: ModificationTarget
}

export function ProfileEditor({ config, setConfig }: ProfileEditorProps) {
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0)
  const [selectedDeviceTarget, setSelectedDeviceTarget] = useState<string>("profile")
  const { toast } = useToast()

  const selectedProfile = config.profiles[selectedProfileIndex]

  const duplicates: SimpleModificationDuplicate[] = findDuplicateSimpleModifications(selectedProfile)

  const deviceOptions = useMemo<ModificationTargetOption[]>(() => {
    const options: ModificationTargetOption[] = [
      {
        label: "All devices",
        value: "profile",
        target: { type: "profile" },
      },
    ]

    selectedProfile.devices?.forEach((device, index) => {
      options.push({
        label: formatDeviceLabel(device, index),
        value: `device-${index}`,
        target: { type: "device", deviceIndex: index },
      })
    })

    return options
  }, [selectedProfile.devices])

  const deviceLabelLookup = useMemo(() => {
    const map = new Map<number, string>()
    selectedProfile.devices?.forEach((device, index) => {
      map.set(index, formatDeviceLabel(device, index))
    })
    return map
  }, [selectedProfile.devices])

  const duplicateMessages = useMemo(() => {
    return duplicates.map((duplicate) =>
      duplicate.scope === "profile"
        ? `${duplicate.key} (All devices)`
        : `${duplicate.key} (${deviceLabelLookup.get(duplicate.deviceIndex ?? -1) || "Unknown device"})`,
    )
  }, [deviceLabelLookup, duplicates])

  const selectedDeviceOption = useMemo(() => {
    return deviceOptions.find((opt) => opt.value === selectedDeviceTarget) || deviceOptions[0]
  }, [deviceOptions, selectedDeviceTarget])

  const currentModifications = useMemo(() => {
    if (!selectedDeviceOption) return []

    if (selectedDeviceOption.target.type === "profile") {
      return selectedProfile.simple_modifications || []
    } else {
      const deviceIndex = selectedDeviceOption.target.deviceIndex
      return selectedProfile.devices?.[deviceIndex]?.simple_modifications || []
    }
  }, [selectedProfile, selectedDeviceOption])

  useEffect(() => {
    setSelectedDeviceTarget("profile")
  }, [selectedProfileIndex])

  const updateProfileName = (name: string) => {
    const newConfig = { ...config }
    newConfig.profiles[selectedProfileIndex].name = name
    setConfig(newConfig)
  }

  const addProfile = () => {
    const newProfile: Profile = {
      name: `Profile ${config.profiles.length + 1}`,
      selected: false,
      simple_modifications: [],
    }
    setConfig({
      ...config,
      profiles: [...config.profiles, newProfile],
    })
    setSelectedProfileIndex(config.profiles.length)
    toast({
      title: "Profile added",
      description: "New profile created successfully",
    })
  }

  const deleteProfile = (index: number) => {
    if (config.profiles.length === 1) {
      toast({
        title: "Cannot delete",
        description: "At least one profile is required",
        variant: "destructive",
      })
      return
    }
    const newProfiles = config.profiles.filter((_, i) => i !== index)
    setConfig({ ...config, profiles: newProfiles })
    setSelectedProfileIndex(Math.max(0, index - 1))
    toast({
      title: "Profile deleted",
      description: "Profile removed successfully",
    })
  }

  const addSimpleModification = (from: string, to: string, target: ModificationTarget) => {
    const newConfig = { ...config }
    const profile = newConfig.profiles[selectedProfileIndex]

    const modification = {
      from: { key_code: from },
      to: [{ key_code: to }],
    }

    if (target.type === "profile") {
      if (!profile.simple_modifications) {
        profile.simple_modifications = []
      }
      profile.simple_modifications.push(modification)
    } else {
      if (!profile.devices || !profile.devices[target.deviceIndex]) {
        toast({
          title: "Unable to add",
          description: "The selected device could not be found.",
          variant: "destructive",
        })
        return
      }
      const device = profile.devices[target.deviceIndex]
      if (!device.simple_modifications) {
        device.simple_modifications = []
      }
      device.simple_modifications.push(modification)
    }

    setConfig(newConfig)
    const targetLabel =
      target.type === "profile"
        ? "All devices"
        : deviceLabelLookup.get(target.deviceIndex) || `Device ${target.deviceIndex + 1}`
    toast({
      title: "Modification added",
      description: `${from} → ${to} (${targetLabel})`,
    })
  }

  const deleteSimpleModification = (location: ModificationLocation) => {
    const newConfig = { ...config }
    const profile = newConfig.profiles[selectedProfileIndex]

    if (location.type === "profile") {
      profile.simple_modifications?.splice(location.modIndex, 1)
    } else if (profile.devices?.[location.deviceIndex]) {
      profile.devices[location.deviceIndex].simple_modifications?.splice(location.modIndex, 1)
    } else {
      toast({
        title: "Unable to delete",
        description: "The selected device could not be found.",
        variant: "destructive",
      })
      return
    }

    setConfig(newConfig)
    const targetLabel =
      location.type === "profile"
        ? "All devices"
        : deviceLabelLookup.get(location.deviceIndex) || `Device ${location.deviceIndex + 1}`
    toast({
      title: "Modification deleted",
      description: `Removed mapping for ${targetLabel}`,
    })
  }

  const updateComplexModifications = (rules: Rule[]) => {
    const newConfig = { ...config }
    if (!newConfig.profiles[selectedProfileIndex].complex_modifications) {
      newConfig.profiles[selectedProfileIndex].complex_modifications = {
        rules: [],
      }
    }
    newConfig.profiles[selectedProfileIndex].complex_modifications!.rules = rules
    setConfig(newConfig)
  }

  const updateFnFunctionKeys = (updatedProfile: Profile) => {
    const newConfig = { ...config }
    newConfig.profiles[selectedProfileIndex] = updatedProfile
    setConfig(newConfig)
  }

  const addDevice = (device: Device) => {
    const newConfig = { ...config }
    const profile = newConfig.profiles[selectedProfileIndex]

    if (!profile.devices) {
      profile.devices = []
    }

    profile.devices.push(device)
    setConfig(newConfig)

    // Select the newly added device
    const newDeviceIndex = profile.devices.length - 1
    setSelectedDeviceTarget(`device-${newDeviceIndex}`)

    toast({
      title: "Device added",
      description: "New device configuration created successfully",
    })
  }

  const deleteDevice = (deviceIndex: number) => {
    const newConfig = { ...config }
    const profile = newConfig.profiles[selectedProfileIndex]

    if (!profile.devices || !profile.devices[deviceIndex]) {
      return
    }

    profile.devices.splice(deviceIndex, 1)
    setConfig(newConfig)

    // Switch to "All devices" after deletion
    setSelectedDeviceTarget("profile")

    toast({
      title: "Device deleted",
      description: "Device configuration removed successfully",
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Profile List */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Profiles</h3>
          <Button size="sm" onClick={addProfile}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {config.profiles.map((profile, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedProfileIndex === index ? "bg-primary/10 border-primary" : "hover:bg-muted"
                }`}
                onClick={() => setSelectedProfileIndex(index)}
              >
                <span className="text-sm font-medium truncate">{profile.name}</span>
                {config.profiles.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProfile(index)
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

      {/* Profile Editor */}
      <Card className="p-6">
        {/* Tabs for simple, fn function keys, and complex modifications */}
        <Tabs defaultValue="simple" className="w-full">
          <div className="space-y-4 mb-6">
            {/* Profile Name */}
            <div className="space-y-2">
              <Label>Profile Name</Label>
              <Input
                value={selectedProfile.name}
                onChange={(e) => updateProfileName(e.target.value)}
                placeholder="Profile name"
              />
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="simple" className="cursor-pointer">
              Simple
            </TabsTrigger>
            <TabsTrigger value="fn" className="cursor-pointer">
              Fn Keys
            </TabsTrigger>
            <TabsTrigger value="complex" className="cursor-pointer">
              Complex
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
              {/* Device Selector */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Device</h3>
                  <AddDeviceDialog onAdd={addDevice} />
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {deviceOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedDeviceTarget === option.value ? "bg-primary/10 border-primary" : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedDeviceTarget(option.value)}
                      >
                        <span className="text-sm font-medium">{option.label}</span>
                        {option.target.type === "device" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteDevice(option.target.deviceIndex)
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

              {/* Modifications for Selected Device */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedDeviceOption?.label || "Modifications"}</h3>
                  <AddModificationDialog
                    onAdd={addSimpleModification}
                    currentTarget={selectedDeviceOption?.target || { type: "profile" }}
                    currentLabel={selectedDeviceOption?.label || "All devices"}
                  />
                </div>

                {duplicateMessages.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold">Duplicate key mappings detected:</p>
                      <p className="text-sm">{duplicateMessages.join(", ")}</p>
                    </AlertDescription>
                  </Alert>
                )}

                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {currentModifications.length > 0 ? (
                      currentModifications.map((mod, index) => {
                        const toValue = Array.isArray(mod.to) ? mod.to[0] : mod.to
                        const location: ModificationLocation =
                          selectedDeviceOption?.target.type === "profile"
                            ? { type: "profile", modIndex: index }
                            : {
                                type: "device",
                                deviceIndex: selectedDeviceOption!.target.deviceIndex,
                                modIndex: index,
                              }

                        return (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                            <div className="flex items-center gap-4">
                              <code className="px-3 py-1 rounded bg-muted text-sm font-mono">
                                {formatKeyLabel(mod.from)}
                              </code>
                              <span className="text-muted-foreground">→</span>
                              <code className="px-3 py-1 rounded bg-muted text-sm font-mono">
                                {formatKeyLabel(toValue)}
                              </code>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => deleteSimpleModification(location)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No mappings for this device yet.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fn">
            <FnFunctionKeysEditor
              profile={selectedProfile}
              onChange={updateFnFunctionKeys}
              deviceLabelLookup={deviceLabelLookup}
              onAddDevice={addDevice}
              onDeleteDevice={deleteDevice}
            />
          </TabsContent>

          <TabsContent value="complex">
            <ComplexModificationsEditor
              rules={selectedProfile.complex_modifications?.rules || []}
              onRulesChange={updateComplexModifications}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

function formatKeyLabel(key: KeyCode | undefined): string {
  if (!key) {
    return "unknown"
  }
  return key.key_code || key.consumer_key_code || key.pointing_button || "unknown"
}

function formatDeviceLabel(device: Device, index: number): string {
  const identifiers = device.identifiers || {}
  const descriptorParts: string[] = []

  if (identifiers.vendor_id !== undefined) {
    descriptorParts.push(`VID ${identifiers.vendor_id}`)
  }
  if (identifiers.product_id !== undefined) {
    descriptorParts.push(`PID ${identifiers.product_id}`)
  }
  if (identifiers.is_keyboard) {
    descriptorParts.push("Keyboard")
  }
  if (identifiers.is_pointing_device) {
    descriptorParts.push("Pointing device")
  }

  if (descriptorParts.length === 0) {
    return `Device ${index + 1}`
  }

  return `Device ${index + 1} • ${descriptorParts.join(" • ")}`
}

function AddModificationDialog({
  onAdd,
  currentTarget,
  currentLabel,
}: {
  onAdd: (from: string, to: string, target: ModificationTarget) => void
  currentTarget: ModificationTarget
  currentLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [fromKey, setFromKey] = useState("")
  const [toKey, setToKey] = useState("")

  const handleAdd = () => {
    if (fromKey && toKey) {
      onAdd(fromKey, toKey, currentTarget)
      setFromKey("")
      setToKey("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Mapping
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Key Mapping</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>From Key</Label>
            <KeyInput value={fromKey} onChange={setFromKey} placeholder="Select or type key to remap" />
          </div>

          <div className="space-y-2">
            <Label>To Key</Label>
            <KeyInput value={toKey} onChange={setToKey} placeholder="Select or type target key" />
          </div>

          <div className="space-y-2">
            <Label>Target Device</Label>
            <div className="px-3 py-2 rounded-md border bg-muted text-sm">{currentLabel}</div>
          </div>

          <Button onClick={handleAdd} className="w-full" disabled={!fromKey || !toKey}>
            Add Mapping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AddDeviceDialog({ onAdd }: { onAdd: (device: Device) => void }) {
  const [open, setOpen] = useState(false)
  const [vendorId, setVendorId] = useState("")
  const [productId, setProductId] = useState("")
  const [isKeyboard, setIsKeyboard] = useState(true)
  const [isPointingDevice, setIsPointingDevice] = useState(false)

  const handleAdd = () => {
    const device: Device = {
      identifiers: {
        vendor_id: vendorId ? Number.parseInt(vendorId) : undefined,
        product_id: productId ? Number.parseInt(productId) : undefined,
        is_keyboard: isKeyboard,
        is_pointing_device: isPointingDevice,
      },
      simple_modifications: [],
    }

    onAdd(device)

    // Reset form
    setVendorId("")
    setProductId("")
    setIsKeyboard(true)
    setIsPointingDevice(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="cursor-pointer bg-transparent">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Device Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-id">Vendor ID (optional)</Label>
            <Input
              id="vendor-id"
              type="number"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="e.g., 1452"
            />
            <p className="text-xs text-muted-foreground">Use Karabiner EventViewer to find your device's vendor ID</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-id">Product ID (optional)</Label>
            <Input
              id="product-id"
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g., 641"
            />
            <p className="text-xs text-muted-foreground">Use Karabiner EventViewer to find your device's product ID</p>
          </div>

          <div className="space-y-3">
            <Label>Device Type</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-keyboard"
                checked={isKeyboard}
                onCheckedChange={(checked) => setIsKeyboard(checked as boolean)}
              />
              <label
                htmlFor="is-keyboard"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Keyboard
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-pointing-device"
                checked={isPointingDevice}
                onCheckedChange={(checked) => setIsPointingDevice(checked as boolean)}
              />
              <label
                htmlFor="is-pointing-device"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Pointing Device
              </label>
            </div>
          </div>

          <Button onClick={handleAdd} className="w-full">
            Add Device
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
