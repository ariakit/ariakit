---
"@ariakit/react": minor
---

The `initialFocusRef` and `finalFocusRef` props from `Dialog` and derived components have been renamed to `initialFocus` and `finalFocus` respectively. They now support `HTMLElement` in addition to refs.

```diff
- <Dialog initialFocusRef={initialFocusRef} finalFocusRef={finalFocusRef} />
+ <Dialog initialFocus={initialFocusRef} finalFocus={finalFocusRef} />
```
