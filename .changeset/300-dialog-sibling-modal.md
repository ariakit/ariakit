---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed sibling modal [`Dialog`](https://ariakit.com/reference/dialog) components rendered in their default portals so opening them in the same render no longer made each other inert. Thanks to [@yishayhaz](https://github.com/yishayhaz) for reporting the issue.
