'use client';

import type { Manipulator } from '@/types/karabiner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ManipulatorBuilderPanel } from './manipulator-builder-panel';
import { ComplexModificationKeyboard } from '../keyboard/complex-modification-keyboard';

interface MappingBuilderDialogProps {
  open: boolean;
  title: string;
  fromKey: string;
  manipulators: Manipulator[];
  existingManipulators?: Manipulator[];
  onSave: (manipulators: Manipulator[]) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onSelectFromKey: (keyCode: string) => void;
}

export function MappingBuilderDialog({
  open,
  title,
  fromKey,
  manipulators,
  existingManipulators = [],
  onSave,
  onCancel,
  onDelete,
  onSelectFromKey,
}: MappingBuilderDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel();
        }
      }}
    >
      <DialogContent className='sm:max-w-4xl' showCloseButton={false}>
        <DialogHeader className='sr-only'>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {fromKey ? (
          <ManipulatorBuilderPanel
            fromKey={fromKey}
            existingManipulators={existingManipulators}
            onSave={onSave}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        ) : (
          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-semibold'>Create Mapping</h3>
            </div>
            <ComplexModificationKeyboard
              manipulators={manipulators}
              onKeyClick={onSelectFromKey}
              selectedFromKey={null}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
