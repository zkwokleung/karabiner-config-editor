'use client';

import { useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, Keyboard, List } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Rule, Manipulator } from '@/types/karabiner';
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
import { ComplexModificationKeyboard } from './keyboard/complex-modification-keyboard';
import { KeyMappingList } from './keyboard/key-mapping-list';
import { MappingBuilderDialog } from './builder/mapping-builder-dialog';
import { SortableMappingSummary } from './mapping-summary';

interface RuleDetailPanelProps {
  rule: Rule;
  onDelete: () => void;
  onUpdateDescription: (desc: string) => void;
  onDeleteManipulator: (index: number) => void;
  onUpdateManipulator: (index: number, manipulator: Manipulator) => void;
  onReorderManipulators: (manipulators: Manipulator[]) => void;
}

export function RuleDetailPanel({
  rule,
  onDelete,
  onUpdateDescription,
  onDeleteManipulator,
  onUpdateManipulator,
  onReorderManipulators,
}: RuleDetailPanelProps) {
  const [selectedFromKey, setSelectedFromKey] = useState<string | null>(null);
  const [editingManipulatorIndex, setEditingManipulatorIndex] = useState<
    number | null
  >(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('keyboard');

  const manipulatorSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const getManipulatorIndicesForKey = useCallback(
    (keyCode: string) => {
      return rule.manipulators
        .map((m, i) => ({ m, i }))
        .filter(
          ({ m }) =>
            m.from.key_code === keyCode || m.from.consumer_key_code === keyCode,
        )
        .map(({ i }) => i);
    },
    [rule.manipulators],
  );

  const selectedKeyIndices = useMemo(() => {
    if (!selectedFromKey) return [];
    return getManipulatorIndicesForKey(selectedFromKey);
  }, [selectedFromKey, getManipulatorIndicesForKey]);

  const handleKeyboardKeyClick = useCallback((keyCode: string) => {
    setSelectedFromKey(keyCode);
    setEditingManipulatorIndex(null);
    setIsCreatingNew(false);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedFromKey(null);
    setEditingManipulatorIndex(null);
    setIsCreatingNew(false);
  }, []);

  const handleAddManipulatorForKey = useCallback(() => {
    if (!selectedFromKey) return;
    setIsCreatingNew(true);
    setEditingManipulatorIndex(null);
  }, [selectedFromKey]);

  const handleEditManipulator = useCallback((index: number) => {
    setEditingManipulatorIndex(index);
    setIsCreatingNew(false);
  }, []);

  const handleBuilderCancel = useCallback(() => {
    setEditingManipulatorIndex(null);
    setIsCreatingNew(false);
  }, []);

  const handleBuilderDelete = useCallback(() => {
    if (editingManipulatorIndex !== null) {
      onDeleteManipulator(editingManipulatorIndex);
      setEditingManipulatorIndex(null);
    }
  }, [editingManipulatorIndex, onDeleteManipulator]);

  const handleManipulatorDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = active.id as number;
    const newIndex = over.id as number;
    const newManipulators = arrayMove(rule.manipulators, oldIndex, newIndex);
    onReorderManipulators(newManipulators);
  };

  const handleAddMappingFromList = useCallback(() => {
    setSelectedFromKey(null);
    setIsCreatingNew(true);
    setEditingManipulatorIndex(null);
  }, []);

  const handleEditFromList = useCallback(
    (index: number) => {
      const manipulator = rule.manipulators[index];
      const fromKey =
        manipulator.from.key_code || manipulator.from.consumer_key_code || '';
      setSelectedFromKey(fromKey);
      setEditingManipulatorIndex(index);
      setIsCreatingNew(false);
    },
    [rule.manipulators],
  );

  const handleBuilderSave = useCallback(
    (newManipulators: Manipulator[]) => {
      if (editingManipulatorIndex !== null) {
        if (newManipulators.length > 0) {
          onUpdateManipulator(editingManipulatorIndex, newManipulators[0]);
        }
      } else if (isCreatingNew) {
        const updatedManipulators = [...rule.manipulators, ...newManipulators];
        onReorderManipulators(updatedManipulators);
      }
      setEditingManipulatorIndex(null);
      setIsCreatingNew(false);
      setSelectedFromKey(null);
    },
    [
      editingManipulatorIndex,
      isCreatingNew,
      rule.manipulators,
      onUpdateManipulator,
      onReorderManipulators,
    ],
  );

  const showMappingList =
    selectedFromKey && !editingManipulatorIndex && !isCreatingNew;
  const showBuilder = editingManipulatorIndex !== null || isCreatingNew;

  const builderFromKey =
    editingManipulatorIndex !== null
      ? rule.manipulators[editingManipulatorIndex]?.from.key_code ||
        rule.manipulators[editingManipulatorIndex]?.from.consumer_key_code ||
        ''
      : selectedFromKey || '';
  const builderExistingManipulators =
    editingManipulatorIndex !== null
      ? [rule.manipulators[editingManipulatorIndex]]
      : [];

  const dialogTitle = isCreatingNew ? 'Create Mapping' : 'Edit Mapping';

  return (
    <div className='space-y-4'>
      <Card className='p-4'>
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
      </Card>

      <Card className='p-4'>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className='flex items-center justify-between mb-4'>
            <TabsList>
              <TabsTrigger value='keyboard' className='gap-2'>
                <Keyboard className='h-4 w-4' />
                Keyboard
              </TabsTrigger>
              <TabsTrigger value='list' className='gap-2'>
                <List className='h-4 w-4' />
                List
              </TabsTrigger>
            </TabsList>
            <Badge variant='secondary'>
              {rule.manipulators.length} mapping
              {rule.manipulators.length === 1 ? '' : 's'}
            </Badge>
          </div>

          <TabsContent value='keyboard' className='mt-0 space-y-4'>
            <ComplexModificationKeyboard
              manipulators={rule.manipulators}
              onKeyClick={handleKeyboardKeyClick}
              selectedFromKey={selectedFromKey}
            />

            {showMappingList && (
              <KeyMappingList
                selectedKey={selectedFromKey}
                manipulators={rule.manipulators}
                manipulatorIndices={selectedKeyIndices}
                onAddManipulator={handleAddManipulatorForKey}
                onEditManipulator={handleEditManipulator}
                onDeleteManipulator={onDeleteManipulator}
                onClearSelection={handleClearSelection}
              />
            )}
          </TabsContent>

          <TabsContent value='list' className='mt-0 space-y-3'>
            {!showBuilder && (
              <>
                <div className='flex items-center justify-end'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={handleAddMappingFromList}
                    className='bg-transparent'
                  >
                    <Plus className='mr-2 h-3 w-3' />
                    Add Mapping
                  </Button>
                </div>

                {rule.manipulators.length === 0 ? (
                  <div className='py-8 text-center text-sm text-muted-foreground border rounded-lg border-dashed'>
                    No mappings yet. Click &quot;Add Mapping&quot; to create
                    one.
                  </div>
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
                      <div className='space-y-2'>
                        {rule.manipulators.map(
                          (manipulator, manipulatorIndex) => (
                            <SortableMappingSummary
                              key={manipulatorIndex}
                              manipulator={manipulator}
                              manipulatorIndex={manipulatorIndex}
                              onEdit={() =>
                                handleEditFromList(manipulatorIndex)
                              }
                              onDelete={() =>
                                onDeleteManipulator(manipulatorIndex)
                              }
                            />
                          ),
                        )}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <MappingBuilderDialog
        open={showBuilder}
        title={dialogTitle}
        fromKey={builderFromKey}
        existingManipulators={builderExistingManipulators}
        onSave={handleBuilderSave}
        onCancel={handleBuilderCancel}
        onDelete={
          editingManipulatorIndex !== null ? handleBuilderDelete : undefined
        }
      />
    </div>
  );
}
