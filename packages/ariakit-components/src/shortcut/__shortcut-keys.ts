export type ShortcutPlatform = "apple" | "windows" | "other";

export type ShortcutModifier = "Control" | "Alt" | "Shift" | "Meta";

export interface ShortcutKeyboardEventLike {
  key: string;
  code?: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  isComposing?: boolean;
  keyCode?: number;
  getModifierState?: (key: string) => boolean;
}

export interface ParsedShortcut {
  /** Canonical shortcut text, such as `"Control+Shift+K"`. */
  value: string;
  /** Canonical keys in modifier order, followed by the base key. */
  keys: string[];
}

export interface ShortcutGlyphs {
  [key: string]: string;
}

export interface ShortcutKeyNames {
  [key: string]: string;
}

export interface ShortcutFormatOptions {
  platform?: ShortcutPlatform;
  /** Overrides the platform joiner and the `"+"` glyph entry. */
  joiner?: string;
  glyphs?: ShortcutGlyphs;
  keyNames?: ShortcutKeyNames;
}

export interface ShortcutKeyToken {
  /** Canonical key value. */
  value: string;
  /** Text or glyph to display. */
  text: string;
  /** Accessible spoken name when the visible text is not sufficient. */
  name?: string;
  modifier: boolean;
}

export interface ShortcutKeyTokens {
  /** Canonical shortcut text. */
  value: string;
  /** Plain formatted shortcut text. */
  text: string;
  joiner: string;
  keys: ShortcutKeyToken[];
}

export interface FormattedShortcutKeys {
  /** Canonical alternatives separated by spaces. */
  value: string;
  /** Plain formatted alternatives separated by spaces. */
  text: string;
  alternatives: ShortcutKeyTokens[];
}

export type ShortcutEventRejectReason =
  | "empty"
  | "dead"
  | "unidentified"
  | "composing"
  | "alt-graph"
  | "modifier"
  | "unsupported";

export interface NormalizedShortcutEvent {
  valid: true;
  /** Canonical base key. */
  key: string;
  /** Exact canonical shortcut, including every pressed modifier. */
  value: string;
  /** Lookup values, exact first and an optional Shift-less fallback second. */
  keys: string[];
}

export interface RejectedShortcutEvent {
  valid: false;
  reason: ShortcutEventRejectReason;
}

export type ShortcutEventNormalization =
  | NormalizedShortcutEvent
  | RejectedShortcutEvent;

const MODIFIERS = ["Control", "Alt", "Shift", "Meta"] as const;

const MODIFIER_ALIASES = new Map<string, ShortcutModifier>([
  ["control", "Control"],
  ["alt", "Alt"],
  ["shift", "Shift"],
  ["meta", "Meta"],
]);

const MODIFIER_EVENT_KEYS = new Set([
  ...MODIFIERS.map((modifier) => modifier.toLowerCase()),
  "altgraph",
  "fn",
  "fnlock",
  "hyper",
  "os",
  "super",
  "symbol",
  "symbollock",
]);

const REJECTED_BASE_KEYS = new Set([
  ...MODIFIER_EVENT_KEYS,
  "dead",
  "unidentified",
]);

