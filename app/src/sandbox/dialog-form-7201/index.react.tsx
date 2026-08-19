import * as Ariakit from "@ariakit/react";
import { useState } from "react";

interface CoverageDialogProps {
  label: string;
  withDocumentField: boolean;
}

// A benefits form names its controls after what they collect, and both `self`
// and `document` below collide with a member the realm helpers read from the
// form itself.
// https://github.com/ariakit/ariakit/issues/7201
function CoverageDialog({ label, withDocumentField }: CoverageDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {/* A plain button rather than `DialogDisclosure`, so the dialog has to
          resolve its own disclosure from the active element when it opens.
          `tabIndex` keeps Safari focusing the button on click. */}
      <button tabIndex={0} onClick={() => setOpen(true)}>
        {label}
      </button>
      {/* TODO: Remove once https://github.com/ariakit/ariakit/issues/7201 is
          fixed. The dialog resolves its own document and window from the
          element it renders, and a form answers those lookups with a control
          named after them. Nesting the form inside the dialog, rather than
          rendering the dialog as the form, keeps the form out of that lookup
          while the dialog still holds exactly the same controls. */}
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="fixed inset-x-4 top-20 mx-auto flex max-w-md flex-col gap-3 rounded bg-white p-6"
      >
        <Ariakit.DialogHeading>{label}</Ariakit.DialogHeading>
        <form className="flex flex-col gap-3">
          <label>
            <input type="checkbox" name="self" />
            This coverage is for me
          </label>
          {withDocumentField ? (
            <label>
              Proof of eligibility
              <input name="document" />
            </label>
          ) : null}
          <Ariakit.DialogDismiss>Cancel</Ariakit.DialogDismiss>
        </form>
      </Ariakit.Dialog>
    </div>
  );
}

export default function Example() {
  return (
    <main>
      <h1>Coverage forms</h1>
      <CoverageDialog label="Add coverage" withDocumentField={false} />
      <CoverageDialog label="Add coverage with proof" withDocumentField />
    </main>
  );
}
