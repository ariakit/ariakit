---
"@ariakit/components": patch
"@ariakit/store": patch
---

Framework-independent shortcut commands

The new `createShortcutStore` function provides registration, triggering, remapping, key lookup, formatting, and same-origin document attachment outside React.

```ts
import { createShortcutStore } from "@ariakit/components/shortcut/shortcut-store";

const shortcuts = createShortcutStore({ platform: "apple" });
const unregister = shortcuts.registerCommand({
  command: "save",
  keys: "mod+S",
  onTrigger: save,
});

shortcuts.setKeys("save", "Meta+Shift+S");
shortcuts.trigger("save");
unregister();
```

This also adds a private atomic state synchronization path to `@ariakit/store` so inherited shortcut settings reach subscribers as one coherent snapshot.

Thanks to [@georgekaran](https://github.com/georgekaran) for building the implementation prototype and behavioral test exploration that informed this experiment.