// Keep this table aligned with the W3C UI Events named key values.
// https://www.w3.org/TR/uievents-key/#named-key-attribute-values
const UI_EVENT_NAMED_KEYS = [
  "Unidentified",
  "Alt",
  "AltGraph",
  "CapsLock",
  "Control",
  "Fn",
  "FnLock",
  "Meta",
  "NumLock",
  "ScrollLock",
  "Shift",
  "Symbol",
  "SymbolLock",
  "Hyper",
  "Super",
  "Enter",
  "Tab",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  "Backspace",
  "Clear",
  "Copy",
  "CrSel",
  "Cut",
  "Delete",
  "EraseEof",
  "ExSel",
  "Insert",
  "Paste",
  "Redo",
  "Undo",
  "Accept",
  "Again",
  "Attn",
  "Cancel",
  "ContextMenu",
  "Escape",
  "Execute",
  "Find",
  "Help",
  "Pause",
  "Play",
  "Props",
  "Select",
  "ZoomIn",
  "ZoomOut",
  "BrightnessDown",
  "BrightnessUp",
  "Eject",
  "LogOff",
  "Power",
  "PowerOff",
  "PrintScreen",
  "Hibernate",
  "Standby",
  "WakeUp",
  "AllCandidates",
  "Alphanumeric",
  "CodeInput",
  "Compose",
  "Convert",
  "Dead",
  "FinalMode",
  "GroupFirst",
  "GroupLast",
  "GroupNext",
  "GroupPrevious",
  "ModeChange",
  "NextCandidate",
  "NonConvert",
  "PreviousCandidate",
  "Process",
  "SingleCandidate",
  "HangulMode",
  "HanjaMode",
  "JunjaMode",
  "Eisu",
  "Hankaku",
  "Hiragana",
  "HiraganaKatakana",
  "KanaMode",
  "KanjiMode",
  "Katakana",
  "Romaji",
  "Zenkaku",
  "ZenkakuHankaku",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
  "Soft1",
  "Soft2",
  "Soft3",
  "Soft4",
  "ChannelDown",
  "ChannelUp",
  "Close",
  "MailForward",
  "MailReply",
  "MailSend",
  "MediaClose",
  "MediaFastForward",
  "MediaPause",
  "MediaPlay",
  "MediaPlayPause",
  "MediaRecord",
  "MediaRewind",
  "MediaStop",
  "MediaTrackNext",
  "MediaTrackPrevious",
  "New",
  "Open",
  "Print",
  "Save",
  "SpellCheck",
  "Key11",
  "Key12",
  "AudioBalanceLeft",
  "AudioBalanceRight",
  "AudioBassBoostDown",
  "AudioBassBoostToggle",
  "AudioBassBoostUp",
  "AudioFaderFront",
  "AudioFaderRear",
  "AudioSurroundModeNext",
  "AudioTrebleDown",
  "AudioTrebleUp",
  "AudioVolumeDown",
  "AudioVolumeUp",
  "AudioVolumeMute",
  "MicrophoneToggle",
  "MicrophoneVolumeDown",
  "MicrophoneVolumeUp",
  "MicrophoneVolumeMute",
  "SpeechCorrectionList",
  "SpeechInputToggle",
  "LaunchApplication1",
  "LaunchApplication2",
  "LaunchCalendar",
  "LaunchContacts",
  "LaunchMail",
  "LaunchMediaPlayer",
  "LaunchMusicPlayer",
  "LaunchPhone",
  "LaunchScreenSaver",
  "LaunchSpreadsheet",
  "LaunchWebBrowser",
  "LaunchWebCam",
  "LaunchWordProcessor",
  "BrowserBack",
  "BrowserFavorites",
  "BrowserForward",
  "BrowserHome",
  "BrowserRefresh",
  "BrowserSearch",
  "BrowserStop",
  "AppSwitch",
  "Call",
  "Camera",
  "CameraFocus",
  "EndCall",
  "GoBack",
  "GoHome",
  "HeadsetHook",
  "LastNumberRedial",
  "Notification",
  "MannerMode",
  "VoiceDial",
  "TV",
  "TV3DMode",
  "TVAntennaCable",
  "TVAudioDescription",
  "TVAudioDescriptionMixDown",
  "TVAudioDescriptionMixUp",
  "TVContentsMenu",
  "TVDataService",
  "TVInput",
  "TVInputComponent1",
  "TVInputComponent2",
  "TVInputComposite1",
  "TVInputComposite2",
  "TVInputHDMI1",
  "TVInputHDMI2",
  "TVInputHDMI3",
  "TVInputHDMI4",
  "TVInputVGA1",
  "TVMediaContext",
  "TVNetwork",
  "TVNumberEntry",
  "TVPower",
  "TVRadioService",
  "TVSatellite",
  "TVSatelliteBS",
  "TVSatelliteCS",
  "TVSatelliteToggle",
  "TVTerrestrialAnalog",
  "TVTerrestrialDigital",
  "TVTimer",
  "AVRInput",
  "AVRPower",
  "ColorF0Red",
  "ColorF1Green",
  "ColorF2Yellow",
  "ColorF3Blue",
  "ColorF4Grey",
  "ColorF5Brown",
  "ClosedCaptionToggle",
  "Dimmer",
  "DisplaySwap",
  "DVR",
  "Exit",
  "FavoriteClear0",
  "FavoriteClear1",
  "FavoriteClear2",
  "FavoriteClear3",
  "FavoriteRecall0",
  "FavoriteRecall1",
  "FavoriteRecall2",
  "FavoriteRecall3",
  "FavoriteStore0",
  "FavoriteStore1",
  "FavoriteStore2",
  "FavoriteStore3",
  "Guide",
  "GuideNextDay",
  "GuidePreviousDay",
  "Info",
  "InstantReplay",
  "Link",
  "ListProgram",
  "LiveContent",
  "Lock",
  "MediaApps",
  "MediaAudioTrack",
  "MediaLast",
  "MediaSkipBackward",
  "MediaSkipForward",
  "MediaStepBackward",
  "MediaStepForward",
  "MediaTopMenu",
  "NavigateIn",
  "NavigateNext",
  "NavigateOut",
  "NavigatePrevious",
  "NextFavoriteChannel",
  "NextUserProfile",
  "OnDemand",
  "Pairing",
  "PinPDown",
  "PinPMove",
  "PinPToggle",
  "PinPUp",
  "PlaySpeedDown",
  "PlaySpeedReset",
  "PlaySpeedUp",
  "RandomToggle",
  "RcLowBattery",
  "RecordSpeedNext",
  "RfBypass",
  "ScanChannelsToggle",
  "ScreenModeNext",
  "Settings",
  "SplitScreenToggle",
  "STBInput",
  "STBPower",
  "Subtitle",
  "Teletext",
  "VideoModeNext",
  "Wink",
  "ZoomToggle",
] as const;

