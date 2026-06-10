---
"@ariakit/utils": patch
---

Improved `getFirstTabbableIn` performance: it now returns as soon as it finds a tabbable element instead of collecting and checking every tabbable element in the container first.
