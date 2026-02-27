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

export const JIS_BUTTON_WIDTHS: Record<string, string> = {
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
};
