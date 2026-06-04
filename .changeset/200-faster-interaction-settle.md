---
"@ariakit/test": patch
---

Faster simulated interactions

The `click`, `type`, `press`, `hover`, and `select` helpers now settle between their internal sub-steps using microtasks and animation frames instead of a wall-clock delay, and the delay of the final settle after each interaction was shortened. The components under test schedule their per-step updates with microtasks and animation frames, so this speeds up test suites while preserving their behavior. Interactions that rely on a real timer (animations, tooltip/typeahead timeouts) are unaffected — pass an explicit delay to `sleep(ms)` when you need one.
