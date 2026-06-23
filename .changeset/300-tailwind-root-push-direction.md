---
"@ariakit/tailwind": patch
---

Fixed root pushed layers in `@ariakit/tailwind` to escape the forbidden lightness band in the same direction as nested dark layers. In browsers with CSS `if()` support, root pushed layers also use their own source direction for high-contrast bias and edge colors. Browsers without CSS `if()` support also avoid extra source-direction color work.
