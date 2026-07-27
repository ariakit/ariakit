---
"@ariakit/test": patch
---

Fixed happy-dom exposing raw targets instead of the public `<form>` and `<select>` proxies during ancestor traversal, which broke identity checks in tests using `parentNode`, `parentElement`, `closest`, `compareDocumentPosition`, or bubbled event `currentTarget`.
