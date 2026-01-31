'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Rule, Manipulator } from '@/types/karabiner';
import { useToast } from '@/hooks/use-toast';
import { findConflictingManipulators } from '@/lib/validation';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { RuleTemplates } from './builder/rule-templates';
import { SortableRuleListItem } from './rule-list-item';
import { RuleDetailPanel } from './rule-detail-panel';

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
      if (rules.length === 0) return null;
      if (current === null) return 0;
      if (current >= rules.length) return rules.length - 1;
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
    if (!over || active.id === over.id) return;

    const oldIndex = active.id as number;
    const newIndex = over.id as number;
    const newRules = arrayMove(rules, oldIndex, newIndex);
    onRulesChange(newRules);

    setSelectedRuleIndex((current) => {
      if (current === null) return current;
      if (current === oldIndex) return newIndex;
      if (oldIndex < newIndex && current > oldIndex && current <= newIndex)
        return current - 1;
      if (oldIndex > newIndex && current < oldIndex && current >= newIndex)
        return current + 1;
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
    const newRule: Rule = { description: 'New Rule', manipulators: [] };
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
      if (current === ruleIndex)
        return Math.min(ruleIndex, newRules.length - 1);
      if (current > ruleIndex) return current - 1;
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

  const handleDeleteManipulator = (ruleIndex: number, manipIndex: number) => {
    const newRules = [...rules];
    newRules[ruleIndex].manipulators = newRules[ruleIndex].manipulators.filter(
      (_, index) => index !== manipIndex,
    );
    onRulesChange(newRules);
    toast({ title: 'Mapping deleted', description: 'Key mapping removed' });
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
              onDelete={() => handleDeleteRule(selectedRuleIndex!)}
              onUpdateDescription={(desc) =>
                handleUpdateDescription(selectedRuleIndex!, desc)
              }
              onDeleteManipulator={(manipIndex) =>
                handleDeleteManipulator(selectedRuleIndex!, manipIndex)
              }
              onUpdateManipulator={(manipIndex, manipulator) =>
                handleUpdateManipulator(
                  selectedRuleIndex!,
                  manipIndex,
                  manipulator,
                )
              }
              onReorderManipulators={(newManipulators) =>
                handleReorderManipulators(selectedRuleIndex!, newManipulators)
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
