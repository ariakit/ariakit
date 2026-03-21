---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Deprecation warning for implicit compatible provider context fallbacks

Components that still rely on implicit compatible provider context fallbacks now
log a warning in development. Pass the provider component to the `store` prop to
keep the current behavior while preparing for the future breaking change.
