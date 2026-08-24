import { beforeEach, expect, test, vi } from "vitest";
import {
  getSelectionAttributeByRole,
  isAdditiveSelectionEvent,
  isNonContiguousSelectionEvent,
  isRangeSelectionEvent,
  isVirtualClick,
  supportsAriaMultiselectable,
} from "./index.ts";
import { isApple } from "./platform.ts";
import type { AriaRole } from "./types.ts";

vi.mock("./platform.ts", () => ({ isApple: vi.fn() }));

const mockedIsApple = vi.mocked(isApple);

beforeEach(() => {
  mockedIsApple.mockReturnValue(false);
});

const booleanValues = [false, true];

const selectionEventCases = booleanValues.flatMap((apple) =>
  booleanValues.flatMap((ctrlKey) =>
    booleanValues.flatMap((metaKey) =>
      booleanValues.map((shiftKey) => {
        const nonContiguous = apple ? metaKey : ctrlKey;
        const range = shiftKey && !(apple && metaKey);
        return {
          platform: apple ? "Apple" : "non-Apple",
          apple,
          ctrlKey,
          metaKey,
          shiftKey,
          nonContiguous,
          range,
          additive: range && nonContiguous,
        };
      }),
    ),
  ),
);

test.each(selectionEventCases)(
  "$platform selection modifiers: Control=$ctrlKey Meta=$metaKey Shift=$shiftKey",
  ({ apple, ctrlKey, metaKey, shiftKey, nonContiguous, range, additive }) => {
    mockedIsApple.mockReturnValue(apple);
    const event = { ctrlKey, metaKey, shiftKey };

    expect(isNonContiguousSelectionEvent(event)).toBe(nonContiguous);
    expect(isRangeSelectionEvent(event)).toBe(range);
    expect(isAdditiveSelectionEvent(event)).toBe(additive);
  },
);

test.each([
  { detail: 0, expected: true },
  { detail: 1, expected: false },
  { detail: 2, expected: false },
])(
  "isVirtualClick returns $expected for detail $detail",
  ({ detail, expected }) => {
    expect(isVirtualClick({ detail })).toBe(expected);
  },
);

const knownRoles = [
  "alert",
  "alertdialog",
  "application",
  "article",
  "banner",
  "button",
  "cell",
  "checkbox",
  "columnheader",
  "combobox",
  "complementary",
  "contentinfo",
  "definition",
  "dialog",
  "directory",
  "document",
  "feed",
  "figure",
  "form",
  "grid",
  "gridcell",
  "group",
  "heading",
  "img",
  "link",
  "list",
  "listbox",
  "listitem",
  "log",
  "main",
  "marquee",
  "math",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "navigation",
  "none",
  "note",
  "option",
  "presentation",
  "progressbar",
  "radio",
  "radiogroup",
  "region",
  "row",
  "rowgroup",
  "rowheader",
  "scrollbar",
  "search",
  "searchbox",
  "separator",
  "slider",
  "spinbutton",
  "status",
  "switch",
  "tab",
  "table",
  "tablist",
  "tabpanel",
  "term",
  "textbox",
  "timer",
  "toolbar",
  "tooltip",
  "tree",
  "treegrid",
  "treeitem",
] as const satisfies readonly AriaRole[];

const multiselectableRoles = new Set<AriaRole>([
  "grid",
  "listbox",
  "tree",
  "treegrid",
]);

test.each(knownRoles)(
  "supportsAriaMultiselectable handles the %s role",
  (role) => {
    expect(supportsAriaMultiselectable(role)).toBe(
      multiselectableRoles.has(role),
    );
  },
);

test.each([undefined, null, "custom-role"])(
  "supportsAriaMultiselectable rejects %s",
  (role) => {
    expect(supportsAriaMultiselectable(role)).toBe(false);
  },
);

type SelectionAttribute = "aria-checked" | "aria-selected";

const selectionAttributes = new Map<AriaRole, SelectionAttribute>([
  ["checkbox", "aria-checked"],
  ["menuitemcheckbox", "aria-checked"],
  ["menuitemradio", "aria-checked"],
  ["radio", "aria-checked"],
  ["switch", "aria-checked"],
  ["columnheader", "aria-selected"],
  ["gridcell", "aria-selected"],
  ["option", "aria-selected"],
  ["row", "aria-selected"],
  ["rowheader", "aria-selected"],
  ["tab", "aria-selected"],
  ["treeitem", "aria-selected"],
]);

test.each(knownRoles)(
  "getSelectionAttributeByRole handles the %s role",
  (role) => {
    expect(getSelectionAttributeByRole(role)).toBe(
      selectionAttributes.get(role),
    );
  },
);

test.each([undefined, null, "custom-role"])(
  "getSelectionAttributeByRole rejects %s",
  (role) => {
    expect(getSelectionAttributeByRole(role)).toBeUndefined();
  },
);
