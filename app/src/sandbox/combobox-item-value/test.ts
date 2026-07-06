import { q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// "Resume.pdf" with combining acute accents on the "e"s, that is, stored in
// decomposed (NFD) form.
const decomposedResume = "Re\u0301sume\u0301.pdf";

function getPartTexts(element: HTMLElement, selector: string) {
  return Array.from(
    element.querySelectorAll(selector),
    (part) => part.textContent,
  );
}

// Reproduces https://github.com/ariakit/ariakit/issues/6298
test("renders overlapping matches without duplicated text", async () => {
  await type("ana", q.combobox.ensure("Search files"));

  const option = q.option.ensure("Banana.txt");
  expect(option.textContent).toBe("Banana.txt");
  expect(getPartTexts(option, "[data-user-value]")).toEqual(["anana"]);

  const normalizedEmptyValue = q.status.ensure("Normalized empty value");
  expect(normalizedEmptyValue.textContent).toBe("Cafe");
  expect(getPartTexts(normalizedEmptyValue, "[data-user-value]")).toEqual([]);
});

// Reproduces https://github.com/ariakit/ariakit/issues/6329
test("highlights only the typed syllable in Hangul item values", async () => {
  await type("사", q.combobox.ensure("Search files"));

  const option = q.option.ensure("사과.txt");
  expect(option.textContent).toBe("사과.txt");
  expect(getPartTexts(option, "[data-user-value]")).toEqual(["사"]);
  expect(getPartTexts(option, "[data-autocomplete-value]")).toEqual(["과.txt"]);
});

test("highlights only the typed kana in item values with dakuten", async () => {
  await type("ガ", q.combobox.ensure("Search files"));

  const option = q.option.ensure("ガラス.txt");
  expect(option.textContent).toBe("ガラス.txt");
  expect(getPartTexts(option, "[data-user-value]")).toEqual(["ガ"]);
  expect(getPartTexts(option, "[data-autocomplete-value]")).toEqual([
    "ラス.txt",
  ]);
});

test("keeps combining marks attached in decomposed item values", async () => {
  await type("sum", q.combobox.ensure("Search files"));

  const option = q.option.ensure(decomposedResume);
  expect(option.textContent).toBe(decomposedResume);
  expect(getPartTexts(option, "[data-user-value]")).toEqual(["sum"]);
  expect(getPartTexts(option, "[data-autocomplete-value]")).toEqual([
    "Re\u0301",
    "e\u0301.pdf",
  ]);
});

test("renders a single autocomplete span for normalized-empty input", async () => {
  // A lone combining mark normalizes to an empty string, which must not
  // produce highlights but must keep the autocomplete span structure.
  await type("\u0301", q.combobox.ensure("Search files"));

  const option = q.option.ensure("notes.txt");
  expect(option.textContent).toBe("notes.txt");
  expect(getPartTexts(option, "[data-user-value]")).toEqual([]);
  expect(getPartTexts(option, "[data-autocomplete-value]")).toEqual([
    "notes.txt",
  ]);
});

test("does not highlight characters the input only partially matches", async () => {
  // A lone medial jamo matches only a fragment of the decomposed 사 syllable,
  // which must not highlight the whole character.
  await type("\u1161", q.combobox.ensure("Search files"));

  const option = q.option.ensure("사과.txt");
  expect(option.textContent).toBe("사과.txt");
  expect(getPartTexts(option, "[data-user-value]")).toEqual([]);
  expect(getPartTexts(option, "[data-autocomplete-value]")).toEqual([
    "사과.txt",
  ]);
});

test("collapses partial matches next to removed combining marks", async () => {
  const markedApple = "사\u0301과.txt";
  const output = q.status.ensure("Partial match with combining mark");
  expect(output.textContent).toBe(markedApple);
  expect(getPartTexts(output, "[data-user-value]")).toEqual([]);
  expect(getPartTexts(output, "[data-autocomplete-value]")).toEqual([
    markedApple,
  ]);
});

test("highlights a character fully covered by overlapping partial matches", async () => {
  const output = q.status.ensure("Union of partial matches");
  expect(output.textContent).toBe("각");
  expect(getPartTexts(output, "[data-user-value]")).toEqual(["각"]);
  expect(getPartTexts(output, "[data-autocomplete-value]")).toEqual([]);
});

test("highlights diacritic-insensitive matches in decomposed item values", async () => {
  await type("resume", q.combobox.ensure("Search files"));

  const option = q.option.ensure(decomposedResume);
  expect(option.textContent).toBe(decomposedResume);
  expect(getPartTexts(option, "[data-user-value]")).toEqual([
    "Re\u0301sume\u0301",
  ]);
  expect(getPartTexts(option, "[data-autocomplete-value]")).toEqual([".pdf"]);
});
