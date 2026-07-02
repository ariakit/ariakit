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

test("highlights diacritic-insensitive matches in decomposed item values", async () => {
  await type("resume", q.combobox.ensure("Search files"));

  const option = q.option.ensure(decomposedResume);
  expect(option.textContent).toBe(decomposedResume);
  expect(getPartTexts(option, "[data-user-value]")).toEqual([
    "Re\u0301sume\u0301",
  ]);
  expect(getPartTexts(option, "[data-autocomplete-value]")).toEqual([".pdf"]);
});
