---
"ariakit": patch
"ariakit-utils": patch
---

Fixes an issue where `ariakit-utils` was importing React v18 APIs via named imports. As Webpack/CRA see that these APIs do not exist on React v17, it would raise an error.
