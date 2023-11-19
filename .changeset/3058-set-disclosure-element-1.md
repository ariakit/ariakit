---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Multiple disclosure and anchor elements

The `disclosureElement` and `anchorElement` states on [Disclosure](https://ariakit.org/components/disclosure), [Popover](https://ariakit.org/components/popover), and [Menu](https://ariakit.org/components/menu), along with related components, are now set only upon interaction.

This change enables us to support multiple disclosure/anchor elements for the same `contentElement` (typically the popup element) when triggered by hover or focus.
