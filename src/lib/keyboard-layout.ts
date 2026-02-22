// Keyboard layout data and mapping for visual keyboard component
// Maps between simple-keyboard keys and Karabiner key codes

export type KeyboardLayoutType = 'ansi' | 'iso' | 'jis';

interface KeyboardLayoutOption {
  value: KeyboardLayoutType;
  label: string;
  description: string;
}

export const KEYBOARD_LAYOUT_OPTIONS: Readonly<KeyboardLayoutOption[]> = [
  { value: 'ansi', label: 'ANSI', description: 'US / Americas layout' },
  { value: 'iso', label: 'ISO', description: 'European / UK layout' },
  { value: 'jis', label: 'JIS', description: 'Japanese layout' },
];

// Mapping from simple-keyboard button names to Karabiner key codes
const SIMPLE_KEYBOARD_TO_KARABINER: Record<string, string> = {
  // Function row
  '{escape}': 'escape',
  '{f1}': 'f1',
  '{f2}': 'f2',
  '{f3}': 'f3',
  '{f4}': 'f4',
  '{f5}': 'f5',
  '{f6}': 'f6',
  '{f7}': 'f7',
  '{f8}': 'f8',
  '{f9}': 'f9',
  '{f10}': 'f10',
  '{f11}': 'f11',
  '{f12}': 'f12',

  // Number row
  '`': 'grave_accent_and_tilde',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '0': '0',
  '-': 'hyphen',
  '=': 'equal_sign',
  '{backspace}': 'delete_or_backspace',
  '{bksp}': 'delete_or_backspace',

  // QWERTY row
  '{tab}': 'tab',
  q: 'q',
  w: 'w',
  e: 'e',
  r: 'r',
  t: 't',
  y: 'y',
  u: 'u',
  i: 'i',
  o: 'o',
  p: 'p',
  '[': 'open_bracket',
  ']': 'close_bracket',
  '\\': 'backslash',

  // ASDF row
  '{capslock}': 'caps_lock',
  '{lock}': 'caps_lock',
  a: 'a',
  s: 's',
  d: 'd',
  f: 'f',
  g: 'g',
  h: 'h',
  j: 'j',
  k: 'k',
  l: 'l',
  ';': 'semicolon',
  "'": 'quote',
  '{enter}': 'return_or_enter',
  '#': 'non_us_pound', // ISO layout key between L and Enter

  // ZXCV row
  '{shift}': 'left_shift',
  '{shiftleft}': 'left_shift',
  '{shiftright}': 'right_shift',
  '§': 'non_us_backslash', // ISO extra key
  z: 'z',
  x: 'x',
  c: 'c',
  v: 'v',
  b: 'b',
  n: 'n',
  m: 'm',
  ',': 'comma',
  '.': 'period',
  '/': 'slash',

  // Bottom row
  '{fn}': 'fn',
  '{controlleft}': 'left_control',
  '{controlright}': 'right_control',
  '{altleft}': 'left_option',
  '{altright}': 'right_option',
  '{metaleft}': 'left_command',
  '{metaright}': 'right_command',
  '{space}': 'spacebar',

  // Arrow keys
  '{arrowup}': 'up_arrow',
  '{arrowdown}': 'down_arrow',
  '{arrowleft}': 'left_arrow',
  '{arrowright}': 'right_arrow',

  // JIS specific keys
  '{kana}': 'japanese_kana',
  '{eisu}': 'japanese_eisuu',
  '{ro}': 'international1',
  '¥': 'international3', // Yen key

  // Additional keys
  '{delete}': 'delete_forward',
  '{home}': 'home',
  '{end}': 'end',
  '{pageup}': 'page_up',
  '{pagedown}': 'page_down',
};

// Reverse mapping: Karabiner key code -> simple-keyboard button
const KARABINER_TO_SIMPLE_KEYBOARD: Record<string, string> = {};
Object.entries(SIMPLE_KEYBOARD_TO_KARABINER).forEach(([sk, kb]) => {
  if (!KARABINER_TO_SIMPLE_KEYBOARD[kb]) {
    KARABINER_TO_SIMPLE_KEYBOARD[kb] = sk;
  }
});

// Convert simple-keyboard button to Karabiner key code
export function toKarabinerKeyCode(simpleKeyboardButton: string): string {
  const lower = simpleKeyboardButton.toLowerCase();
  return (
    SIMPLE_KEYBOARD_TO_KARABINER[simpleKeyboardButton] ||
    SIMPLE_KEYBOARD_TO_KARABINER[lower] ||
    lower
  );
}

