---
"@ariakit/tailwind": patch
---

Moved CSS custom properties outside the `base` layer

This should resolve most bundler warnings about `Unknown at rule: @property`. Some custom properties are still defined inside a `@supports` block. Browsers handle this fine, but bundlers may still warn. This has no runtime impact.
