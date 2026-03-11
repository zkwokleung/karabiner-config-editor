import { CheckboxField } from '@/components/configurations/fields/checkbox-field';
import { Card } from '@/components/ui/card';
import type { GlobalSettings } from '@/types/karabiner';

interface UiTabProps {
  globalSettings: GlobalSettings;
  onGlobalSettingChange: <K extends keyof GlobalSettings>(
    key: K,
    value: GlobalSettings[K],
  ) => void;
}

export function UiTab({ globalSettings, onGlobalSettingChange }: UiTabProps) {
  return (
    <Card className='p-4 space-y-4'>
      <div>
        <h3 className='text-sm font-semibold'>UI Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Configure Karabiner global interface preferences.
        </p>
      </div>

      <div className='grid gap-2'>
        <CheckboxField
          id='ui-ask-before-quit'
          label='Ask for confirmation before quitting'
          checked={Boolean(globalSettings.ask_for_confirmation_before_quitting)}
          onCheckedChange={(checked) =>
            onGlobalSettingChange(
              'ask_for_confirmation_before_quitting',
              checked ? true : undefined,
            )
          }
        />
        <CheckboxField
          id='ui-check-updates'
          label='Check for updates on startup'
          checked={Boolean(globalSettings.check_for_updates_on_startup)}
          onCheckedChange={(checked) =>
            onGlobalSettingChange(
              'check_for_updates_on_startup',
              checked ? true : undefined,
            )
          }
        />
        <CheckboxField
          id='ui-show-menu-bar'
          label='Show icon in menu bar'
          checked={Boolean(globalSettings.show_in_menu_bar)}
          onCheckedChange={(checked) =>
            onGlobalSettingChange(
              'show_in_menu_bar',
              checked ? true : undefined,
            )
          }
        />
        <CheckboxField
          id='ui-show-profile-name'
          label='Show profile name in menu bar'
          checked={Boolean(globalSettings.show_profile_name_in_menu_bar)}
          onCheckedChange={(checked) =>
            onGlobalSettingChange(
              'show_profile_name_in_menu_bar',
              checked ? true : undefined,
            )
          }
        />
        <CheckboxField
          id='ui-unsafe-mode'
          label='Enable unsafe UI mode'
          checked={Boolean(globalSettings.unsafe_ui)}
          onCheckedChange={(checked) =>
            onGlobalSettingChange('unsafe_ui', checked ? true : undefined)
          }
        />
      </div>
    </Card>
  );
}
