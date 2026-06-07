import { expect, test } from "vitest";
import { isBrowser, wrapAsync } from "./__utils.ts";
import { click } from "./click.ts";
import { dispatch } from "./dispatch.ts";
import "./shims.ts";

test("applies the browser shims at import, for the whole environment", () => {
  if (isBrowser) return;
  const connected = document.createElement("button");
  document.body.append(connected);
  const disconnected = document.createElement("button");
  try {
    // The getClientRects shim reports a 1x1 rect for connected, visible
    // elements even outside a simulated interaction (`wrapAsync`)...
    expect(connected.getClientRects()[0]).toMatchObject({
      width: 1,
      height: 1,
    });
    // ...and an empty list for elements that aren't visible.
    expect(disconnected.getClientRects()).toHaveLength(0);
  } finally {
    connected.remove();
  }
});

test("keeps the browser shims applied after an interaction settles", async () => {
  if (isBrowser) return;
  const element = document.createElement("button");
  document.body.append(element);
  try {
    await wrapAsync(async () => {});
    // The shims are no longer torn down between interactions, so they're still
    // in place once `wrapAsync` returns.
    expect(element.getClientRects()[0]).toMatchObject({ width: 1, height: 1 });
  } finally {
    element.remove();
  }
});

test("runs animation frame callbacks as a spec-compliant batch", async () => {
  if (isBrowser) return;
  const order: string[] = [];
  const timestamps: number[] = [];
  await new Promise<void>((resolve) => {
    requestAnimationFrame((timestamp) => {
      order.push("a");
      timestamps.push(timestamp);
      // Requested while the frame is running, so it must be deferred to the
      // next frame — after "b", not interleaved before it.
      requestAnimationFrame(() => {
        order.push("c");
        resolve();
      });
    });
    requestAnimationFrame((timestamp) => {
      order.push("b");
      timestamps.push(timestamp);
    });
  });
  // "c" is requested during the frame, so it runs after "b" (deferred to the
  // next frame), which the order asserts. The property unique to batching — and
  // the real point of this test — is that the same-frame callbacks "a" and "b"
  // share one timestamp; unbatched, each would get its own.
  expect(order).toEqual(["a", "b", "c"]);
  expect(timestamps[0]).toBe(timestamps[1]);
});

test("exposes the dispatched event on window.event while listeners run", async () => {
  if (isBrowser) return;
  const button = document.createElement("button");
  document.body.append(button);
  let eventTypeDuringDispatch: string | undefined;
  button.addEventListener("click", () => {
    eventTypeDuringDispatch = (window as { event?: Event }).event?.type;
  });
  try {
    // React 18 reads `window.event` to give updates dispatched from a native
    // listener discrete-event (sync) priority. happy-dom omits the global, so
    // `@ariakit/test`'s dispatch sets it for the synchronous duration of the
    // dispatch to match jsdom and real browsers.
    await dispatch.click(button);
    expect(eventTypeDuringDispatch).toBe("click");
    // It's exposed only while listeners run, then removed (happy-dom has no
    // such property to begin with, so the shim deletes it again).
    expect("event" in window).toBe(false);
  } finally {
    button.remove();
  }
});

test("restores window.event around a nested dispatch", async () => {
  if (isBrowser) return;
  const outer = document.createElement("button");
  const inner = document.createElement("button");
  document.body.append(outer, inner);
  const seen: Array<string | undefined> = [];
  outer.addEventListener("click", () => {
    seen.push((window as { event?: Event }).event?.type);
    // A nested dispatch fires its event synchronously, so `window.event` is the
    // inner event while the inner listener runs, then restored to the outer one.
    void dispatch.mouseDown(inner);
    seen.push((window as { event?: Event }).event?.type);
  });
  inner.addEventListener("mousedown", () => {
    seen.push((window as { event?: Event }).event?.type);
  });
  try {
    await dispatch.click(outer);
    expect(seen).toEqual(["click", "mousedown", "click"]);
    // Removed again once the outermost dispatch finishes.
    expect("event" in window).toBe(false);
  } finally {
    outer.remove();
    inner.remove();
  }
});

