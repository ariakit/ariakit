import { isVisible, isFocusable, invariant } from "@ariakit/utils";
import {
  getClickOptions,
  getContextMenuOptions,
  getHoverOptions,
  getMouseButton,
  omitButtons,
} from "./__mouse.ts";
import { isHappyDOM, settle, wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";
import { focus } from "./focus.ts";
import { hover } from "./hover.ts";
import { mouseDown } from "./mouse-down.ts";
import { mouseUp } from "./mouse-up.ts";
import { sleep } from "./sleep.ts";

function getClosestLabel(element: Element) {
  if (!isFocusable(element)) {
    return element.closest("label");
  }
  return null;
}

function getInputFromLabel(element: HTMLLabelElement) {
  const input = element.htmlFor
    ? element.ownerDocument?.getElementById(element.htmlFor)
    : element.querySelector("input,textarea,select");

  return input as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
    | null
    | undefined;
}

async function clickLabel(
  element: HTMLLabelElement,
  options?: PointerEventInit,
) {
  const input = getInputFromLabel(element);
  const isInputDisabled = Boolean(input?.disabled);

  if (input) {
    // JSDOM will automatically "click" input right after we "click" the label.
    // Since we need to "focus" it first, we temporarily disable it so it won't
    // get automatically clicked.
    input.disabled = true;
  }

  const defaultAllowed = await dispatch.click(element, options);

  if (input) {
    input.disabled = isInputDisabled;
    if (defaultAllowed && isFocusable(input)) {
      await focus(input);
      // Only "click" is fired! Browsers don't go over the whole event stack in
      // this case (mousedown, mouseup etc.). The forwarded click carries the
      // terminal event init from the gesture that activated the label.
      await dispatch.click(input, options);
    }
  }
}

function setSelected(element: HTMLOptionElement, selected: boolean) {
  // User interaction changes selectedness, not default selectedness.
  element.selected = selected;
}

// WHY: happy-dom caches `select.selectedOptions` from the internal
// `querySelectorAll("option")` result and does not invalidate it when only
// `option.selected` changes. Real browsers and jsdom expose a live collection.
// The former `selected` attribute write cleared this cache as a side effect;
// now selection changes only update IDL selectedness, so clear happy-dom's
// query cache explicitly before dispatching events.
function clearHappyDOMSelectCache(element: HTMLSelectElement) {
  if (!isHappyDOM()) return;
  let prototype: object | null = element;
  while (prototype) {
    const clearCacheSymbol = Object.getOwnPropertySymbols(prototype).find(
      (symbol) => symbol.description === "clearCache",
    );
    if (clearCacheSymbol) {
      const clearCache: unknown = Reflect.get(element, clearCacheSymbol);
      if (typeof clearCache === "function") {
        clearCache.call(element);
      }
      return;
    }
    prototype = Object.getPrototypeOf(prototype);
  }
}

async function clickOption(
  element: HTMLOptionElement,
  eventOptions?: PointerEventInit,
) {
  // https://stackoverflow.com/a/16530782/5513909
  const select = element.closest("select") as HTMLSelectElement & {
    lastOptionSelectedNotByShiftKey?: HTMLOptionElement;
  };

  if (!select) {
    await dispatch.click(element, eventOptions);
    return;
  }

  if (select.multiple) {
    const options = Array.from(select.options);
    const resetOptions = () => {
      for (const option of options) {
        setSelected(option, false);
      }
    };
    const selectRange = (a: number, b: number) => {
      const from = Math.min(a, b);
      const to = Math.max(a, b) + 1;
      const selectedOptions = options.slice(from, to);
      for (const option of selectedOptions) {
        setSelected(option, true);
      }
    };

    // Shift extends from the last unshifted option; Ctrl toggles one option,
    // while an unmodified click replaces the selection.
    if (eventOptions?.shiftKey) {
      const elementIndex = options.indexOf(element);
      const referenceOption =
        select.lastOptionSelectedNotByShiftKey ??
        options.find((option) => option.selected);
      const referenceOptionIndex = referenceOption
        ? options.indexOf(referenceOption)
        : -1;

      resetOptions();
      selectRange(
        elementIndex,
        referenceOptionIndex === -1 ? elementIndex : referenceOptionIndex,
      );

      setSelected(element, true);
    } else {
      select.lastOptionSelectedNotByShiftKey = element;

      if (eventOptions?.ctrlKey) {
        setSelected(element, !element.selected);
      } else {
        resetOptions();
        setSelected(element, true);
      }
    }
  } else {
    setSelected(element, true);
  }

  clearHappyDOMSelectCache(select);
  await dispatch.input(select);
  await dispatch.change(select);
  await dispatch.click(element, eventOptions);
}

/**
 * Clicks on an element, simulating the sequence of events a real mouse click
 * produces — hovering the target, then `pointerdown`, `mousedown`, `focus`,
 * `pointerup`, `mouseup`, and `click`.
 *
 * Hidden and disabled elements are handled the same way a browser would, and
 * clicks on labels, `option` elements, and form controls behave like native
 * interactions. Pass `options` to set event properties such as modifier keys
 * (e.g. `{ shiftKey: true }`).
 *
 * Pass `button` to click with another mouse button. Activation behavior runs on
 * `click`, so a non-primary button fires `auxclick` instead and doesn't activate
 * labels or `option` elements, and the secondary button also fires `contextmenu`
 * while it's held down. Each step derives `buttons` from that button, so an
 * explicit `buttons` is ignored here; `mouseDown` and `mouseUp` accept one to
 * describe a chorded gesture.
 * @example
 * ```ts
 * await click(q.button("Submit"));
 * // With a modifier key held down:
 * await click(q.option("Item"), { shiftKey: true });
 * // With the middle mouse button, firing `auxclick`:
 * await click(q.link("Ariakit"), { button: 1 });
 * ```
 */
export function click(
  element: Element | null,
  options?: PointerEventInit,
  tap = false,
) {
  return wrapAsync(async () => {
    invariant(element, "Unable to click on null element");
    if (!isVisible(element)) return;

    const button = getMouseButton(options);
    const stepOptions = omitButtons(options);

    await hover(element, getHoverOptions(stepOptions));
    await mouseDown(element, stepOptions);

    // The element may be hidden after hover/mouseDown, so we need to check again
    // and find the first visible parent.
    while (!isVisible(element)) {
      if (!element.parentElement) return;
      element = element.parentElement;
    }

    // The secondary button opens the context menu while it's still held down.
    if (button === 2) {
      await dispatch.contextMenu(element, getContextMenuOptions(stepOptions));
    }

    if (!tap) {
      // Press-and-release dwell between mouseDown and mouseUp: let work scheduled
      // on pointer/mouse down flush (microtask/rAF) before releasing, without a
      // wall-clock delay. The final settle below keeps the real timer.
      await settle();
    }

    await mouseUp(element, stepOptions);

    const { disabled } = element as HTMLButtonElement;
    const clickOptions = getClickOptions(stepOptions);

    if (button !== 0) {
      // Non-primary buttons fire `auxclick` instead of `click`, and never run
      // activation behavior, so labels and options aren't forwarded. Chromium
      // and WebKit still fire it on disabled controls, so it isn't suppressed
      // here (Firefox doesn't fire it).
      await dispatch.auxClick(element, clickOptions);
    } else if (disabled) {
      // Disabled controls suppress the final user-generated click.
      return;
    } else {
      const label = getClosestLabel(element);

      if (label) {
        await clickLabel(label, clickOptions);
      } else if (element instanceof HTMLOptionElement) {
        await clickOption(element, clickOptions);
      } else {
        await dispatch.click(element, clickOptions);
      }
    }

    await sleep();
  });
}
