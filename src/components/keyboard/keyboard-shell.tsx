'use client';

import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { cn } from '@/lib/utils';
import {
  BUTTON_WIDTHS,
  KEYBOARD_LAYOUT_OPTIONS,
  getKeyboardDisplay,
  getLayoutForType,
  type KeyboardLayoutType,
} from '@/lib/keyboard-layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ButtonTheme = Array<{ class: string; buttons: string }>;

export interface KeyboardShellProps {
  layoutType: KeyboardLayoutType;
  onLayoutChange: (layout: KeyboardLayoutType) => void;
  className?: string;
  legend?: ReactNode;
  hint?: string;
  beforeKeyboard?: ReactNode;
  afterKeyboard?: ReactNode;
  children?: ReactNode;
  keyboardBaseClass?: string;
  keyboardWrapperClassName?: string;
  keyboardKey?: string;
  buttonTheme?: ButtonTheme;
  display?: Record<string, string>;
  onKeyPress?: (button: string, e?: MouseEvent) => void;
  keyboardRef?: (instance: typeof Keyboard | null) => void;
  physicalKeyboardHighlight?: boolean;
  physicalKeyboardHighlightBgColor?: string;
  physicalKeyboardHighlightTextColor?: string;
  mergeDisplay?: boolean;
  useButtonTag?: boolean;
  extraStyles?: string;
}

export function KeyboardShell({
  layoutType,
  onLayoutChange,
  className,
  legend,
  hint = 'Some physical keys map to different key codes depending on the layout.',
  beforeKeyboard,
  afterKeyboard,
  children,
  keyboardBaseClass = 'shared-kb',
  keyboardWrapperClassName,
  keyboardKey,
  buttonTheme,
  display,
  onKeyPress,
  keyboardRef,
  physicalKeyboardHighlight,
  physicalKeyboardHighlightBgColor,
  physicalKeyboardHighlightTextColor,
  mergeDisplay = true,
  useButtonTag = true,
  extraStyles,
}: KeyboardShellProps) {
  const internalKeyboardRef = useRef<typeof Keyboard | null>(null);

  const layout = useMemo(() => getLayoutForType(layoutType), [layoutType]);
  const baseDisplay = useMemo(
    () => getKeyboardDisplay(layoutType),
    [layoutType],
  );
  const resolvedDisplay = useMemo(() => {
    return display ? { ...baseDisplay, ...display } : baseDisplay;
  }, [baseDisplay, display]);
  const buttonWidths = useMemo(() => BUTTON_WIDTHS[layoutType], [layoutType]);

  const buttonWidthStyles = useMemo(() => {
    return Object.entries(buttonWidths)
      .map(([button, width]) => {
        return `.${keyboardBaseClass} .hg-button[data-skbtn="${button}"] { width: ${width}; min-width: ${width}; max-width: ${width}; }`;
      })
      .join('\n');
  }, [buttonWidths, keyboardBaseClass]);

  const sharedStyles = useMemo(() => {
    return `
      .${keyboardBaseClass}.simple-keyboard.hg-theme-default {
        background: var(--color-muted) !important;
        padding: 10px !important;
        border-radius: 10px !important;
        font-family: inherit !important;
      }
      .${keyboardBaseClass}.simple-keyboard .hg-row {
        gap: 4px !important;
        margin-bottom: 4px !important;
      }
      .${keyboardBaseClass}.simple-keyboard .hg-row:last-child {
        margin-bottom: 0 !important;
      }
      .${keyboardBaseClass}.simple-keyboard .hg-button {
        height: 38px !important;
        min-width: 38px !important;
        border-radius: 6px !important;
        background: var(--color-background) !important;
        border: 1px solid var(--color-border) !important;
        color: var(--color-foreground) !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        transition: all 0.1s ease !important;
      }
      .${keyboardBaseClass}.simple-keyboard .hg-button:hover {
        background: var(--color-accent) !important;
        border-color: var(--color-primary) !important;
      }
      .${keyboardBaseClass}.simple-keyboard .hg-button:active {
        transform: translateY(1px) !important;
        box-shadow: none !important;
      }
      ${buttonWidthStyles}
      ${extraStyles || ''}
    `;
  }, [buttonWidthStyles, extraStyles, keyboardBaseClass]);

  useEffect(() => {
    if (internalKeyboardRef.current?.setOptions) {
      internalKeyboardRef.current.setOptions({
        layout,
        buttonTheme,
        display: resolvedDisplay,
      });
    }
  }, [layout, buttonTheme, resolvedDisplay]);

  return (
    <div className={cn('select-none relative', className)}>
      <div className='flex items-center justify-between mb-3 flex-wrap gap-2'>
        <Select
          value={layoutType}
          onValueChange={(value) => onLayoutChange(value as KeyboardLayoutType)}
        >
          <SelectTrigger className='w-[130px] h-8 bg-transparent text-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KEYBOARD_LAYOUT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({option.description})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {legend}
      </div>

      {hint ? (
        <p className='text-xs text-muted-foreground mb-3'>{hint}</p>
      ) : null}

      {beforeKeyboard}

      <style
        dangerouslySetInnerHTML={{
          __html: sharedStyles,
        }}
      />

      <div
        className={cn(
          'bg-muted/50 rounded-lg border p-2',
          keyboardWrapperClassName,
        )}
      >
        <Keyboard
          key={keyboardKey ?? layoutType}
          baseClass={keyboardBaseClass}
          keyboardRef={(instance) => {
            internalKeyboardRef.current = instance;
            keyboardRef?.(instance);
          }}
          layout={layout}
          display={resolvedDisplay}
          buttonTheme={buttonTheme}
          onKeyPress={onKeyPress}
          physicalKeyboardHighlight={physicalKeyboardHighlight}
          physicalKeyboardHighlightBgColor={physicalKeyboardHighlightBgColor}
          physicalKeyboardHighlightTextColor={
            physicalKeyboardHighlightTextColor
          }
          mergeDisplay={mergeDisplay}
          useButtonTag={useButtonTag}
        />
      </div>

      {afterKeyboard}
      {children}
    </div>
  );
}
