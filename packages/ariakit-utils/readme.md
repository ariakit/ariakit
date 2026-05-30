# @ariakit/utils

**Important:** This package is an internal dependency of Ariakit and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions.

Shared framework-agnostic utilities used by Ariakit packages.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [API reference](#api-reference)

## Installation

```sh
npm i @ariakit/utils
```

## Usage

Import helpers from the package root:

```ts
import { invariant } from "@ariakit/utils";
```

This package is ESM-only and exposes a single public entrypoint.

<!-- ariakit-docs:start -->

## API reference

- [Array utilities](#array-utilities)
  - [`toArray`](#toarray)
  - [`addItemToArray`](#additemtoarray)
  - [`flatten2DArray`](#flatten2darray)
  - [`reverseArray`](#reversearray)
- [DOM utilities](#dom-utilities)
  - [`canUseDOM`](#canusedom)
  - [`getDocument`](#getdocument)
  - [`getWindow`](#getwindow)
  - [`getActiveElement`](#getactiveelement)
  - [`contains`](#contains)
  - [`isElement`](#iselement)
  - [`isNode`](#isnode)
  - [`isFrame`](#isframe)
  - [`isButton`](#isbutton)
  - [`isVisible`](#isvisible)
  - [`isTextField`](#istextfield)
  - [`isTextbox`](#istextbox)
  - [`getTextboxValue`](#gettextboxvalue)
  - [`getTextboxSelection`](#gettextboxselection)
  - [`getPopupRole`](#getpopuprole)
  - [`getPopupItemRole`](#getpopupitemrole)
  - [`scrollIntoViewIfNeeded`](#scrollintoviewifneeded)
  - [`getScrollingElement`](#getscrollingelement)
  - [`isPartiallyHidden`](#ispartiallyhidden)
  - [`setSelectionRange`](#setselectionrange)
  - [`sortBasedOnDOMPosition`](#sortbasedondomposition)
- [Event utilities](#event-utilities)
  - [`isPortalEvent`](#isportalevent)
  - [`isSelfTarget`](#isselftarget)
  - [`isOpeningInNewTab`](#isopeninginnewtab)
  - [`isDownloading`](#isdownloading)
  - [`fireEvent`](#fireevent)
  - [`fireBlurEvent`](#fireblurevent)
  - [`fireFocusEvent`](#firefocusevent)
  - [`fireKeyboardEvent`](#firekeyboardevent)
  - [`fireClickEvent`](#fireclickevent)
  - [`isFocusEventOutside`](#isfocuseventoutside)
  - [`getInputType`](#getinputtype)
  - [`queueBeforeEvent`](#queuebeforeevent)
  - [`addGlobalEventListener`](#addglobaleventlistener)
- [Focus utilities](#focus-utilities)
  - [`isFocusable`](#isfocusable)
  - [`isTabbable`](#istabbable)
  - [`getAllFocusableIn`](#getallfocusablein)
  - [`getAllFocusable`](#getallfocusable)
  - [`getFirstFocusableIn`](#getfirstfocusablein)
  - [`getFirstFocusable`](#getfirstfocusable)
  - [`getAllTabbableIn`](#getalltabbablein)
  - [`getAllTabbable`](#getalltabbable)
  - [`getFirstTabbableIn`](#getfirsttabbablein)
  - [`getFirstTabbable`](#getfirsttabbable)
  - [`getLastTabbableIn`](#getlasttabbablein)
  - [`getLastTabbable`](#getlasttabbable)
  - [`getNextTabbableIn`](#getnexttabbablein)
  - [`getNextTabbable`](#getnexttabbable)
  - [`getPreviousTabbableIn`](#getprevioustabbablein)
  - [`getPreviousTabbable`](#getprevioustabbable)
  - [`getClosestFocusable`](#getclosestfocusable)
  - [`hasFocus`](#hasfocus)
  - [`hasFocusWithin`](#hasfocuswithin)
  - [`focusIfNeeded`](#focusifneeded)
  - [`disableFocus`](#disablefocus)
  - [`disableFocusIn`](#disablefocusin)
  - [`restoreFocusIn`](#restorefocusin)
  - [`focusIntoView`](#focusintoview)
- [General utilities](#general-utilities)
  - [`noop`](#noop)
  - [`shallowEqual`](#shallowequal)
  - [`applyState`](#applystate)
  - [`isObject`](#isobject)
  - [`isEmpty`](#isempty)
  - [`isInteger`](#isinteger)
  - [`hasOwnProperty`](#hasownproperty)
  - [`chain`](#chain)
  - [`cx`](#cx)
  - [`normalizeString`](#normalizestring)
  - [`omit`](#omit)
  - [`pick`](#pick)
  - [`identity`](#identity)
  - [`beforePaint`](#beforepaint)
  - [`afterPaint`](#afterpaint)
  - [`invariant`](#invariant)
  - [`getKeys`](#getkeys)
  - [`isFalsyBooleanCallback`](#isfalsybooleancallback)
  - [`disabledFromProps`](#disabledfromprops)
  - [`disabledFromElement`](#disabledfromelement)
  - [`removeUndefinedValues`](#removeundefinedvalues)
  - [`defaultValue`](#defaultvalue)
- [Platform utilities](#platform-utilities)
  - [`isTouchDevice`](#istouchdevice)
  - [`isApple`](#isapple)
  - [`isSafari`](#issafari)
  - [`isFirefox`](#isfirefox)
  - [`isMac`](#ismac)
- [Type utilities](#type-utilities)
  - [`AnyObject`](#anyobject)
  - [`EmptyObject`](#emptyobject)
  - [`AnyFunction`](#anyfunction)
  - [`BivariantCallback`](#bivariantcallback)
  - [`SetStateAction`](#setstateaction)
  - [`SetState`](#setstate)
  - [`BooleanOrCallback`](#booleanorcallback)
  - [`StringWithValue`](#stringwithvalue)
  - [`ToPrimitive`](#toprimitive)
  - [`PickByValue`](#pickbyvalue)
  - [`PickRequired`](#pickrequired)
  - [`AriaHasPopup`](#ariahaspopup)
  - [`AriaRole`](#ariarole)
- [Undo utilities](#undo-utilities)
  - [`UndoManager`](#undomanager)
  - [`createUndoManager`](#createundomanager)

### Array utilities

Array helpers used by Ariakit packages.

#### `toArray`

```ts
function toArray<T>(arg: T): T extends readonly any[] ? T : T[];
```

Transforms `arg` into an array if it's not already.

Example:

```ts
toArray("a"); // ["a"]
toArray(["a"]); // ["a"]
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `addItemToArray`

```ts
function addItemToArray<T extends any[]>(
  array: T,
  item: T[number],
  index = -1,
): T;
```

Immutably adds an item to an array.

Returns: A new array with the item in the passed array index.

Example:

```ts
addItemToArray(["a", "b", "d"], "c", 2); // ["a", "b", "c", "d"]
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `flatten2DArray`

```ts
function flatten2DArray<T>(array: T[][]): T[];
```

Flattens a 2D array into a one-dimensional array.

Returns: A one-dimensional array.

Example:

```ts
flatten2DArray([["a"], ["b"], ["c"]]); // ["a", "b", "c"]
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `reverseArray`

```ts
function reverseArray<T>(array: T[]): T[];
```

Immutably reverses an array.

Returns: Reversed array.

Example:

```ts
reverseArray(["a", "b", "c"]); // ["c", "b", "a"]
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### DOM utilities

DOM helpers for browser, iframe, text input, popup, and scrolling behavior.

#### `canUseDOM`

```ts
const canUseDOM: boolean;
```

It's `true` if it is running in a browser environment or `false` if it is not (SSR).

Example:

```ts
const title = canUseDOM ? document.title : "";
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getDocument`

```ts
function getDocument(node?: Window | Document | Node | null): Document;
```

Returns `element.ownerDocument || document`.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getWindow`

```ts
function getWindow(node?: Window | Document | Node | null): Window;
```

Returns `element.ownerDocument.defaultView || window`.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getActiveElement`

```ts
function getActiveElement(
  node?: Node | null,
  activeDescendant = false,
): HTMLElement | null;
```

Returns `element.ownerDocument.activeElement`.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `contains`

```ts
function contains(parent: Node, child: Node): boolean;
```

Similar to `Element.prototype.contains`, but a little bit faster when `element` is the same as `child`.

Example:

```ts
contains(document.getElementById("parent"), document.getElementById("child"));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isElement`

```ts
function isElement(target: EventTarget | null | undefined): target is Element;
```

Checks whether the given event target is an element.

`event.target` and `event.relatedTarget` are `EventTarget`s, which aren't necessarily elements — for example `window` or an `XMLHttpRequest` when an event is dispatched programmatically. Calling `Element`-only methods such as `hasAttribute` on those throws, so guard with this before treating them as elements. When you only need a `Node` — for example to call `contains` — use `isNode` instead.

It tests `nodeType` rather than `instanceof Element` so that elements coming from same-origin child frames (which `addGlobalEventListener` also listens on) aren't wrongly rejected for belonging to a different realm.

Example:

```ts
if (isElement(event.target)) {
  event.target.hasAttribute("data-active");
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isNode`

```ts
function isNode(target: EventTarget | null | undefined): target is Node;
```

Checks whether the given event target is a node.

Like `isElement`, but only requires the target to be a `Node` rather than an element — useful before calling `contains`, which accepts any node. It still rejects non-node `EventTarget`s (such as `window` or an `XMLHttpRequest`) that would make `contains` throw.

Example:

```ts
if (isNode(event.target)) {
  contains(element, event.target);
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isFrame`

```ts
function isFrame(element: Element): element is HTMLIFrameElement;
```

Checks whether `element` is a frame element.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isButton`

```ts
function isButton(element: { tagName: string; type?: string }): boolean;
```

Checks whether `element` is a native HTML button element.

Example:

```ts
isButton(document.querySelector("button")); // true
isButton(document.querySelector("input[type='button']")); // true
isButton(document.querySelector("div")); // false
isButton(document.querySelector("input[type='text']")); // false
isButton(document.querySelector("div[role='button']")); // false
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isVisible`

```ts
function isVisible(element: Element): boolean;
```

Checks if the element is visible or not.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isTextField`

```ts
function isTextField(
  element: Element,
): element is HTMLInputElement | HTMLTextAreaElement;
```

Check whether the given element is a text field, where text field is defined by the ability to select within the input.

Example:

```ts
isTextField(document.querySelector("div")); // false
isTextField(document.querySelector("input")); // true
isTextField(document.querySelector("input[type='button']")); // false
isTextField(document.querySelector("textarea")); // true
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isTextbox`

```ts
function isTextbox(element: HTMLElement): boolean;
```

Check whether the given element is a text field or a content editable element.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getTextboxValue`

```ts
function getTextboxValue(element: HTMLElement): string;
```

Returns the value of the text field or content editable element as a string.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getTextboxSelection`

```ts
function getTextboxSelection(element: HTMLElement): {
  start: number;
  end: number;
};
```

Returns the start and end offsets of the selection in the element.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getPopupRole`

```ts
function getPopupRole(
  element?: Element | null,
  fallback?: AriaHasPopup,
): AriaHasPopup;
```

Returns the popup role from the element's role attribute, if it has one.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getPopupItemRole`

```ts
function getPopupItemRole(
  element?: Element | null,
  fallback?: AriaRole,
): string | undefined;
```

Returns the item role attribute based on the popup's role.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `scrollIntoViewIfNeeded`

```ts
function scrollIntoViewIfNeeded(
  element: Element,
  arg?: boolean | ScrollIntoViewOptions,
): void;
```

Calls `element.scrollIntoView()` if the element is hidden or partly hidden in the viewport.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getScrollingElement`

```ts
function getScrollingElement(
  element?: Element | null,
): HTMLElement | Element | null;
```

Returns the scrolling container element of a given element.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isPartiallyHidden`

```ts
function isPartiallyHidden(element: Element): boolean;
```

Determines whether an element is hidden or partially hidden in the viewport.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `setSelectionRange`

```ts
function setSelectionRange(
  element: HTMLInputElement | HTMLTextAreaElement,
  ...args: Parameters<typeof HTMLInputElement.prototype.setSelectionRange>
): void;
```

SelectionRange only works on a few types of input. Calling `setSelectionRange` on an unsupported input type may throw an error on certain browsers. To avoid it, we check if its type supports SelectionRange first. It will be a noop to non-supported types until we find a workaround.

See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `sortBasedOnDOMPosition`

```ts
function sortBasedOnDOMPosition<T>(
  items: T[],
  getElement: (item: T) => Element | null | undefined,
): T[];
```

Sort the items based on their DOM position.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### Event utilities

Event helpers for dispatching and interpreting browser events.

#### `isPortalEvent`

```ts
function isPortalEvent(event: Pick<Event, "currentTarget" | "target">): boolean;
```

Returns `true` if `event` has been fired within a React Portal element.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isSelfTarget`

```ts
function isSelfTarget(event: Pick<Event, "target" | "currentTarget">): boolean;
```

Returns `true` if `event.target` and `event.currentTarget` are the same.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isOpeningInNewTab`

```ts
function isOpeningInNewTab(
  event: Pick<MouseEvent, "currentTarget" | "metaKey" | "ctrlKey">,
): boolean;
```

Checks whether the user event is triggering a page navigation in a new tab.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isDownloading`

```ts
function isDownloading(
  event: Pick<MouseEvent, "altKey" | "currentTarget">,
): boolean;
```

Checks whether the user event is triggering a download.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `fireEvent`

```ts
function fireEvent(
  element: Element,
  type: string,
  eventInit?: EventInit,
): boolean;
```

Creates and dispatches an event.

Example:

```ts
fireEvent(document.getElementById("id"), "blur", {
  bubbles: true,
  cancelable: true,
});
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `fireBlurEvent`

```ts
function fireBlurEvent(element: Element, eventInit?: FocusEventInit): boolean;
```

Creates and dispatches a blur event.

Example:

```ts
fireBlurEvent(document.getElementById("id"));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `fireFocusEvent`

```ts
function fireFocusEvent(element: Element, eventInit?: FocusEventInit): boolean;
```

Creates and dispatches a focus event.

Example:

```ts
fireFocusEvent(document.getElementById("id"));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `fireKeyboardEvent`

```ts
function fireKeyboardEvent(
  element: Element,
  type: string,
  eventInit?: KeyboardEventInit,
): boolean;
```

Creates and dispatches a keyboard event.

Example:

```ts
fireKeyboardEvent(document.getElementById("id"), "keydown", {
  key: "ArrowDown",
  shiftKey: true,
});
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `fireClickEvent`

```ts
function fireClickEvent(
  element: Element,
  eventInit?: PointerEventInit,
): boolean;
```

Creates and dispatches a click event.

Example:

```ts
fireClickEvent(document.getElementById("id"));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isFocusEventOutside`

```ts
function isFocusEventOutside(
  event: Pick<FocusEvent, "currentTarget" | "relatedTarget">,
  container?: Element | null,
): boolean;
```

Checks whether the focus/blur event is happening from/to outside of the container element.

Example:

```ts
const element = document.getElementById("id");
element.addEventListener("blur", (event) => {
  if (isFocusEventOutside(event)) {
    // ...
  }
});
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getInputType`

```ts
function getInputType(
  event: Event | { nativeEvent: Event },
): string | undefined;
```

Returns the `inputType` property of the event, if available.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `queueBeforeEvent`

```ts
function queueBeforeEvent(
  element: Element,
  type: string,
  callback: () => void,
  timeout?: number,
): () => void;
```

Runs a callback on the next animation frame, but before a certain event.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `addGlobalEventListener`

```ts
function addGlobalEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (event: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
  scope?: Window,
): () => void;
function addGlobalEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
  scope?: Window,
): () => void;
```

Adds a global event listener, including on child frames.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### Focus utilities

Focus management helpers for focusable and tabbable elements.

#### `isFocusable`

```ts
function isFocusable(element: Element): boolean;
```

Checks whether `element` is focusable or not.

Example:

```ts
isFocusable(document.querySelector("input")); // true
isFocusable(document.querySelector("input[tabindex='-1']")); // true
isFocusable(document.querySelector("input[hidden]")); // false
isFocusable(document.querySelector("input:disabled")); // false
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isTabbable`

```ts
function isTabbable(
  element: Element | HTMLElement | HTMLInputElement,
): element is HTMLElement;
```

Checks whether `element` is tabbable or not.

Example:

```ts
isTabbable(document.querySelector("input")); // true
isTabbable(document.querySelector("input[tabindex='-1']")); // false
isTabbable(document.querySelector("input[hidden]")); // false
isTabbable(document.querySelector("input:disabled")); // false
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getAllFocusableIn`

```ts
function getAllFocusableIn(
  container: HTMLElement,
  includeContainer?: boolean,
): HTMLElement[];
```

Returns all the focusable elements in `container`.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getAllFocusable`

```ts
function getAllFocusable(includeBody?: boolean): HTMLElement[];
```

Returns all the focusable elements in the document.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getFirstFocusableIn`

```ts
function getFirstFocusableIn(
  container: HTMLElement,
  includeContainer?: boolean,
): HTMLElement | null;
```

Returns the first focusable element in `container`.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getFirstFocusable`

```ts
function getFirstFocusable(includeBody?: boolean): HTMLElement | null;
```

Returns the first focusable element in the document.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getAllTabbableIn`

```ts
function getAllTabbableIn(
  container: HTMLElement,
  includeContainer?: boolean,
  fallbackToFocusable?: boolean,
): HTMLElement[];
```

Returns all the tabbable elements in `container`, including the container itself.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getAllTabbable`

```ts
function getAllTabbable(fallbackToFocusable?: boolean): HTMLElement[];
```

Returns all the tabbable elements in the document.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getFirstTabbableIn`

```ts
function getFirstTabbableIn(
  container: HTMLElement,
  includeContainer?: boolean,
  fallbackToFocusable?: boolean,
): HTMLElement | null;
```

Returns the first tabbable element in `container`, including the container itself if it's tabbable.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getFirstTabbable`

```ts
function getFirstTabbable(fallbackToFocusable?: boolean): HTMLElement | null;
```

Returns the first tabbable element in the document.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getLastTabbableIn`

```ts
function getLastTabbableIn(
  container: HTMLElement,
  includeContainer?: boolean,
  fallbackToFocusable?: boolean,
): HTMLElement | null;
```

Returns the last tabbable element in `container`, including the container itself if it's tabbable.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getLastTabbable`

```ts
function getLastTabbable(fallbackToFocusable?: boolean): HTMLElement | null;
```

Returns the last tabbable element in the document.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getNextTabbableIn`

```ts
function getNextTabbableIn(
  container: HTMLElement,
  includeContainer?: boolean,
  fallbackToFirst?: boolean,
  fallbackToFocusable?: boolean,
): HTMLElement | null;
```

Returns the next tabbable element in `container`.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getNextTabbable`

```ts
function getNextTabbable(
  fallbackToFirst?: boolean,
  fallbackToFocusable?: boolean,
): HTMLElement | null;
```

Returns the next tabbable element in the document.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getPreviousTabbableIn`

```ts
function getPreviousTabbableIn(
  container: HTMLElement,
  includeContainer?: boolean,
  fallbackToLast?: boolean,
  fallbackToFocusable?: boolean,
): HTMLElement | null;
```

Returns the previous tabbable element in `container`.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getPreviousTabbable`

```ts
function getPreviousTabbable(
  fallbackToFirst?: boolean,
  fallbackToFocusable?: boolean,
): HTMLElement | null;
```

Returns the previous tabbable element in the document.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getClosestFocusable`

```ts
function getClosestFocusable(element?: HTMLElement | null): HTMLElement | null;
```

Returns the closest focusable element.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `hasFocus`

```ts
function hasFocus(element: Element): boolean;
```

Checks if `element` has focus. Elements that are referenced by `aria-activedescendant` are also considered.

Example:

```ts
hasFocus(document.getElementById("id"));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `hasFocusWithin`

```ts
function hasFocusWithin(element: Node | Element): boolean;
```

Checks if `element` has focus within. Elements that are referenced by `aria-activedescendant` are also considered.

Example:

```ts
hasFocusWithin(document.getElementById("id"));
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `focusIfNeeded`

```ts
function focusIfNeeded(element: HTMLElement): void;
```

Focus on an element only if it's not already focused.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `disableFocus`

```ts
function disableFocus(element: HTMLElement): void;
```

Disable focus on `element`.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `disableFocusIn`

```ts
function disableFocusIn(
  container: HTMLElement,
  includeContainer?: boolean,
): void;
```

Makes elements inside container not tabbable.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `restoreFocusIn`

```ts
function restoreFocusIn(container: HTMLElement): void;
```

Restores tabbable elements inside container that were affected by disableFocusIn.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `focusIntoView`

```ts
function focusIntoView(
  element: HTMLElement,
  options?: ScrollIntoViewOptions,
): void;
```

Focus on element and scroll into view.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### General utilities

General-purpose helpers for state, objects, strings, scheduling, and assertions.

#### `noop`

```ts
function noop(..._: any[]): any;
```

Empty function.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `shallowEqual`

```ts
function shallowEqual(a?: AnyObject, b?: AnyObject): boolean;
```

Compares two objects.

Example:

```ts
shallowEqual({ a: "a" }, {}); // false
shallowEqual({ a: "a" }, { b: "b" }); // false
shallowEqual({ a: "a" }, { a: "a" }); // true
shallowEqual({ a: "a" }, { a: "a", b: "b" }); // false
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `applyState`

```ts
function applyState<T>(
  argument: SetStateAction<T>,
  currentValue: T | (() => T),
): T;
```

Receives a `setState` argument and calls it with `currentValue` if it's a function. Otherwise return the argument as the new value.

Example:

```ts
applyState((value) => value + 1, 1); // 2
applyState(2, 1); // 2
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isObject`

```ts
function isObject(arg: any): arg is Record<any, unknown>;
```

Checks whether `arg` is an object or not.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isEmpty`

```ts
function isEmpty(arg: any): boolean;
```

Checks whether `arg` is empty or not.

Example:

```ts
isEmpty([]); // true
isEmpty(["a"]); // false
isEmpty({}); // true
isEmpty({ a: "a" }); // false
isEmpty(); // true
isEmpty(null); // true
isEmpty(undefined); // true
isEmpty(""); // true
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isInteger`

```ts
function isInteger(arg: any): boolean;
```

Checks whether `arg` is an integer or not.

Example:

```ts
isInteger(1); // true
isInteger(1.5); // false
isInteger("1"); // true
isInteger("1.5"); // false
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `hasOwnProperty`

```ts
function hasOwnProperty<T extends AnyObject>(
  object: T,
  prop: keyof any,
): prop is keyof T;
```

Checks whether `prop` is an own property of `obj` or not.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `chain`

```ts
function chain<T>(
  ...fns: T[]
): (...args: T extends AnyFunction ? Parameters<T> : never) => void;
```

Receives functions as arguments and returns a new function that calls all.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `cx`

```ts
function cx(
  ...args: Array<string | null | false | 0 | undefined>
): string | undefined;
```

Returns a string with the truthy values of `args` separated by space.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `normalizeString`

```ts
function normalizeString(str: string): string;
```

Removes diacritics from a string.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `omit`

```ts
function omit<T extends AnyObject, K extends keyof T>(
  object: T,
  keys: ReadonlyArray<K> | K[],
): Omit<T, K>;
```

Omits specific keys from an object.

Example:

```ts
omit({ a: "a", b: "b" }, ["a"]); // { b: "b" }
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `pick`

```ts
function pick<T extends AnyObject, K extends keyof T>(
  object: T,
  paths: ReadonlyArray<K> | K[],
): Pick<T, K>;
```

Picks specific keys from an object.

Example:

```ts
pick({ a: "a", b: "b" }, ["a"]); // { a: "a" }
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `identity`

```ts
function identity<T>(value: T): T;
```

Returns the same argument.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `beforePaint`

```ts
function beforePaint(cb: () => void = noop): () => void;
```

Runs right before the next paint.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `afterPaint`

```ts
function afterPaint(cb: () => void = noop): () => void;
```

Runs after the next paint.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `invariant`

```ts
function invariant(
  condition: any,
  message?: string | boolean,
): asserts condition;
```

Asserts that a condition is true, otherwise throws an error.

Example:

```ts
invariant(
  condition,
  process.env.NODE_ENV !== "production" && "Invariant failed",
);
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getKeys`

```ts
function getKeys<T extends object>(obj: T): (keyof T)[];
```

Similar to `Object.keys` but returns a type-safe array of keys.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isFalsyBooleanCallback`

```ts
function isFalsyBooleanCallback<T extends unknown[]>(
  booleanOrCallback?: boolean | ((...args: T) => boolean),
  ...args: T
): boolean;
```

Checks whether a boolean event prop (e.g., hideOnInteractOutside) was intentionally set to false, either with a boolean value or a callback that returns false.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `disabledFromProps`

```ts
function disabledFromProps(props: {
  disabled?: boolean;
  "aria-disabled"?: boolean | "true" | "false";
}): boolean;
```

Checks whether something is disabled or not based on its props.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `disabledFromElement`

```ts
function disabledFromElement(element: Element): boolean;
```

Checks whether something is disabled or not based on its DOM attributes.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `removeUndefinedValues`

```ts
function removeUndefinedValues<T extends AnyObject>(obj: T): T;
```

Removes undefined values from an object.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `defaultValue`

```ts
type DefaultValue<T extends readonly any[], Other = never> = T extends [
  infer Head,
  ...infer Rest,
]
  ? Rest extends []
    ? T[number] | Other
    : undefined extends Head
      ? DefaultValue<Rest, Exclude<Other | Head, undefined>>
      : Exclude<T[number], undefined>
  : never;

function defaultValue<T extends readonly any[]>(...values: T): DefaultValue<T>;
```

Returns the first value that is not `undefined`.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### Platform utilities

Browser and platform detection helpers.

#### `isTouchDevice`

```ts
function isTouchDevice(): boolean;
```

Detects if the device has touch capabilities.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isApple`

```ts
function isApple(): boolean;
```

Detects Apple device.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isSafari`

```ts
function isSafari(): boolean;
```

Detects Safari browser.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isFirefox`

```ts
function isFirefox(): boolean;
```

Detects Firefox browser.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isMac`

```ts
function isMac(): boolean;
```

Detects Mac computer.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### Type utilities

Shared type utilities used across Ariakit packages.

#### `AnyObject`

```ts
type AnyObject = Record<string, any>;
```

Any object.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `EmptyObject`

```ts
type EmptyObject = Record<keyof any, never>;
```

Empty object.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `AnyFunction`

```ts
type AnyFunction = (...args: any) => any;
```

Any function.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `BivariantCallback`

```ts
type BivariantCallback<T extends AnyFunction> = {
  bivarianceHack(...args: Parameters<T>): ReturnType<T>;
}["bivarianceHack"];
```

Workaround for variance issues.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `SetStateAction`

```ts
type SetStateAction<T> = T | BivariantCallback<(prevState: T) => T>;
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `SetState`

```ts
type SetState<T> = BivariantCallback<(value: SetStateAction<T>) => void>;
```

The type of the `setState` function in `[state, setState] = useState()`.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `BooleanOrCallback`

```ts
type BooleanOrCallback<T> = boolean | BivariantCallback<(arg: T) => boolean>;
```

A boolean value or a callback that returns a boolean value.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `StringWithValue`

```ts
type StringWithValue<T extends string> = T | (string & Record<never, never>);
```

A string that will provide autocomplete for specific strings.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `ToPrimitive`

```ts
type ToPrimitive<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends AnyFunction
        ? (...args: Parameters<T>) => ReturnType<T>
        : T;
```

Transforms a type into a primitive type.

Example:

```ts
// string
ToPrimitive<"a">;
// number
ToPrimitive<1>;
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `PickByValue`

```ts
type PickByValue<T, Value> = {
  [K in keyof T as [Value] extends [T[K]]
    ? T[K] extends Value | undefined
      ? K
      : never
    : never]: T[K];
};
```

Picks only the properties from a type that have a specific value.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `PickRequired`

```ts
type PickRequired<T, P extends keyof T> = T &
  {
    [K in keyof T]: Pick<Required<T>, K>;
  }[P];
```

Picks only the required properties from a type.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `AriaHasPopup`

```ts
type AriaHasPopup =
  | boolean
  | "false"
  | "true"
  | "menu"
  | "listbox"
  | "tree"
  | "grid"
  | "dialog"
  | undefined;
```

Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `AriaRole`

```ts
type AriaRole =
  | "alert"
  | "alertdialog"
  | "application"
  | "article"
  | "banner"
  | "button"
  | "cell"
  | "checkbox"
  | "columnheader"
  | "combobox"
  | "complementary"
  | "contentinfo"
  | "definition"
  // ... 53 more lines
  | "tree"
  | "treegrid"
  | "treeitem"
  | (string & {});
```

All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### Undo utilities

Undo and redo manager utilities.

#### `UndoManager`

```ts
type Callback = void | (() => Callback | Promise<Callback>);

const UndoManager: {
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  execute: (callback: Callback, group?: string) => Promise<void>;
};
```

Shared undo manager instance.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `createUndoManager`

```ts
type Callback = void | (() => Callback | Promise<Callback>);

interface CreateUndoManagerOptions {
  limit?: number;
}

function createUndoManager({ limit = 100 }: CreateUndoManagerOptions = {}): {
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  execute: (callback: Callback, group?: string) => Promise<void>;
};
```

Creates an undo manager with undo and redo stacks.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

<!-- ariakit-docs:end -->
