---
"@ariakit/test": patch
---

`getModifierState` reports every modifier name

Events created by `dispatch`, and by the helpers built on it such as `press` and `click`, now report `false` for modifier names they don't recognize. `Object.prototype` member names such as `constructor`, `toString`, and `hasOwnProperty` used to report `true`.

The `modifierHyper` and `modifierSuper` init members are honored now too, so they report the `Hyper` and `Super` modifiers.
