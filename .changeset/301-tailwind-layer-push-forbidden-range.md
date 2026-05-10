---
"@ariakit/tailwind": patch
---

Fixed `ak-layer-push-*` and `ak-state-push-*` utilities so targets inside the forbidden mid-luminance range move to the boundary on the other side, while targets that already land outside the range stay untouched.
