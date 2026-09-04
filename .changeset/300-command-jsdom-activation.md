---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed `Command` keyboard activation in Vitest's default jsdom environment

The click that [`Command`](https://ariakit.com/reference/command) synthesizes for `Enter` and `Space` on a non-native element no longer throws when Vitest replaces `document.defaultView` with its Node global context. This also restores keyboard activation for every component built on `Command`, including [`Button`](https://ariakit.com/reference/button) and [`MenuButton`](https://ariakit.com/reference/menu-button).

Thanks to [@cloud-walker](https://github.com/cloud-walker) for reporting and reproducing the issue, diagnosing its cause, and exploring possible solutions.
