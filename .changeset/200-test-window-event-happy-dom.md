---
"@ariakit/test": patch
---

Populated `window.event` during simulated events under happy-dom

`@ariakit/test` now exposes the event currently being dispatched on the legacy `window.event` global for the synchronous duration of each simulated event under happy-dom, matching jsdom and real browsers.

React 18 reads `window.event` to give state updates triggered from native event listeners discrete-event priority. happy-dom doesn't implement the global, so without this those updates fell back to a lower priority and flushed later, reordering commits — for example, a controlled [`Dialog`](https://ariakit.com/reference/dialog) hidden by clicking outside could momentarily re-open and restore focus to the wrong element. Simulated interactions on React 18 now match the other environments; the divergence this fixes doesn't reproduce under React 19.