// Convert Karabiner key code to simple-keyboard button
export function toSimpleKeyboardButton(karabinerKeyCode: string): string {
  const overrides: Record<string, string> = {
    left_shift: '{shiftleft}',
    right_shift: '{shiftright}',
    left_control: '{controlleft}',
    right_control: '{controlright}',
    left_option: '{altleft}',
    right_option: '{altright}',
    left_command: '{metaleft}',
    right_command: '{metaright}',
  };

  return (
    overrides[karabinerKeyCode] ||
    KARABINER_TO_SIMPLE_KEYBOARD[karabinerKeyCode] ||
    karabinerKeyCode
  );
}

// Display labels for Karabiner key codes
const KEY_DISPLAY_LABELS: Record<string, string> = {
  escape: 'Esc',
  delete_or_backspace: '⌫',
  delete_forward: '⌦',
  tab: '⇥',
  caps_lock: '⇪',
  return_or_enter: '↩',
  left_shift: '⇧',
  right_shift: '⇧',
  left_control: '⌃',
  right_control: '⌃',
  left_option: '⌥',
  right_option: '⌥',
  left_command: '⌘',
  right_command: '⌘',
  spacebar: 'Space',
  up_arrow: '↑',
  down_arrow: '↓',
  left_arrow: '←',
  right_arrow: '→',
  grave_accent_and_tilde: '`',
  hyphen: '-',
  equal_sign: '=',
  open_bracket: '[',
  close_bracket: ']',
  backslash: '\\',
  semicolon: ';',
  quote: "'",
  comma: ',',
  period: '.',
  slash: '/',
  fn: 'fn',
  non_us_backslash: '§',
  non_us_pound: '#',
  international1: 'ろ',
  international3: '¥',
  japanese_kana: 'かな',
  japanese_eisuu: '英数',
};

// Get display label for a key code
export function getKeyLabel(keyCode: string): string {
  if (KEY_DISPLAY_LABELS[keyCode]) {
    return KEY_DISPLAY_LABELS[keyCode];
  }
  // Single letter keys - uppercase
  if (keyCode.length === 1) {
    return keyCode.toUpperCase();
  }
  // Function keys
  if (keyCode.match(/^f\d+$/)) {
    return keyCode.toUpperCase();
  }
  // Fallback: replace underscores with spaces
  return keyCode.replace(/_/g, ' ');
}

export interface LayoutAwareKeyLabel {
  keyCode: string;
  output: string | null;
  display: string;
}

export function getLayoutOutputForKeyCode(
  keyCode: string,
  layoutType: KeyboardLayoutType,
): string | null {
  const simpleButton = toSimpleKeyboardButton(keyCode);
  if (!simpleButton || simpleButton.startsWith('{')) {
    return null;
  }

  const display = getKeyboardDisplay(layoutType);
  const output = display[simpleButton] || simpleButton;
  if (!output || output === ' ') {
    return null;
  }

  return output;
}

export function getLayoutAwareKeyLabel(
  keyCode: string,
  layoutType: KeyboardLayoutType,
): LayoutAwareKeyLabel {
  const output = getLayoutOutputForKeyCode(keyCode, layoutType);
  const keyCodeLabel = getKeyLabel(keyCode);

  if (!output || output === keyCodeLabel) {
    return {
      keyCode,
      output: null,
      display: keyCodeLabel,
    };
  }

  return {
    keyCode,
    output,
    display: `${keyCodeLabel} (${output})`,
  };
}

// Mac ANSI Layout (US)
const MAC_ANSI_LAYOUT = {
  default: [
    '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
    '` 1 2 3 4 5 6 7 8 9 0 - = {backspace}',
    '{tab} q w e r t y u i o p [ ] \\',
    "{capslock} a s d f g h j k l ; ' {enter}",
    '{shiftleft} z x c v b n m , . / {shiftright}',
    '{fn} {controlleft} {altleft} {metaleft} {space} {metaright} {altright} {arrowleft} {arrowup} {arrowdown} {arrowright}',
  ],
};

// Mac ISO Layout (UK/Europe) - extra key left of Z, different Enter shape
const MAC_ISO_LAYOUT = {
  default: [
    '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
    '` 1 2 3 4 5 6 7 8 9 0 - = {backspace}',
    '{tab} q w e r t y u i o p [ ] {enter}',
    "{capslock} a s d f g h j k l ; ' # {enter}",
    '{shiftleft} § z x c v b n m , . / {shiftright}',
    '{fn} {controlleft} {altleft} {metaleft} {space} {metaright} {altright} {arrowleft} {arrowup} {arrowdown} {arrowright}',
  ],
};

