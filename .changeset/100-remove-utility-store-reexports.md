---
"@ariakit/core": minor
"@ariakit/react-core": minor
"@ariakit/solid-core": minor
---

Removed core utility re-exports

**BREAKING** if you import utility or framework-agnostic store APIs from Ariakit core packages instead of the new dedicated packages.

Utility and framework-agnostic store APIs are now exported by the new `@ariakit/utils`, `@ariakit/store`, `@ariakit/react-utils`, and `@ariakit/solid-utils` packages. React store utilities remain available from [`@ariakit/react`](https://ariakit.com/reference/use-store-state) and `@ariakit/react-core/utils/store`.

Before:

```ts
import { createStore } from "@ariakit/core/utils/store";
import { getDocument } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import type { AnyObject } from "@ariakit/core/utils/types";
import { useEvent } from "@ariakit/react-core/utils/hooks";
```

After:

```ts
import { createStore } from "@ariakit/store";
import { getDocument, invariant } from "@ariakit/utils";
import type { AnyObject } from "@ariakit/utils";
import { useEvent } from "@ariakit/react-utils";
```

Before:

```ts
import { mergeProps } from "@ariakit/react-core/utils/misc";
import { createElement } from "@ariakit/react-core/utils/system";
import type { Options, Props } from "@ariakit/react-core/utils/types";
```

After:

```ts
import { createElement, mergeProps } from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
```

Before:

```ts
import { createInstance } from "@ariakit/solid-core/utils/system";
import { createId } from "@ariakit/solid-core/utils/misc";
import { createRef } from "@ariakit/solid-core/utils/reactivity";
import type { Options, Props } from "@ariakit/solid-core/utils/types";
```

After:

```ts
import { createId, createInstance, createRef } from "@ariakit/solid-utils";
import type { Options, Props } from "@ariakit/solid-utils";
```
