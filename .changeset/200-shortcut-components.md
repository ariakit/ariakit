---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Composable shortcut commands

The new [`ShortcutCommand`](https://ariakit.com/reference/shortcut-command) component and [`useShortcutCommand`](https://ariakit.com/reference/use-shortcut-command) hook register named or unnamed keyboard commands. Named declarations can supply behavior once and connect it to several rendered references.

```tsx
useShortcutCommand({
  command: "save",
  keys: "mod+S",
  onTrigger: save,
});

<MenuItem render={<ShortcutCommand command="save" />}>
  Save <Shortcut />
</MenuItem>;
```

The new [`ShortcutProvider`](https://ariakit.com/reference/shortcut-provider), [`useShortcutStore`](https://ariakit.com/reference/use-shortcut-store), and [`ShortcutScope`](https://ariakit.com/reference/shortcut-scope) APIs support nested shortcut levels, master enablement, focus-specific commands, platform configuration, and user key overrides. The new [`useShortcutKeys`](https://ariakit.com/reference/use-shortcut-keys) hook reads the effective canonical bindings for a command.

The new [`Shortcut`](https://ariakit.com/reference/shortcut) component renders platform-aware and accessible key hints. The new [`ShortcutInput`](https://ariakit.com/reference/shortcut-input) component records a canonical chord that can be passed directly to a command or stored as a user override.

Thanks to [@georgekaran](https://github.com/georgekaran) for building the implementation prototype and behavioral test exploration that informed this experiment.