test("cancels a not-yet-run animation frame callback within the same frame", async () => {
  if (isBrowser) return;
  const ran: string[] = [];
  await new Promise<void>((resolve) => {
    let handleB = 0;
    requestAnimationFrame(() => {
      ran.push("a");
      cancelAnimationFrame(handleB);
      // Resolve on the next frame, by which point a wrongly-surviving "b" would
      // already have run in this frame and been recorded.
      requestAnimationFrame(() => resolve());
    });
    handleB = requestAnimationFrame(() => {
      ran.push("b");
    });
  });
  // "a" cancels "b" before "b" runs, so "b" must be skipped even though both
  // were requested for the same frame.
  expect(ran).toEqual(["a"]);
});

test("runs the listener for a click dispatched on a disabled button", async () => {
  if (isBrowser) return;
  // happy-dom drops a scripted click on a disabled <button>/<input> entirely.
  // jsdom and real browsers (verified on Chromium, Firefox, and WebKit) still run
  // the listeners — only clicks queued from a real user interaction are barred. A
  // plain button has no activation behavior, so the click just reaches the
  // listener (the case PR #6271 needed for a disabled `Command`). `dispatch`
  // normalizes that (see dispatch.ts).
  const button = document.createElement("button");
  button.disabled = true;
  let buttonClicks = 0;
  let disabledDuringClick: boolean | undefined;
  button.addEventListener("click", () => {
    buttonClicks++;
    disabledDuringClick = button.disabled;
  });
  document.body.append(button);
  try {
    const defaultAllowed = await dispatch.click(button);
    expect(buttonClicks).toBe(1);
    // The button stays disabled throughout, and nothing cancels the click, so the
    // default action is allowed — as in a browser.
    expect(disabledDuringClick).toBe(true);
    expect(defaultAllowed).toBe(true);
  } finally {
    button.remove();
  }
});

test("toggles a disabled checkbox in either direction for a scripted click", async () => {
  if (isBrowser) return;
  // jsdom and real browsers (verified on Chromium, Firefox, and WebKit) run the
  // activation behavior for a scripted click on a disabled checkbox: it toggles
  // before the click listener runs (which still sees it disabled) and fires
  // input/change, only barring clicks queued from a real user interaction.
  // happy-dom drops the click entirely; `dispatch` normalizes that (see
  // dispatch.ts). Covers both toggle directions.
  for (const initiallyChecked of [false, true]) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.disabled = true;
    checkbox.checked = initiallyChecked;
    let checkedDuringClick: boolean | undefined;
    let disabledDuringClick: boolean | undefined;
    let inputEvents = 0;
    let changeEvents = 0;
    let eventTypeDuringInput: string | undefined;
    let eventTypeDuringChange: string | undefined;
    const currentEventType = () => (window as { event?: Event }).event?.type;
    checkbox.addEventListener("input", () => {
      inputEvents++;
      eventTypeDuringInput = currentEventType();
    });
    checkbox.addEventListener("change", () => {
      changeEvents++;
      eventTypeDuringChange = currentEventType();
    });
    checkbox.addEventListener("click", () => {
      checkedDuringClick = checkbox.checked;
      disabledDuringClick = checkbox.disabled;
    });
    document.body.append(checkbox);
    try {
      const defaultAllowed = await dispatch.click(checkbox);
      expect(defaultAllowed).toBe(true);
      // Toggled before the listener runs, while still disabled.
      expect(checkedDuringClick).toBe(!initiallyChecked);
      expect(disabledDuringClick).toBe(true);
      expect(checkbox.checked).toBe(!initiallyChecked);
      expect(inputEvents).toBe(1);
      expect(changeEvents).toBe(1);
      // Each activation event exposes itself on window.event while its listener
      // runs, like jsdom/browsers — not the outer click event.
      expect(eventTypeDuringInput).toBe("input");
      expect(eventTypeDuringChange).toBe("change");
    } finally {
      checkbox.remove();
    }
  }
});

