export const JIS_LAYOUT = {
  default: [
    '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
    '1 2 3 4 5 6 7 8 9 0 - = ¥ {backspace}',
    '{tab} q w e r t y u i o p [ ]',
    "{controlleft} a s d f g h j k l ; ' \\ {enter}",
    '{shiftleft} z x c v b n m , . / {ro} {shiftright}',
    '{capslock} {altleft} {metaleft} {eisu} {space} {kana} {metaright} {fn} {arrowleft} {arrowup} {arrowdown} {arrowright}',
  ],
};

export const JIS_DISPLAY_OVERRIDES: Record<string, string> = {
  '=': '^',
  '[': '@',
  ']': '[',
  '\\': ']',
  "'": ':',
};
