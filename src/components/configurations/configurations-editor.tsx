'use client';

import {
  MOUSE_KEY_XY_SCALE_DEFAULT,
  type ProfileParameterKey,
} from '@/components/configurations/constants';
import { ParameterTab } from '@/components/configurations/tabs/parameter-tab';
import { UiTab } from '@/components/configurations/tabs/ui-tab';
import { VirtualKeyboardTab } from '@/components/configurations/tabs/virtual-keyboard-tab';
import {
  normalizeOptionalObject,
  normalizeProfileParameters,
} from '@/components/configurations/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  ComplexModifications,
  GlobalSettings,
  Profile,
  VirtualHidKeyboard,
} from '@/types/karabiner';

interface ConfigurationsEditorProps {
  profile: Profile;
  globalSettings?: GlobalSettings;
  onProfileChange: (profile: Profile) => void;
  onGlobalSettingsChange: (settings: GlobalSettings) => void;
}

export function ConfigurationsEditor({
  profile,
  globalSettings,
  onProfileChange,
  onGlobalSettingsChange,
}: ConfigurationsEditorProps) {
  const safeGlobalSettings = globalSettings ?? {};

  const updateVirtualKeyboard = (updates: Partial<VirtualHidKeyboard>) => {
    const current = profile.virtual_hid_keyboard ?? {};
    const hasMouseKeyScaleUpdate = Object.prototype.hasOwnProperty.call(
      updates,
      'mouse_key_xy_scale',
    );
    const hasStickyIndicatorUpdate = Object.prototype.hasOwnProperty.call(
      updates,
      'indicate_sticky_modifier_keys_state',
    );
    const normalizedUpdates: Partial<VirtualHidKeyboard> = {
      ...updates,
    };

    if (hasMouseKeyScaleUpdate) {
      normalizedUpdates.mouse_key_xy_scale =
        updates.mouse_key_xy_scale === MOUSE_KEY_XY_SCALE_DEFAULT
          ? undefined
          : updates.mouse_key_xy_scale;
    }

    if (hasStickyIndicatorUpdate) {
      normalizedUpdates.indicate_sticky_modifier_keys_state =
        updates.indicate_sticky_modifier_keys_state === true
          ? undefined
          : updates.indicate_sticky_modifier_keys_state;
    }

    const next = normalizeOptionalObject<VirtualHidKeyboard>({
      ...current,
      ...normalizedUpdates,
    });

    onProfileChange({ ...profile, virtual_hid_keyboard: next });
  };

  const updateGlobalSetting = <K extends keyof GlobalSettings>(
    key: K,
    value: GlobalSettings[K],
    defaultValue?: GlobalSettings[K],
  ) => {
    const normalizedValue =
      defaultValue !== undefined && value === defaultValue ? undefined : value;

    const nextGlobal = normalizeOptionalObject<GlobalSettings>({
      ...safeGlobalSettings,
      [key]: normalizedValue,
    });
    onGlobalSettingsChange(nextGlobal ?? {});
  };

  const updateVirtualKeyboardSetting = <K extends keyof VirtualHidKeyboard>(
    key: K,
    value: VirtualHidKeyboard[K],
    defaultValue?: VirtualHidKeyboard[K],
  ) => {
    const normalizedValue =
      defaultValue !== undefined && value === defaultValue ? undefined : value;

    updateVirtualKeyboard({
      [key]: normalizedValue,
    } as Partial<VirtualHidKeyboard>);
  };

  const updateProfileParameter = (
    key: ProfileParameterKey,
    value: number | undefined,
  ) => {
    const currentComplex = profile.complex_modifications;
    const currentParameters = currentComplex?.parameters ?? {};
    const nextParameters = normalizeProfileParameters({
      ...currentParameters,
      [key]: value,
    });

    const nextComplex = normalizeOptionalObject<ComplexModifications>({
      ...(currentComplex ?? {}),
      parameters: nextParameters,
    });

    onProfileChange({
      ...profile,
      complex_modifications: nextComplex,
    });
  };

  return (
    <Tabs defaultValue='virtual-keyboard' className='w-full'>
      <TabsList className='grid w-full grid-cols-3 mb-6'>
        <TabsTrigger value='virtual-keyboard' className='cursor-pointer'>
          Virtual Keyboard
        </TabsTrigger>
        <TabsTrigger value='parameter' className='cursor-pointer'>
          Parameter
        </TabsTrigger>
        <TabsTrigger value='ui' className='cursor-pointer'>
          UI
        </TabsTrigger>
      </TabsList>

      <TabsContent value='virtual-keyboard'>
        <VirtualKeyboardTab
          virtualKeyboard={profile.virtual_hid_keyboard ?? {}}
          onVirtualKeyboardChange={updateVirtualKeyboard}
        />
      </TabsContent>

      <TabsContent value='parameter'>
        <ParameterTab
          profileParameters={profile.complex_modifications?.parameters ?? {}}
          onProfileParameterChange={updateProfileParameter}
        />
      </TabsContent>

      <TabsContent value='ui'>
        <UiTab
          globalSettings={safeGlobalSettings}
          virtualKeyboard={profile.virtual_hid_keyboard ?? {}}
          onGlobalSettingChange={updateGlobalSetting}
          onVirtualKeyboardSettingChange={updateVirtualKeyboardSetting}
        />
      </TabsContent>
    </Tabs>
  );
}
