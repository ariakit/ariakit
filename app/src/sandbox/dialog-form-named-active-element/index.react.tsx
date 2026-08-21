import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";

// A saved-views form on the page carries a name that collides with the member
// `getActiveElement` reads, so the document answers `activeElement` with the
// form instead of the focused control. `Dialog` remembers the element that
// opened it through that read, so focus has nowhere correct to return to.
export default function Example() {
  const dialog = Ariakit.useDialogStore();
  const [focusedElement, setFocusedElement] = useState("None");

  return (
    <main>
      <h1>Reports</h1>

      <form name="activeElement" aria-label="Saved views">
        <label>
          View name
          <input name="view" defaultValue="Last quarter" />
        </label>
      </form>

      {/* The named form makes `document.activeElement` answer with itself, so
          Playwright's `toBeFocused` can never pass on this page: it compares
          `getRootNode().activeElement` against the node. Focus is reported
          through the output below instead. `tabIndex` keeps Safari focusing the
          button on click, so all three projects exercise the same path. */}
      <button
        type="button"
        tabIndex={0}
        onClick={dialog.show}
        onFocus={() => setFocusedElement("Edit report")}
      >
        Edit report
      </button>

      <Ariakit.Dialog store={dialog} modal={false} aria-label="Edit report">
        <Ariakit.DialogHeading>Edit report</Ariakit.DialogHeading>
        <button
          type="button"
          tabIndex={0}
          onClick={dialog.hide}
          onFocus={() => setFocusedElement("Done")}
        >
          Done
        </button>
      </Ariakit.Dialog>

      <output aria-label="Focused element">{focusedElement}</output>

      <EscapedFocusDialog />
    </main>
  );
}

// React focuses the filter field at commit, before the dialog runs its own
// auto-focus, and the app hands focus straight to the help button outside the
// dialog. The delayed auto-focus must leave it there, and it reads the same
// colliding member to decide that.
function EscapedFocusDialog() {
  const dialog = Ariakit.useDialogStore();
  const dialogRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLButtonElement>(null);
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const recordFocus = (name: string) => {
    setFocusHistory((history) => [...history, name]);
  };

  // TODO: Remove once the dialog reads activeElement through the hardened
  // accessor.
  // https://github.com/ariakit/ariakit/issues/7230
  const hasEscapedFocus = () => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) return false;
    // The `:focus` selector answers the focused element without going through
    // the member the named form shadows.
    const focused = dialogElement.ownerDocument.querySelector(":focus");
    if (!focused) return false;
    if (dialogElement.contains(focused)) return false;
    // The disclosure still holds focus on an ordinary open, and the dialog
    // counts it as its own, so it is not an escape.
    if (dialog.getState().disclosureElement?.contains(focused)) return false;
    return true;
  };

  return (
    <>
      <Ariakit.DialogDisclosure store={dialog}>
        Filter reports
      </Ariakit.DialogDisclosure>

      <button type="button" ref={helpRef} onFocus={() => recordFocus("help")}>
        Filter help
      </button>

      <output aria-label="Filter focus history">
        {focusHistory.join(" → ") || "none"}
      </output>

      {/* This panel stays open while the app moves focus elsewhere, so an
          outside focus must not close it. `unmountOnHide` is what makes the
          scenario reproducible: without it the field renders hidden on the
          first paint, so React's commit-time `autoFocus` call is a no-op and
          the dialog's own auto-focus is left to move focus for the first time,
          which is not the ordering under test. */}
      <Ariakit.Dialog
        ref={dialogRef}
        store={dialog}
        aria-label="Filter reports"
        autoFocusOnShow={() => !hasEscapedFocus()}
        hideOnInteractOutside={false}
        modal={false}
        unmountOnHide
      >
        <Ariakit.DialogHeading>Filter reports</Ariakit.DialogHeading>
        <input
          aria-label="Filter query"
          autoFocus
          onFocus={() => {
            recordFocus("query");
            helpRef.current?.focus();
          }}
        />
      </Ariakit.Dialog>
    </>
  );
}
