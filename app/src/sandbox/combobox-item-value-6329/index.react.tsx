import * as Ariakit from "@ariakit/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

// The escaped entry is "Resume.pdf" with combining acute accents on the "e"s,
// that is, stored in decomposed (NFD) form as produced by macOS file-system
// APIs.
const files = [
  "사과.txt",
  "바나나.txt",
  "ガラス.txt",
  "Re\u0301sume\u0301.pdf",
  "notes.txt",
];

// Diacritic-insensitive filtering, as apps commonly implement so that typing
// "resume" still matches the decomposed "Résumé.pdf" entry.
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// TODO: Remove this workaround once
// https://github.com/ariakit/ariakit/issues/6329 is fixed.
//
// ComboboxItemValue computes the highlight offsets on a normalized copy of the
// item value but slices the original string with them, so Hangul, kana, and
// decomposed (NFD) values highlight the wrong characters. Compute the parts in
// userland instead: match on the normalized strings (keeping the highlight
// diacritic-insensitive), then map each normalized offset back to the original
// character that produced it before slicing.
function getHighlightedParts(itemValue: string, userValue: string) {
  if (!userValue) return itemValue;
  const normalizedUserValue = normalize(userValue);
  // A truthy input that normalizes to an empty string (such as a lone
  // combining mark) produces no highlights, but keeps the autocomplete span
  // like the built-in split.
  if (!normalizedUserValue) {
    return <span data-autocomplete-value="">{itemValue}</span>;
  }

  const normalizedItemValue = normalize(itemValue);

  // Collect every match offset in normalized space, including overlapping
  // occurrences, then merge them so repeated matches render as a single span
  // like the built-in split does.
  const offsets: Array<[number, number]> = [];
  let matchIndex = normalizedItemValue.indexOf(normalizedUserValue);
  while (matchIndex !== -1) {
    offsets.push([matchIndex, normalizedUserValue.length]);
    matchIndex = normalizedItemValue.indexOf(
      normalizedUserValue,
      matchIndex + 1,
    );
  }

  const merged: Array<[number, number]> = [];
  for (const [offset, length] of offsets) {
    const last = merged[merged.length - 1];
    if (last && offset < last[0] + last[1]) {
      last[1] = Math.max(last[1], offset + length - last[0]);
    } else {
      merged.push([offset, length]);
    }
  }

  // Maps each index of the normalized item value to the index of the original
  // character that produced it, plus a final entry for the end boundary.
  // Iterating code points keeps surrogate pairs intact, and characters removed
  // by normalization contribute no entries, so combining marks stay attached
  // to the preceding character when slicing.
  const indexes: number[] = [];
  let index = 0;
  for (const char of itemValue) {
    const normalizedLength = normalize(char).length;
    for (let i = 0; i < normalizedLength; i += 1) {
      indexes.push(index);
    }
    index += char.length;
  }
  indexes.push(itemValue.length);

  const parts: ReactNode[] = [];
  let position = 0;

  for (const [offset, length] of merged) {
    const start = indexes[offset];
    const end = indexes[offset + length];
    if (start == null || end == null) continue;
    // Matches confined to a fragment of a single character (for example, part
    // of a decomposed Hangul syllable while composing with an IME) collapse to
    // an empty range and produce no highlight.
    if (end <= start) continue;
    if (start > position) {
      parts.push(
        <span key={parts.length} data-autocomplete-value="">
          {itemValue.slice(position, start)}
        </span>,
      );
    }
    parts.push(
      <span key={parts.length} data-user-value="">
        {itemValue.slice(start, end)}
      </span>,
    );
    position = end;
  }

  if (!parts.length) {
    return <span data-autocomplete-value="">{itemValue}</span>;
  }
  if (position < itemValue.length) {
    parts.push(
      <span key={parts.length} data-autocomplete-value="">
        {itemValue.slice(position)}
      </span>,
    );
  }
  return parts;
}

// Reproduces https://github.com/ariakit/ariakit/issues/6329
export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const matches = useMemo(() => {
    const search = normalize(searchValue);
    return files.filter((file) => normalize(file).includes(search));
  }, [searchValue]);

  return (
    <Ariakit.ComboboxProvider defaultOpen setValue={setSearchValue}>
      <Ariakit.ComboboxLabel>Search files</Ariakit.ComboboxLabel>
      <Ariakit.Combobox placeholder="e.g., notes" />
      <Ariakit.ComboboxPopover gutter={8} sameWidth>
        {matches.map((file) => (
          <Ariakit.ComboboxItem key={file} value={file}>
            <Ariakit.ComboboxItemValue>
              {getHighlightedParts(file, searchValue)}
            </Ariakit.ComboboxItemValue>
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
