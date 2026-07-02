---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxItemValue`](https://ariakit.com/reference/combobox-item-value) highlighting the wrong characters for item values whose Unicode normalization changes the string length, such as Hangul, kana with dakuten, and decomposed (NFD) strings. Matching remains diacritic-insensitive, and the `data-user-value` spans now cover exactly the matched characters without detaching combining marks from their base letters.
