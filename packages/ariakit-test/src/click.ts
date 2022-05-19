import "./mock-get-client-rects";

import { closest } from "ariakit-utils/dom";
import { isFocusable } from "ariakit-utils/focus";
import { fireEvent } from "./fire-event";
import { focus } from "./focus";
import { hover } from "./hover";
import { mouseDown } from "./mouse-down";
import { mouseUp } from "./mouse-up";
import { sleep } from "./sleep";

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

function clickLabel(element: HTMLLabelElement, options?: MouseEventInit) {
  const input = getInputFromLabel(element);
  const isInputDisabled = Boolean(input?.disabled);

  if (input) {
    // JSDOM will automatically "click" input right after we "click" the label.
    // Since we need to "focus" it first, we temporarily disable it so it won't
    // get automatically clicked.
    input.disabled = true;
  }

  const defaultAllowed = fireEvent.click(element, options);

  if (input) {
    // Now we can revert input disabled state and fire events on it in the
    // right order.
    input.disabled = isInputDisabled;
    if (defaultAllowed && isFocusable(input)) {
      focus(input);
      // Only "click" is fired! Browsers don't go over the whole event stack in
      // this case (mousedown, mouseup etc.).
      fireEvent.click(input);
    }
  }
}

function setSelected(element: HTMLOptionElement, selected: boolean) {
  element.setAttribute("selected", selected ? "selected" : "");
  element.selected = selected;
}

function clickOption(
  element: HTMLOptionElement,
  eventOptions?: MouseEventInit
) {
  // https://stackoverflow.com/a/16530782/5513909
  const select = closest(element, "select") as HTMLSelectElement & {
    lastOptionSelectedNotByShiftKey?: HTMLOptionElement;
  };

  if (!select) {
    fireEvent.click(element, eventOptions);
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

  fireEvent.input(select);
  fireEvent.change(select);
  fireEvent.click(element, eventOptions);
}

export async function click(
  element: Element,
  options?: MouseEventInit,
  tap = false
) {
  await hover(element, options);
  mouseDown(element, options);

  if (!tap) {
    await sleep();
  }

  mouseUp(element, options);

  const label = getClosestLabel(element);

  if (label) {
    clickLabel(label, { detail: 1, ...options });
  } else if (element instanceof HTMLOptionElement) {
    clickOption(element, { detail: 1, ...options });
  } else {
    fireEvent.click(element, { detail: 1, ...options });
  }

  await sleep();
}
