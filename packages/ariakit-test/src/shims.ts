import { applyBrowserPolyfills } from "./__utils.ts";

// Apply the browser shims once for the whole test environment, instead of only
// while a simulated interaction runs. Components read layout and focusability
// between interactions too — for example a dialog's auto-focus effect calls
// `getFirstTabbableIn`, which uses the `getClientRects` shim to decide whether
// an element is visible. If the shims only existed inside `wrapAsync`, those
// reads would hit jsdom's empty layout and misbehave (focus landing on the
// dialog container instead of the first tabbable).
//
// `index.ts` imports this module so the shims are applied automatically with
// the main entrypoint. It's also a public entrypoint (`@ariakit/test/shims`)
// for consumers that import individual helpers and want to opt in explicitly.
applyBrowserPolyfills();
