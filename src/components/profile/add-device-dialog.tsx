'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { Device } from '@/types/karabiner';

interface AddDeviceDialogProps {
  onAdd: (device: Device) => void;
  buttonVariant?: 'default' | 'outline';
  buttonClassName?: string;
}

export function AddDeviceDialog({
  onAdd,
  buttonVariant = 'outline',
  buttonClassName,
}: AddDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [isKeyboard, setIsKeyboard] = useState(true);
  const [isPointingDevice, setIsPointingDevice] = useState(false);

  const handleAdd = () => {
    const device: Device = {
      identifiers: {
        vendor_id: vendorId ? Number.parseInt(vendorId, 10) : undefined,
        product_id: productId ? Number.parseInt(productId, 10) : undefined,
        is_keyboard: isKeyboard,
        is_pointing_device: isPointingDevice,
      },
    };

    onAdd(device);

    setVendorId('');
    setProductId('');
    setIsKeyboard(true);
    setIsPointingDevice(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size='sm'
          variant={buttonVariant}
          className={
            buttonClassName ?? 'cursor-pointer bg-transparent h-8 w-8 p-0'
          }
        >
          <Plus className='h-4 w-4' />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Device Configuration</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 pt-4'>
          <div className='space-y-2'>
            <Label htmlFor='vendor-id'>Vendor ID (optional)</Label>
            <Input
              id='vendor-id'
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
              placeholder='Vendor ID'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='product-id'>Product ID (optional)</Label>
            <Input
              id='product-id'
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              placeholder='Product ID'
            />
          </div>

          <div className='space-y-2'>
            <Label>Device Type</Label>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='is-keyboard'
                checked={isKeyboard}
                onCheckedChange={(checked) => setIsKeyboard(!!checked)}
              />
              <Label htmlFor='is-keyboard' className='text-sm font-normal'>
                Keyboard
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='is-pointing-device'
                checked={isPointingDevice}
                onCheckedChange={(checked) => setIsPointingDevice(!!checked)}
              />
              <Label
                htmlFor='is-pointing-device'
                className='text-sm font-normal'
              >
                Pointing Device
              </Label>
            </div>
          </div>

          <Button onClick={handleAdd} className='w-full'>
            Add Device
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
