import * as Ariakit from "@ariakit/react";
import type { SyntheticEvent } from "react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);

  const close = (event?: Event | SyntheticEvent) => {
    event?.preventDefault();
    setOpen(false);
  };

  return (
    <>
      <a
        href="/post"
        className="button"
        onClick={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        Post
      </a>
      <Ariakit.Dialog
        open={open}
        onClose={close}
        backdrop={
          <div className="fixed inset-0 bg-black/20" data-testid="backdrop" />
        }
        className="fixed inset-x-4 top-20 mx-auto max-w-md rounded bg-white p-4"
      >
        <Ariakit.DialogDismiss
          className="button secondary dismiss"
          render={<a href="/" />}
          onClick={close}
        />
        <Ariakit.DialogHeading hidden>Post</Ariakit.DialogHeading>
        <form className="form" onSubmit={close}>
          <label>
            <Ariakit.VisuallyHidden>Post</Ariakit.VisuallyHidden>
            <Ariakit.Focusable
              autoFocus
              className="input"
              render={<textarea placeholder="What's happening?" rows={5} />}
            />
          </label>
          <Ariakit.Button type="submit" className="button primary">
            Post
          </Ariakit.Button>
        </form>
      </Ariakit.Dialog>
    </>
  );
}
