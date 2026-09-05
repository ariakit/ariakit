# @ariakit/test

## 0.8.1

- Updated dependencies: `@ariakit/utils@0.2.1`

## 0.8.0

### Test queries ensure matches by default

**BREAKING** if you use `q` or `query` methods that may not find an element, or if you use their `.ensure` variants.

Single-element queries now throw when no matching element is found. The `.ensure` variant has been removed, and the new `.maybe` variant returns `null` when no element is found. Collection queries such as `.all()` continue to return an empty array when there are no matches.

Before:

```ts
const saveButton = q.button.ensure("Save");
const optionalDialog = q.dialog("Settings");
```

After:

```ts
const saveButton = q.button("Save");
const optionalDialog = q.dialog.maybe("Settings");
```

### Removed the `PointerEvent` fallback

**BREAKING** if your tests, or the code they exercise, reference the `PointerEvent` global, narrow a `pointer*` event with `instanceof MouseEvent`, or read `pageX`, `pageY`, `offsetX`, `offsetY`, or `which` from one, on jsdom below v27, such as the jsdom 26 that `jest-environment-jsdom` 30 depends on.

Importing `@ariakit/test` used to install a `PointerEvent` constructor when the environment had none, which it had done since a time when jsdom implemented no such constructor. jsdom implements it from v27 on, and happy-dom implements it too, so the fallback no longer served the environments it was written for. Environments that implement `PointerEvent` are unaffected.

Where the constructor is missing, the global is now absent again, so building one by hand throws. Dispatch the event by name instead, which reports the same members and works in every environment.

Before:

```ts
await dispatch(q.button(), new PointerEvent("pointerdown", { pointerId: 7 }));
```

After:

```ts
await dispatch.pointerDown(q.button(), { pointerId: 7 });
```

