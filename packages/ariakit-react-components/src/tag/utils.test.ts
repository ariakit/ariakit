import { expect, test } from "vitest";
import { getDelimiters, splitValueByDelimiter } from "./utils.ts";

test("getDelimiters", () => {
  expect(getDelimiters(undefined)).toEqual(["\n", ";", ",", /\s/]);
  expect(getDelimiters(null)).toEqual([]);
  expect(getDelimiters("")).toEqual([]);
  expect(getDelimiters(undefined, null)).toEqual([]);
  expect(getDelimiters(undefined, ";")).toEqual([";"]);
  expect(getDelimiters([",", /\s/])).toEqual([",", /\s/]);
});

test.each([
  {
    name: "array first-match-wins",
    value: "one,two three",
    delimiters: [/\s/, ","],
    expected: ["one,two", "three"],
  },
  {
    name: "leading-delimiter strip",
    value: ",,one,two",
    delimiters: [","],
    expected: ["one", "two"],
  },
  {
    name: "trailing delimiter",
    value: "one,two,",
    delimiters: [","],
    expected: ["one", "two", ""],
  },
  {
    name: "value only delimiter",
    value: ",",
    delimiters: [","],
    expected: [],
  },
  {
    name: "capturing-group regex",
    value: "one,two;three",
    delimiters: [/([,;])/],
    expected: ["one", ",", "two", ";", "three"],
  },
  {
    name: "global-flag regex",
    value: ",one,two",
    delimiters: [/,/g],
    expected: ["", "one", "two"],
  },
] as const)(
  "splitValueByDelimiter $name",
  ({ value, delimiters, expected }) => {
    expect(splitValueByDelimiter(value, [...delimiters])).toEqual(expected);
  },
);
