import { contains } from "@ariakit/utils";
import type { RefObject } from "react";
import type { Cleanups } from "./tree-cleanup.ts";
import { isElementMarked, isElementMarkedBy } from "./tree-cleanup.ts";

type DialogRef = RefObject<Element | null>;

interface OpenDialogOptions {
  // The current walk can change without registering the dialog again.
  getOutsideCleanups?: () => Cleanups | undefined;
  // The portal node can change without registering the dialog again.
  getPortalNode?: () => Element | null;
  // The wrapper element can change without registering the dialog again.
  getWrapperElement?: () => Element | null | undefined;
  // The backdrop element can change without registering the dialog again.
  getBackdropElement?: () => Element | null;
  // The hidden dismiss button can change without registering the dialog again.
  getHiddenDismissElement?: () => Element | null;
  onEarlierDialogElementChange?: () => void;
}

// The open dialogs, in the order that they opened. Each one is a ref, so a
// dialog keeps its place when its element changes while it's open.
const openDialogs = new Map<DialogRef, OpenDialogOptions>();

/**
 * Adds the dialog after the dialogs that are already open. A dialog that is
 * already there keeps its place. With `onEarlierDialogElementChange`, the
 * dialog learns when the element, the backdrop, or the hidden dismiss button of
 * a dialog that opened before it changes.
 */
export function addOpenDialog(
  dialogRef: DialogRef,
  options: OpenDialogOptions = {},
) {
  openDialogs.set(dialogRef, options);
}

export function removeOpenDialog(dialogRef: DialogRef) {
  openDialogs.delete(dialogRef);
}

/**
 * Returns the elements of the dialogs that opened before the given dialog,
 * their portal nodes, their wrapper elements, their backdrops, and their hidden
 * dismiss buttons, except the ones that contain it.
 */
export function getEarlierOpenDialogElements(dialogRef: DialogRef) {
  const elements: Element[] = [];
  const dialog = dialogRef.current;
  for (const [openDialogRef, options] of openDialogs) {
    if (openDialogRef === dialogRef) break;
    // The tree walk reaches a dialog in a portal through its portal node, and a
    // dialog in a wrapper element through that wrapper, so the dialog element
    // alone doesn't make the walk find it. The backdrop and the hidden dismiss
    // button render next to the dialog element or its wrapper, so the walk
    // doesn't find them through those elements.
    const openDialogElements = [
      options.getPortalNode?.(),
      options.getWrapperElement?.(),
      options.getBackdropElement?.(),
      options.getHiddenDismissElement?.(),
      openDialogRef.current,
    ];
    for (const element of openDialogElements) {
      if (!element?.isConnected) continue;
      if (dialog && contains(element, dialog)) continue;
      elements.push(element);
    }
  }
  return elements;
}

/**
 * Tells the dialogs that opened after the given dialog that its element, its
 * backdrop, or its hidden dismiss button changed.
 */
export function notifyOpenDialogElementChange(dialogRef: DialogRef) {
  let foundDialog = false;
  for (const [openDialogRef, options] of openDialogs) {
    if (openDialogRef === dialogRef) {
      foundDialog = true;
      continue;
    }
    if (!foundDialog) continue;
    options.onEarlierDialogElementChange?.();
  }
}

/**
 * Returns whether something is above the given dialog, which is the case when
 * the dialog is marked.
 *
 * The exception is two dialogs that mark each other, because a dialog also
 * marks a dialog that's in the DOM while hidden and opens later. In that case,
 * the dialog that opened last is above the other one.
 * https://github.com/ariakit/ariakit/issues/7647
 */
export function hasDialogAbove(dialogRef: DialogRef) {
  const dialog = dialogRef.current;
  if (!dialog) return false;
  if (!isElementMarked(dialog)) return false;
  const cleanups = openDialogs.get(dialogRef)?.getOutsideCleanups?.();
  let openedAfterDialog = false;
  let isAboveEarlierDialog = false;
  for (const [openDialogRef, options] of openDialogs) {
    if (openDialogRef === dialogRef) {
      openedAfterDialog = true;
      continue;
    }
    const openDialog = openDialogRef.current;
    if (!openDialog) continue;
    if (!isElementMarkedBy(dialog, options.getOutsideCleanups?.())) continue;
    if (openedAfterDialog) return true;
    // A dialog that opened before is above too, unless the dialogs mark each
    // other.
    if (!isElementMarkedBy(openDialog, cleanups)) return true;
    isAboveEarlierDialog = true;
  }
  // The remaining marks count unless they come from the dialogs below the given
  // one. A mark can also come from outside the open dialogs, such as from
  // another copy of this module.
  return !(openedAfterDialog && isAboveEarlierDialog);
}
