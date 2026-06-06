---
"@ariakit/test": patch
---

Batched `requestAnimationFrame` callbacks under happy-dom

`@ariakit/test` now runs happy-dom's `requestAnimationFrame` callbacks as a batched frame: all callbacks scheduled before a frame run together with a single shared timestamp, and a callback scheduled while the frame is running is deferred to the next frame. This matches the HTML specification, jsdom, and real browsers.

happy-dom otherwise runs each callback as its own task, so components that schedule work in the same frame could observe each other's mid-flight state — for example, an animated [`Dialog`](https://ariakit.com/reference/dialog) and its backdrop reading each other's computed styles while a leave animation is being set up. The batching keeps happy-dom's fast cadence, so test runs are not slowed down.
