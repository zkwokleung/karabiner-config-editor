import { SwitchField } from '@/components/configurations/fields/switch-field';
import { Card } from '@/components/ui/card';
import type { GlobalSettings, VirtualHidKeyboard } from '@/types/karabiner';

interface UiTabProps {
  globalSettings: GlobalSettings;
  virtualKeyboard: VirtualHidKeyboard;
  onGlobalSettingChange: <K extends keyof GlobalSettings>(
    key: K,
    value: GlobalSettings[K],
    defaultValue: GlobalSettings[K],
  ) => void;
  onVirtualKeyboardSettingChange: <K extends keyof VirtualHidKeyboard>(
    key: K,
    value: VirtualHidKeyboard[K],
    defaultValue: VirtualHidKeyboard[K],
  ) => void;
}

export function UiTab({
  globalSettings,
  virtualKeyboard,
  onGlobalSettingChange,
  onVirtualKeyboardSettingChange,
}: UiTabProps) {
  return (
    <Card className='p-4 space-y-4'>
      <div>
        <h3 className='text-sm font-semibold'>UI Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Configure Karabiner global interface preferences.
        </p>
      </div>

      <div className='space-y-3'>
        <h4 className='text-sm font-semibold'>Menu bar</h4>
        <div className='grid gap-2'>
          <SwitchField
            id='ui-show-menu-bar'
            label='Show icon in menu bar (Default: on)'
            checked={globalSettings.show_in_menu_bar ?? true}
            onCheckedChange={(checked) =>
              onGlobalSettingChange('show_in_menu_bar', checked, true)
            }
          />
          <SwitchField
            id='ui-show-profile-name'
            label='Show profile name in menu bar (Default: off)'
            checked={globalSettings.show_profile_name_in_menu_bar ?? false}
            onCheckedChange={(checked) =>
              onGlobalSettingChange(
                'show_profile_name_in_menu_bar',
                checked,
                false,
              )
            }
          />
          <SwitchField
            id='ui-show-additional-menu-items'
            label='Show additional menu items (Default: off)'
            checked={globalSettings.show_additional_menu_items ?? false}
            onCheckedChange={(checked) =>
              onGlobalSettingChange(
                'show_additional_menu_items',
                checked,
                false,
              )
            }
          />
          <SwitchField
            id='ui-ask-before-quit'
            label='Ask for confirmation when quitting (Default: on)'
            checked={
              globalSettings.ask_for_confirmation_before_quitting ?? true
            }
            onCheckedChange={(checked) =>
              onGlobalSettingChange(
                'ask_for_confirmation_before_quitting',
                checked,
                true,
              )
            }
          />
        </div>
      </div>

      <div className='space-y-3'>
        <h4 className='text-sm font-semibold'>Karabiner Notification Window</h4>
        <div className='grid gap-2'>
          <SwitchField
            id='ui-enable-notification-window'
            label='Enable Karabiner Notification Window (Default: on)'
            checked={globalSettings.enable_notification_window ?? true}
            onCheckedChange={(checked) =>
              onGlobalSettingChange('enable_notification_window', checked, true)
            }
          />
          <SwitchField
            id='ui-indicate-sticky-modifier-keys-state'
            label='Indicate sticky modifier keys state (Default: on)'
            checked={
              virtualKeyboard.indicate_sticky_modifier_keys_state ?? true
            }
            onCheckedChange={(checked) =>
              onVirtualKeyboardSettingChange(
                'indicate_sticky_modifier_keys_state',
                checked,
                true,
              )
            }
          />
        </div>
      </div>
    </Card>
  );
}
