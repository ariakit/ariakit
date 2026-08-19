---
"@ariakit/react-components": minor
---

Renamed `TagListLabel` to `TagLabel`

**BREAKING** if you're using the `TagListLabel` component.

The label doesn't belong to the tag list alone. It labels the `TagInput` element and provides the accessible name for both the listbox element rendered by `TagList` and the group element rendered by `TagControl`, so it's now called `TagLabel` and its module moved to `@ariakit/react-components/tag/tag-label`.

Before:

```tsx
import { TagListLabel } from "@ariakit/react-components/tag/tag-list-label";

<TagListLabel>Invitees</TagListLabel>;
```

After:

```tsx
import { TagLabel } from "@ariakit/react-components/tag/tag-label";

<TagLabel>Invitees</TagLabel>;
```

The `useTagListLabel` hook and the `TagListLabelOptions` and `TagListLabelProps` types were renamed to `useTagLabel`, `TagLabelOptions` and `TagLabelProps` as well.
