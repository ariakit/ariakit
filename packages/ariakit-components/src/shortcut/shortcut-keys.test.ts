// @vitest-environment node

import { afterEach, expect, test, vi } from "vitest";
import type { ShortcutGlyphs } from "./__shortcut-keys.ts";
import {
  formatShortcutKeys,
  getDefaultShortcutGlyphs,
  getDefaultShortcutKeyNames,
  getShortcutEventKeys,
  getShortcutPlatform,
  normalizeShortcutEvent,
  parseShortcutKeys,
} from "./__shortcut-keys.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("parses ASCII-space alternatives and canonicalizes modifiers", () => {
  expect(
    parseShortcutKeys(
      "  meta+shift+Alt+Control+k control+escape Space  ",
      "apple",
    ),
  ).toEqual([
    {
      value: "Control+Alt+Shift+Meta+K",
      keys: ["Control", "Alt", "Shift", "Meta", "K"],
    },
    {
      value: "Control+Escape",
      keys: ["Control", "Escape"],
    },
    { value: "Space", keys: ["Space"] },
  ]);
});

test("accepts the exact modifiers case-insensitively", () => {
  expect(parseShortcutKeys("CONTROL+alt+SHIFT+META+K", "apple")).toEqual([
    {
      value: "Control+Alt+Shift+Meta+K",
      keys: ["Control", "Alt", "Shift", "Meta", "K"],
    },
  ]);
});

test("rejects aliases, inherited names, and modifiers after the key", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(
    parseShortcutKeys(
      "ctrl+K option+K cmd+K command+K K+Control constructor+K __proto__+K",
      "apple",
    ),
  ).toEqual([]);
  expect(consoleWarn).toHaveBeenCalledTimes(7);
});

test("uses only ASCII spaces between alternatives", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(parseShortcutKeys("K J", "other")).toEqual([
    { value: "K", keys: ["K"] },
    { value: "J", keys: ["J"] },
  ]);
  expect(parseShortcutKeys("K\tJ", "other")).toEqual([]);
  expect(parseShortcutKeys("K\nJ", "other")).toEqual([]);
  expect(parseShortcutKeys("K  J", "other")).toEqual([
    { value: "K", keys: ["K"] },
    { value: "J", keys: ["J"] },
  ]);
  expect(consoleWarn).toHaveBeenCalledTimes(3);
});

test("resolves mod and platform prefixes", () => {
  expect(parseShortcutKeys("mod+K apple:mod+A pc:mod+P", "apple")).toEqual([
    { value: "Meta+K", keys: ["Meta", "K"] },
    { value: "Meta+A", keys: ["Meta", "A"] },
  ]);
  expect(parseShortcutKeys("mod+K apple:mod+A pc:mod+P", "windows")).toEqual([
    { value: "Control+K", keys: ["Control", "K"] },
    { value: "Control+P", keys: ["Control", "P"] },
  ]);
  expect(parseShortcutKeys("pc:mod+P", "other")).toEqual([
    { value: "Control+P", keys: ["Control", "P"] },
  ]);
});

test("supports literal keys and the W3C named-key table", () => {
  expect(
    parseShortcutKeys(
      "Plus Space arrowup MediaFastForward LaunchMail HangulMode Soft8 F36",
      "other",
    ).map((shortcut) => shortcut.value),
  ).toEqual([
    "Plus",
    "Space",
    "ArrowUp",
    "MediaFastForward",
    "LaunchMail",
    "HangulMode",
    "Soft8",
    "F36",
  ]);
});

test("rejects values outside the current W3C named-key table", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(parseShortcutKeys("Finish", "other")).toEqual([]);
  expect(consoleWarn).toHaveBeenCalledOnce();
});

test("rejects named keys that event normalization cannot dispatch", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const keys = [
    "Dead",
    "Unidentified",
    "AltGraph",
    "Fn",
    "FnLock",
    "Hyper",
    "Super",
    "Symbol",
    "SymbolLock",
  ];
  expect(parseShortcutKeys(keys.join(" "), "other")).toEqual([]);
  expect(consoleWarn).toHaveBeenCalledTimes(keys.length);
  for (const key of keys) {
    expect(getShortcutEventKeys({ key })).toEqual([]);
  }
});

