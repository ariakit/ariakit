---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`TooltipProvider`](https://ariakit.com/reference/tooltip-provider) to avoid a re-entrant loop when multiple tooltips are forced open at the same time.