// Mac JIS Layout (Japanese) - extra keys, smaller spacebar
const MAC_JIS_LAYOUT = {
  default: [
    '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
    '1 2 3 4 5 6 7 8 9 0 - = ¥ {backspace}',
    '{tab} q w e r t y u i o p [ ]',
    "{controlleft} a s d f g h j k l ; ' \\ {enter}",
    '{shiftleft} z x c v b n m , . / {ro} {shiftright}',
    '{capslock} {altleft} {metaleft} {eisu} {space} {kana} {metaright} {fn} {arrowleft} {arrowup} {arrowdown} {arrowright}',
  ],
};

export function getLayoutForType(layoutType: KeyboardLayoutType) {
  switch (layoutType) {
    case 'iso':
      return MAC_ISO_LAYOUT;
    case 'jis':
      return MAC_JIS_LAYOUT;
    case 'ansi':
    default:
      return MAC_ANSI_LAYOUT;
  }
}

// Display mappings for simple-keyboard buttons
export const KEYBOARD_DISPLAY: Record<string, string> = {
  '{escape}': 'Esc',
  '{f1}': 'F1',
  '{f2}': 'F2',
  '{f3}': 'F3',
  '{f4}': 'F4',
  '{f5}': 'F5',
  '{f6}': 'F6',
  '{f7}': 'F7',
  '{f8}': 'F8',
  '{f9}': 'F9',
  '{f10}': 'F10',
  '{f11}': 'F11',
  '{f12}': 'F12',
  '{backspace}': '⌫',
  '{bksp}': '⌫',
  '{tab}': '⇥',
  '{capslock}': '⇪',
  '{lock}': '⇪',
  '{enter}': '↩',
  '{shiftleft}': '⇧',
  '{shiftright}': '⇧',
  '{shift}': '⇧',
  '{controlleft}': '⌃',
  '{controlright}': '⌃',
  '{altleft}': '⌥',
  '{altright}': '⌥',
  '{metaleft}': '⌘',
  '{metaright}': '⌘',
  '{fn}': 'fn',
  '{space}': ' ',
  '{arrowup}': '↑',
  '{arrowdown}': '↓',
  '{arrowleft}': '←',
  '{arrowright}': '→',
  '{kana}': 'かな',
  '{eisu}': '英数',
  '{ro}': 'ろ',
};

const JIS_DISPLAY_OVERRIDES: Record<string, string> = {
  '=': '^',
  '[': '@',
  ']': '[',
  '\\': ']',
  "'": ':',
};

const ISO_DISPLAY_OVERRIDES: Record<string, string> = {
  '`': '§',
  '§': '\\',
  '#': '|',
};

export function getKeyboardDisplay(
  layoutType: KeyboardLayoutType,
): Record<string, string> {
  if (layoutType === 'jis') {
    return { ...KEYBOARD_DISPLAY, ...JIS_DISPLAY_OVERRIDES };
  }
  if (layoutType === 'iso') {
    return { ...KEYBOARD_DISPLAY, ...ISO_DISPLAY_OVERRIDES };
  }
  return KEYBOARD_DISPLAY;
}

// Button widths for proper key sizing
export const BUTTON_WIDTHS: Record<
  KeyboardLayoutType,
  Record<string, string>
> = {
  ansi: {
    '{backspace}': '78px',
    '{tab}': '58px',
    '\\': '58px',
    '{capslock}': '72px',
    '{enter}': '88px',
    '{shiftleft}': '92px',
    '{shiftright}': '116px',
    '{fn}': '42px',
    '{controlleft}': '42px',
    '{altleft}': '42px',
    '{metaleft}': '54px',
    '{space}': '240px',
    '{metaright}': '54px',
    '{altright}': '42px',
  },
  iso: {
    '{backspace}': '78px',
    '{tab}': '58px',
    '{capslock}': '72px',
    '{enter}': '88px',
    '#': '42px',
    '{shiftleft}': '48px',
    '§': '42px',
    '{shiftright}': '116px',
    '{fn}': '42px',
    '{controlleft}': '42px',
    '{altleft}': '42px',
    '{metaleft}': '54px',
    '{space}': '240px',
    '{metaright}': '54px',
    '{altright}': '42px',
  },
  jis: {
    '{backspace}': '58px',
    '¥': '42px',
    '{tab}': '58px',
    '{controlleft}': '72px',
    '{capslock}': '42px',
    '{enter}': '68px',
    ']': '42px',
    '\\': '42px',
    '{shiftleft}': '72px',
    '{ro}': '42px',
    '{shiftright}': '72px',
    '{fn}': '38px',
    '{altleft}': '38px',
    '{metaleft}': '48px',
    '{eisu}': '48px',
    '{space}': '160px',
    '{kana}': '48px',
    '{metaright}': '48px',
  },
};
