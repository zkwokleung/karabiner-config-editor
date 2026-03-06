# User Guide

## Who This Is For

Users who want to create or edit Karabiner-Elements configuration files using a
visual editor.

## What You Need

- A browser
- Optional: an existing `karabiner.json`

## Import a Configuration

You can start in three ways:

1. **Use Default Config** to create a minimal starter file.
2. **Upload Config File** to import an existing `karabiner.json`.
3. **Paste JSON Config** for direct text-based import.

If JSON is invalid, the editor will show an error and keep your current state.

## Edit Profiles and Mappings

In the **Edit** tab:

- Manage profiles (create, rename, delete)
- Edit simple modifications per profile or per device
- Edit fn key mappings per profile or per device
- Build complex modifications with keyboard/list workflows
- Manage Configurations for Devices, Virtual Keyboard, and UI settings

## Use Complex Rule Builder

Inside a rule you can:

- add and reorder manipulators
- add optional description text per manipulator
- set `from` key and modifiers
- add one or more `to` events
- add conditions
- configure advanced actions (`to_if_alone`, `to_if_held_down`, etc.)

You can also start from built-in rule templates.

## Configure Devices, Virtual Keyboard, and UI

In the **Configurations** tab:

- **Devices**: add/remove devices and set identifiers (`vendor_id`,
  `product_id`, keyboard/pointing flags) plus device options (`ignore`,
  `disable_built_in_keyboard_if_exists`, `treat_as_built_in_keyboard`).
- **Virtual Keyboard**: configure `country_code`, `mouse_key_xy_scale`,
  `caps_lock_delay_milliseconds`, and sticky modifier key indicator behavior.
- **UI**: control global preferences like update checks, menu bar visibility,
  profile name in menu bar, quit confirmation, and unsafe UI mode.

## Validate and Export

In the **Export** tab:

- Review warnings and errors
- Download `karabiner.json`
- Copy formatted JSON to clipboard
- Inspect mappings on a visual keyboard (click a key to see all matching simple,
  fn, and complex mappings)

Export is blocked while validation contains severity `error`.

## Recommended Safe Workflow

1. Import your current working config.
2. Make one focused change at a time.
3. Check validation output after each change.
4. Export and test in Karabiner-Elements.
5. Keep previous known-good config as backup.

## Troubleshooting

- **Invalid JSON on import**: validate syntax before pasting/uploading.
- **Export blocked**: resolve all errors listed in validation panel.
- **Unexpected remap behavior**: check duplicate/conflicting mappings and rule
  order.
