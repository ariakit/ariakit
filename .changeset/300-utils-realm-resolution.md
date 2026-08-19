---
"@ariakit/utils": patch
---

Realm helpers report a document and a window for every input

`getDocument` and `getWindow` decided what kind of value they were handed by testing for a member name, then returned whatever that member answered with. A `<form>` defeats both steps, because it exposes its controls as named properties that override built-ins, so a control named `self`, `document`, or `ownerDocument` makes the form answer for the member the helper reads. A document does the same for the elements it names, so a `<form name="defaultView">` answers the lookup that resolves a window, which changes the answer for every element on the page rather than only for the form.

Both helpers now validate what they resolve rather than trusting the member it came from. A window has to be its own `window`, a document has to report a document's node type, and a resolved view has to own the document back, which is what separates a real view from the window of an `<iframe name="defaultView">`.

They also report the document and the window that own a document from another realm, instead of the ambient ones. `getWindow` is now typed the way `document.defaultView` is, so the interfaces a window carries, such as `PointerEvent`, can be read off its result.
