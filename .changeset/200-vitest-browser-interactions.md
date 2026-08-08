---
"@ariakit/test": patch
---

Vitest Browser Mode support

The new Vitest entries route supported `@ariakit/test` interactions through Vitest's Playwright provider, allowing the same component tests to use trusted browser input in Browser Mode.

The synthetic `hover` transition now sends leave events to the previous target without dispatching an extra pair of move events first.

```ts
// vitest.config.ts
import { ariakitBrowserCommands } from "@ariakit/test/vitest-config";

export default defineConfig({
  test: {
    browser: { commands: ariakitBrowserCommands },
  },
});

// vitest.setup.browser.ts
import "@ariakit/test/vitest";
```

Thanks to [@kettanaito](https://github.com/kettanaito) for proposing the feature.
