import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const [value, setValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);

  if (!dialogOpen && warningOpen) {
    setWarningOpen(false);
  }

  if (!dialogOpen && value) {
    setValue("");
  }

  return (
    <>
      <Ariakit.Button onClick={() => setDialogOpen(true)} className="button">
        Post
      </Ariakit.Button>
      <Ariakit.Dialog
        className="dialog"
        backdrop={<div className="backdrop" />}
        open={dialogOpen}
        onClose={() => {
          if (value) {
            return setWarningOpen(true);
          }
          setDialogOpen(false);
        }}
        // Trigger the autoFocus behavior again whenever the warning dialog is
        // closed.
        autoFocusOnShow={!warningOpen}
      >
        <Ariakit.DialogHeading hidden className="heading">
          Post
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="button secondary dismiss" />
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            setDialogOpen(false);
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
          className="dialog warning-dialog"
          backdrop={<div className="backdrop" />}
          open={warningOpen}
          onClose={() => setWarningOpen(false)}
        >
          <Ariakit.DialogHeading className="heading">
            Save post?
          </Ariakit.DialogHeading>
          <Ariakit.DialogDescription>
            You can save this to send later from your drafts.
          </Ariakit.DialogDescription>
          <Ariakit.DialogDismiss
            className="button primary"
            onClick={() => setDialogOpen(false)}
          >
            Save
          </Ariakit.DialogDismiss>
          <Ariakit.DialogDismiss
            className="button secondary"
            onClick={() => setDialogOpen(false)}
          >
            Discard
          </Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.Dialog>
    </>
  );
}
