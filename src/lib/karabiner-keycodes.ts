// Full list of Karabiner-Elements key codes from official source
// Source: https://github.com/pqrs-org/Karabiner-Elements/blob/main/src/apps/SettingsWindow/Resources/simple_modifications.json

export interface KeyCodeItem {
  label: string
  key_code?: string
  consumer_key_code?: string
  pointing_button?: string
  apple_vendor_top_case_key_code?: string
  apple_vendor_keyboard_key_code?: string
  not_from?: boolean // Cannot be used as "from" key
}

export interface KeyCodeCategory {
  category: string
  items: KeyCodeItem[]
}

// Organized key codes by category
export const KARABINER_KEYCODES: KeyCodeCategory[] = [
  {
    category: "Disable this key",
    items: [{ label: "vk_none", key_code: "vk_none", not_from: true }],
  },
  {
    category: "Modifier keys",
    items: [
      { label: "caps_lock", key_code: "caps_lock" },
      { label: "left_control", key_code: "left_control" },
      { label: "left_shift", key_code: "left_shift" },
      { label: "left_option", key_code: "left_option" },
      { label: "left_command", key_code: "left_command" },
      { label: "right_control", key_code: "right_control" },
      { label: "right_shift", key_code: "right_shift" },
      { label: "right_option", key_code: "right_option" },
      { label: "right_command", key_code: "right_command" },
      { label: "fn (globe)", apple_vendor_top_case_key_code: "keyboard_fn" },
    ],
  },
  {
    category: "Controls and symbols",
    items: [
      { label: "return_or_enter", key_code: "return_or_enter" },
      { label: "escape", key_code: "escape" },
      { label: "delete_or_backspace", key_code: "delete_or_backspace" },
      { label: "delete_forward", key_code: "delete_forward" },
      { label: "tab", key_code: "tab" },
      { label: "spacebar", key_code: "spacebar" },
      { label: "hyphen (-)", key_code: "hyphen" },
      { label: "equal_sign (=)", key_code: "equal_sign" },
      { label: "open_bracket [", key_code: "open_bracket" },
      { label: "close_bracket ]", key_code: "close_bracket" },
      { label: "backslash (\\)", key_code: "backslash" },
      { label: "non_us_pound", key_code: "non_us_pound" },
      { label: "semicolon (;)", key_code: "semicolon" },
      { label: "quote (')", key_code: "quote" },
      { label: "grave_accent_and_tilde (`)", key_code: "grave_accent_and_tilde" },
      { label: "comma (,)", key_code: "comma" },
      { label: "period (.)", key_code: "period" },
      { label: "slash (/)", key_code: "slash" },
      { label: "non_us_backslash", key_code: "non_us_backslash" },
    ],
  },
  {
    category: "Arrow keys",
    items: [
      { label: "up_arrow", key_code: "up_arrow" },
      { label: "down_arrow", key_code: "down_arrow" },
      { label: "left_arrow", key_code: "left_arrow" },
      { label: "right_arrow", key_code: "right_arrow" },
      { label: "page_up", key_code: "page_up" },
      { label: "page_down", key_code: "page_down" },
      { label: "home", key_code: "home" },
      { label: "end", key_code: "end" },
    ],
  },
  {
    category: "Letter keys",
    items: [
      { label: "a", key_code: "a" },
      { label: "b", key_code: "b" },
      { label: "c", key_code: "c" },
      { label: "d", key_code: "d" },
      { label: "e", key_code: "e" },
      { label: "f", key_code: "f" },
      { label: "g", key_code: "g" },
      { label: "h", key_code: "h" },
      { label: "i", key_code: "i" },
      { label: "j", key_code: "j" },
      { label: "k", key_code: "k" },
      { label: "l", key_code: "l" },
      { label: "m", key_code: "m" },
      { label: "n", key_code: "n" },
      { label: "o", key_code: "o" },
      { label: "p", key_code: "p" },
      { label: "q", key_code: "q" },
      { label: "r", key_code: "r" },
      { label: "s", key_code: "s" },
      { label: "t", key_code: "t" },
      { label: "u", key_code: "u" },
      { label: "v", key_code: "v" },
      { label: "w", key_code: "w" },
      { label: "x", key_code: "x" },
      { label: "y", key_code: "y" },
      { label: "z", key_code: "z" },
    ],
  },
  {
    category: "Number keys",
    items: [
      { label: "1", key_code: "1" },
      { label: "2", key_code: "2" },
      { label: "3", key_code: "3" },
      { label: "4", key_code: "4" },
      { label: "5", key_code: "5" },
      { label: "6", key_code: "6" },
      { label: "7", key_code: "7" },
      { label: "8", key_code: "8" },
      { label: "9", key_code: "9" },
      { label: "0", key_code: "0" },
    ],
  },
  {
    category: "Function keys",
    items: [
      { label: "f1", key_code: "f1" },
      { label: "f2", key_code: "f2" },
      { label: "f3", key_code: "f3" },
      { label: "f4", key_code: "f4" },
      { label: "f5", key_code: "f5" },
      { label: "f6", key_code: "f6" },
      { label: "f7", key_code: "f7" },
      { label: "f8", key_code: "f8" },
      { label: "f9", key_code: "f9" },
      { label: "f10", key_code: "f10" },
      { label: "f11", key_code: "f11" },
      { label: "f12", key_code: "f12" },
      { label: "f13", key_code: "f13" },
      { label: "f14", key_code: "f14" },
      { label: "f15", key_code: "f15" },
      { label: "f16", key_code: "f16" },
      { label: "f17", key_code: "f17" },
      { label: "f18", key_code: "f18" },
      { label: "f19", key_code: "f19" },
      { label: "f20", key_code: "f20" },
      { label: "f21", key_code: "f21" },
      { label: "f22", key_code: "f22" },
      { label: "f23", key_code: "f23" },
      { label: "f24", key_code: "f24" },
    ],
  },
  {
    category: "Keypad keys",
    items: [
      { label: "keypad_num_lock", key_code: "keypad_num_lock" },
      { label: "keypad_slash", key_code: "keypad_slash" },
      { label: "keypad_asterisk", key_code: "keypad_asterisk" },
      { label: "keypad_hyphen", key_code: "keypad_hyphen" },
      { label: "keypad_plus", key_code: "keypad_plus" },
      { label: "keypad_enter", key_code: "keypad_enter" },
      { label: "keypad_1", key_code: "keypad_1" },
      { label: "keypad_2", key_code: "keypad_2" },
      { label: "keypad_3", key_code: "keypad_3" },
      { label: "keypad_4", key_code: "keypad_4" },
      { label: "keypad_5", key_code: "keypad_5" },
      { label: "keypad_6", key_code: "keypad_6" },
      { label: "keypad_7", key_code: "keypad_7" },
      { label: "keypad_8", key_code: "keypad_8" },
      { label: "keypad_9", key_code: "keypad_9" },
      { label: "keypad_0", key_code: "keypad_0" },
      { label: "keypad_period", key_code: "keypad_period" },
      { label: "keypad_equal_sign", key_code: "keypad_equal_sign" },
      { label: "keypad_comma", key_code: "keypad_comma" },
    ],
  },
  {
    category: "Media controls",
    items: [
      { label: "mute", consumer_key_code: "mute" },
      { label: "volume_decrement", consumer_key_code: "volume_decrement" },
      { label: "volume_increment", consumer_key_code: "volume_increment" },
      { label: "display_brightness_decrement", key_code: "display_brightness_decrement" },
      { label: "display_brightness_increment", key_code: "display_brightness_increment" },
      { label: "rewind", consumer_key_code: "rewind" },
      { label: "play_or_pause", consumer_key_code: "play_or_pause" },
      { label: "fastforward", consumer_key_code: "fastforward" },
      { label: "eject", consumer_key_code: "eject" },
      { label: "apple_display_brightness_decrement", apple_vendor_top_case_key_code: "brightness_down" },
      { label: "apple_display_brightness_increment", apple_vendor_top_case_key_code: "brightness_up" },
      { label: "apple_top_case_display_brightness_decrement", apple_vendor_keyboard_key_code: "brightness_down" },
      { label: "apple_top_case_display_brightness_increment", apple_vendor_keyboard_key_code: "brightness_up" },
      { label: "dashboard", apple_vendor_top_case_key_code: "dashboard" },
      { label: "launchpad", apple_vendor_top_case_key_code: "launchpad" },
      { label: "mission_control", apple_vendor_top_case_key_code: "mission_control" },
      { label: "illumination_decrement", apple_vendor_top_case_key_code: "illumination_down" },
      { label: "illumination_increment", apple_vendor_top_case_key_code: "illumination_up" },
    ],
  },
  {
    category: "PC keyboard keys",
    items: [
      { label: "print_screen", key_code: "print_screen" },
      { label: "scroll_lock", key_code: "scroll_lock" },
      { label: "pause", key_code: "pause" },
      { label: "insert", key_code: "insert" },
      { label: "application", key_code: "application" },
      { label: "help", key_code: "help" },
      { label: "power", key_code: "power" },
      { label: "execute", key_code: "execute" },
      { label: "menu", key_code: "menu" },
      { label: "select", key_code: "select" },
      { label: "stop", key_code: "stop" },
      { label: "again", key_code: "again" },
      { label: "undo", key_code: "undo" },
      { label: "cut", key_code: "cut" },
      { label: "copy", key_code: "copy" },
      { label: "paste", key_code: "paste" },
      { label: "find", key_code: "find" },
    ],
  },
  {
    category: "International keys",
    items: [
      { label: "international1", key_code: "international1" },
      { label: "international2", key_code: "international2" },
      { label: "international3", key_code: "international3" },
      { label: "international4", key_code: "international4" },
      { label: "international5", key_code: "international5" },
      { label: "international6", key_code: "international6" },
      { label: "international7", key_code: "international7" },
      { label: "international8", key_code: "international8" },
      { label: "international9", key_code: "international9" },
      { label: "lang1", key_code: "lang1" },
      { label: "lang2", key_code: "lang2" },
      { label: "lang3", key_code: "lang3" },
      { label: "lang4", key_code: "lang4" },
      { label: "lang5", key_code: "lang5" },
      { label: "lang6", key_code: "lang6" },
      { label: "lang7", key_code: "lang7" },
      { label: "lang8", key_code: "lang8" },
      { label: "lang9", key_code: "lang9" },
    ],
  },
  {
    category: "Japanese keys",
    items: [
      { label: "japanese_eisuu", key_code: "japanese_eisuu" },
      { label: "japanese_kana", key_code: "japanese_kana" },
      { label: "japanese_pc_nfer", key_code: "japanese_pc_nfer" },
      { label: "japanese_pc_xfer", key_code: "japanese_pc_xfer" },
      { label: "japanese_pc_katakana", key_code: "japanese_pc_katakana" },
    ],
  },
  {
    category: "Korean keys",
    items: [{ label: "korean_han", key_code: "korean_han" }],
  },
  {
    category: "Pointing button",
    items: [
      { label: "button1", pointing_button: "button1" },
      { label: "button2", pointing_button: "button2" },
      { label: "button3", pointing_button: "button3" },
      { label: "button4", pointing_button: "button4" },
      { label: "button5", pointing_button: "button5" },
      { label: "button6", pointing_button: "button6" },
      { label: "button7", pointing_button: "button7" },
      { label: "button8", pointing_button: "button8" },
    ],
  },
]

// Helper function to get the actual key code value from a KeyCodeItem
export function getKeyCodeValue(item: KeyCodeItem): string {
  return (
    item.key_code ||
    item.consumer_key_code ||
    item.pointing_button ||
    item.apple_vendor_top_case_key_code ||
    item.apple_vendor_keyboard_key_code ||
    ""
  )
}

// Helper function to find a key code item by its value
export function findKeyCodeItem(value: string): KeyCodeItem | undefined {
  for (const category of KARABINER_KEYCODES) {
    const item = category.items.find((item) => getKeyCodeValue(item) === value)
    if (item) return item
  }
  return undefined
}
