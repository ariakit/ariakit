import { contains } from "@ariakit/utils";
import type { RefObject } from "react";
import type { Cleanups } from "./tree-cleanup.ts";
import { isElementMarked, isElementMarkedBy } from "./tree-cleanup.ts";

type DialogRef = RefObject<Element | null>;

interface OpenDialogOptions {
  // The current walk can change without registering the dialog again.
  getOutsideCleanups?: () => Cleanups | undefined;
  onEarlierDialogElementChange?: () => void;
}

// The open dialogs, in the order that they opened. Each one is a ref, so a
// dialog keeps its place when its element changes while it's open.
const openDialogs = new Map<DialogRef, OpenDialogOptions>();

/**
 * Adds the dialog after the dialogs that are already open. The returned
 * function removes it. With `onEarlierDialogElementChange`, the dialog learns
 * when the element of a dialog that opened before it changes.
 */
export function addOpenDialog(
  dialogRef: DialogRef,
  options: OpenDialogOptions = {},
) {
  openDialogs.set(dialogRef, options);
  return () => {
    openDialogs.delete(dialogRef);
  };
}

/**
 * Returns the elements of the dialogs that opened before the given dialog,
 * except the ones that contain it.
 */
export function getEarlierOpenDialogElements(dialogRef: DialogRef) {
  const elements: Element[] = [];
  for (const openDialogRef of openDialogs.keys()) {
    if (openDialogRef === dialogRef) break;
    const { current: element } = openDialogRef;
    if (!element?.isConnected) continue;
    if (dialogRef.current && contains(element, dialogRef.current)) continue;
    elements.push(element);
  }
  return elements;
}

/**
 * Tells the dialogs that opened after the given dialog that its element
 * changed.
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
