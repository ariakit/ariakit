---
"@ariakit/test": patch
---

Fixed `getModifierState` on keyboard and mouse events created by `dispatch`, and by the helpers built on it such as `press` and `click`, to report `false` for modifier names it doesn't recognize. `Object.prototype` member names such as `constructor`, `toString`, and `hasOwnProperty` used to report `true`.
