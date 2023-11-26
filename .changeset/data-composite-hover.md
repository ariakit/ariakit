---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Internal data attribute changes

Just like the change in v0.3.6 that removed the `data-command` and `data-disclosure` attributes from elements, this update stops the `data-composite-hover` attribute from infiltrating composite item elements in the DOM. We're mentioning this in the changelog as some users might have snapshot tests that require updating.
