import { expect, test } from "vitest";
import {
  defaultSelectedValuePersistenceLimit,
  getPersistentSelectedValues,
} from "./__combobox-renderer.ts";

const values = Array.from({ length: 40 }, (_, index) => `${index + 1}`);

// https://github.com/ariakit/ariakit/issues/7114
test("limits persisted selected values", () => {
  expect(defaultSelectedValuePersistenceLimit).toBe(32);
  expect(getPersistentSelectedValues(values)).toEqual(values.slice(-32));
});

// https://github.com/ariakit/ariakit/issues/7114
const normalizationCases = [
  [0, []],
  [-1, []],
  [-Infinity, []],
  [2.9, values.slice(-2)],
  [Infinity, values],
  [NaN, values.slice(-32)],
] satisfies ReadonlyArray<readonly [number, readonly string[]]>;

test.each(normalizationCases)(
  "normalizes a persistence limit of %s",
  (limit, expected) => {
    expect(getPersistentSelectedValues(values, limit)).toEqual(expected);
  },
);