test("uppercases one-character keys without multi-character expansion", () => {
  expect(parseShortcutKeys("a é ß ẞ 🙂", "other")).toEqual([
    { value: "A", keys: ["A"] },
    { value: "É", keys: ["É"] },
    { value: "ß", keys: ["ß"] },
    { value: "🙂", keys: ["🙂"] },
  ]);
});

test("normalizes W3C multi-code-point key strings", () => {
  expect(parseShortcutKeys("ḍ̇ Ḍ̇", "other")).toEqual([
    { value: "Ḍ̇", keys: ["Ḍ̇"] },
  ]);
  expect(getShortcutEventKeys({ key: "ḍ̇", code: "KeyD" })).toEqual(["Ḍ̇"]);
  expect(getShortcutEventKeys({ key: "ж́", code: "KeyW" })).toEqual(["W"]);
  expect(getShortcutEventKeys({ key: "!́", shiftKey: true })).toEqual([
    "Shift+!́",
  ]);
});

test.each(["\u00a0", "\u2009", "\u3000"])(
  "round trips the W3C whitespace key %#",
  (key) => {
    expect(parseShortcutKeys(key, "other")).toEqual([
      { value: key, keys: [key] },
    ]);
    expect(parseShortcutKeys(`Control+${key}`, "other")).toEqual([
      { value: `Control+${key}`, keys: ["Control", key] },
    ]);
    expect(getShortcutEventKeys({ key })).toEqual([key]);
    expect(getShortcutEventKeys({ key, ctrlKey: true })).toEqual([
      `Control+${key}`,
    ]);
  },
);

test("rejects non-NFC and multi-base key strings", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(parseShortcutKeys("ḍ̇ ab", "other")).toEqual([]);
  expect(getShortcutEventKeys({ key: "ḍ̇" })).toEqual([]);
  expect(getShortcutEventKeys({ key: "ab" })).toEqual([]);
  expect(consoleWarn).toHaveBeenCalledTimes(2);
});

test("deduplicates canonical alternatives", () => {
  expect(
    parseShortcutKeys(
      "Control+K control+K CONTROL+K mod+K pc:control+k",
      "windows",
    ),
  ).toEqual([{ value: "Control+K", keys: ["Control", "K"] }]);
});

test("warns once for each invalid alternative and keeps valid ones", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(
    parseShortcutKeys(
      "Control+K Control+ Control Control+A+B Hyper+K opt+K NotAKey windows:K pc:",
      "windows",
    ),
  ).toEqual([{ value: "Control+K", keys: ["Control", "K"] }]);
  expect(consoleWarn).toHaveBeenCalledTimes(8);
});

test("does not warn for empty alternatives filtered by platform", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(parseShortcutKeys("apple:", "windows")).toEqual([]);
  expect(parseShortcutKeys("pc:", "apple")).toEqual([]);
  expect(parseShortcutKeys("   ", "other")).toEqual([]);
  expect(consoleWarn).not.toHaveBeenCalled();
});

test("warns for an empty alternative on its matching platform", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(parseShortcutKeys("apple:", "apple")).toEqual([]);
  expect(consoleWarn).toHaveBeenCalledOnce();
});

test("normalizes event modifiers, literals, and named keys", () => {
  expect(
    normalizeShortcutEvent({
      key: "a",
      ctrlKey: true,
      altKey: true,
      shiftKey: true,
      metaKey: true,
    }),
  ).toEqual({
    valid: true,
    key: "A",
    value: "Control+Alt+Shift+Meta+A",
    keys: ["Control+Alt+Shift+Meta+A"],
  });
  expect(getShortcutEventKeys({ key: " ", ctrlKey: true })).toEqual([
    "Control+Space",
  ]);
  expect(getShortcutEventKeys({ key: "+", metaKey: true })).toEqual([
    "Meta+Plus",
  ]);
  expect(getShortcutEventKeys({ key: "escape" })).toEqual(["Escape"]);
  expect(getShortcutEventKeys({ key: "F36" })).toEqual(["F36"]);
  expect(getShortcutEventKeys({ key: "soft8" })).toEqual(["Soft8"]);
  expect(getShortcutEventKeys({ key: "ß" })).toEqual(["ß"]);
  expect(getShortcutEventKeys({ key: "ẞ" })).toEqual(["ß"]);
});

