import * as Ariakit from "@ariakit/react";
import { useState } from "react";

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
    </main>
  );
}
