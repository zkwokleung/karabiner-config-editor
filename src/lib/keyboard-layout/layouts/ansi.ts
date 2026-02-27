export const ANSI_LAYOUT = {
  default: [
    '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
    '` 1 2 3 4 5 6 7 8 9 0 - = {backspace}',
    '{tab} q w e r t y u i o p [ ] \\',
    "{capslock} a s d f g h j k l ; ' {enter}",
    '{shiftleft} z x c v b n m , . / {shiftright}',
    '{fn} {controlleft} {altleft} {metaleft} {space} {metaright} {altright} {arrowleft} {arrowup} {arrowdown} {arrowright}',
  ],
};

export const ANSI_BUTTON_WIDTHS: Record<string, string> = {
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
};
