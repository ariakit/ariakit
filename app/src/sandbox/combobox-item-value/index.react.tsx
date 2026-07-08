import * as Ariakit from "@ariakit/react";
import { useMemo, useState } from "react";

// The escaped entry is "Resume.pdf" with combining acute accents on the "e"s,
// that is, stored in decomposed (NFD) form as produced by macOS file-system
// APIs.
const files = [
  "사과.txt",
  "바나나.txt",
  "ガラス.txt",
  "Banana.txt",
  "Re\u0301sume\u0301.pdf",
  "notes.txt",
];

const normalizedEmptyUserValue = "\u0301";

// Diacritic-insensitive filtering, as apps commonly implement so that typing
// "resume" still matches the decomposed "Résumé.pdf" entry.
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// The first syllable is followed by a combining acute accent that
// normalization removes, and the user value is that syllable's lone medial
// jamo.
const markedApple = "사\u0301과.txt";
const medialJamo = "\u1161";

// Overlapping partial matches that together cover every part of the
// syllable.
const syllable = "각";
const partialValues = ["가", "\u1161\u11a8"];

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
            <Ariakit.ComboboxItemValue />
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
      <output aria-label="Partial match with combining mark">
        {/* A user value matching only a fragment of the decomposed syllable,
            which is followed by a combining mark that normalization removes,
            must not highlight anything - especially not the bare mark. */}
        <Ariakit.ComboboxItemValue value={markedApple} userValue={medialJamo} />
      </output>
      <output aria-label="Union of partial matches">
        {/* Overlapping partial matches that together cover the whole
            syllable highlight it, since every part of the character was
            matched. */}
        <Ariakit.ComboboxItemValue value={syllable} userValue={partialValues} />
      </output>
      <output aria-label="Normalized empty value">
        <Ariakit.ComboboxItemValue
          value="Cafe"
          userValue={normalizedEmptyUserValue}
        />
      </output>
    </Ariakit.ComboboxProvider>
  );
}