export const shortcutNamedKeys = [
  ...UI_EVENT_NAMED_KEYS,
  "Space",
  "Plus",
] as const;

const NAMED_KEY_MAP = new Map(
  shortcutNamedKeys.map((key) => [key.toLowerCase(), key]),
);

const PLATFORM_PREFIX = /^(apple|pc):/i;
const INDEXED_NAMED_KEY = /^(f|soft)([1-9]\d*)$/i;
const ASCII_KEY_STRING = /^[\x20-\x7e]\p{Mark}*$/u;
const LATIN_KEY_STRING = /^\p{Script=Latin}\p{Mark}*$/u;
const CONTROL_CHARACTER = /^\p{Cc}$/u;
const COMBINING_CHARACTER = /^\p{Mark}$/u;
const LETTER = /^\p{Letter}$/u;
const KEY_CODE = /^Key([A-Z])$/;
const DIGIT_CODE = /^(?:Digit|Numpad)([0-9])$/;

const CHARACTER_CODE_MAP: Readonly<Record<string, string>> = {
  Backquote: "`",
  Backslash: "\\",
  BracketLeft: "[",
  BracketRight: "]",
  Comma: ",",
  Equal: "=",
  Minus: "-",
  Period: ".",
  Quote: "'",
  Semicolon: ";",
  Slash: "/",
  NumpadAdd: "+",
  NumpadComma: ",",
  NumpadDecimal: ".",
  NumpadDivide: "/",
  NumpadEqual: "=",
  NumpadMultiply: "*",
  NumpadSubtract: "-",
};

const DEFAULT_GLYPHS: Readonly<Record<ShortcutPlatform, ShortcutGlyphs>> = {
  apple: {
    Control: "⌃",
    Alt: "⌥",
    Shift: "⇧",
    Meta: "⌘",
    "+": "",
  },
  windows: {
    Control: "Ctrl",
    Alt: "Alt",
    Shift: "Shift",
    Meta: "Win",
    "+": "+",
  },
  other: {
    Control: "Ctrl",
    Alt: "Alt",
    Shift: "Shift",
    Meta: "Meta",
    "+": "+",
  },
};

