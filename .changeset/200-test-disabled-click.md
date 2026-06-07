---
"@ariakit/test": patch
---

Ran `click` listeners on disabled controls under happy-dom

`@ariakit/test` now runs the event listeners for a `click` dispatched on a disabled `button` or `input` under happy-dom, without activating the control. This matches jsdom and real browsers, which only bar clicks queued from user interaction on a disabled control — not a scripted `dispatchEvent`.

happy-dom otherwise drops such a click entirely, so a test couldn't observe a click reaching a control that became disabled mid-interaction.
