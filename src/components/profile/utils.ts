import type { Device } from '@/types/karabiner';

export function formatDeviceLabel(device: Device, index: number): string {
  const { identifiers } = device;
  const descriptorParts: string[] = [];

  if (identifiers?.vendor_id) {
    descriptorParts.push(`Vendor ${identifiers.vendor_id}`);
  }
  if (identifiers?.product_id) {
    descriptorParts.push(`Product ${identifiers.product_id}`);
  }
  if (identifiers?.is_keyboard) {
    descriptorParts.push('Keyboard');
  }
  if (identifiers?.is_pointing_device) {
    descriptorParts.push('Pointing device');
  }

  if (descriptorParts.length === 0) {
    return `Device ${index + 1}`;
  }

  return `Device ${index + 1} • ${descriptorParts.join(' • ')}`;
}

export function buildDeviceLabelLookup(
  devices: Device[] | undefined,
): Map<number, string> {
  const map = new Map<number, string>();
  devices?.forEach((device, index) => {
    map.set(index, formatDeviceLabel(device, index));
  });
  return map;
}