const DEFAULT_KEY_NAMES: Readonly<Record<ShortcutPlatform, ShortcutKeyNames>> =
  {
    apple: {
      Control: "Control",
      Shift: "Shift",
    },
    windows: {},
    other: {},
  };

export function getDefaultShortcutGlyphs(
  platform: ShortcutPlatform,
): ShortcutGlyphs {
  return { ...DEFAULT_GLYPHS[platform] };
}

export function getDefaultShortcutKeyNames(
  platform: ShortcutPlatform,
): ShortcutKeyNames {
  return { ...DEFAULT_KEY_NAMES[platform] };
}

function warnInvalidShortcut(
  alternative: string,
  input: string,
  reason: string,
) {
  if (process.env.NODE_ENV === "production") return;
  console.warn(
    `Invalid shortcut alternative "${alternative}" in "${input}".`,
    reason,
  );
}

function getKeyString(value: string, normalized = true) {
  if (!value) return null;
  if (normalized && value.normalize("NFC") !== value) return null;

  const characters = Array.from(value);
  let index = 0;
  const firstCharacter = characters[0];
  if (!firstCharacter) return null;
  if (!COMBINING_CHARACTER.test(firstCharacter)) {
    if (CONTROL_CHARACTER.test(firstCharacter)) return null;
    index = 1;
  }
  for (; index < characters.length; index++) {
    const character = characters[index];
    if (!character) return null;
    if (!COMBINING_CHARACTER.test(character)) return null;
  }
  return value;
}

function uppercaseWithoutExpansion(value: string) {
  const lowercase = value.toLowerCase();
  const uppercaseLowercase = lowercase.toUpperCase();
  if (
    getKeyString(lowercase, false) &&
    !getKeyString(uppercaseLowercase, false)
  ) {
    return lowercase.normalize("NFC");
  }
  const uppercase = value.toUpperCase().normalize("NFC");
  if (getKeyString(uppercase)) {
    return uppercase;
  }
  return value;
}

function canonicalizeBaseKey(value: string) {
  const keyString = getKeyString(value);
  if (keyString) {
    return uppercaseWithoutExpansion(keyString);
  }
  const lowerValue = value.toLowerCase();
  if (REJECTED_BASE_KEYS.has(lowerValue)) return null;
  const namedKey = NAMED_KEY_MAP.get(lowerValue);
  if (namedKey) {
    return namedKey;
  }
  const indexedKey = value.match(INDEXED_NAMED_KEY);
  const prefix = indexedKey?.[1]?.toLowerCase();
  const index = indexedKey?.[2];
  if (!prefix) return null;
  if (!index) return null;
  return `${prefix === "f" ? "F" : "Soft"}${index}`;
}

function isShortcutModifier(value: string): value is ShortcutModifier {
  return MODIFIERS.some((modifier) => modifier === value);
}

function getShortcutModifier(value: string, platform: ShortcutPlatform) {
  const lowerValue = value.toLowerCase();
  if (lowerValue === "mod") {
    return platform === "apple" ? "Meta" : "Control";
  }
  return MODIFIER_ALIASES.get(lowerValue) ?? null;
}

function parseShortcutAlternative(
  alternative: string,
  platform: ShortcutPlatform,
  input: string,
  warnOnInvalid: boolean,
): ParsedShortcut | null {
  const invalid = (reason: string) => {
    if (warnOnInvalid) {
      warnInvalidShortcut(alternative, input, reason);
    }
    return null;
  };
  let chord = alternative;
  const prefix = chord.match(PLATFORM_PREFIX);
  if (prefix) {
    const prefixPlatform = prefix[1]?.toLowerCase();
    const matchesPlatform =
      prefixPlatform === "apple" ? platform === "apple" : platform !== "apple";
    if (!matchesPlatform) return null;
    chord = chord.slice(prefix[0].length);
  }

  const parts = chord.split("+");
  for (const part of parts) {
    if (!part) {
      return invalid(
        'Empty chord parts are not allowed. Use "Plus" for the plus key.',
      );
    }
  }

  const basePart = parts[parts.length - 1];
  if (!basePart) return null;
  if (getShortcutModifier(basePart, platform)) {
    return invalid("A chord must end with exactly one non-modifier key.");
  }

  const modifiers = new Set<ShortcutModifier>();
  for (let index = 0; index < parts.length - 1; index++) {
    const part = parts[index];
    if (!part) return null;
    const modifier = getShortcutModifier(part, platform);
    if (!modifier) {
      return invalid(
        "Only modifiers may precede the non-modifier key in a chord.",
      );
    }
    modifiers.add(modifier);
  }

  const baseKey = canonicalizeBaseKey(basePart);
  if (!baseKey) {
    return invalid(
      `"${basePart}" is not a supported named key or a single character.`,
    );
  }

  const keys: string[] = [];
  for (const modifier of MODIFIERS) {
    if (modifiers.has(modifier)) {
      keys.push(modifier);
    }
  }
  keys.push(baseKey);
  return { value: keys.join("+"), keys };
}

