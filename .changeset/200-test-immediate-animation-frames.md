---
"@ariakit/test": patch
---

Faster simulated interactions in test environments

Methods such as `click`, `type`, and `press` wait for animation frames between simulated events to mimic real user interaction. In non-browser test environments (jsdom and happy-dom), `requestAnimationFrame` runs on a ~16ms cadence, which made interaction-heavy tests slow.

These environments now resolve animation frames on an immediate macrotask instead, significantly speeding up test runs while preserving the order and number of frames that components depend on. The browser environment is unaffected and keeps using the native cadence.

To achieve this, `@ariakit/test` now replaces the global `requestAnimationFrame` and `cancelAnimationFrame` functions in non-browser test environments when it's imported.
