'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Settings,
  Search,
  GripVertical,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type {
  Rule,
  Manipulator,
  Modifiers,
  ToEvent,
  Condition,
} from '@/types/karabiner';
import { useToast } from '@/hooks/use-toast';
import { ConditionEditor } from '@/components/condition-editor';
import { ToEventEditor } from '@/components/to-event-editor';
import { ModifierSelector } from '@/components/modifier-selector';
import { KeyInput } from '@/components/key-input';
import { RuleTemplates } from '@/components/rule-templates';
import { findConflictingManipulators } from '@/lib/validation';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SortableHandleProps = Pick<
  ReturnType<typeof useSortable>,
  'attributes' | 'listeners'
>;

interface ComplexModificationsEditorProps {
  rules: Rule[];
  onRulesChange: (rules: Rule[]) => void;
}

export function ComplexModificationsEditor({
  rules,
  onRulesChange,
}: ComplexModificationsEditorProps) {
  const { toast } = useToast();
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number | null>(
    rules.length > 0 ? 0 : null,
  );
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const filteredRules = useMemo(() => {
    if (!searchQuery.trim())
      return rules.map((rule, index) => ({ rule, originalIndex: index }));

    const query = searchQuery.toLowerCase();
    return rules
      .map((rule, index) => ({ rule, originalIndex: index }))
      .filter(({ rule }) => {
        if (rule.description.toLowerCase().includes(query)) return true;

        return rule.manipulators.some((manipulator) => {
          const fromKey =
            manipulator.from.key_code ||
            manipulator.from.consumer_key_code ||
            '';
          return fromKey.toLowerCase().includes(query);
        });
      });
  }, [rules, searchQuery]);

  const conflicts = useMemo(() => findConflictingManipulators(rules), [rules]);

  useEffect(() => {
    setSelectedRuleIndex((current) => {
      if (rules.length === 0) {
        return null;
      }

      if (current === null) {
        return 0;
      }

      if (current >= rules.length) {
        return rules.length - 1;
      }

      return current;
    });
  }, [rules]);

  useEffect(() => {
    if (filteredRules.length === 0) {
      setSelectedRuleIndex(null);
      return;
    }

    setSelectedRuleIndex((current) => {
      if (
        current !== null &&
        filteredRules.some(({ originalIndex }) => originalIndex === current)
      ) {
        return current;
      }

      return filteredRules[0].originalIndex;
    });
  }, [filteredRules]);

  const handleSelectRule = (ruleIndex: number) => {
    setSelectedRuleIndex(ruleIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = active.id as number;
    const newIndex = over.id as number;

    const newRules = arrayMove(rules, oldIndex, newIndex);
    onRulesChange(newRules);

    setSelectedRuleIndex((current) => {
      if (current === null) return current;
      if (current === oldIndex) return newIndex;
      if (oldIndex < newIndex && current > oldIndex && current <= newIndex) {
        return current - 1;
      }
      if (oldIndex > newIndex && current < oldIndex && current >= newIndex) {
        return current + 1;
      }
      return current;
    });

    toast({
      title: 'Rule reordered',
      description: 'Rule order has been updated',
    });
  };

  const handleAddRuleFromTemplate = (rule: Rule) => {
    const nextIndex = rules.length;
    onRulesChange([...rules, rule]);
    setSelectedRuleIndex(nextIndex);
  };

  const handleAddRule = () => {
    const newRule: Rule = {
      description: 'New Rule',
      manipulators: [],
    };
    const nextIndex = rules.length;
    onRulesChange([...rules, newRule]);
    setSelectedRuleIndex(nextIndex);
    toast({
      title: 'Rule added',
      description: 'New complex modification rule created',
    });
  };

  const handleDeleteRule = (ruleIndex: number) => {
    const newRules = rules.filter((_, index) => index !== ruleIndex);
    onRulesChange(newRules);
    setSelectedRuleIndex((current) => {
      if (newRules.length === 0) return null;
      if (current === null) return null;
      if (current === ruleIndex) {
        return Math.min(ruleIndex, newRules.length - 1);
      }
      if (current > ruleIndex) {
        return current - 1;
      }
      return current;
    });
    toast({
      title: 'Rule deleted',
      description: 'Complex modification rule removed',
    });
  };

  const handleUpdateDescription = (ruleIndex: number, description: string) => {
    const newRules = [...rules];
    newRules[ruleIndex].description = description;
    onRulesChange(newRules);
  };

  const handleAddManipulator = (ruleIndex: number) => {
    const newManipulator: Manipulator = {
      type: 'basic',
      from: {
        key_code: 'caps_lock',
      },
      to: [
        {
          key_code: 'left_control',
        },
      ],
    };

    const newRules = [...rules];
    newRules[ruleIndex].manipulators = [
      ...newRules[ruleIndex].manipulators,
      newManipulator,
    ];
    onRulesChange(newRules);
    toast({
      title: 'Manipulator added',
      description: 'New key manipulator created',
    });
  };

  const handleDeleteManipulator = (ruleIndex: number, manipIndex: number) => {
    const newRules = [...rules];
    newRules[ruleIndex].manipulators = newRules[ruleIndex].manipulators.filter(
      (_, index) => index !== manipIndex,
    );
    onRulesChange(newRules);
    toast({
      title: 'Manipulator deleted',
      description: 'Key manipulator removed',
    });
  };

  const handleUpdateManipulator = (
    ruleIndex: number,
    manipIndex: number,
    manipulator: Manipulator,
  ) => {
    const newRules = [...rules];
    newRules[ruleIndex].manipulators[manipIndex] = manipulator;
    onRulesChange(newRules);
  };

  const handleReorderManipulators = (
    ruleIndex: number,
    newManipulators: Manipulator[],
  ) => {
    const newRules = [...rules];
    newRules[ruleIndex].manipulators = newManipulators;
    onRulesChange(newRules);
  };

  const selectedRule =
    selectedRuleIndex !== null ? rules[selectedRuleIndex] : null;
  const isFiltering = Boolean(searchQuery.trim());

  let detailFallbackMessage = '';
  if (rules.length === 0) {
    detailFallbackMessage =
      'No complex modification rules yet. Add one to create advanced key mappings.';
  } else if (filteredRules.length === 0) {
    detailFallbackMessage = 'No rules match your search query.';
  } else {
    detailFallbackMessage = 'Select a rule from the list to view its details.';
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Complex Modifications</h3>
          <p className='text-sm text-muted-foreground'>
            Advanced key remapping with conditions and modifiers
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <RuleTemplates onAddRule={handleAddRuleFromTemplate} />
          <Button onClick={handleAddRule} size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            Add Rule
          </Button>
        </div>
      </div>

      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='Search rules by description or key...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pl-9'
        />
      </div>

      {conflicts.length > 0 && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            <div className='space-y-1'>
              <p className='font-semibold'>
                Conflicting key mappings detected:
              </p>
              <ul className='list-inside list-disc text-sm'>
                {conflicts.map((conflict, index) => (
                  <li key={index}>{conflict}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className='grid gap-6 lg:grid-cols-[280px_1fr]'>
        <Card className='p-3'>
          <ScrollArea className='h-[600px] pr-2'>
            <div className='space-y-2'>
              {filteredRules.length === 0 ? (
                <Card className='p-6 text-center text-sm text-muted-foreground'>
                  {isFiltering
                    ? 'No rules match your search query.'
                    : 'No complex modification rules yet. Add one to create advanced key mappings.'}
                </Card>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredRules.map(
                      ({ originalIndex }) => originalIndex,
                    )}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredRules.map(({ rule, originalIndex }) => (
                      <SortableRuleListItem
                        key={originalIndex}
                        rule={rule}
                        ruleIndex={originalIndex}
                        selected={selectedRuleIndex === originalIndex}
                        onSelect={handleSelectRule}
                        onDelete={() => handleDeleteRule(originalIndex)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </ScrollArea>
        </Card>

        <div className='pr-2'>
          {selectedRule ? (
            <RuleDetailPanel
              rule={selectedRule}
              onDelete={() => handleDeleteRule(selectedRuleIndex)}
              onUpdateDescription={(desc) =>
                handleUpdateDescription(selectedRuleIndex, desc)
              }
              onAddManipulator={() => handleAddManipulator(selectedRuleIndex)}
              onDeleteManipulator={(manipIndex) =>
                handleDeleteManipulator(selectedRuleIndex, manipIndex)
              }
              onUpdateManipulator={(manipIndex, manipulator) =>
                handleUpdateManipulator(
                  selectedRuleIndex,
                  manipIndex,
                  manipulator,
                )
              }
              onReorderManipulators={(newManipulators) =>
                handleReorderManipulators(selectedRuleIndex, newManipulators)
              }
            />
          ) : (
            <Card className='p-8 text-center'>
              <p className='text-sm text-muted-foreground'>
                {detailFallbackMessage}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SortableRuleListItem({
  rule,
  ruleIndex,
  selected,
  onSelect,
  onDelete,
}: {
  rule: Rule;
  ruleIndex: number;
  selected: boolean;
  onSelect: (ruleIndex: number) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ruleIndex });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(ruleIndex)}
      className={cn(
        'flex items-center gap-3 rounded-md border bg-card p-2 text-left transition hover:bg-muted',
        selected ? 'border-primary bg-muted' : 'border-border',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className='flex h-full cursor-grab items-center rounded-md px-2 text-muted-foreground transition hover:bg-muted active:cursor-grabbing'
      >
        <GripVertical className='h-4 w-4' />
      </div>
      <div className='flex flex-1 flex-col gap-1'>
        <span className='text-sm font-medium'>
          {rule.description || 'Untitled rule'}
        </span>
        <Badge variant='secondary' className='w-fit'>
          {rule.manipulators.length} manipulator
          {rule.manipulators.length === 1 ? '' : 's'}
        </Badge>
      </div>
      <Button
        size='icon'
        variant='ghost'
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  );
}

function RuleDetailPanel({
  rule,
  onDelete,
  onUpdateDescription,
  onAddManipulator,
  onDeleteManipulator,
  onUpdateManipulator,
  onReorderManipulators,
}: {
  rule: Rule;
  onDelete: () => void;
  onUpdateDescription: (desc: string) => void;
  onAddManipulator: () => void;
  onDeleteManipulator: (index: number) => void;
  onUpdateManipulator: (index: number, manipulator: Manipulator) => void;
  onReorderManipulators: (manipulators: Manipulator[]) => void;
}) {
  const manipulatorSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleManipulatorDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = active.id as number;
    const newIndex = over.id as number;

    const newManipulators = arrayMove(rule.manipulators, oldIndex, newIndex);
    onReorderManipulators(newManipulators);
  };

  return (
    <Card className='space-y-4 p-6'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1 space-y-2'>
          <Label>Rule Description</Label>
          <Input
            value={rule.description}
            onChange={(event) => onUpdateDescription(event.target.value)}
            placeholder='Describe what this rule does'
          />
        </div>
        <Button
          size='icon'
          variant='ghost'
          onClick={onDelete}
          className='shrink-0'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label>Manipulators</Label>
          <Button
            size='sm'
            variant='outline'
            onClick={onAddManipulator}
            className='bg-transparent'
          >
            <Plus className='mr-2 h-3 w-3' />
            Add Manipulator
          </Button>
        </div>

        {rule.manipulators.length === 0 ? (
          <Card className='p-6 text-center text-sm text-muted-foreground'>
            No manipulators yet. Add one to start remapping keys.
          </Card>
        ) : (
          <DndContext
            sensors={manipulatorSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleManipulatorDragEnd}
          >
            <SortableContext
              items={rule.manipulators.map((_, index) => index)}
              strategy={verticalListSortingStrategy}
            >
              <div className='space-y-3'>
                {rule.manipulators.map((manipulator, manipulatorIndex) => (
                  <SortableManipulatorEditor
                    key={manipulatorIndex}
                    manipulator={manipulator}
                    manipulatorIndex={manipulatorIndex}
                    onUpdate={(updated) =>
                      onUpdateManipulator(manipulatorIndex, updated)
                    }
                    onDelete={() => onDeleteManipulator(manipulatorIndex)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </Card>
  );
}

function SortableManipulatorEditor({
  manipulator,
  manipulatorIndex,
  onUpdate,
  onDelete,
}: {
  manipulator: Manipulator;
  manipulatorIndex: number;
  onUpdate: (manipulator: Manipulator) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: manipulatorIndex,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ManipulatorEditor
        manipulator={manipulator}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
}

function ManipulatorEditor({
  manipulator,
  onUpdate,
  onDelete,
  dragHandleProps,
}: {
  manipulator: Manipulator;
  onUpdate: (manipulator: Manipulator) => void;
  onDelete: () => void;
  dragHandleProps?: SortableHandleProps;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFromKey = (key: string) => {
    onUpdate({
      ...manipulator,
      from: { ...manipulator.from, key_code: key },
    });
  };

  const updateFromModifiers = (
    type: 'mandatory' | 'optional',
    modifiers: string[],
  ) => {
    const newModifiers: Modifiers = { ...manipulator.from.modifiers };
    newModifiers[type] = modifiers;
    onUpdate({
      ...manipulator,
      from: { ...manipulator.from, modifiers: newModifiers },
    });
  };

  const clearField = (
    field: 'to_if_alone' | 'to_if_held_down' | 'to_after_key_up',
  ) => {
    const updated = { ...manipulator };
    delete updated[field];
    onUpdate(updated);
  };

  const updateToAfterKeyUp = (events: ToEvent[]) => {
    if (events.length === 0) {
      const updated = { ...manipulator };
      delete updated.to_after_key_up;
      onUpdate(updated);
    } else {
      onUpdate({ ...manipulator, to_after_key_up: events });
    }
  };

  const updateConditions = (conditions: Condition[]) => {
    if (conditions.length === 0) {
      const updated = { ...manipulator };
      delete updated.conditions;
      onUpdate(updated);
    } else {
      onUpdate({ ...manipulator, conditions });
    }
  };

  return (
    <Card className='p-4 space-y-2'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2 text-sm font-medium'>
          <div
            {...dragHandleProps?.attributes}
            {...dragHandleProps?.listeners}
            className='cursor-grab text-muted-foreground active:cursor-grabbing'
          >
            <GripVertical className='h-4 w-4' />
          </div>
          Manipulator
        </div>
        <Button size='icon' variant='ghost' onClick={onDelete}>
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      <div className='space-y-3'>
        <div className='space-y-3'>
          <Label className='text-sm font-semibold'>From Key</Label>
          <KeyInput
            value={manipulator.from.key_code || ''}
            onChange={updateFromKey}
            placeholder='Select or type key to remap'
          />

          <div className='grid grid-cols-2 gap-3'>
            <ModifierSelector
              selected={manipulator.from.modifiers?.mandatory || []}
              onChange={(mods) => updateFromModifiers('mandatory', mods)}
              label='Mandatory Modifiers'
            />
            <ModifierSelector
              selected={manipulator.from.modifiers?.optional || []}
              onChange={(mods) => updateFromModifiers('optional', mods)}
              label='Optional Modifiers'
            />
          </div>
        </div>

        <Separator />

        <ToEventEditor
          events={manipulator.to || []}
          onChange={(events) => onUpdate({ ...manipulator, to: events })}
          label='To Events'
        />

        <Separator />

        <ConditionEditor
          conditions={manipulator.conditions || []}
          onChange={updateConditions}
        />

        <Separator />

        <Button
          variant='ghost'
          size='sm'
          onClick={() => setShowAdvanced(!showAdvanced)}
          className='w-full'
        >
          <Settings className='mr-2 h-4 w-4' />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </Button>

        {showAdvanced && (
          <div className='space-y-3 pt-2'>
            <Separator />

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs'>
                  To If Alone (when pressed alone)
                </Label>
                {manipulator.to_if_alone && (
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => clearField('to_if_alone')}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <ToEventEditor
                events={manipulator.to_if_alone || []}
                onChange={(events) => {
                  if (events.length === 0) {
                    const updated = { ...manipulator };
                    delete updated.to_if_alone;
                    onUpdate(updated);
                  } else {
                    onUpdate({ ...manipulator, to_if_alone: events });
                  }
                }}
                label=''
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs'>To If Held Down (when held)</Label>
                {manipulator.to_if_held_down && (
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => clearField('to_if_held_down')}
                  >
                    Clear
                  </Button>
                )}
              </div>
              <ToEventEditor
                events={manipulator.to_if_held_down || []}
                onChange={(events) => {
                  if (events.length === 0) {
                    const updated = { ...manipulator };
                    delete updated.to_if_held_down;
                    onUpdate(updated);
                  } else {
                    onUpdate({ ...manipulator, to_if_held_down: events });
                  }
                }}
                label=''
              />
            </div>

            <div className='space-y-2'>
              <Label className='text-xs'>
                To After Key Up (after key released)
              </Label>
              <ToEventEditor
                events={manipulator.to_after_key_up || []}
                onChange={updateToAfterKeyUp}
                label=''
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