test("reverts a disabled checkbox toggle in either direction when a click listener prevents it", async () => {
  if (isBrowser) return;
  // The checkbox is toggled before the click listener runs, so the listener sees
  // the flipped value; preventDefault() then cancels the activation, restoring
  // the previous checked state and firing no input/change — matching jsdom and
  // real browsers. Covers both toggle directions.
  for (const initiallyChecked of [false, true]) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.disabled = true;
    checkbox.checked = initiallyChecked;
    let checkedDuringClick: boolean | undefined;
    let inputEvents = 0;
    let changeEvents = 0;
    checkbox.addEventListener("input", () => inputEvents++);
    checkbox.addEventListener("change", () => changeEvents++);
    checkbox.addEventListener("click", (event) => {
      checkedDuringClick = checkbox.checked;
      event.preventDefault();
    });
    document.body.append(checkbox);
    try {
      const defaultAllowed = await dispatch.click(checkbox);
      expect(defaultAllowed).toBe(false);
      // Toggled to the flipped value while the listener runs...
      expect(checkedDuringClick).toBe(!initiallyChecked);
      // ...then restored to the original value once prevented.
      expect(checkbox.checked).toBe(initiallyChecked);
      expect(inputEvents).toBe(0);
      expect(changeEvents).toBe(0);
    } finally {
      checkbox.remove();
    }
  }
});

test("selects a disabled radio on click and fires events only when it changes", async () => {
  if (isBrowser) return;
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.disabled = true;
  let radioClicks = 0;
  let checkedDuringClick: boolean | undefined;
  let inputEvents = 0;
  let changeEvents = 0;
  radio.addEventListener("input", () => inputEvents++);
  radio.addEventListener("change", () => changeEvents++);
  radio.addEventListener("click", () => {
    radioClicks++;
    checkedDuringClick = radio.checked;
  });
  document.body.append(radio);
  try {
    const defaultAllowed = await dispatch.click(radio);
    expect(defaultAllowed).toBe(true);
    expect(radioClicks).toBe(1);
    expect(radio.checked).toBe(true);
    // The radio is selected before the click listener runs, like a browser.
    expect(checkedDuringClick).toBe(true);
    expect(inputEvents).toBe(1);
    expect(changeEvents).toBe(1);
    // Clicking an already-selected radio still runs the listener (which sees it
    // selected) but leaves its value unchanged, so it fires no further
    // input/change events — matching jsdom and real browsers.
    checkedDuringClick = undefined;
    await dispatch.click(radio);
    expect(radioClicks).toBe(2);
    expect(checkedDuringClick).toBe(true);
    expect(radio.checked).toBe(true);
    expect(inputEvents).toBe(1);
    expect(changeEvents).toBe(1);
  } finally {
    radio.remove();
  }
});

test("restores a disabled radio group when a click listener prevents the selection", async () => {
  if (isBrowser) return;
  // Selecting a radio unchecks its previously-selected peer before the click
  // listener runs; preventDefault() must restore the whole group, not just the
  // clicked radio's own previous state. Verified on Chromium, Firefox, and
  // WebKit.
  const form = document.createElement("form");
  const selected = document.createElement("input");
  const clicked = document.createElement("input");
  selected.type = clicked.type = "radio";
  selected.name = clicked.name = "choice";
  selected.disabled = clicked.disabled = true;
  selected.checked = true;
  form.append(selected, clicked);
  document.body.append(form);
  let selectedChange = 0;
  let clickedChange = 0;
  let clickedInput = 0;
  let selectedDuringClick: boolean | undefined;
  let clickedDuringClick: boolean | undefined;
  selected.addEventListener("change", () => selectedChange++);
  clicked.addEventListener("change", () => clickedChange++);
  clicked.addEventListener("input", () => clickedInput++);
  clicked.addEventListener("click", (event) => {
    // The clicked radio is selected and its peer unchecked before the listener.
    selectedDuringClick = selected.checked;
    clickedDuringClick = clicked.checked;
    event.preventDefault();
  });
  try {
    const defaultAllowed = await dispatch.click(clicked);
    expect(defaultAllowed).toBe(false);
    expect(selectedDuringClick).toBe(false);
    expect(clickedDuringClick).toBe(true);
    // preventDefault restores the original group selection.
    expect(selected.checked).toBe(true);
    expect(clicked.checked).toBe(false);
    expect(selectedChange).toBe(0);
    expect(clickedChange).toBe(0);
    expect(clickedInput).toBe(0);
  } finally {
    form.remove();
  }
});

