---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Radio`](https://ariakit.com/reference/radio) ignoring a selection when its [`checked`](https://ariakit.com/reference/radio#checked) prop is `false` but the radio store still holds its value, such as after the app resets its controlled state.
