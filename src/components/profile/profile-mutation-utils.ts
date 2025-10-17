import type { Device, Profile } from '@/types/karabiner';

export type ProfileMutator = (draft: Profile) => boolean | void;

export function applyProfileUpdate(
  profile: Profile,
  onProfileChange: (profile: Profile) => void,
  mutator: ProfileMutator,
): boolean {
  const draft: Profile = {
    ...profile,
    simple_modifications: profile.simple_modifications
      ? [...profile.simple_modifications]
      : undefined,
    fn_function_keys: profile.fn_function_keys
      ? [...profile.fn_function_keys]
      : undefined,
    devices: profile.devices?.map((device) => ({
      ...device,
      simple_modifications: device.simple_modifications
        ? [...device.simple_modifications]
        : undefined,
      fn_function_keys: device.fn_function_keys
        ? [...device.fn_function_keys]
        : undefined,
    })),
  };

  const result = mutator(draft);
  if (result === false) {
    return false;
  }

  onProfileChange(draft);
  return true;
}

export function addDeviceToProfile(
  profile: Profile,
  onProfileChange: (profile: Profile) => void,
  device: Device,
): boolean {
  return applyProfileUpdate(profile, onProfileChange, (draft) => {
    const devices = draft.devices ? [...draft.devices] : [];
    devices.push(device);
    draft.devices = devices;
  });
}

export function removeDeviceFromProfile(
  profile: Profile,
  onProfileChange: (profile: Profile) => void,
  deviceIndex: number,
): boolean {
  return applyProfileUpdate(profile, onProfileChange, (draft) => {
    if (!draft.devices || !draft.devices[deviceIndex]) {
      return false;
    }
    draft.devices = draft.devices.filter((_, index) => index !== deviceIndex);
  });
}
