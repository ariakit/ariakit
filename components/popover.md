---
tags:
  - Popover
  - Dropdowns
---

# Popover

<div data-description>

Show a popup dialog positioned relative to an anchor element. This component can be either [`modal`](/reference/popover#modal) or non-modal and optionally rendered in a React [`portal`](/reference/popover#portal).

</div>

<div data-tags></div>

<a href="../examples/popover/index.tsx" data-playground>Example</a>

## API

```jsx
usePopoverStore()
usePopoverContext()

<PopoverProvider>
  <PopoverAnchor />
  <PopoverDisclosure />
  <Popover>
    <PopoverArrow />
    <PopoverHeading />
    <PopoverDescription />
    <PopoverDismiss />
  </Popover>
</PopoverProvider>
```
