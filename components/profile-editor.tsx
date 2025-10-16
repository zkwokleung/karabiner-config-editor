"use client"

import { useState } from "react"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { KarabinerConfig, Profile, Rule, FnFunctionKey } from "@/types/karabiner"
import { useToast } from "@/hooks/use-toast"
import { ComplexModificationsEditor } from "@/components/complex-modifications-editor"
import { FnFunctionKeysEditor } from "@/components/fn-function-keys-editor"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { KeyInput } from "@/components/key-input"
import { findDuplicateSimpleModifications } from "@/lib/validation"

interface ProfileEditorProps {
  config: KarabinerConfig
  setConfig: (config: KarabinerConfig) => void
}

export function ProfileEditor({ config, setConfig }: ProfileEditorProps) {
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0)
  const { toast } = useToast()

  const selectedProfile = config.profiles[selectedProfileIndex]

  const duplicates = findDuplicateSimpleModifications(selectedProfile)

  // Update profile name
  const updateProfileName = (name: string) => {
    const newConfig = { ...config }
    newConfig.profiles[selectedProfileIndex].name = name
    setConfig(newConfig)
  }

  // Add new profile
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

  // Delete profile
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

  // Add simple modification
  const addSimpleModification = (from: string, to: string) => {
    const newConfig = { ...config }
    if (!newConfig.profiles[selectedProfileIndex].simple_modifications) {
      newConfig.profiles[selectedProfileIndex].simple_modifications = []
    }
    newConfig.profiles[selectedProfileIndex].simple_modifications!.push({
      from: { key_code: from },
      to: [{ key_code: to }],
    })
    setConfig(newConfig)
    toast({
      title: "Modification added",
      description: `${from} → ${to}`,
    })
  }

  // Delete simple modification
  const deleteSimpleModification = (index: number) => {
    const newConfig = { ...config }
    newConfig.profiles[selectedProfileIndex].simple_modifications!.splice(index, 1)
    setConfig(newConfig)
    toast({
      title: "Modification deleted",
      description: "Key mapping removed",
    })
  }

  // Update complex modifications
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

  // Update fn function keys
  const updateFnFunctionKeys = (fnKeys: FnFunctionKey[]) => {
    const newConfig = { ...config }
    newConfig.profiles[selectedProfileIndex].fn_function_keys = fnKeys
    setConfig(newConfig)
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
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedProfileIndex === index ? "bg-primary/10 border-primary" : "hover:bg-muted"
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Simple Modifications</h3>
              <AddModificationDialog onAdd={addSimpleModification} />
            </div>

            {duplicates.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold">Duplicate key mappings detected:</p>
                  <p className="text-sm">The following keys are mapped multiple times: {duplicates.join(", ")}</p>
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {selectedProfile.simple_modifications?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No key mappings yet. Add one to get started.
                  </p>
                )}
                {selectedProfile.simple_modifications?.map((mod, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-4">
                      <code className="px-3 py-1 rounded bg-muted text-sm font-mono">{mod.from.key_code}</code>
                      <span className="text-muted-foreground">→</span>
                      <code className="px-3 py-1 rounded bg-muted text-sm font-mono">
                        {Array.isArray(mod.to) ? mod.to[0]?.key_code : mod.to?.key_code}
                      </code>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteSimpleModification(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="fn">
            <FnFunctionKeysEditor fnKeys={selectedProfile.fn_function_keys || []} onChange={updateFnFunctionKeys} />
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

function AddModificationDialog({ onAdd }: { onAdd: (from: string, to: string) => void }) {
  const [open, setOpen] = useState(false)
  const [fromKey, setFromKey] = useState("")
  const [toKey, setToKey] = useState("")

  const handleAdd = () => {
    if (fromKey && toKey) {
      onAdd(fromKey, toKey)
      setFromKey("")
      setToKey("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
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

          <Button onClick={handleAdd} className="w-full" disabled={!fromKey || !toKey}>
            Add Mapping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
