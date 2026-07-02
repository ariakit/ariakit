import * as Ariakit from "@ariakit/react";
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
    </Ariakit.ComboboxProvider>
  );
}
