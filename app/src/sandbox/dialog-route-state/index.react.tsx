import * as Ariakit from "@ariakit/react";
import type { SyntheticEvent } from "react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  const [includePreview, setIncludePreview] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const close = (event?: Event | SyntheticEvent) => {
    event?.preventDefault();
    setOpen(false);
    setPreviewOpen(false);
  };

  return (
    <>
      <label>
        <input
          type="checkbox"
          tabIndex={0}
          checked={includePreview}
          onChange={(event) => setIncludePreview(event.currentTarget.checked)}
        />
        Include preview
      </label>
      <a
        href="/post"
        className="button"
        onClick={(event) => {
          event.preventDefault();
          setPreviewOpen(includePreview);
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
        <Ariakit.HovercardProvider open={previewOpen} setOpen={setPreviewOpen}>
          <Ariakit.HovercardAnchor render={<Ariakit.Role.div />}>
            Preview anchor
          </Ariakit.HovercardAnchor>
          <Ariakit.Hovercard
            role="presentation"
            focusable={false}
            hideOnEscape={false}
            hideOnInteractOutside={false}
            unmountOnHide
            updatePosition={() => {}}
            render={(props) => <Ariakit.Role.div {...props} id={undefined} />}
            getPersistentElements={() => document.getElementsByTagName("body")}
          >
            Feature preview
          </Ariakit.Hovercard>
        </Ariakit.HovercardProvider>
      </Ariakit.Dialog>
    </>
  );
}
