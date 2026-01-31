'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  KARABINER_KEYCODES,
  getKeyCodeValue,
  findKeyCodeItem,
  type KeyCodeItem,
} from '@/lib/karabiner-keycodes';

interface KeyCodeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeNotFrom?: boolean; // Exclude keys that can't be used as "from"
}

/**
 * Advanced key code selector with categorized dropdown menu
 * Displays all Karabiner key codes organized by category with hover-based submenu
 */
export function KeyCodeSelector({
  value,
  onChange,
  placeholder = 'Select key...',
  excludeNotFrom = false,
}: KeyCodeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [menuHeight, setMenuHeight] = useState(400);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Find the selected item to display its label
  const selectedItem = findKeyCodeItem(value);
  const displayValue = selectedItem?.label || value || placeholder;

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Use the larger space, with padding of 16px from screen edges
      // Also account for search input (48px) and padding
      const availableSpace = Math.max(spaceBelow, spaceAbove) - 80;

      // Set a reasonable min/max height
      const calculatedHeight = Math.min(Math.max(availableSpace, 200), 600);
      setMenuHeight(calculatedHeight);
    }
  }, [open]);

  // Filter categories and items based on search
  const filteredCategories = KARABINER_KEYCODES.map((category) => ({
    ...category,
    items: category.items.filter((item) => {
      // Exclude not_from keys if requested
      if (excludeNotFrom && item.not_from) return false;

      // Filter by search
      if (!searchValue) return true;
      const search = searchValue.toLowerCase();
      return (
        item.label.toLowerCase().includes(search) ||
        getKeyCodeValue(item).toLowerCase().includes(search)
      );
    }),
  })).filter((category) => category.items.length > 0);

  const isCategorySelected = (categoryName: string) => {
    const category = filteredCategories.find(
      (c) => c.category === categoryName,
    );
    if (!category) return false;
    return category.items.some((item) => getKeyCodeValue(item) === value);
  };

  const handleSelect = (item: KeyCodeItem) => {
    onChange(getKeyCodeValue(item));
    setOpen(false);
    setSearchValue('');
    setHoveredCategory(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-mono text-xs bg-transparent cursor-pointer'
        >
          <span className='truncate'>{displayValue}</span>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[600px] p-0' align='start'>
        <div className='p-2 border-b'>
          <Input
            placeholder='Search key codes...'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className='h-8 text-sm'
          />
        </div>
        <div className='flex' style={{ height: `${menuHeight}px` }}>
          {/* Left panel: Categories */}
          <ScrollArea className='w-[250px] border-r'>
            <div className='p-1'>
              {filteredCategories.length === 0 ? (
                <div className='p-4 text-sm text-center text-muted-foreground'>
                  No keys found
                  {searchValue && (
                    <div className='mt-2'>
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => {
                          onChange(searchValue);
                          setOpen(false);
                          setSearchValue('');
                        }}
                      >
                        Use &quot;{searchValue}&quot;
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const isSelected = isCategorySelected(category.category);
                  const isHovered = hoveredCategory === category.category;

                  return (
                    <div
                      key={category.category}
                      onMouseEnter={() => setHoveredCategory(category.category)}
                      className={cn(
                        'flex items-center gap-2 px-2 py-2 text-xs font-medium rounded cursor-pointer transition-colors',
                        isHovered ? 'bg-accent' : 'hover:bg-accent/50',
                      )}
                    >
                      <Check
                        className={cn(
                          'h-3 w-3 shrink-0',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className='flex-1 truncate'>
                        {category.category}
                      </span>
                      <span className='text-[10px] text-muted-foreground'>
                        ({category.items.length})
                      </span>
                      <ChevronRight className='h-3 w-3 shrink-0 text-muted-foreground' />
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Right panel: Key codes for hovered category */}
          <ScrollArea className='flex-1'>
            <div className='p-1'>
              {hoveredCategory ? (
                (() => {
                  const category = filteredCategories.find(
                    (c) => c.category === hoveredCategory,
                  );
                  if (!category) return null;

                  return (
                    <div className='space-y-0.5'>
                      {category.items.map((item, index) => {
                        const keyValue = getKeyCodeValue(item);
                        const isSelected = value === keyValue;

                        return (
                          <button
                            key={`${item.label}-${index}`}
                            onClick={() => handleSelect(item)}
                            className={cn(
                              'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded cursor-pointer transition-colors',
                              isSelected ? 'bg-accent' : 'hover:bg-accent/50',
                            )}
                          >
                            <Check
                              className={cn(
                                'h-3 w-3 shrink-0',
                                isSelected ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            <span className='font-mono truncate'>
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div className='flex items-center justify-center h-full text-xs text-muted-foreground p-4 text-center'>
                  Hover over a category to view key codes
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
