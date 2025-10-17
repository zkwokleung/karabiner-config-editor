"use client"

import { KeyCodeSelector } from "@/components/key-code-selector"

interface KeyInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  excludeNotFrom?: boolean
}

/**
 * Key input component using the advanced KeyCodeSelector
 * Provides categorized key code selection with search
 */
export function KeyInput({
  value,
  onChange,
  placeholder = "Select or type key...",
  excludeNotFrom = false,
}: KeyInputProps) {
  return <KeyCodeSelector value={value} onChange={onChange} placeholder={placeholder} excludeNotFrom={excludeNotFrom} />
}
