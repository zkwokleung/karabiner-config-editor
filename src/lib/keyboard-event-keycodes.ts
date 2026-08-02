import type { KeySelection } from '@/lib/karabiner-keycodes';

const MODIFIER_CODES = new Set([
  'AltLeft',
  'AltRight',
  'ControlLeft',
  'ControlRight',
  'Fn',
  'MetaLeft',
  'MetaRight',
  'OSLeft',
  'OSRight',
  'ShiftLeft',
  'ShiftRight',
]);

const KEY_CODE_SELECTIONS: Record<string, KeySelection> = {
  Backquote: keyCode('grave_accent_and_tilde'),
  Backslash: keyCode('backslash'),
  Backspace: keyCode('delete_or_backspace'),
  BracketLeft: keyCode('open_bracket'),
  BracketRight: keyCode('close_bracket'),
  CapsLock: keyCode('caps_lock'),
  Comma: keyCode('comma'),
  ContextMenu: keyCode('application'),
  Convert: keyCode('japanese_pc_xfer'),
  Delete: keyCode('delete_forward'),
  End: keyCode('end'),
  Enter: keyCode('return_or_enter'),
  Equal: keyCode('equal_sign'),
  Escape: keyCode('escape'),
  Help: keyCode('help'),
  Home: keyCode('home'),
  Insert: keyCode('insert'),
  IntlBackslash: keyCode('non_us_backslash'),
  IntlRo: keyCode('international1'),
  IntlYen: keyCode('international3'),
  KanaMode: keyCode('japanese_kana'),
  Lang1: keyCode('lang1'),
  Lang2: keyCode('lang2'),
  Lang3: keyCode('lang3'),
  Lang4: keyCode('lang4'),
  Lang5: keyCode('lang5'),
  Minus: keyCode('hyphen'),
  NonConvert: keyCode('japanese_pc_nfer'),
  NumLock: keyCode('keypad_num_lock'),
  NumpadAdd: keyCode('keypad_plus'),
  NumpadComma: keyCode('keypad_comma'),
  NumpadDecimal: keyCode('keypad_period'),
  NumpadDivide: keyCode('keypad_slash'),
  NumpadEnter: keyCode('keypad_enter'),
  NumpadEqual: keyCode('keypad_equal_sign'),
  NumpadMultiply: keyCode('keypad_asterisk'),
  NumpadSubtract: keyCode('keypad_hyphen'),
  PageDown: keyCode('page_down'),
  PageUp: keyCode('page_up'),
  Pause: keyCode('pause'),
  Period: keyCode('period'),
  PrintScreen: keyCode('print_screen'),
  Quote: keyCode('quote'),
  ScrollLock: keyCode('scroll_lock'),
  Semicolon: keyCode('semicolon'),
  Slash: keyCode('slash'),
  Space: keyCode('spacebar'),
  Tab: keyCode('tab'),
  ArrowDown: keyCode('down_arrow'),
  ArrowLeft: keyCode('left_arrow'),
  ArrowRight: keyCode('right_arrow'),
  ArrowUp: keyCode('up_arrow'),
  AudioVolumeDown: consumerKeyCode('volume_decrement'),
  AudioVolumeMute: consumerKeyCode('mute'),
  AudioVolumeUp: consumerKeyCode('volume_increment'),
  BrightnessDown: consumerKeyCode('display_brightness_decrement'),
  BrightnessUp: consumerKeyCode('display_brightness_increment'),
  Eject: consumerKeyCode('eject'),
  MediaPlayPause: consumerKeyCode('play_or_pause'),
  MediaTrackNext: consumerKeyCode('fastforward'),
  MediaTrackPrevious: consumerKeyCode('rewind'),
};

function keyCode(value: string): KeySelection {
  return { field: 'key_code', value };
}

function consumerKeyCode(value: string): KeySelection {
  return { field: 'consumer_key_code', value };
}

/** Returns whether a browser code represents a modifier that cannot be recorded alone. */
export function isModifierKeyboardCode(code: string): boolean {
  return MODIFIER_CODES.has(code);
}

/** Maps a physical KeyboardEvent.code to the equivalent Karabiner selection. */
export function getKeySelectionFromKeyboardCode(
  code: string,
): KeySelection | null {
  const exactMatch = KEY_CODE_SELECTIONS[code];
  if (exactMatch) {
    return exactMatch;
  }

  const letterMatch = /^Key([A-Z])$/u.exec(code);
  if (letterMatch) {
    return keyCode(letterMatch[1].toLowerCase());
  }

  const numberMatch = /^Digit([0-9])$/u.exec(code);
  if (numberMatch) {
    return keyCode(numberMatch[1]);
  }

  const functionMatch = /^F([1-9]|1[0-9]|2[0-4])$/u.exec(code);
  if (functionMatch) {
    return keyCode(`f${functionMatch[1]}`);
  }

  const keypadNumberMatch = /^Numpad([0-9])$/u.exec(code);
  if (keypadNumberMatch) {
    return keyCode(`keypad_${keypadNumberMatch[1]}`);
  }

  return null;
}