The helpers themselves keep working there, and every event they fire carries the same mouse, modifier, and pointer members it carries anywhere else. `click`, `auxclick`, and `contextmenu` are built from `MouseEvent` there rather than `PointerEvent`, so they keep the computed members too. The `pointer*` events come from `Event`, so `pageX`, `pageY`, `offsetX`, `offsetY`, and `which` are undefined on those. The [readme](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-test/readme.md#test-environment) documents the expected environment.

### `click` supports non-primary mouse buttons

Passing `button` to `click` now simulates that mouse button through the whole interaction. Activation behavior runs on `click`, so a non-primary button fires `auxclick` instead and never activates labels or `option` elements, and the secondary button also fires `contextmenu` while it is held down.

```ts
await click(q.link("Ariakit"), { button: 1 });
```

Chromium and WebKit keep firing `auxclick` on disabled controls, so `click` does too, even though it still suppresses `click` there. Firefox is the exception and fires neither.

`mouseDown` and `mouseUp` accept `button` the same way. Every helper that presses a button, which means `click`, `tap`, `mouseDown`, and `select`, now reports the button being held down in the `buttons` property on `pointerdown` and `mousedown` instead of always reporting `0`. Pass `buttons` to `mouseDown` and `mouseUp` yourself to describe a chorded gesture, such as pressing the secondary button while the primary one is still held, then releasing it with the primary one still down.

`click`, `tap`, `rightClick`, and `select` run every step from one init, where a single `buttons` cannot describe the move, the press, and the release at once, so they ignore an explicit value and derive each step instead. `rightClick` keeps firing the same sequence.

### Added `dispatch.auxClick`

`dispatch` now fires `auxclick` by name, like every other event it builds. `@testing-library/dom` has no `auxclick` entry in its event map, so firing that event previously meant building it by hand and passing it to `dispatch(element, event)`.

```ts
await dispatch.auxClick(q.link("Ariakit"), { button: 1 });
```

### Chorded button changes fire `pointermove`

`mouseDown` and `mouseUp` now follow Pointer Events for a chorded gesture, where a button changes state while another one stays held down. No `pointerdown` or `pointerup` fires in that case, so the change rides on `pointermove` and only the compatibility `mousedown` and `mouseup` fire for each button. Describe the gesture by passing `buttons` yourself, as before.

```ts
// The primary button stays held while the secondary one is pressed, so this
// fires `pointermove` instead of `pointerdown`, and `mousedown` still fires.
await mouseDown(q.button("Resize"), { button: 2, buttons: 3 });
// The primary button is still held after the release, so this fires
// `pointermove` instead of `pointerup`, and `mouseup` still fires.
await mouseUp(q.button("Resize"), { button: 2, buttons: 1 });
```

A canceled `pointerdown` also keeps suppressing the compatibility mouse events until the gesture ends, so a chorded press and release in between fire none either. Both sequences match what Chromium, Firefox, and WebKit produce for the same gesture.

### Composition dispatchers report `data`, `view`, and `detail`

`dispatch.compositionStart`, `dispatch.compositionUpdate`, and `dispatch.compositionEnd` now report the members `CompositionEvent` defines, so a listener reading `data` receives the composed text instead of `undefined`, along with the `view` and `detail` the interface inherits from `UIEvent`.

`type` composes text through `dispatch.compositionUpdate` when you pass `isComposing`, so an IME-aware listener now reads each character it simulates.

This affected happy-dom, whose `CompositionEvent` is an alias for `Event`, and not jsdom or real browsers, which implement the interface themselves.

### Events dispatched inside a same-origin iframe are initialized

`dispatch` builds an event with the constructors of the window that owns its target, so an event dispatched at an element inside an iframe belongs to that frame. The initialization then tested it against the outer window's constructors, matched none of them, and skipped every member it assigns.

A keyboard or mouse event reached its listeners with the modifier state its own constructor happened to store, rather than the one the dispatch described. The events already recognized by their type, which are the pointer and click families along with the drag events and `wheel`, were unaffected.

This affected any environment that gives a frame its own constructors, including jsdom and real browsers, but not happy-dom, whose frames share the parent's.

### Pointer events report the contact, pressure, and pointer a real device reports

A listener on the pointer events that `hover`, `mouseDown`, `mouseUp`, and the `click`, `tap`, `rightClick`, and `select` gestures fire read `width: 0`, `height: 0`, `isPrimary: false`, and whatever transducer angle the environment happened to pick, a combination no pointing device produces. Pointer Events sizes the contact of a device that reports no geometry of its own, like a mouse, as 1 by 1, requires the altitude of a transducer perpendicular to the screen from a device that reports no tilt, and treats a lone pointer as the primary pointer of its type.

Those events now report the values Chromium, Firefox, and WebKit all report for one ordinary click, including the pressure Pointer Events defines for a device with no pressure sensor: `0.5` while a button is held down and `0` otherwise. A chorded release keeps `0.5` while another button stays held, because the pointer is still in the active buttons state, which is what Firefox and WebKit report. Chromium derives that one from the button being released and reports `0`.

```ts
q.button("Resize").addEventListener("pointerdown", (event) => {
  event.width; // 1
  event.height; // 1
  event.pressure; // 0.5
  event.isPrimary; // true
  event.altitudeAngle; // Math.PI / 2
});

await mouseDown(q.button("Resize"));
```

Values passed to a helper still win. `dispatch` sizes and angles a pointer event it builds by name the same way, because those describe a pointer at rest, and leaves the pressure and the primary pointer to the helper that knows which gesture fires the event.

### `click`, `auxclick`, and `contextmenu` are dispatched as `PointerEvent`

Pointer Events defines these three events as `PointerEvent`, and Chromium, Firefox, and WebKit all dispatch them that way, but the test environment built them as `MouseEvent`. A listener could not check `event instanceof PointerEvent`, and pointer properties such as `pointerType` were missing even though the `pointerdown` and `pointerup` of the same gesture reported them. TypeScript types all three events as `PointerEvent`, so reading `pointerType` in a listener type-checked and then returned `undefined`.

`click`, `tap`, `rightClick`, and `select` now carry the `pointerId` and `pointerType` they simulate through to the event that ends the gesture, including the click a label forwards to its control. The attributes describing the contact itself, such as `pressure` and `tiltX`, stay at their default values there, the way browsers reset them, so a pen press reporting `tiltX: 30` still ends in a `click` reporting `tiltX: 0`.

```ts
q.link("Ariakit").addEventListener("auxclick", (event) => {
  event.pointerType; // "pen"
});

await click(q.link("Ariakit"), { button: 1, pointerType: "pen" });
```

`press.Enter` and `press.Space` fire the same `PointerEvent`, but report no pointer behind it, with `pointerId: -1` and an empty `pointerType`. That is what every engine reports for a click no pointer caused.

`button` and `buttons` keep their mouse-event semantics on these three events, as Pointer Events requires, so assertions on them are unaffected.

### Other updates

- Fixed `@ariakit/test` clipboard event dispatch so caller-supplied `clipboardData` is preserved by named dispatchers and caller-built events in environments without native clipboard event support.
- Fixed named mouse and pointer events in `@ariakit/test` to derive `pageX` and `pageY` from the client coordinates and target window scroll, and derive `which` from `button`, matching browser-generated events even when the environment provides no `MouseEvent` base.
- Fixed mouse events in the test environment to expose `getModifierState` for `Alt`, `Control`, `Meta`, and `Shift`, plus the `x` and `y` aliases of `clientX` and `clientY`, so a listener reading modifier state no longer throws a `TypeError` on an event passed to `dispatch(element, event)` or on the `auxclick` that `rightClick` and `click` with a non-primary `button` fire.
- Fixed `dispatch` to expose only event names it can build, preventing the unsupported `doubleClick` alias from being typed or installed at runtime.
- Fixed click-family gesture helpers to reset `isPrimary` on their terminal events, fixed `click` to carry modifiers, coordinates, and `detail` to the click a label forwards to its control, and fixed `press.Enter` to carry `modifier*` values such as `modifierCapsLock` to a form's implicit submit-button click.
- Fixed keyboard events in the test environment so `getModifierState` matches the exact modifier names in UI Events and reports the `modifier*` members the event was built with, such as `AltGraph` and `CapsLock`, instead of reading `AltGraph` from `Alt` and matching a name like `shift` case-insensitively.
- Fixed `getModifierState` on keyboard and mouse events created by `dispatch`, and by the helpers built on it such as `press` and `click`, to report `false` for modifier names it doesn't recognize. `Object.prototype` member names such as `constructor`, `toString`, and `hasOwnProperty` used to report `true`.
- Fixed named pointer events in `@ariakit/test` to derive `tiltX` and `tiltY` from `altitudeAngle` and `azimuthAngle`, and vice versa, so listeners no longer receive contradictory orientations when callers provide only one pair.
- Fixed `dispatch.wheel` and the drag dispatchers such as `dispatch.dragStart` and `dispatch.drop` to apply the `MouseEventInit` and modifier init members that `WheelEvent` and `DragEvent` accept in browsers, where both derive from `MouseEvent`, so a listener reading `ctrlKey` or `clientX` no longer receives `undefined` and calling `getModifierState` no longer throws a `TypeError`.
- Fixed the `auxclick` that `rightClick` and `click` with a non-primary `button` fire to report the same modifier state as the rest of the gesture, so `modifier*` init members such as `modifierCapsLock` and `modifierAltGraph` now reach `getModifierState` on every mouse event the gesture produces.
- Updated dependencies: `@ariakit/utils@0.2.0`

## 0.7.4

- Updated dependencies: `@ariakit/utils@0.1.6`

## 0.7.3

- Fixed `contains` reporting `false` for descendants of a `<form>` or `<select>` element when tests run on happy-dom, which made elements nested in a form look like they were outside an open modal dialog.
- Fixed happy-dom exposing raw targets instead of the public `<form>` and `<select>` proxies during ancestor traversal, which broke identity checks in tests using `parentNode`, `parentElement`, `closest`, `compareDocumentPosition`, or bubbled event `currentTarget`.

## 0.7.2

- Updated dependencies: `@ariakit/utils@0.1.5`

## 0.7.1

- Added `rightClick` to simulate secondary mouse clicks in tests.
- Updated dependencies: `@ariakit/utils@0.1.4`

## 0.7.0

### Renamed the `includesHidden` query variant to `hidden`

**BREAKING** if you use the `includesHidden` role-query variant from `@ariakit/test`.

The role-query variant that also matches elements hidden from the accessibility tree (such as `inert` or `aria-hidden` elements) has been renamed from `includesHidden` to `hidden`.

Before:

```ts
q.dialog.includesHidden("Settings");
q.menuitemcheckbox.all.includesHidden();
```

After:

```ts
q.dialog.hidden("Settings");
q.menuitemcheckbox.all.hidden();
```

### Applied the browser shims for the whole test environment

**BREAKING** if you import helpers from individual subpaths such as `@ariakit/test/click`.

`@ariakit/test` now exposes only the `@ariakit/test`, `@ariakit/test/react`, and `@ariakit/test/playwright` entry points; the individual helper subpaths have been removed. Import the helpers from the root `@ariakit/test` instead.

Before:

```ts
import { click } from "@ariakit/test/click";
```

After:

```ts
import { click } from "@ariakit/test";
```

`@ariakit/test` installs browser shims (most importantly a `getClientRects` visibility shim that jsdom lacks). They were only active while a simulated interaction ran, but component code reads layout and focusability between interactions too — for example a dialog's auto-focus picks the first tabbable element with `getFirstTabbableIn`, which depends on `getClientRects`. When such a read ran outside an interaction (e.g. when asserting with `expect.poll`), it hit jsdom's empty layout and misbehaved. The shims now apply for the whole test environment, and are applied automatically when importing `@ariakit/test` or `@ariakit/test/react`.

### Faster simulated interactions

The `click`, `type`, `press`, `hover`, and `select` helpers now settle between their internal sub-steps using microtasks and animation frames instead of a wall-clock delay, and the delay of the final settle after each interaction was shortened. The components under test schedule their per-step updates with microtasks and animation frames, so this speeds up test suites while preserving their behavior. Interactions that rely on a real timer (animations, tooltip/typeahead timeouts) are unaffected — pass an explicit delay to `sleep(ms)` when you need one.

### Improved happy-dom support

When simulating interactions in a happy-dom environment, `@ariakit/test` now polyfills several gaps so behavior matches jsdom and real browsers:

- `validationMessage` returns a non-empty message for elements failing built-in constraint validation (happy-dom leaves it empty).
- Disabled `<select>` and `<textarea>` controls are excluded from `FormData` (happy-dom incorrectly includes them).
- The `selectionchange` event that happy-dom fires synchronously inside `Selection.removeAllRanges()` is deferred to a task, as the spec requires.
- `window.alert` is stubbed as a no-op (happy-dom doesn't implement it).

### Batched `requestAnimationFrame` callbacks under happy-dom

`@ariakit/test` now runs happy-dom's `requestAnimationFrame` callbacks as a batched frame: all callbacks scheduled before a frame run together with a single shared timestamp, and a callback scheduled while the frame is running is deferred to the next frame. This matches the HTML specification, jsdom, and real browsers.

happy-dom otherwise runs each callback as its own task, so components that schedule work in the same frame could observe each other's mid-flight state — for example, an animated [`Dialog`](https://ariakit.com/reference/dialog) and its backdrop reading each other's computed styles while a leave animation is being set up. The batching keeps happy-dom's fast cadence, so test runs are not slowed down.

### Ran `click` listeners and activation on disabled controls under happy-dom

`@ariakit/test` now runs both the event listeners and the activation behavior for a `click` dispatched on a disabled `button` or `input` under happy-dom. This matches jsdom and real browsers, which only bar clicks queued from user interaction on a disabled control — not a scripted `dispatchEvent`.

A disabled `checkbox`/`radio` now toggles before its click listener runs (which still sees it disabled) and fires `input`/`change`, reverting — and restoring the rest of the radio group — when a listener calls `preventDefault()`. Disabled submit/reset controls run their listeners without submitting or resetting the form.

happy-dom otherwise drops such a click entirely, so a test couldn't observe a click reaching a control that became disabled mid-interaction, and a disabled checkbox wouldn't toggle.

### Added `press.down` and `press.up`

The `press` utility now provides `press.down` and `press.up` to fire only the keydown or keyup half of a key press, each with the same per-key shortcuts as `press` (`press.down.Space()`, `press.up.Enter()`, and so on). Both default to the currently focused element, so a key released after focus moved away — for example, an element that disables itself on keydown — lands where a real browser would deliver it.

```ts
// Press and release in two steps; the keyup lands wherever focus is at release
// time, not necessarily where the keydown happened.
await press.down.Space();
await press.up.Space();
```

### Hardened interaction settling under load

The settle that runs after each simulated interaction now drains pending React work before resolving. React 18 renders concurrently while interactions run, so under CPU contention it can split a render or commit across several scheduler tasks; a fixed delay could return between two of them and leave the DOM momentarily unsettled. Waiting for those slices to finish makes assertions after `click`, `press`, `type`, and the other helpers reliable under load.

### Populated `window.event` during simulated events under happy-dom

`@ariakit/test` now exposes the event currently being dispatched on the legacy `window.event` global for the synchronous duration of each simulated event under happy-dom, matching jsdom and real browsers.

React 18 reads `window.event` to give state updates triggered from native event listeners discrete-event priority. happy-dom doesn't implement the global, so without this those updates fell back to a lower priority and flushed later, reordering commits — for example, a controlled [`Dialog`](https://ariakit.com/reference/dialog) hidden by clicking outside could momentarily re-open and restore focus to the wrong element. Simulated interactions on React 18 now match the other environments; the divergence this fixes doesn't reproduce under React 19.

### Other updates

- Slightly reduced the default delay between simulated interactions in non-browser test environments, speeding up test suites.
- Added JSDoc descriptions and usage examples to the `@ariakit/test` public API, surfaced in editor hover hints and the package's API reference.
- Added `.lazy` to `@ariakit/test` queries so a query can be stored and re-run later by calling the returned function.
- Fixed `press.Enter` to respect disabled default submit buttons and activate enabled ones during implicit form submission.
- Fixed `@ariakit/test` event helpers to use empty-string defaults instead of `"undefined"` for omitted keyboard and input event string fields.
- Fixed `press.Enter()` and `type("\n")` to emit an Enter `keypress` with `charCode` `13` when typing into text fields.
- Fixed `mouseDown()` preserving or clearing the document selection based on the pressed target, matching browser behavior for native non-text controls and text targets.
- Fixed `click()` on native options to preserve default selectedness and anchor shift-click selection from the current selected option.
- Fixed `click`, `tap`, `mouseDown`, and `mouseUp` to suppress compatibility mouse events after a canceled `pointerdown`.
- Fixed `press` extending text selections past the anchor when pressing Shift+Home or Shift+End.
- Fixed `type` so readonly fields, prevented keydowns, non-text-field targets, and no-op deletion keys no longer cause `blur` or `focus` to dispatch a `change` event when the value did not change.
- Fixed nested test helpers to reuse browser polyfills and act-environment overrides instead of reapplying them.
- Updated dependencies: `@ariakit/utils@0.1.3`

## 0.6.1

- Improved text selection performance in `@ariakit/test`.
- Fixed runtime `process.env.NODE_ENV` checks in published package output, including test-only behavior and development warnings.
- Updated dependencies: `@ariakit/utils@0.1.2`

## 0.6.0

### Removed React 17 support from `@ariakit/test`

**BREAKING** if you're using `@ariakit/test` with React 17 or React Testing Library 12.

The `@ariakit/test` peer dependencies now support React 18 and 19, and React Testing Library 13 through 16.

Before:

```json
{
  "react": "17.x",
  "@testing-library/react": "12.x"
}
```

After:

```json
{
  "react": "18.x || 19.x",
  "@testing-library/react": "13.x || 14.x || 15.x || 16.x"
}
```

## 0.5.1

- Release artifacts now include npm trusted publishing provenance.
- Updated dependencies: `@ariakit/utils@0.1.1`

## 0.5.0

### Removed CommonJS builds

**BREAKING** if your code loads `@ariakit/test` with CommonJS `require()`.

`@ariakit/test` now publishes ESM-only exports.

Before:

```js
const test = require("@ariakit/test");
```

After:

```js
import * as test from "@ariakit/test";
```

### Other updates

- Updated dependencies: `@ariakit/utils@0.1.0`

## 0.4.15

- Changed the [`query`](https://ariakit.com/reference/query) helper to use `exact: true` by default for role and text queries in Playwright tests.
- Updated dependencies: `@ariakit/core@0.4.20`

## 0.4.14

- Updated dependencies: `@ariakit/core@0.4.19`

## 0.4.13

- Added `q.text()` query to `@ariakit/test/playwright`.
- Updated dependencies: `@ariakit/core@0.4.18`

## 0.4.12

- Updated packages to target ES2018 (previously ES2017).
- Updated dependencies: `@ariakit/core@0.4.17`

## 0.4.11

- Updated dependencies: `@ariakit/core@0.4.16`

## 0.4.10

- Updated dependencies: `@ariakit/core@0.4.15`

## 0.4.9

- Fixed a build issue that resulted in JavaScript files not being part of the released package.

## 0.4.8

- Fixed the package for running in an SSR environment.

## 0.4.7

- Updated dependencies: `@ariakit/core@0.4.14`

## 0.4.6

- Updated dependencies: `@ariakit/core@0.4.13`

## 0.4.5

- Updated dependencies: `@ariakit/core@0.4.12`

## 0.4.4

- Fixed CJS build on Next.js.
- Updated pointer events to initialize with a default `pointerType` value of `mouse`.
- Updated dependencies: `@ariakit/core@0.4.11`

## 0.4.3

- Updated dependencies: `@ariakit/core@0.4.10`

## 0.4.2

- Updated dependencies: `@ariakit/core@0.4.9`

## 0.4.1

- Added a README file to the package.
- Updated dependencies: `@ariakit/core@0.4.8`

## 0.4.0

- The `render` method now returns a promise of `{ unmount, rerender }` instead of just the `unmount` function.

## 0.3.16

- Added React 19 to peer dependencies.
- Updated dependencies: `@ariakit/core@0.4.7`

## 0.3.15

- Updated dependencies: `@ariakit/core@0.4.6`

## 0.3.14

- Added `within` function to queries.
- Updated dependencies: `@ariakit/core@0.4.5`

## 0.3.13

- Updated dependencies: `@ariakit/core@0.4.4`

## 0.3.12

- Updated dependencies: `@ariakit/core@0.4.3`

## 0.3.11

- Added `@ariakit/test/playwright` path with Playwright-specific query utilities.
- Updated dependencies: `@ariakit/core@0.4.2`

## 0.3.10

- Updated dependencies: `@ariakit/core@0.4.1`

## 0.3.9

- Queries no longer match `inert` elements.
- Updated dependencies: `@ariakit/core@0.4.0`

## 0.3.8

- Updated dependencies: `@ariakit/core@0.3.11`

## 0.3.7

- Added missing properties to dispatched events.
- Updated dependencies: `@ariakit/core@0.3.10`

## 0.3.6

### <kbd>Home</kbd> and <kbd>End</kbd> keys on text fields

Pressing the <kbd>Home</kbd> or <kbd>End</kbd> keys on text fields will now move the cursor (`selectionStart`/`selectionEnd` properties) to the start or finish of the text when using the `press` function.

### Other updates

- Updated dependencies: `@ariakit/core@0.3.9`

## 0.3.5

- Updated dependencies: `@ariakit/core@0.3.8`

## 0.3.4

- Updated dependencies: `@ariakit/core@0.3.7`

## 0.3.3

- Updated dependencies: `@ariakit/core@0.3.6`

## 0.3.2

- Updated dependencies: `@ariakit/core@0.3.5`

## 0.3.1

### Patch Changes

- [`#2935`](https://github.com/ariakit/ariakit/pull/2935) Fixed TypeScript declaration files in CommonJS projects using `NodeNext` for `moduleResolution`.

- [`#2948`](https://github.com/ariakit/ariakit/pull/2948) Added `"use client"` directive to all modules.

- Updated dependencies: `@ariakit/core@0.3.4`.

## 0.3.0

### Minor Changes

- [`#2894`](https://github.com/ariakit/ariakit/pull/2894) All `@ariakit/test` functions now disable `global.IS_REACT_ACT_ENVIRONMENT` before running and restore its value at the end.

- [`#2894`](https://github.com/ariakit/ariakit/pull/2894) Replaced the synchronous `fireEvent` functions by asynchronous `dispatch` functions.

- [`#2894`](https://github.com/ariakit/ariakit/pull/2894) The `act` export has been removed.

- [`#2894`](https://github.com/ariakit/ariakit/pull/2894) Exported user event functions that were previously synchronous are now asyncrhonous.

- [`#2899`](https://github.com/ariakit/ariakit/pull/2899) The `screen` module and its queries (`getBy*`, `queryBy*`, etc.) have been removed in favor of the `query` module.

- [`#2899`](https://github.com/ariakit/ariakit/pull/2899) The `within` module has been removed.

- [`#2900`](https://github.com/ariakit/ariakit/pull/2900) The `render` function has been moved to the `@ariakit/test/react` path. It's now asynchronous. The root `@ariakit/test` package does not depend on React or React Testing Library anymore.

### Patch Changes

- [`#2892`](https://github.com/ariakit/ariakit/pull/2892) Updated function argument types to support `null` instead of `Element`, but added a runtime error in case `null` is passed.

- [`#2892`](https://github.com/ariakit/ariakit/pull/2892) Added a new `query` module that exports a `query`/`q` object with functions to query the DOM.

- Updated dependencies: `@ariakit/core@0.3.3`.

## 0.2.5

### Patch Changes

- Updated dependencies: `@ariakit/core@0.3.2`.

## 0.2.4

### Patch Changes

- Updated dependencies: `@ariakit/core@0.3.1`.

## 0.2.3

### Patch Changes

- Updated dependencies: `@ariakit/core@0.3.0`.

## 0.2.2

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.9`.

## 0.2.1

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.8`.

## 0.2.0

### Minor Changes

- Replaced `mock-get-client-rects` module by `polyfills`. ([#2587](https://github.com/ariakit/ariakit/pull/2587))

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.7`.

## 0.1.14

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.6`.

## 0.1.13

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.5`.

## 0.1.12

### Patch Changes

- Added missing `types` field to proxy package.json files. ([#2489](https://github.com/ariakit/ariakit/pull/2489))

- Updated dependencies: `@ariakit/core@0.2.4`.

## 0.1.11

### Patch Changes

- Added `.cjs` and `.js` extensions to paths in proxy package.json files to support bundlers that can't automaically resolve them. ([#2487](https://github.com/ariakit/ariakit/pull/2487))

- Updated dependencies: `@ariakit/core@0.2.3`.

## 0.1.10

### Patch Changes

- Fixed several actions not considering hidden elements before dispatching events, which was causing a freeze in JSDOM. ([#2462](https://github.com/ariakit/ariakit/pull/2462))

## 0.1.9

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.2`.

## 0.1.8

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.1`.

## 0.1.7

### Patch Changes

- Updated dependencies: `@ariakit/core@0.2.0`.

## 0.1.6

### Patch Changes

- Fixed build target. ([#2355](https://github.com/ariakit/ariakit/pull/2355))

- Fixed `mock-get-client-rects` module marking elements not connected to the DOM as visible. ([#2339](https://github.com/ariakit/ariakit/pull/2339))

- Updated dependencies: `@ariakit/core@0.1.5`.

## 0.1.5

### Patch Changes

- Updated dependencies: `@ariakit/core@0.1.4`.

## 0.1.4

### Patch Changes

- Updated dependencies: `@ariakit/core@0.1.3`.

## 0.1.3

### Patch Changes

- Added support for elements becoming inaccessible between `mousedown` and `mouseup` events on the `click` function. ([#2300](https://github.com/ariakit/ariakit/pull/2300))

- Added support for composition text on `type`. ([#2308](https://github.com/ariakit/ariakit/pull/2308))

## 0.1.2

### Patch Changes

- Updated dependencies: `@ariakit/core@0.1.2`.

## 0.1.1

### Patch Changes

- Updated dependencies: `@ariakit/core@0.1.1`.

## 0.1.0

### Minor Changes

- Updated package names to include the `@ariakit` scope, providing a more distinct and specific namespace for our packages.

  Additionally, we've made a change to the versioning system, moving from `v2.0.0-beta.x` to `v0.x.x`. This alteration means that although the library is still in beta, we can release breaking changes in minor versions without disrupting projects that don't set exact versions in their `package.json`.

  ```diff
  - npm i ariakit
  + npm i @ariakit/react
  ```

### Patch Changes

- Packages are now ESM by default (commonjs modules are still available with the `.cjs` extension).

- Updated dependencies: `@ariakit/core@0.1.0`.
