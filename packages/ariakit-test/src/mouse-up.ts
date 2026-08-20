import { getDocument, invariant } from "@ariakit/utils";
import {
  getPointerOptions,
  getReleaseOptions,
  isChordedRelease,
} from "./__mouse.ts";
import {
  getPreventMouseEvents,
  setPreventMouseEvents,
  wrapAsync,
} from "./__utils.ts";
import { dispatch } from "./dispatch.ts";
import { isVisible } from "./shims.ts";

/**
 * Releases a pointer button on an element, firing `pointerup` and `mouseup`.
 * Disabled elements still receive the pointer event but not `mouseup`.
 *
 * This is the counterpart to `mouseDown` and one step of a full `click`. Pass
 * `options` to set event properties such as modifier keys, or `button` to
 * release another mouse button. The events report no button still held down in
 * `buttons`, like a browser does, unless you pass `buttons` yourself to describe
 * the buttons a chorded gesture keeps held. When that value shows another button
 * stays held down, the release fires `pointermove` instead of `pointerup`, the
 * way Pointer Events routes a chorded release, and the compatibility `mouseup`
 * still fires. The pointer event reports `pressure: 0`, or `0.5` while a chorded
 * gesture keeps a button held.
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
    const releaseOptions = getPointerOptions(getReleaseOptions(options));
    const chorded = isChordedRelease(releaseOptions);

    if (chorded) {
      await dispatch.pointerMove(element, releaseOptions);
    } else {
      await dispatch.pointerUp(element, releaseOptions);
    }

    const document = getDocument(element);
    const preventMouseEvents = getPreventMouseEvents(document);

    // A chorded release ends one button, not the gesture, so the suppression a
    // canceled `pointerdown` started stays until the release that ends it.
    if (!chorded) {
      setPreventMouseEvents(document, false);
    }

    // Disabled controls and canceled pointerdown suppress compatibility
    // mouseup.
    if (disabled) return;

    if (preventMouseEvents) return;

    await dispatch.mouseUp(element, { detail: 1, ...releaseOptions });
  });
}