/**
 * Resolves a shortcut declaration into canonical alternatives for a platform.
 */
function parseShortcutKeysWithWarnings(
  input: string,
  platform: ShortcutPlatform,
  warnOnInvalid: boolean,
): ParsedShortcut[] {
  const trimmedInput = input.replace(/^ +| +$/g, "");
  if (!trimmedInput) return [];

  const parsed: ParsedShortcut[] = [];
  const seen = new Set<string>();
  for (const alternative of trimmedInput.split(" ")) {
    const shortcut = parseShortcutAlternative(
      alternative,
      platform,
      input,
      warnOnInvalid,
    );
    if (!shortcut) continue;
    if (seen.has(shortcut.value)) continue;
    seen.add(shortcut.value);
    parsed.push(shortcut);
  }
  return parsed;
}

/**
 * Resolves a shortcut declaration into canonical alternatives for a platform.
 */
export function parseShortcutKeys(
  input: string,
  platform = getShortcutPlatform(),
) {
  return parseShortcutKeysWithWarnings(input, platform, true);
}

/** Resolves a declaration without repeating registration-time warnings. @private */
export function parseShortcutKeysSilently(
  input: string,
  platform: ShortcutPlatform,
) {
  return parseShortcutKeysWithWarnings(input, platform, false);
}

function getCharacterFromCode(code?: string) {
  if (!code) return null;
  const letter = code.match(KEY_CODE)?.[1];
  if (letter) {
    return letter;
  }
  const digit = code.match(DIGIT_CODE)?.[1];
  if (digit) {
    return digit;
  }
  if (!Object.hasOwn(CHARACTER_CODE_MAP, code)) return null;
  return CHARACTER_CODE_MAP[code] ?? null;
}

interface EventBaseKey {
  key: string;
  shiftFallback: boolean;
}

function getEventBaseKey(
  event: ShortcutKeyboardEventLike,
): EventBaseKey | null {
  const eventCharacter = getKeyString(event.key);
  if (eventCharacter) {
    let character = eventCharacter;
    const isAsciiOrLatin =
      ASCII_KEY_STRING.test(character) || LATIN_KEY_STRING.test(character);
    if (!isAsciiOrLatin) {
      character = getCharacterFromCode(event.code) ?? character;
    }
    const key =
      character === " "
        ? "Space"
        : character === "+"
          ? "Plus"
          : uppercaseWithoutExpansion(character);
    const shiftFallback =
      !!event.shiftKey &&
      Array.from(eventCharacter).length === 1 &&
      !LETTER.test(eventCharacter);
    return { key, shiftFallback };
  }

  const key = canonicalizeBaseKey(event.key);
  if (!key) return null;
  return { key, shiftFallback: false };
}

function getEventModifiers(event: ShortcutKeyboardEventLike) {
  const modifiers: ShortcutModifier[] = [];
  if (event.ctrlKey) modifiers.push("Control");
  if (event.altKey) modifiers.push("Alt");
  if (event.shiftKey) modifiers.push("Shift");
  if (event.metaKey) modifiers.push("Meta");
  return modifiers;
}

/**
 * Normalizes a keyboard event and reports why events that cannot match were
 * rejected.
 */
