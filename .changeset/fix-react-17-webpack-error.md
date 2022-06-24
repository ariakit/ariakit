---
"ariakit": patch
"ariakit-utils": patch
---

Fixed an issue where `ariakit-utils` was importing React v18 APIs via named imports. As Webpack/CRA sees that these APIs do not exist on React v17, it would raise an error. ([#1542](https://github.com/ariakit/ariakit/pull/1542))
