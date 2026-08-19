---
"@ariakit/test": patch
---

Events dispatched inside a same-origin iframe are initialized

`dispatch` builds an event with the constructors of the window that owns its target, so an event dispatched at an element inside an iframe belongs to that frame. The initialization then tested it against the outer window's constructors, matched none of them, and skipped every member it assigns.

A keyboard or mouse event reached its listeners with the modifier state its own constructor happened to store, rather than the one the dispatch described. The events already recognized by their type, which are the pointer and click families along with the drag events and `wheel`, were unaffected.

This affected any environment that gives a frame its own constructors, including jsdom and real browsers, but not happy-dom, whose frames share the parent's.
