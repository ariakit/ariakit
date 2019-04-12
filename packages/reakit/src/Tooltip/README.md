---
path: /docs/tooltip
redirect_from:
  - /components/tooltip
---

# Tooltip

```jsx
import {
  Tooltip,
  TooltipArrow,
  TooltipReference,
  useTooltipState,
  Button
} from "reakit";

function Example() {
  const tooltip = useTooltipState();
  return (
    <div style={{ padding: 100 }}>
      <TooltipReference as={Button} {...tooltip}>
        Reference
      </TooltipReference>
      <Tooltip {...tooltip}>
        <TooltipArrow {...tooltip} />
        tooltip
      </Tooltip>
    </div>
  );
}
```

## Props

<!-- Automatically generated -->

### `useTooltipState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>unstable_flip</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether or not flip the popover. |
| <strong><code>unstable_shift</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether or not shift the popover. |
| <strong><code>unstable_gutter</code>&nbsp;⚠️</strong> | <code>number&nbsp;&#124;&nbsp;undefined</code> | Offset between the reference and the popover. |

### `Tooltip`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>unstable_popoverRef</code>&nbsp;⚠️</strong> | <code>RefObject&#60;HTMLElement&nbsp;&#124;&nbsp;null&#62;</code> | The popover element. |

### `TooltipArrow`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |

### `TooltipReference`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>unstable_referenceRef</code>&nbsp;⚠️</strong> | <code>RefObject&#60;HTMLElement&nbsp;&#124;&nbsp;null&#62;</code> | The reference element. |
| <strong><code>show</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `true` |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |
