// Karabiner-Elements configuration types based on official documentation

export interface KarabinerConfig {
  global: GlobalSettings
  profiles: Profile[]
}

export interface GlobalSettings {
  ask_for_confirmation_before_quitting?: boolean
  check_for_updates_on_startup?: boolean
  show_in_menu_bar?: boolean
  show_profile_name_in_menu_bar?: boolean
  unsafe_ui?: boolean
}

export interface Profile {
  name: string
  selected?: boolean
  simple_modifications?: SimpleModification[]
  fn_function_keys?: FnFunctionKey[]
  complex_modifications?: ComplexModifications
  virtual_hid_keyboard?: VirtualHidKeyboard
  devices?: Device[]
}

export interface SimpleModification {
  from: KeyCode
  to: KeyCode | KeyCode[]
}

export interface KeyCode {
  key_code?: string
  consumer_key_code?: string
  pointing_button?: string
}

export interface FnFunctionKey {
  from: KeyCode
  to: KeyCode | KeyCode[]
}

export interface ComplexModifications {
  parameters?: Parameters
  rules?: Rule[]
}

export interface Parameters {
  "basic.simultaneous_threshold_milliseconds"?: number
  "basic.to_delayed_action_delay_milliseconds"?: number
  "basic.to_if_alone_timeout_milliseconds"?: number
  "basic.to_if_held_down_threshold_milliseconds"?: number
  "mouse_motion_to_scroll.speed"?: number
}

export interface Rule {
  description: string
  manipulators: Manipulator[]
}

export interface Manipulator {
  type: string
  from: FromEvent
  to?: ToEvent[]
  to_if_alone?: ToEvent[]
  to_if_held_down?: ToEvent[]
  to_after_key_up?: ToEvent[]
  to_delayed_action?: DelayedAction
  conditions?: Condition[]
  parameters?: Parameters
}

export interface FromEvent {
  key_code?: string
  consumer_key_code?: string
  pointing_button?: string
  modifiers?: Modifiers
  simultaneous?: KeyCode[]
  simultaneous_options?: SimultaneousOptions
}

export interface ToEvent {
  key_code?: string
  consumer_key_code?: string
  pointing_button?: string
  shell_command?: string
  select_input_source?: InputSource
  set_variable?: Variable
  mouse_key?: MouseKey
  modifiers?: string[]
  lazy?: boolean
  repeat?: boolean
  halt?: boolean
  hold_down_milliseconds?: number
}

export interface Modifiers {
  mandatory?: string[]
  optional?: string[]
}

export interface SimultaneousOptions {
  detect_key_down_uninterruptedly?: boolean
  key_down_order?: string
  key_up_order?: string
  key_up_when?: string
  to_after_key_up?: ToEvent[]
}

export interface DelayedAction {
  to_if_invoked?: ToEvent[]
  to_if_canceled?: ToEvent[]
}

export interface Condition {
  type: string
  name?: string
  value?: number | string
  bundle_identifiers?: string[]
  file_paths?: string[]
  description?: string
  identifiers?: DeviceIdentifier[]
  keyboard_types?: string[]
}

export interface InputSource {
  language?: string
  input_source_id?: string
  input_mode_id?: string
}

export interface Variable {
  name: string
  value: number | string
}

export interface MouseKey {
  x?: number
  y?: number
  vertical_wheel?: number
  horizontal_wheel?: number
  speed_multiplier?: number
}

export interface VirtualHidKeyboard {
  country_code?: number
  mouse_key_xy_scale?: number
  indicate_sticky_modifier_keys_state?: boolean
  caps_lock_delay_milliseconds?: number
}

export interface Device {
  identifiers: DeviceIdentifier
  ignore?: boolean
  disable_built_in_keyboard_if_exists?: boolean
  fn_function_keys?: FnFunctionKey[]
  simple_modifications?: SimpleModification[]
  treat_as_built_in_keyboard?: boolean
}

export interface DeviceIdentifier {
  vendor_id?: number
  product_id?: number
  is_keyboard?: boolean
  is_pointing_device?: boolean
}
