---
"ariakit": patch
"ariakit-utils": patch
---

Fixed an issue where `ariakit-utils` was directly accessing React v18 APIs via a _namespace_ import  (`import * as React from 'react'`) and Webpack was raising an error. Changed access to string concatenation so that Webpack is unable to infer that these APIs _may_ not be in the imported package.
