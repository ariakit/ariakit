---
"@ariakit/solid-utils": minor
"@ariakit/solid-components": minor
"@ariakit/solid": minor
---

Solid 2 compatibility

**BREAKING:** These packages now require Solid 2 instead of Solid 1. `@ariakit/solid-utils` also requires the separate `@solidjs/web` runtime. The Solid implementation is being rebuilt from scratch; the component entrypoints remain empty on `solid-reboot`.

Before:

```sh
npm install solid-js@1 @ariakit/solid
```

After:

```sh
npm install solid-js@2.0.0-rc.13 @solidjs/web@2.0.0-rc.13 @ariakit/solid
```

Applications must also use the Solid 2 compiler, such as `@solidjs/vite-plugin@3.0.0-next.47`, instead of `vite-plugin-solid`.
