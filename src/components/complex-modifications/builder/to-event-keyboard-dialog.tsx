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

interface ToEventKeyboardDialogProps {
  open: boolean;
  selectedKey?: string | null;
  onSelectKey: (keyCode: string) => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function ToEventKeyboardDialog({
  open,
  selectedKey,
  onSelectKey,
  onConfirm,
  onOpenChange,
}: ToEventKeyboardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Select From Keyboard</DialogTitle>
        </DialogHeader>
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
