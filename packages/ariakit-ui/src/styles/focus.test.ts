import type { VariantProps } from "clava";
import { expect, expectTypeOf, test } from "vitest";
import { focus, focusHighlight } from "./focus.ts";
import { input } from "./input.ts";
import { link } from "./link.ts";

function getOffsetClasses(className: string) {
  return className
    .split(" ")
    .filter((name) => name.includes("outline-offset-"));
}

// https://github.com/ariakit/ariakit/pull/7495#discussion_r3997158431
test("leaves the focus offset unset", () => {
  expectTypeOf<VariantProps<typeof focus>["$focusOffset"]>().toEqualTypeOf<
    "unset" | 0 | 1 | 2 | undefined
  >();
  for (const recipe of [focus, input, link]) {
    const result = recipe({ $focus: true, $focusOffset: "unset" });
    expect(getOffsetClasses(result.class)).toEqual([]);
  }
});

// https://github.com/ariakit/ariakit/pull/7495#discussion_r3996994127
test("sets an explicit zero focus offset", () => {
  for (const recipe of [focus, input, link]) {
    const result = recipe({ $focus: true, $focusOffset: 0 });
    expect(getOffsetClasses(result.class)).toEqual(["outline-offset-0"]);
  }
});

// https://github.com/ariakit/ariakit/pull/7495#discussion_r3996994127
test("preserves focus offset defaults and caller overrides", () => {
  expect(getOffsetClasses(focus({ $focus: true }).class)).toEqual([
    "outline-offset-1",
  ]);
  expect(getOffsetClasses(input().class)).toEqual(["-outline-offset-1"]);
  expect(getOffsetClasses(link().class)).toEqual(["outline-offset-0"]);
  for (const recipe of [focus, input, link]) {
    for (const offset of [1, 2] as const) {
      const result = recipe({ $focus: true, $focusOffset: offset });
      expect(getOffsetClasses(result.class)).toEqual([
        `outline-offset-${offset}`,
      ]);
    }
  }
});

// https://github.com/ariakit/ariakit/pull/7495#discussion_r3996994127
test("clears the focus offset when the highlight replaces the ring", () => {
  const result = focusHighlight({
    $focus: true,
    $focusOffset: 2,
    $focusHighlight: true,
  });
  expect(getOffsetClasses(result.class)).toEqual([]);
});
