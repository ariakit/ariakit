// PopoverDismiss, MenuDismiss and friends all render DialogDismiss, and a
// nested popup renders inline and stays rendered while closed, so its dismiss
// sits in this dialog's subtree even though it closes a different popup.
// https://github.com/ariakit/ariakit/issues/7321
export function hasOwnDismiss(dialog: Element) {
  const dismisses = dialog.querySelectorAll("[data-dialog-dismiss]");
  for (const dismiss of dismisses) {
    if (dismiss.closest("[data-dialog]") === dialog) return true;
  }
  return false;
}
