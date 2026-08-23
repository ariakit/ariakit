---
"@ariakit/react-components": patch
---

Experimental `Link` and `useLink`

The experimental `Link` component renders a native anchor. When disabled, it omits native destination and anchor microdata attributes during render and exposes link semantics in server HTML.

```tsx
import { Link } from "@ariakit/react-components/link/link";

<Link href="/articles/2" disabled accessibleWhenDisabled>
  Next article
</Link>;
```

Pass the destination to `Link` so it can withhold it while disabled.
