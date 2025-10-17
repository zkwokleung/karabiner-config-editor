export type DeviceScope =
  | {
      type: 'profile';
    }
  | {
      type: 'device';
      deviceIndex: number;
    };

export interface DeviceTargetOption {
  label: string;
  value: string;
  target: DeviceScope;
}

export type DeviceLabelLookup = Map<number, string>;
