---
"@ariakit/store": patch
"@ariakit/solid-store": patch
---

Fixed merged stores to keep values in sync when `sync` listeners update parent
stores during initialization, including composed stores used by
[`Select`](https://ariakit.com/reference/select) and
[`Combobox`](https://ariakit.com/reference/combobox).
