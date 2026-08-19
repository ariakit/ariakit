import { getDocument, isVisible, invariant } from "@ariakit/utils";
import { getReleaseOptions } from "./__mouse.ts";
import {
  getPreventMouseEvents,
  setPreventMouseEvents,
  wrapAsync,
} from "./__utils.ts";
import { dispatch } from "./dispatch.ts";

/**
 * Releases a pointer button on an element, firing `pointerup` and `mouseup`.
 * Disabled elements still receive `pointerup` but not `mouseup`.
 *
 * This is the counterpart to `mouseDown` and one step of a full `click`. Pass
 * `options` to set event properties such as modifier keys, or `button` to
 * release another mouse button. The events report no button still held down in
 * `buttons`, like a browser does, unless you pass `buttons` yourself to describe
 * the buttons a chorded gesture keeps held. When another button stays held, a
 * browser fires `pointermove` instead of `pointerup`. This helper fires
 * `pointerup` in both cases.
 * @example
 * ```ts
 * await mouseDown(q.button("Resize"));
 * await mouseUp(q.button("Resize"));
 * ```
 */
export function mouseUp(element: Element | null, options?: PointerEventInit) {
  return wrapAsync(async () => {
    invariant(element, "Unable to mouseUp on null element");

    if (!isVisible(element)) return;

    const { disabled } = element as HTMLButtonElement;
    const releaseOptions = getReleaseOptions(options);

    await dispatch.pointerUp(element, releaseOptions);

    const document = getDocument(element);
    const preventMouseEvents = getPreventMouseEvents(document);
    setPreventMouseEvents(document, false);

    // Disabled controls and canceled pointerdown suppress compatibility
    // mouseup.
    if (disabled) return;

    if (preventMouseEvents) return;

    await dispatch.mouseUp(element, { detail: 1, ...releaseOptions });
  });
}
