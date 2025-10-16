"use client"

import type React from "react"

import { useState } from "react"
import { Moon, Sun, Upload, Download, Copy, FileJson, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ProfileEditor } from "@/components/profile-editor"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { KarabinerConfig } from "@/types/karabiner"
import { validateConfig, type ValidationError } from "@/lib/validation"

export default function KarabinerEditor() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [config, setConfig] = useState<KarabinerConfig | null>(null)
  const [jsonInput, setJsonInput] = useState("")
  const [activeTab, setActiveTab] = useState("import")
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const { toast } = useToast()

  const updateConfig = (newConfig: KarabinerConfig) => {
    setConfig(newConfig)
    const errors = validateConfig(newConfig)
    setValidationErrors(errors)
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsed = JSON.parse(content)
        updateConfig(parsed)
        setJsonInput(JSON.stringify(parsed, null, 2))
        setActiveTab("edit")
        toast({
          title: "Config loaded",
          description: "Successfully loaded Karabiner config file",
        })
      } catch {
        toast({
          title: "Error",
          description: "Invalid JSON file",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleJsonPaste = () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Error",
        description: "Please paste a config first",
        variant: "destructive",
      })
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      updateConfig(parsed)
      setJsonInput(JSON.stringify(parsed, null, 2))
      setActiveTab("edit")
      toast({
        title: "Config loaded",
        description: "Successfully parsed JSON config",
      })
    } catch {
      toast({
        title: "Error",
        description: "Invalid JSON format. Please check your syntax.",
        variant: "destructive",
      })
    }
  }

  const handleExport = () => {
    if (!config) return

    const criticalErrors = validationErrors.filter((e) => e.severity === "error")
    if (criticalErrors.length > 0) {
      toast({
        title: "Cannot export",
        description: "Please fix all errors before exporting",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "karabiner.json"
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Config exported",
      description: "Downloaded karabiner.json",
    })
  }

  const handleCopy = () => {
    if (!config) return

    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    toast({
      title: "Copied",
      description: "Config copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <FileJson className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Karabiner Config Editor</h1>
          </div>
          <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-lg bg-transparent">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="import" className="cursor-pointer">
              Import
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={!config} className="cursor-pointer">
              Edit
            </TabsTrigger>
            <TabsTrigger value="export" disabled={!config} className="cursor-pointer">
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            {config && (
              <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Config loaded successfully! Switch to the Edit tab to modify it.</span>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Config File</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload">
                    <Button asChild variant="outline">
                      <span className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </span>
                    </Button>
                  </label>
                  <span className="text-sm text-muted-foreground">Upload your karabiner.json file</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Paste JSON Config</h2>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste your Karabiner config JSON here..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="font-mono text-sm min-h-[300px]"
                />
                <Button onClick={handleJsonPaste}>Load Config</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="edit">{config && <ProfileEditor config={config} setConfig={updateConfig} />}</TabsContent>

          <TabsContent value="export" className="space-y-6">
            {validationErrors.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                  Validation Issues ({validationErrors.length})
                </h3>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {validationErrors.map((error, index) => (
                      <Alert
                        key={index}
                        variant={error.severity === "error" ? "destructive" : "default"}
                        className={error.severity === "warning" ? "border-yellow-500 dark:border-yellow-600" : ""}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm font-medium">
                          {error.severity === "error" ? "Error" : "Warning"}: {error.path}
                        </AlertTitle>
                        <AlertDescription className="text-xs">{error.message}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Export Config</h2>
              <div className="flex gap-4">
                <Button onClick={handleExport} disabled={validationErrors.some((e) => e.severity === "error")}>
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </Button>
                <Button onClick={handleCopy} variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </div>
              {validationErrors.some((e) => e.severity === "error") && (
                <p className="text-sm text-destructive mt-2">Fix all errors before exporting</p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              <Textarea
                value={config ? JSON.stringify(config, null, 2) : ""}
                readOnly
                className="font-mono text-sm min-h-[400px]"
              />
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
