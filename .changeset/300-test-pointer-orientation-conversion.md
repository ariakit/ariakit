---
"@ariakit/test": patch
---

Fixed named pointer events in `@ariakit/test` to derive `tiltX` and `tiltY` from `altitudeAngle` and `azimuthAngle`, and vice versa, so listeners no longer receive contradictory orientations when callers provide only one pair.
