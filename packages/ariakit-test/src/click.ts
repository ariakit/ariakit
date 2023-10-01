import "./polyfills.js";

import { closest, isVisible } from "@ariakit/core/utils/dom";
import { isFocusable } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import { wrapAsync } from "./__utils.js";
import { dispatch } from "./dispatch.js";
import { focus } from "./focus.js";
import { hover } from "./hover.js";
import { mouseDown } from "./mouse-down.js";
import { mouseUp } from "./mouse-up.js";
import { sleep } from "./sleep.js";

function getClosestLabel(element: Element) {
  if (!isFocusable(element)) {
    return closest(element, "label");
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

async function clickLabel(element: HTMLLabelElement, options?: MouseEventInit) {
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
    // Now we can revert input disabled state and fire events on it in the
    // right order.
    input.disabled = isInputDisabled;
    if (defaultAllowed && isFocusable(input)) {
      await focus(input);
      // Only "click" is fired! Browsers don't go over the whole event stack in
      // this case (mousedown, mouseup etc.).
      await dispatch.click(input);
    }
  }
}

function setSelected(element: HTMLOptionElement, selected: boolean) {
  element.setAttribute("selected", selected ? "selected" : "");
  element.selected = selected;
}

async function clickOption(
  element: HTMLOptionElement,
  eventOptions?: MouseEventInit,
) {
  // https://stackoverflow.com/a/16530782/5513909
  const select = closest(element, "select") as HTMLSelectElement & {
    lastOptionSelectedNotByShiftKey?: HTMLOptionElement;
  };

  if (!select) {
    await dispatch.click(element, eventOptions);
    return;
  }

  if (select.multiple) {
    const options = Array.from(select.options);
    const resetOptions = () =>
      options.forEach((option) => {
        setSelected(option, false);
      });
    const selectRange = (a: number, b: number) => {
      const from = Math.min(a, b);
      const to = Math.max(a, b) + 1;
      const selectedOptions = options.slice(from, to);
      selectedOptions.forEach((option) => {
        setSelected(option, true);
      });
    };

    if (eventOptions?.shiftKey) {
      const elementIndex = options.indexOf(element);
      const referenceOption = select.lastOptionSelectedNotByShiftKey;
      const referenceOptionIndex = referenceOption
        ? options.indexOf(referenceOption)
        : -1;

      resetOptions();
      // Select options between the reference option and the clicked element
      selectRange(elementIndex, referenceOptionIndex);

      setSelected(element, true);
    } else {
      // Keep track of this option as this will be used later when shift key
      // is used.
      select.lastOptionSelectedNotByShiftKey = element;

      if (eventOptions?.ctrlKey) {
        // Clicking with ctrlKey will select/deselect the option
        setSelected(element, !element.selected);
      } else {
        // Simply clicking an option will select only that option
        resetOptions();
        setSelected(element, true);
      }
    }
  } else {
    setSelected(element, true);
  }

  await dispatch.input(select);
  await dispatch.change(select);
  await dispatch.click(element, eventOptions);
}

export function click(
  element: Element | null,
  options?: MouseEventInit,
  tap = false,
) {
  return wrapAsync(async () => {
    invariant(element, "Unable to click on null element");
    if (!isVisible(element)) return;

    await hover(element, options);
    await mouseDown(element, options);

    // The element may be hidden after hover/mouseDown, so we need to check again
    // and find the first visible parent.
    while (!isVisible(element)) {
      if (!element.parentElement) return;
      element = element.parentElement;
    }

    if (!tap) {
      await sleep();
    }

    await mouseUp(element, options);

    // click is not called on disabled elements
    const { disabled } = element as HTMLButtonElement;
    if (disabled) return;

    const label = getClosestLabel(element);

    if (label) {
      await clickLabel(label, { detail: 1, ...options });
    } else if (element instanceof HTMLOptionElement) {
      await clickOption(element, { detail: 1, ...options });
    } else {
      await dispatch.click(element, { detail: 1, ...options });
    }

    await sleep();
  });
}
