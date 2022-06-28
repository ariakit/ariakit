---
"ariakit": patch
"ariakit-utils": patch
---

Fixed an issue where `ariakit-utils` was importing React v18 APIs via a _namespace_ (and previously named) import (`import * as React from 'react'`). When using React v17, Webpack will raise an error when using either named or namedspace imports.
