import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const [value, setValue] = useState("");

  const warning = Ariakit.useDialogStore();
  const dialog = Ariakit.useDialogStore({
    setOpen(open) {
      if (!open) {
        // Whenever the dialog is closed, we reset the post value and make sure
        // the warning dialog is closed as well.
        setValue("");
        warning.hide();
      }
    },
  });

  const warningOpen = warning.useState("open");

  // Opens the warning dialog when the post dialog attempts to close while
  // there's an unsaved post value.
  const warnOnHide = (event: Pick<Event, "preventDefault">) => {
    if (!value) return true;
    warning.show();
    event.preventDefault();
    return false;
  };

  return (
    <>
      <Ariakit.Button onClick={dialog.show} className="button">
        Post
      </Ariakit.Button>
      <Ariakit.Dialog
        store={dialog}
        className="dialog"
        backdrop={<div className="backdrop" />}
        // Trigger the autoFocus behavior again whenever the warning dialog is
        // closed.
        autoFocusOnShow={!warningOpen}
        // Prevents the dialog from closing when the user presses the escape key
        // or clicks outside the dialog while the post value is not empty.
        hideOnEscape={warnOnHide}
        hideOnInteractOutside={warnOnHide}
      >
        <Ariakit.DialogHeading hidden className="heading">
          Post
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss
          className="button secondary dismiss"
          onClick={warnOnHide}
        />
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            dialog.hide();
          }}
        >
          <label>
            <Ariakit.VisuallyHidden>Post</Ariakit.VisuallyHidden>
            <Ariakit.Focusable
              autoFocus
              render={
                <textarea
                  rows={5}
                  className="input"
                  placeholder="What is happening?"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
              }
            />
          </label>
          <Ariakit.Button type="submit" className="button primary">
            Post
          </Ariakit.Button>
        </form>
        <Ariakit.Dialog
          store={warning}
          backdrop={<div className="backdrop" />}
          className="dialog warning-dialog"
        >
          <Ariakit.DialogHeading className="heading">
            Save post?
          </Ariakit.DialogHeading>
          <Ariakit.DialogDescription>
            You can save this to send later from your drafts.
          </Ariakit.DialogDescription>
          <Ariakit.Button className="button primary" onClick={dialog.hide}>
            Save
          </Ariakit.Button>
          <Ariakit.Button className="button secondary" onClick={dialog.hide}>
            Discard
          </Ariakit.Button>
        </Ariakit.Dialog>
      </Ariakit.Dialog>
    </>
  );
}