test("restores a disabled radio group linked by the form attribute when prevented", async () => {
  if (isBrowser) return;
  // Radios linked to a form by the `form` attribute (instead of nesting) are
  // still grouped by happy-dom's `checked` setter at the root node — a scope that
  // differs from the radio's resolved `form`. The snapshot must cover that scope
  // so preventDefault restores the previously-selected peer rather than leaving
  // the whole group unchecked.
  const form = document.createElement("form");
  form.id = "radio-group-form";
  const selected = document.createElement("input");
  const clicked = document.createElement("input");
  selected.type = clicked.type = "radio";
  selected.name = clicked.name = "choice";
  selected.setAttribute("form", form.id);
  clicked.setAttribute("form", form.id);
  selected.disabled = clicked.disabled = true;
  selected.checked = true;
  // Appended as siblings of the form, not descendants — associated only via the
  // form attribute, so happy-dom groups them at the document root.
  document.body.append(form, selected, clicked);
  clicked.addEventListener("click", (event) => event.preventDefault());
  try {
    await dispatch.click(clicked);
    expect(selected.checked).toBe(true);
    expect(clicked.checked).toBe(false);
  } finally {
    form.remove();
    selected.remove();
    clicked.remove();
  }
});

test("reverts only the activation's changes, preserving listener changes to other radios", async () => {
  if (isBrowser) return;
  // A prevented click reverts only what the activation changed (the clicked radio
  // and the peer it unchecked), not state a listener changes during the click. A
  // same-name radio in another scope (a separate group) is flipped by the
  // listener here and must keep the listener's value after preventDefault.
  const form = document.createElement("form");
  const selected = document.createElement("input");
  const clicked = document.createElement("input");
  selected.type = clicked.type = "radio";
  selected.name = clicked.name = "pick";
  selected.disabled = clicked.disabled = true;
  const outside = document.createElement("input");
  outside.type = "radio";
  outside.name = "pick";
  form.append(selected, clicked);
  document.body.append(form, outside);
  // Select the out-of-form radio first (its root-wide scope would otherwise clear
  // the in-form one), then the in-form radio, leaving both selected.
  outside.checked = true;
  selected.checked = true;
  clicked.addEventListener("click", (event) => {
    // A listener change to a radio outside the clicked radio's group.
    outside.checked = false;
    event.preventDefault();
  });
  try {
    await dispatch.click(clicked);
    // The clicked radio's own group is reverted...
    expect(selected.checked).toBe(true);
    expect(clicked.checked).toBe(false);
    // ...but the listener's change to the out-of-scope radio is preserved.
    expect(outside.checked).toBe(false);
  } finally {
    form.remove();
    outside.remove();
  }
});

test("doesn't submit or reset a form from a click on a disabled submit/reset control", async () => {
  if (isBrowser) return;
  // Real browsers run the click listeners for a scripted click on a disabled
  // submit/reset control but skip its form-activation behavior — the form is
  // neither submitted nor reset. happy-dom drops the click for both <button> and
  // <input> through separate per-class dispatchEvent overrides, so cover both.
  // Verified on Chromium, Firefox, and WebKit.
  const form = document.createElement("form");
  const controls = (["submit", "reset"] as const).flatMap((type) =>
    ["button", "input"].map((tag) => {
      const control = document.createElement(tag) as
        | HTMLButtonElement
        | HTMLInputElement;
      control.type = type;
      control.disabled = true;
      return control;
    }),
  );
  form.append(...controls);
  document.body.append(form);

  let controlClicks = 0;
  let submitEvents = 0;
  let resetEvents = 0;
  for (const control of controls) {
    control.addEventListener("click", () => controlClicks++);
  }
  form.addEventListener("submit", (event) => {
    submitEvents++;
    event.preventDefault();
  });
  form.addEventListener("reset", () => resetEvents++);
  try {
    for (const control of controls) {
      await dispatch.click(control);
    }
    // The clicks reach the disabled controls, so their listeners run...
    expect(controlClicks).toBe(controls.length);
    // ...but none of them activates the form.
    expect(submitEvents).toBe(0);
    expect(resetEvents).toBe(0);
  } finally {
    form.remove();
  }
});

test("click(label) fires the associated control's click only once", async () => {
  if (isBrowser) return;
  // `click` suppresses happy-dom's automatic label-to-control click by
  // temporarily disabling the control, relying on happy-dom dropping that
  // forwarded click. The disabled-click normalization is scoped to events
  // @ariakit/test dispatches, so it must not undo that drop and double-fire the
  // control on `click(label)`.
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  label.append(checkbox, document.createTextNode("Accept"));
  document.body.append(label);
  let clicks = 0;
  checkbox.addEventListener("click", () => clicks++);
  try {
    await click(label);
    expect(clicks).toBe(1);
  } finally {
    label.remove();
  }
});
