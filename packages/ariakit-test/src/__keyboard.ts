const codeByKey = new Map<string, string>([
  [" ", "Space"],
  ["`", "Backquote"],
  ["~", "Backquote"],
  ["0", "Digit0"],
  [")", "Digit0"],
  ["1", "Digit1"],
  ["!", "Digit1"],
  ["2", "Digit2"],
  ["@", "Digit2"],
  ["3", "Digit3"],
  ["#", "Digit3"],
  ["4", "Digit4"],
  ["$", "Digit4"],
  ["5", "Digit5"],
  ["%", "Digit5"],
  ["6", "Digit6"],
  ["^", "Digit6"],
  ["7", "Digit7"],
  ["&", "Digit7"],
  ["8", "Digit8"],
  ["*", "Digit8"],
  ["9", "Digit9"],
  ["(", "Digit9"],
  ["-", "Minus"],
  ["_", "Minus"],
  ["=", "Equal"],
  ["+", "Equal"],
  ["[", "BracketLeft"],
  ["{", "BracketLeft"],
  ["]", "BracketRight"],
  ["}", "BracketRight"],
  ["\\", "Backslash"],
  ["|", "Backslash"],
  [";", "Semicolon"],
  [":", "Semicolon"],
  ["'", "Quote"],
  ['"', "Quote"],
  [",", "Comma"],
  ["<", "Comma"],
  [".", "Period"],
  [">", "Period"],
  ["/", "Slash"],
  ["?", "Slash"],
  ["Backquote", "Backquote"],
  ["Minus", "Minus"],
  ["Equal", "Equal"],
  ["BracketLeft", "BracketLeft"],
  ["BracketRight", "BracketRight"],
  ["Backslash", "Backslash"],
  ["Semicolon", "Semicolon"],
  ["Quote", "Quote"],
  ["Comma", "Comma"],
  ["Period", "Period"],
  ["Slash", "Slash"],
  ["Space", "Space"],
  ["Escape", "Escape"],
  ["Backspace", "Backspace"],
  ["Tab", "Tab"],
  ["CapsLock", "CapsLock"],
  ["Enter", "Enter"],
  ["Shift", "ShiftLeft"],
  ["Control", "ControlLeft"],
  ["Alt", "AltLeft"],
  ["Meta", "MetaLeft"],
  ["ShiftLeft", "ShiftLeft"],
  ["ShiftRight", "ShiftRight"],
  ["ControlLeft", "ControlLeft"],
  ["ControlRight", "ControlRight"],
  ["AltLeft", "AltLeft"],
  ["AltRight", "AltRight"],
  ["MetaLeft", "MetaLeft"],
  ["MetaRight", "MetaRight"],
  ["ContextMenu", "ContextMenu"],
  ["PrintScreen", "PrintScreen"],
  ["ScrollLock", "ScrollLock"],
  ["Pause", "Pause"],
  ["Insert", "Insert"],
  ["Delete", "Delete"],
  ["Home", "Home"],
  ["End", "End"],
  ["PageUp", "PageUp"],
  ["PageDown", "PageDown"],
  ["ArrowUp", "ArrowUp"],
  ["ArrowRight", "ArrowRight"],
  ["ArrowDown", "ArrowDown"],
  ["ArrowLeft", "ArrowLeft"],
  ["NumLock", "NumLock"],
  ["AudioVolumeMute", "AudioVolumeMute"],
  ["AudioVolumeDown", "AudioVolumeDown"],
  ["AudioVolumeUp", "AudioVolumeUp"],
  ["MediaTrackNext", "MediaTrackNext"],
  ["MediaTrackPrevious", "MediaTrackPrevious"],
  ["MediaPlayPause", "MediaPlayPause"],
]);

function getUSKeyboardCode(key: string) {
  const code = codeByKey.get(key);
  if (code) return code;

  const letter = key.toUpperCase();
  if (letter.length === 1 && letter >= "A" && letter <= "Z") {
    return `Key${letter}`;
  }

  if (/^F(?:[1-9]|1\d|2[0-4])$/.test(key)) return key;
  if (/^(?:Key[A-Z]|Digit\d)$/.test(key)) return key;
  if (
    /^Numpad(?:\d|Add|Decimal|Divide|Enter|Equal|Multiply|Subtract)$/.test(key)
  ) {
    return key;
  }

  return "";
}

/**
 * Fills in a physical key code using a US keyboard layout. Callers can pass an
 * explicit code for another layout or physical key.
 */
export function getKeyboardEventOptions(
  key: string,
  options: KeyboardEventInit = {},
): KeyboardEventInit {
  const eventKey = options.key ?? key;
  return {
    ...options,
    key: eventKey,
    code: options.code ?? getUSKeyboardCode(eventKey),
  };
}
