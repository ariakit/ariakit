import * as Ariakit from "@ariakit/react";
import { useRef } from "react";

// See https://github.com/ariakit/ariakit/issues/6310
//
// Reproduces a portaled popover whose content starts with a non-focusable
// element (the common custom file upload pattern: a `display: none`
// `<input type="file">` followed by a visible "Choose file" button).
// To see the bug:
//   1. Click "Attachments": the popover opens and "Choose file" is focused
//      (correct).
//   2. Click "Attachments" again to close the popover. Closing moves focus to
//      the disclosure, which makes the portal disable focus inside it, leaving
//      "Choose file" with tabindex="-1".
//   3. Click "Attachments" once more to reopen the popover.
// Before the fix, reopening leaves focus on the disclosure: autofocus finds no
// tabbable element (the button is still tabindex="-1") and the focusable
// fallback resolves to the hidden file input, so focusing it is a no-op.
export default function Example() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <Ariakit.PopoverProvider>
      <Ariakit.PopoverDisclosure>Attachments</Ariakit.PopoverDisclosure>
      <Ariakit.Popover portal aria-label="Attachments">
        <input ref={fileInputRef} type="file" style={{ display: "none" }} />
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Choose file
        </button>
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}
