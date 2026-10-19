---
"@ariakit/tailwind": patch
---

Fixed nested `ak-frame` elements keeping a minimum radius of `0.125rem` when their parent's padding covers the parent's radius. The minimum is now `0.125em`, so frames scaled down through their font size stay concentric with their parents.
