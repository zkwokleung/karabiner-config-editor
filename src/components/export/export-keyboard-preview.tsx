'use client';

import { useCallback, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { KeyboardShell } from '@/components/keyboard/keyboard-shell';
import { useKeyboardLayout } from '@/components/keyboard/keyboard-layout-context';
import { useToast } from '@/hooks/use-toast';
import {
  getMappingValue,
  updateMappingValue,
} from '@/lib/mapping-entry-access';
import { buildMappingIndex } from '@/lib/mapping-index';
import {
  formatTargetSummary,
  normalizeConfigMappings,
  type NormalizedMappingEntry,
  type NormalizedMappingType,
} from '@/lib/mapping-normalizer';
import { getKeyLabel, toKarabinerKeyCode } from '@/lib/keyboard-layout';
import { cn } from '@/lib/utils';
import type { KarabinerConfig } from '@/types/karabiner';

type MappingDirectionFilter = 'both' | 'from' | 'to';
type MappingTypeFilter = 'all' | NormalizedMappingType;
type MappingScopeFilter = 'all' | 'profile' | 'device';

interface ExportKeyboardPreviewProps {
  config: KarabinerConfig;
  onConfigChange: (next: KarabinerConfig) => void;
}

export function ExportKeyboardPreview({
  config,
  onConfigChange,
}: ExportKeyboardPreviewProps) {
  const { toast } = useToast();
  const { layoutType, setLayoutType } = useKeyboardLayout();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [directionFilter, setDirectionFilter] =
    useState<MappingDirectionFilter>('both');
  const [typeFilter, setTypeFilter] = useState<MappingTypeFilter>('all');
  const [scopeFilter, setScopeFilter] = useState<MappingScopeFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingEntry, setEditingEntry] =
    useState<NormalizedMappingEntry | null>(null);
  const [editorValue, setEditorValue] = useState('');

  const entries = useMemo(() => normalizeConfigMappings(config), [config]);
  const mappingIndex = useMemo(() => buildMappingIndex(entries), [entries]);

  const selectedFromEntries = useMemo(() => {
    if (!selectedKey) {
      return [];
    }
    return applyFilters(mappingIndex.byFromKey.get(selectedKey) || [], {
      typeFilter,
      scopeFilter,
    });
  }, [mappingIndex.byFromKey, scopeFilter, selectedKey, typeFilter]);

  const selectedToEntries = useMemo(() => {
    if (!selectedKey) {
      return [];
    }
    return applyFilters(mappingIndex.byToKey.get(selectedKey) || [], {
      typeFilter,
      scopeFilter,
    });
  }, [mappingIndex.byToKey, scopeFilter, selectedKey, typeFilter]);

  const handleKeyPress = useCallback((button: string) => {
    setSelectedKey(toKarabinerKeyCode(button));
  }, []);

  const handleOpenEditor = useCallback(
    (entry: NormalizedMappingEntry) => {
      const value = getMappingValue(config, entry);
      if (!value) {
        toast({
          title: 'Unable to open mapping',
          description: 'Mapping path could not be resolved.',
          variant: 'destructive',
        });
        return;
      }

      setEditingEntry(entry);
      setEditorValue(JSON.stringify(value, null, 2));
    },
    [config, toast],
  );

  const handleSaveEditor = useCallback(() => {
    if (!editingEntry) {
      return;
    }

    try {
      const parsed = JSON.parse(editorValue);
      const updated = updateMappingValue(config, editingEntry, parsed);
      if (!updated) {
        toast({
          title: 'Unable to update mapping',
          description: 'Mapping path could not be resolved.',
          variant: 'destructive',
        });
        return;
      }

      onConfigChange(updated);
      setEditingEntry(null);
      setEditorValue('');
      toast({
        title: 'Mapping updated',
        description: 'Changes were applied to the configuration.',
      });
    } catch {
      toast({
        title: 'Invalid JSON',
        description: 'Please provide valid JSON for this mapping.',
        variant: 'destructive',
      });
    }
  }, [config, editingEntry, editorValue, onConfigChange, toast]);

  const handleCloseEditor = useCallback(() => {
    setEditingEntry(null);
    setEditorValue('');
  }, []);

  const selectedHighlight = selectedKey ? [selectedKey] : [];
  const highlightLayers = [
    { className: 'kb-mapped', keys: Array.from(mappingIndex.mappedKeys) },
    { className: 'kb-selected', keys: selectedHighlight },
  ];

  const showFrom = directionFilter === 'both' || directionFilter === 'from';
  const showTo = directionFilter === 'both' || directionFilter === 'to';

  const legend = (
    <div className='flex items-center gap-3 text-xs text-muted-foreground'>
      <div className='flex items-center gap-1'>
        <div className='w-2.5 h-2.5 rounded-sm bg-primary/20 border border-primary' />
        <span>Has mappings</span>
      </div>
      {selectedKey && (
        <div className='flex items-center gap-1'>
          <div className='w-2.5 h-2.5 rounded-sm bg-primary/40 border border-primary' />
          <span>Selected key</span>
        </div>
      )}
    </div>
  );

  return (
    <div className='grid gap-4 xl:grid-cols-[1.4fr_1fr]'>
      <div className='space-y-3'>
        <KeyboardShell
          layoutType={layoutType}
          onLayoutChange={(value) => setLayoutType(value)}
          legend={legend}
          keyboardBaseClass='export-kb'
          highlightLayers={highlightLayers}
          onKeyPress={handleKeyPress}
          physicalKeyboardHighlight={false}
        />
      </div>

      <div className='rounded-lg border p-3 bg-card'>
        <div className='flex items-center justify-between gap-2 mb-3'>
          <h3 className='text-sm font-semibold'>Key Mapping Details</h3>
          <Button
            type='button'
            size='sm'
            variant='outline'
            className='h-7 px-2 text-xs cursor-pointer'
            onClick={() => setShowFilters((prev) => !prev)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {showFilters ? (
              <ChevronUp className='ml-1 h-3.5 w-3.5' />
            ) : (
              <ChevronDown className='ml-1 h-3.5 w-3.5' />
            )}
          </Button>
        </div>

        {showFilters && (
          <div className='flex flex-wrap gap-2 mb-3'>
            <FilterPillGroup
              label='Direction'
              options={[
                { value: 'both', label: 'Both' },
                { value: 'from', label: 'From' },
                { value: 'to', label: 'To' },
              ]}
              value={directionFilter}
              onChange={(value) =>
                setDirectionFilter(value as MappingDirectionFilter)
              }
            />
            <FilterPillGroup
              label='Type'
              options={[
                { value: 'all', label: 'All' },
                { value: 'simple', label: 'Simple' },
                { value: 'fn', label: 'Fn' },
                { value: 'complex', label: 'Complex' },
              ]}
              value={typeFilter}
              onChange={(value) => setTypeFilter(value as MappingTypeFilter)}
            />
            <FilterPillGroup
              label='Scope'
              options={[
                { value: 'all', label: 'All' },
                { value: 'profile', label: 'Profile' },
                { value: 'device', label: 'Device' },
              ]}
              value={scopeFilter}
              onChange={(value) => setScopeFilter(value as MappingScopeFilter)}
            />
          </div>
        )}

        {!selectedKey ? (
          <div className='rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground'>
            Select a key on the keyboard to review mappings.
          </div>
        ) : (
          <ScrollArea className='h-[420px] pr-2'>
            <div className='space-y-4'>
              {showFrom && (
                <MappingSection
                  title='From this key'
                  entries={selectedFromEntries}
                  selectedKey={selectedKey}
                  mode='from'
                  onItemClick={handleOpenEditor}
                />
              )}

              {showTo && (
                <MappingSection
                  title='Maps to this key'
                  entries={selectedToEntries}
                  selectedKey={selectedKey}
                  mode='to'
                  onItemClick={handleOpenEditor}
                />
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      <Dialog
        open={Boolean(editingEntry)}
        onOpenChange={(open) => !open && handleCloseEditor()}
      >
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Edit Mapping JSON</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            {editingEntry && (
              <p className='text-xs text-muted-foreground'>
                {editingEntry.type.toUpperCase()} - {editingEntry.profileName}
                {editingEntry.scope === 'device' && editingEntry.deviceLabel
                  ? ` - ${editingEntry.deviceLabel}`
                  : ''}
                {editingEntry.ruleDescription
                  ? ` - ${editingEntry.ruleDescription}`
                  : ''}
              </p>
            )}
            <Textarea
              value={editorValue}
              onChange={(event) => setEditorValue(event.target.value)}
              className='font-mono text-xs min-h-[320px]'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={handleCloseEditor}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditor}>Save Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function applyFilters(
  entries: NormalizedMappingEntry[],
  filters: {
    typeFilter: MappingTypeFilter;
    scopeFilter: MappingScopeFilter;
  },
): NormalizedMappingEntry[] {
  return entries.filter((entry) => {
    const typeMatches =
      filters.typeFilter === 'all' || entry.type === filters.typeFilter;
    const scopeMatches =
      filters.scopeFilter === 'all' || entry.scope === filters.scopeFilter;
    return typeMatches && scopeMatches;
  });
}

function MappingSection({
  title,
  entries,
  selectedKey,
  mode,
  onItemClick,
}: {
  title: string;
  entries: NormalizedMappingEntry[];
  selectedKey: string;
  mode: 'from' | 'to';
  onItemClick: (entry: NormalizedMappingEntry) => void;
}) {
  return (
    <section className='space-y-2'>
      <div className='flex items-center justify-between'>
        <h4 className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          {title}
        </h4>
        <span className='text-xs text-muted-foreground'>
          {entries.length} result{entries.length === 1 ? '' : 's'}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className='rounded-md border border-dashed p-3 text-sm text-muted-foreground'>
          No mappings in this view.
        </div>
      ) : (
        <div className='space-y-2'>
          {entries.map((entry) => (
            <MappingItem
              key={`${mode}-${entry.id}`}
              entry={entry}
              selectedKey={selectedKey}
              mode={mode}
              onClick={() => onItemClick(entry)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MappingItem({
  entry,
  selectedKey,
  mode,
  onClick,
}: {
  entry: NormalizedMappingEntry;
  selectedKey: string;
  mode: 'from' | 'to';
  onClick: () => void;
}) {
  const directionInfo =
    mode === 'from'
      ? formatTargetSummary(entry)
      : formatToMatchSummary(entry, selectedKey);

  return (
    <button
      type='button'
      onClick={onClick}
      className='w-full text-left rounded-md border p-3 space-y-2 hover:bg-muted/40 transition-colors cursor-pointer'
    >
      <div className='flex flex-wrap items-center gap-1.5'>
        <Badge
          variant='secondary'
          className={cn(
            'text-[10px] uppercase tracking-wide',
            entry.type === 'simple' && 'bg-blue-500/10 text-blue-700',
            entry.type === 'fn' && 'bg-amber-500/10 text-amber-700',
            entry.type === 'complex' && 'bg-violet-500/10 text-violet-700',
          )}
        >
          {entry.type}
        </Badge>
        <Badge variant='outline' className='text-[10px]'>
          {entry.profileName}
        </Badge>
        <Badge variant='outline' className='text-[10px]'>
          {entry.scope === 'profile'
            ? 'All devices'
            : entry.deviceLabel || `Device ${(entry.deviceIndex ?? 0) + 1}`}
        </Badge>
        {entry.ruleDescription && (
          <Badge variant='outline' className='text-[10px]'>
            {entry.ruleDescription}
          </Badge>
        )}
      </div>

      <div className='text-sm flex items-center gap-2'>
        <code className='rounded bg-muted px-1.5 py-0.5 font-mono'>
          {getKeyLabel(entry.fromKey)}
        </code>
        <ArrowRight className='h-3.5 w-3.5 text-muted-foreground' />
        <span className='text-muted-foreground'>{directionInfo || '-'}</span>
      </div>

      <div className='flex flex-wrap items-center gap-1.5'>
        {entry.fromModifiers.length > 0 && (
          <Badge variant='outline' className='text-[10px]'>
            From mods: {entry.fromModifiers.join(' + ')}
          </Badge>
        )}
        {entry.conditionsCount > 0 && (
          <Badge variant='outline' className='text-[10px]'>
            {entry.conditionsCount} condition
            {entry.conditionsCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    </button>
  );
}

function formatComplexPhase(phase: string): string {
  if (phase === 'default' || phase === 'to') {
    return 'to';
  }
  return phase.replace(/_/g, ' ');
}

function formatToMatchSummary(
  entry: NormalizedMappingEntry,
  selectedKey: string,
): string {
  const phases = entry.toTargets
    .filter((target) => target.key === selectedKey)
    .map((target) => formatComplexPhase(target.phase));

  const phaseText = phases.length > 0 ? ` via ${phases.join(', ')}` : '';
  return `${getKeyLabel(selectedKey)}${phaseText}`;
}

function FilterPillGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className='flex items-center gap-1'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <div className='inline-flex items-center rounded-md border bg-background p-0.5'>
        {options.map((option) => (
          <Button
            key={option.value}
            type='button'
            size='sm'
            variant={value === option.value ? 'secondary' : 'ghost'}
            className='h-6 px-2 text-xs'
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
