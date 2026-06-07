---
"@ariakit/test": patch
---

Ran `click` listeners and activation on disabled controls under happy-dom

`@ariakit/test` now runs both the event listeners and the activation behavior for a `click` dispatched on a disabled `button` or `input` under happy-dom. This matches jsdom and real browsers, which only bar clicks queued from user interaction on a disabled control — not a scripted `dispatchEvent`.

A disabled `checkbox`/`radio` now toggles before its click listener runs (which still sees it disabled) and fires `input`/`change`, reverting — and restoring the rest of the radio group — when a listener calls `preventDefault()`. Disabled submit/reset controls run their listeners without submitting or resetting the form.

happy-dom otherwise drops such a click entirely, so a test couldn't observe a click reaching a control that became disabled mid-interaction, and a disabled checkbox wouldn't toggle.
