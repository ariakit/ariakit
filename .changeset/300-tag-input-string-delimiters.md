---
"@ariakit/react-components": patch
---

Fixed `TagInput` string delimiters with regex metacharacters so they're matched literally and don't freeze, throw, or fail to split tags.
