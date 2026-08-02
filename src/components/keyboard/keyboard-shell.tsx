'use client';

import { CircleHelp } from 'lucide-react';
import { type ReactNode, useEffect, useId, useMemo, useRef } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { cn } from '@/lib/utils';
import {
  KEYBOARD_LAYOUT_OPTIONS,
  KEYBOARD_LEGEND_OPTIONS,
  getKeyboardDisplay,
  getLayoutForType,
  toSimpleKeyboardButton,
  type KeyboardLayoutType,
  type KeyboardLegendType,
} from '@/lib/keyboard-layout';
import { useKeyboardLayout } from '@/components/keyboard/keyboard-layout-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ButtonTheme = Array<{ class: string; buttons: string }>;

export interface KeyboardShellInstance {
  getButtonElement?: (button: string) => HTMLElement | undefined;
  keyboardDOM?: HTMLElement;
  setOptions?: (options: {
    layout?: ReturnType<typeof getLayoutForType>;
    buttonTheme?: ButtonTheme;
    display?: Record<string, string>;
  }) => void;
}

export interface KeyboardHighlightLayer {
  className: string;
  keys: string[];
}

export interface KeyboardShellProps {
  layoutType: KeyboardLayoutType;
  displayLayoutType?: KeyboardLayoutType;
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
  keyboardRef?: (instance: KeyboardShellInstance | null) => void;
  physicalKeyboardHighlight?: boolean;
  physicalKeyboardHighlightBgColor?: string;
  physicalKeyboardHighlightTextColor?: string;
  mergeDisplay?: boolean;
  useButtonTag?: boolean;
}

const DEFAULT_LAYOUT_HINT =
  'Some physical keys map to different key codes depending on the type.';

export function KeyboardShell({
  layoutType,
  displayLayoutType,
  onLayoutChange,
  className,
  legend,
  hint = DEFAULT_LAYOUT_HINT,
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
  const internalKeyboardRef = useRef<KeyboardShellInstance | null>(null);
  const keyboardName = useId();
  const { legendType, setLegendType } = useKeyboardLayout();

  const resolvedDisplayLayoutType = displayLayoutType ?? layoutType;

  const layout = useMemo(() => getLayoutForType(layoutType), [layoutType]);
  const baseDisplay = useMemo(
    () => getKeyboardDisplay(resolvedDisplayLayoutType, legendType),
    [resolvedDisplayLayoutType, legendType],
  );
  const resolvedDisplay = useMemo(() => {
    return display ? { ...baseDisplay, ...display } : baseDisplay;
  }, [baseDisplay, display]);
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
    <div className={cn('relative min-w-0 select-none', className)}>
      <div className='flex items-center justify-between mb-3 flex-wrap gap-2'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-xs text-muted-foreground'>Geometry</span>
          <Select
            value={layoutType}
            onValueChange={(value) =>
              onLayoutChange(value as KeyboardLayoutType)
            }
          >
            <SelectTrigger className='w-auto h-8 cursor-pointer bg-transparent text-xs'>
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

          <span className='ml-1 text-xs text-muted-foreground'>Legends</span>
          <Select
            value={legendType}
            onValueChange={(value) =>
              setLegendType(value as KeyboardLegendType)
            }
          >
            <SelectTrigger className='h-8 w-auto cursor-pointer bg-transparent text-xs'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEYBOARD_LEGEND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({option.description})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hint ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    className='text-muted-foreground'
                    aria-label='Keyboard layout keycode hint'
                  >
                    <CircleHelp className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='bottom' align='start'>
                  {hint}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>

        {legend}
      </div>

      {beforeKeyboard}

      <div
        className={cn(
          'max-w-full overflow-x-auto rounded-lg border bg-muted/50 p-2 [&_.keyboard-theme]:min-w-[640px]',
          keyboardWrapperClassName,
        )}
      >
        <Keyboard
          baseClass={keyboardBaseClass}
          theme={`${keyboardBaseClass} keyboard-theme hg-theme-default`}
          keyboardName={keyboardName}
          keyboardRef={(instance) => {
            internalKeyboardRef.current = instance as KeyboardShellInstance;
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