test("trusts ASCII and Latin event keys over physical codes", () => {
  expect(
    getShortcutEventKeys({ key: "a", code: "KeyQ", altKey: true }),
  ).toEqual(["Alt+A"]);
  expect(getShortcutEventKeys({ key: "é", code: "KeyE" })).toEqual(["É"]);
  expect(
    getShortcutEventKeys({ key: "!", code: "Digit1", shiftKey: true }),
  ).toEqual(["Shift+!", "!"]);
});

test("falls back from non-Latin event keys to physical codes", () => {
  expect(getShortcutEventKeys({ key: "ж", code: "KeyW" })).toEqual(["W"]);
  expect(
    getShortcutEventKeys({ key: "€", code: "KeyE", altKey: true }),
  ).toEqual(["Alt+E"]);
  expect(getShortcutEventKeys({ key: "文", code: "Slash" })).toEqual(["/"]);
  expect(getShortcutEventKeys({ key: "文", code: "Numpad2" })).toEqual(["2"]);
  expect(getShortcutEventKeys({ key: "ж" })).toEqual(["Ж"]);
});

test("adds a Shift-less lookup only for one-character non-letter keys", () => {
  expect(getShortcutEventKeys({ key: "?", shiftKey: true })).toEqual([
    "Shift+?",
    "?",
  ]);
  expect(
    getShortcutEventKeys({ key: "+", ctrlKey: true, shiftKey: true }),
  ).toEqual(["Control+Shift+Plus", "Control+Plus"]);
  expect(getShortcutEventKeys({ key: "1", shiftKey: true })).toEqual([
    "Shift+1",
    "1",
  ]);
  expect(getShortcutEventKeys({ key: "a", shiftKey: true })).toEqual([
    "Shift+A",
  ]);
  expect(getShortcutEventKeys({ key: "é", shiftKey: true })).toEqual([
    "Shift+É",
  ]);
  expect(getShortcutEventKeys({ key: " ", shiftKey: true })).toEqual([
    "Shift+Space",
    "Space",
  ]);
  expect(getShortcutEventKeys({ key: "ArrowUp", shiftKey: true })).toEqual([
    "Shift+ArrowUp",
  ]);
});

test.each([
  [{ key: "" }, "empty"],
  [{ key: "Dead" }, "dead"],
  [{ key: "Unidentified" }, "unidentified"],
  [{ key: "a", isComposing: true }, "composing"],
  [{ key: "a", keyCode: 229 }, "composing"],
  [{ key: "AltGraph" }, "alt-graph"],
  [
    { key: "€", getModifierState: (key: string) => key === "AltGraph" },
    "alt-graph",
  ],
  [{ key: "Shift", shiftKey: true }, "modifier"],
  [{ key: "Fn" }, "modifier"],
  [{ key: "LaunchSomething" }, "unsupported"],
] as const)("rejects an unmatchable event with reason %s", (event, reason) => {
  expect(normalizeShortcutEvent(event)).toEqual({ valid: false, reason });
  expect(getShortcutEventKeys(event)).toEqual([]);
});

test("formats Apple shortcuts with glyphs and sparse spoken names", () => {
  expect(
    formatShortcutKeys("meta+shift+alt+control+k", { platform: "apple" }),
  ).toEqual({
    value: "Control+Alt+Shift+Meta+K",
    text: "⌃⌥⇧⌘K",
    alternatives: [
      {
        value: "Control+Alt+Shift+Meta+K",
        text: "⌃⌥⇧⌘K",
        joiner: "",
        keys: [
          {
            value: "Control",
            text: "⌃",
            name: "Control",
            modifier: true,
          },
          { value: "Alt", text: "⌥", modifier: true },
          { value: "Shift", text: "⇧", name: "Shift", modifier: true },
          { value: "Meta", text: "⌘", modifier: true },
          { value: "K", text: "K", modifier: false },
        ],
      },
    ],
  });
});

