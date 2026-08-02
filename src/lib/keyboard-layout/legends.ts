export type KeyboardLegendType = 'qwerty' | 'dvorak' | 'colemak';

interface KeyboardLegendOption {
  value: KeyboardLegendType;
  label: string;
  description: string;
}

export const KEYBOARD_LEGEND_OPTIONS: Readonly<KeyboardLegendOption[]> = [
  { value: 'qwerty', label: 'QWERTY', description: 'Standard legends' },
  { value: 'dvorak', label: 'Dvorak', description: 'US Dvorak legends' },
  { value: 'colemak', label: 'Colemak', description: 'Colemak legends' },
];

const DVORAK_LEGENDS: Record<string, string> = {
  q: "'",
  w: ',',
  e: '.',
  r: 'P',
  t: 'Y',
  y: 'F',
  u: 'G',
  i: 'C',
  o: 'R',
  p: 'L',
  open_bracket: '/',
  close_bracket: '=',
  a: 'A',
  s: 'O',
  d: 'E',
  f: 'U',
  g: 'I',
  h: 'D',
  j: 'H',
  k: 'T',
  l: 'N',
  semicolon: 'S',
  quote: '-',
  z: ';',
  x: 'Q',
  c: 'J',
  v: 'K',
  b: 'X',
  n: 'B',
  m: 'M',
  comma: 'W',
  period: 'V',
  slash: 'Z',
};

const COLEMAK_LEGENDS: Record<string, string> = {
  q: 'Q',
  w: 'W',
  e: 'F',
  r: 'P',
  t: 'G',
  y: 'J',
  u: 'L',
  i: 'U',
  o: 'Y',
  p: ';',
  a: 'A',
  s: 'R',
  d: 'S',
  f: 'T',
  g: 'D',
  h: 'H',
  j: 'N',
  k: 'E',
  l: 'I',
  semicolon: 'O',
  z: 'Z',
  x: 'X',
  c: 'C',
  v: 'V',
  b: 'B',
  n: 'K',
  m: 'M',
};

export function getLogicalLegend(
  keyCode: string,
  legendType: KeyboardLegendType,
): string | null {
  if (legendType === 'dvorak') return DVORAK_LEGENDS[keyCode] || null;
  if (legendType === 'colemak') return COLEMAK_LEGENDS[keyCode] || null;
  return null;
}
