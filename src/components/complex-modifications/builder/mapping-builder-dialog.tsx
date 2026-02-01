'use client';

import type { Manipulator } from '@/types/karabiner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ManipulatorBuilderPanel } from './manipulator-builder-panel';

interface MappingBuilderDialogProps {
  open: boolean;
  title: string;
  fromKey: string;
  existingManipulators?: Manipulator[];
  onSave: (manipulators: Manipulator[]) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function MappingBuilderDialog({
  open,
  title,
  fromKey,
  existingManipulators = [],
  onSave,
  onCancel,
  onDelete,
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
      <DialogContent className='sm:max-w-6xl' showCloseButton={false}>
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
          <div className='text-sm text-muted-foreground'>
            Select a key to create a mapping.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