test("uses Windows and other platform defaults", () => {
  expect(
    formatShortcutKeys("control+alt+shift+meta+k", {
      platform: "windows",
    }).text,
  ).toBe("Ctrl+Alt+Shift+Win+K");
  expect(
    formatShortcutKeys("control+alt+shift+meta+k", { platform: "other" }).text,
  ).toBe("Ctrl+Alt+Shift+Meta+K");
  expect(
    formatShortcutKeys("control+k", { platform: "windows" }).alternatives[0]
      ?.keys,
  ).toEqual([
    { value: "Control", text: "Ctrl", modifier: true },
    { value: "K", text: "K", modifier: false },
  ]);
});

test("returns fresh default format maps", () => {
  const glyphs = getDefaultShortcutGlyphs("apple");
  const keyNames = getDefaultShortcutKeyNames("apple");
  glyphs.Meta = "M";
  keyNames.Control = "Ctrl";
  expect(getDefaultShortcutGlyphs("apple").Meta).toBe("⌘");
  expect(getDefaultShortcutKeyNames("apple")).toEqual({
    Control: "Control",
    Shift: "Shift",
  });
  expect(getDefaultShortcutKeyNames("windows")).toEqual({});
  expect(getDefaultShortcutKeyNames("other")).toEqual({});
});

test("formats declaration syntax and keeps canonical output separate", () => {
  expect(
    formatShortcutKeys("apple:mod+S pc:mod+S alt+enter", {
      platform: "windows",
    }),
  ).toMatchObject({
    value: "Control+S Alt+Enter",
    text: "Ctrl+S Alt+Enter",
    alternatives: [
      { value: "Control+S", text: "Ctrl+S" },
      { value: "Alt+Enter", text: "Alt+Enter" },
    ],
  });
});

test("merges custom glyphs and key names with platform defaults", () => {
  const formatted = formatShortcutKeys("alt+mod+k", {
    platform: "apple",
    glyphs: { Meta: "M", K: "κ", "+": "·" },
    keyNames: { Meta: "Super", K: "Kappa" },
  });
  expect(formatted.text).toBe("⌥·M·κ");
  expect(formatted.alternatives[0]?.keys).toEqual([
    { value: "Alt", text: "⌥", modifier: true },
    { value: "Meta", text: "M", name: "Super", modifier: true },
    { value: "K", text: "κ", name: "Kappa", modifier: false },
  ]);
  expect(
    formatShortcutKeys("alt+mod+k", {
      platform: "apple",
      joiner: "/",
      glyphs: { Meta: "M", K: "κ", "+": "·" },
    }).text,
  ).toBe("⌥/M/κ");
});

test("ignores inherited map values and accepts non-enumerable own values", () => {
  const glyphs: ShortcutGlyphs = Object.create({
    Meta: "Inherited",
    "+": "~",
  });
  Object.defineProperty(glyphs, "K", { value: "κ" });
  expect(formatShortcutKeys("meta+k", { platform: "apple", glyphs }).text).toBe(
    "⌘κ",
  );
});

test("uses other-platform defaults without a browser navigator", () => {
  expect(typeof document).toBe("undefined");
  expect(getShortcutPlatform()).toBe("other");
  expect(parseShortcutKeys("mod+k")).toEqual([
    { value: "Control+K", keys: ["Control", "K"] },
  ]);
  expect(formatShortcutKeys("mod+k").text).toBe("Ctrl+K");
});

test.each([
  ["MacIntel", "apple"],
  ["Win32", "windows"],
  ["Linux x86_64", "other"],
] as const)("detects %s in a DOM environment", (platform, expected) => {
  vi.stubGlobal("window", {});
  vi.stubGlobal("document", {});
  vi.stubGlobal("navigator", { platform, userAgent: platform });
  expect(getShortcutPlatform()).toBe(expected);
});

test("detects iOS from user agent data", () => {
  vi.stubGlobal("window", {});
  vi.stubGlobal("document", {});
  vi.stubGlobal("navigator", {
    platform: "iPhone",
    userAgent: "iPhone",
    userAgentData: { platform: "iOS" },
  });
  expect(getShortcutPlatform()).toBe("apple");
});
