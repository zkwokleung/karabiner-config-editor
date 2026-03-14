'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ComplexModificationKeyboard } from '../keyboard/complex-modification-keyboard';

interface KeyboardSelectDialogProps {
  open: boolean;
  title?: string;
  selectedKey?: string | null;
  onSelectKey: (keyCode: string) => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardSelectDialog({
  open,
  title = 'Select Key',
  selectedKey,
  onSelectKey,
  onConfirm,
  onOpenChange,
}: KeyboardSelectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className='text-xs text-muted-foreground'>
          Displayed symbols follow the selected layout. The saved value uses
          key_code.
        </p>
        <ComplexModificationKeyboard
          manipulators={[]}
          mode='select-to'
          selectedToKeys={selectedKey ? [selectedKey] : []}
          onToKeyToggle={onSelectKey}
          showMappedKeys={false}
          selectedKeys={selectedKey ? [selectedKey] : []}
        />
        <DialogFooter>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
