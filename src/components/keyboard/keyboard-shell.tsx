'use client';

import { type ReactNode, useEffect, useId, useMemo, useRef } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { cn } from '@/lib/utils';
import {
  BUTTON_WIDTHS,
  KEYBOARD_LAYOUT_OPTIONS,
  getKeyboardDisplay,
  getLayoutForType,
  toSimpleKeyboardButton,
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

export interface KeyboardHighlightLayer {
  className: string;
  keys: string[];
}

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
  highlightLayers?: KeyboardHighlightLayer[];
  display?: Record<string, string>;
  onKeyPress?: (button: string, e?: MouseEvent | KeyboardEvent) => void;
  keyboardRef?: (instance: typeof Keyboard | null) => void;
  physicalKeyboardHighlight?: boolean;
  physicalKeyboardHighlightBgColor?: string;
  physicalKeyboardHighlightTextColor?: string;
  mergeDisplay?: boolean;
  useButtonTag?: boolean;
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
  highlightLayers,
  display,
  onKeyPress,
  keyboardRef,
  physicalKeyboardHighlight,
  physicalKeyboardHighlightBgColor,
  physicalKeyboardHighlightTextColor,
  mergeDisplay = true,
  useButtonTag = true,
}: KeyboardShellProps) {
  const internalKeyboardRef = useRef<typeof Keyboard | null>(null);
  const keyboardName = useId();

  const layout = useMemo(() => getLayoutForType(layoutType), [layoutType]);
  const baseDisplay = useMemo(
    () => getKeyboardDisplay(layoutType),
    [layoutType],
  );
  const resolvedDisplay = useMemo(() => {
    return display ? { ...baseDisplay, ...display } : baseDisplay;
  }, [baseDisplay, display]);
  const buttonWidths = useMemo(() => BUTTON_WIDTHS[layoutType], [layoutType]);
  const buttonTheme = useMemo<ButtonTheme | undefined>(() => {
    if (!highlightLayers || highlightLayers.length === 0) {
      return undefined;
    }

    const themes = highlightLayers
      .map((layer) => {
        const buttons = layer.keys
          .map((key) => toSimpleKeyboardButton(key))
          .filter(Boolean)
          .join(' ');
        if (!buttons) {
          return null;
        }
        return { class: layer.className, buttons };
      })
      .filter(Boolean) as ButtonTheme;

    return themes.length > 0 ? themes : undefined;
  }, [highlightLayers]);

  const buttonWidthStyles = useMemo(() => {
    return Object.entries(buttonWidths)
      .map(([button, width]) => {
        return `.${keyboardBaseClass} .hg-button[data-skbtn="${button}"] { width: ${width}; min-width: ${width}; max-width: ${width}; }`;
      })
      .join('\n');
  }, [buttonWidths, keyboardBaseClass]);

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
          __html: buttonWidthStyles,
        }}
      />

      <div
        className={cn(
          'bg-muted/50 rounded-lg border p-2',
          keyboardWrapperClassName,
        )}
      >
        <Keyboard
          baseClass={keyboardBaseClass}
          theme={`${keyboardBaseClass} keyboard-theme hg-theme-default`}
          keyboardName={keyboardName}
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