export function normalizeShortcutEvent(
  event: ShortcutKeyboardEventLike,
): ShortcutEventNormalization {
  if (event.isComposing) {
    return { valid: false, reason: "composing" };
  }
  if (event.keyCode === 229) {
    return { valid: false, reason: "composing" };
  }
  if (!event.key) {
    return { valid: false, reason: "empty" };
  }

  const lowerKey = event.key.toLowerCase();
  if (lowerKey === "dead") {
    return { valid: false, reason: "dead" };
  }
  if (lowerKey === "unidentified") {
    return { valid: false, reason: "unidentified" };
  }
  if (lowerKey === "altgraph") {
    return { valid: false, reason: "alt-graph" };
  }
  if (event.getModifierState?.("AltGraph") === true) {
    return { valid: false, reason: "alt-graph" };
  }
  if (MODIFIER_EVENT_KEYS.has(lowerKey)) {
    return { valid: false, reason: "modifier" };
  }

  const base = getEventBaseKey(event);
  if (!base) {
    return { valid: false, reason: "unsupported" };
  }

  const modifiers = getEventModifiers(event);
  const exactKeys = [...modifiers, base.key];
  const value = exactKeys.join("+");
  const keys = [value];

  if (base.shiftFallback) {
    const fallbackKeys: string[] = modifiers.filter(
      (modifier) => modifier !== "Shift",
    );
    fallbackKeys.push(base.key);
    keys.push(fallbackKeys.join("+"));
  }

  return { valid: true, key: base.key, value, keys };
}

/** Returns canonical lookup values for a keyboard event, most specific first. */
export function getShortcutEventKeys(event: ShortcutKeyboardEventLike) {
  const result = normalizeShortcutEvent(event);
  if (!result.valid) return [];
  return result.keys;
}

function getOwnMapValue(
  map: ShortcutGlyphs | ShortcutKeyNames | undefined,
  key: string,
) {
  if (!map) return undefined;
  if (!Object.hasOwn(map, key)) return undefined;
  return map[key];
}

/**
 * Formats declaration syntax while retaining canonical values and per-key
 * accessible names.
 */
export function formatShortcutKeys(
  input: string,
  options: ShortcutFormatOptions = {},
): FormattedShortcutKeys {
  const platform = options.platform ?? getShortcutPlatform();
  const defaultGlyphs = DEFAULT_GLYPHS[platform];
  const defaultKeyNames = DEFAULT_KEY_NAMES[platform];
  const customJoiner = getOwnMapValue(options.glyphs, "+");
  const joiner = options.joiner ?? customJoiner ?? defaultGlyphs["+"] ?? "+";
  const parsed = parseShortcutKeys(input, platform);

  const alternatives = parsed.map((shortcut): ShortcutKeyTokens => {
    const keys = shortcut.keys.map((value): ShortcutKeyToken => {
      const text =
        getOwnMapValue(options.glyphs, value) ??
        getOwnMapValue(defaultGlyphs, value) ??
        value;
      const name =
        getOwnMapValue(options.keyNames, value) ??
        getOwnMapValue(defaultKeyNames, value);
      const token: ShortcutKeyToken = {
        value,
        text,
        modifier: isShortcutModifier(value),
      };
      if (name !== undefined) {
        token.name = name;
      }
      return token;
    });
    return {
      value: shortcut.value,
      text: keys.map((key) => key.text).join(joiner),
      joiner,
      keys,
    };
  });

  return {
    value: alternatives.map((alternative) => alternative.value).join(" "),
    text: alternatives.map((alternative) => alternative.text).join(" "),
    alternatives,
  };
}

/** Returns the platform used by parser and formatter defaults. */
export function getShortcutPlatform(): ShortcutPlatform {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof navigator === "undefined"
  ) {
    return "other";
  }
  const navigatorWithData = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform =
    navigatorWithData.userAgentData?.platform ||
    navigator.platform ||
    navigator.userAgent;
  if (/mac|ios|iphone|ipad|ipod/i.test(platform)) return "apple";
  if (/win/i.test(platform)) return "windows";
  return "other";
}
